<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Client;
use App\Models\Profile;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Display the comprehensive statistics & analytics dashboard.
     * Restricted strictly to Super Admin and System Administrator roles.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        // 1. Authenticate user and enforce strict role gate
        $user = $request->user() ?: auth()->user();
        if (!$user || !$user->isSuperAdmin()) {
            abort(403, 'Accès réservé uniquement aux Super Administrateurs et Administrateurs Système.');
        }

        // 2. Build aggregated statistics dataset with active filters
        $analytics = $this->buildAnalyticsData($request, $user);

        // 3. Render dedicated Super Admin analytics page
        return Inertia::render('Admin/Analytics/Index', [
            'analytics' => $analytics,
            'filters' => $analytics['filters'],
            'options' => $analytics['options'],
            'recentActivity' => $analytics['recentActivity'],
        ]);
    }

    /**
     * JSON API endpoint for fast reactive AJAX / drill-down updates.
     * Restricted strictly to Super Admin and System Administrator roles.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function apiData(Request $request): JsonResponse
    {
        $user = $request->user() ?: auth()->user();
        if (!$user || !$user->isSuperAdmin()) {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        $analytics = $this->buildAnalyticsData($request, $user);

        return response()->json($analytics);
    }

    /**
     * Core computation engine: Aggregates KPIs, calculates trends, normalizes status buckets,
     * builds time-series charts, and evaluates project performance.
     *
     * @param Request $request
     * @param User|null $user
     * @return array
     */
    protected function buildAnalyticsData(Request $request, ?User $user = null): array
    {
        // Check if current user has global super-admin/admin scope or restricted to specific projects
        $isAdmin = $user ? ($user->isSuperAdmin() || $user->isAdmin()) : true;
        $userProjectIds = ($isAdmin || !$user) 
            ? null 
            : $user->projects()->pluck('projects.id')->toArray();

        // -------------------------------------------------------------------------
        // 1. Resolve and Validate Filter Parameters
        // -------------------------------------------------------------------------
        $selectedYear = $request->input('year');
        $selectedMonth = $request->input('month');
        $selectedProjectId = $request->input('project_id');
        $selectedClientId = $request->input('client_id');
        $selectedProfileId = $request->input('profile_id');
        $selectedStatus = $request->input('status');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Security check: restrict project if user does not own access to that project
        if (!$isAdmin && $selectedProjectId && !in_array($selectedProjectId, $userProjectIds ?: [])) {
            $selectedProjectId = null;
        }

        // -------------------------------------------------------------------------
        // 2. Base Query Filter Scope Closure
        // Applies project scoping, entity IDs, status filters, and date boundaries
        // consistently across Eloquent queries to avoid duplicated filter logic.
        // -------------------------------------------------------------------------
        $applyScope = function ($query, string $table = 'clients', string $dateCol = 'created_at') use (
            $isAdmin, $userProjectIds, $selectedProjectId, $selectedClientId, $selectedProfileId, 
            $selectedStatus, $startDate, $endDate, $selectedYear, $selectedMonth
        ) {
            $tbl = $table ? "{$table}." : "";

            // A. Restrict to user's assigned projects for non-admin users
            if (!$isAdmin && $userProjectIds !== null) {
                if ($table === 'assignments') {
                    $query->whereHas('client', fn($q) => $q->whereIn('project_id', $userProjectIds));
                } else {
                    $query->whereIn("{$tbl}project_id", $userProjectIds);
                }
            }

            // B. Filter by selected single Project ID
            if ($selectedProjectId) {
                if ($table === 'assignments') {
                    $query->whereHas('client', fn($q) => $q->where('project_id', $selectedProjectId));
                } else {
                    $query->where("{$tbl}project_id", $selectedProjectId);
                }
            }

            // C. Filter by specific Client ID
            if ($selectedClientId) {
                if ($table === 'clients') {
                    $query->where("{$tbl}id", $selectedClientId);
                } elseif ($table === 'assignments') {
                    $query->where("{$tbl}client_id", $selectedClientId);
                }
            }

            // D. Filter by specific Profile ID
            if ($selectedProfileId) {
                if ($table === 'profiles') {
                    $query->where("{$tbl}id", $selectedProfileId);
                } elseif ($table === 'assignments') {
                    $query->where("{$tbl}profile_id", $selectedProfileId);
                }
            }

            // E. Filter by Lifecycle / Operational Status
            if ($selectedStatus) {
                if ($table === 'clients') {
                    $query->where("{$tbl}statut", $selectedStatus);
                } elseif ($table === 'profiles') {
                    // Match canonical profile status or normalized equivalent
                    if ($selectedStatus === 'En Attente') {
                        $query->whereIn("{$tbl}status", ['En Attente', 'En Attende', 'En_Attende']);
                    } elseif ($selectedStatus === 'Affecté(e)') {
                        $query->whereIn("{$tbl}status", ['Affecté(e)', 'AffectÃ©(e)']);
                    } elseif ($selectedStatus === 'Disponible') {
                        $query->whereIn("{$tbl}status", ['Disponible', 'dISPONIBE']);
                    } else {
                        $query->where("{$tbl}status", $selectedStatus);
                    }
                } elseif ($table === 'assignments') {
                    $query->where("{$tbl}status", $selectedStatus);
                }
            }

            // F. Date Filtering (Custom range or Year/Month)
            if ($table === 'profiles') {
                // Profiles table contains legacy imports where created_at may be null;
                // only apply date filters if profiles actually have timestamp records.
                $hasProfilesWithDates = Profile::whereNotNull('created_at')->exists();
                if ($hasProfilesWithDates) {
                    if ($startDate) $query->whereDate("{$tbl}created_at", '>=', $startDate);
                    if ($endDate) $query->whereDate("{$tbl}created_at", '<=', $endDate);
                    if ($selectedYear && $selectedYear !== 'all') $query->whereYear("{$tbl}created_at", $selectedYear);
                    if ($selectedMonth && $selectedMonth !== 'all') $query->whereMonth("{$tbl}created_at", $selectedMonth);
                }
            } else {
                if ($startDate) {
                    $query->whereDate("{$tbl}{$dateCol}", '>=', $startDate);
                }
                if ($endDate) {
                    $query->whereDate("{$tbl}{$dateCol}", '<=', $endDate);
                }
                if ($selectedYear && $selectedYear !== 'all') {
                    $query->whereYear("{$tbl}{$dateCol}", $selectedYear);
                }
                if ($selectedMonth && $selectedMonth !== 'all') {
                    $query->whereMonth("{$tbl}{$dateCol}", $selectedMonth);
                }
            }

            return $query;
        };

        // -------------------------------------------------------------------------
        // 3. Month-over-Month (MoM) & Growth Trend Calculation Helper
        // Accurately handles edge cases (e.g. division by zero, null previous data, 100% gain)
        // -------------------------------------------------------------------------
        $calcTrend = function ($current, $previous) {
            $curr = (float)$current;
            $prev = (float)$previous;

            if ($prev == 0.0) {
                $change = $curr > 0.0 ? 100.0 : 0.0;
            } else {
                $change = (($curr - $prev) / $prev) * 100.0;
            }

            return [
                'current' => $curr,
                'previous' => $prev,
                'change' => round($change, 1),
                'trend' => $change > 0 ? 'up' : ($change < 0 ? 'down' : 'neutral'),
                'is_positive' => $change >= 0,
            ];
        };

        // Determine reference evaluation window for MoM comparisons
        if ($selectedYear && $selectedYear !== 'all' && $selectedMonth && $selectedMonth !== 'all') {
            $currMonthStart = Carbon::createFromDate((int)$selectedYear, (int)$selectedMonth, 1)->startOfMonth();
            $currMonthEnd = Carbon::createFromDate((int)$selectedYear, (int)$selectedMonth, 1)->endOfMonth();
            $prevMonthStart = (clone $currMonthStart)->subMonth()->startOfMonth();
            $prevMonthEnd = (clone $currMonthStart)->subMonth()->endOfMonth();
        } else {
            $currMonthStart = Carbon::now()->startOfMonth();
            $currMonthEnd = Carbon::now()->endOfMonth();
            $prevMonthStart = Carbon::now()->subMonth()->startOfMonth();
            $prevMonthEnd = Carbon::now()->subMonth()->endOfMonth();
        }

        // -------------------------------------------------------------------------
        // 4. Primary Metric: Total Clients & MoM Trend
        // -------------------------------------------------------------------------
        $clientBaseQuery = Client::query();
        $applyScope($clientBaseQuery, 'clients', 'created_at');
        $totalClients = $clientBaseQuery->count();

        // MoM comparison for client acquisition
        $currClientsCount = Client::whereBetween('created_at', [$currMonthStart, $currMonthEnd])
            ->when($selectedProjectId, fn($q) => $q->where('project_id', $selectedProjectId))
            ->count();
        $prevClientsCount = Client::whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])
            ->when($selectedProjectId, fn($q) => $q->where('project_id', $selectedProjectId))
            ->count();
        $clientsTrend = $calcTrend($currClientsCount, $prevClientsCount);

        // -------------------------------------------------------------------------
        // 5. Primary Metric: Total Candidates / Profiles & Availability
        // -------------------------------------------------------------------------
        $profileBaseQuery = Profile::query();
        $applyScope($profileBaseQuery, 'profiles', 'created_at');
        $totalProfiles = $profileBaseQuery->count();

        // Candidates currently in 'Disponible' status ready for deployment
        $availableProfiles = Profile::whereIn('status', ['Disponible', 'dISPONIBE'])
            ->when($selectedProjectId, fn($q) => $q->where('project_id', $selectedProjectId))
            ->count();
        $profilesTrend = $calcTrend($totalProfiles, $totalProfiles);

        // -------------------------------------------------------------------------
        // 6. Primary Metric: Total Affectations (Assignments) & Active Contracts
        // -------------------------------------------------------------------------
        $assignmentBaseQuery = Assignment::query();
        $applyScope($assignmentBaseQuery, 'assignments', 'created_at');
        $totalAssignments = $assignmentBaseQuery->count();

        // Active running contracts
        $activeAssignments = (clone $assignmentBaseQuery)->where('status', 'active')->count();

        // MoM comparison for assignment volume
        $currAssignmentsCount = Assignment::whereBetween('created_at', [$currMonthStart, $currMonthEnd])
            ->when($selectedProjectId, fn($q) => $q->whereHas('client', fn($sq) => $sq->where('project_id', $selectedProjectId)))
            ->count();
        $prevAssignmentsCount = Assignment::whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])
            ->when($selectedProjectId, fn($q) => $q->whereHas('client', fn($sq) => $sq->where('project_id', $selectedProjectId)))
            ->count();
        $assignmentsTrend = $calcTrend($currAssignmentsCount, $prevAssignmentsCount);

        // -------------------------------------------------------------------------
        // 7. Primary Metric: Total Revenue (Sum of agreed_price from assignments)
        // -------------------------------------------------------------------------
        $totalRevenue = (float)$assignmentBaseQuery->sum('agreed_price');

        // MoM comparison for generated revenue
        $currRevenue = (float)Assignment::whereBetween('created_at', [$currMonthStart, $currMonthEnd])
            ->when($selectedProjectId, fn($q) => $q->whereHas('client', fn($sq) => $sq->where('project_id', $selectedProjectId)))
            ->sum('agreed_price');
        $prevRevenue = (float)Assignment::whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])
            ->when($selectedProjectId, fn($q) => $q->whereHas('client', fn($sq) => $sq->where('project_id', $selectedProjectId)))
            ->sum('agreed_price');
        $revenueTrend = $calcTrend($currRevenue, $prevRevenue);

        // -------------------------------------------------------------------------
        // 8. Primary Metric: Total Reclamations (Complaints across Clients & Candidates)
        // -------------------------------------------------------------------------
        // Client complaints (flagged with reclamation=1 or statut='Reclamation')
        $clientReclamations = Client::where(function ($q) {
            $q->where('statut', 'Reclamation')->orWhere('reclamation', '>', 0);
        })
        ->when($selectedProjectId, fn($q) => $q->where('project_id', $selectedProjectId))
        ->count();

        // Candidate complaints (status='Reclamation')
        $profileReclamations = Profile::where('status', 'Reclamation')
            ->when($selectedProjectId, fn($q) => $q->where('project_id', $selectedProjectId))
            ->count();

        $totalReclamations = $clientReclamations + $profileReclamations;
        $reclamationsTrend = $calcTrend($totalReclamations, 0);

        // -------------------------------------------------------------------------
        // 9. Client Lifecycle Status Breakdown (Normalized strictly to Client::STATUSES)
        // -------------------------------------------------------------------------
        $rawClientStatusCounts = Client::select('statut', DB::raw('count(*) as count'))
            ->when($selectedProjectId, fn($q) => $q->where('project_id', $selectedProjectId))
            ->groupBy('statut')
            ->pluck('count', 'statut')
            ->toArray();

        $clientStatuses = [];
        foreach (Client::STATUSES as $statusName) {
            $clientStatuses[$statusName] = $rawClientStatusCounts[$statusName] ?? 0;
        }

        // Map legacy non-standard status values if present
        if (isset($rawClientStatusCounts['active'])) {
            $clientStatuses['Validé'] = ($clientStatuses['Validé'] ?? 0) + $rawClientStatusCounts['active'];
        }

        // -------------------------------------------------------------------------
        // 10. Profile Status Breakdown (Normalized strictly to Profile::STATUSES)
        // Normalizes variations: 'En Attende', 'AffectÃ©(e)', 'dISPONIBE' into canonical keys
        // -------------------------------------------------------------------------
        $rawProfileStatusCounts = Profile::select('status', DB::raw('count(*) as count'))
            ->when($selectedProjectId, fn($q) => $q->where('project_id', $selectedProjectId))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $profileStatuses = [];
        foreach (Profile::STATUSES as $statusName) {
            $profileStatuses[$statusName] = 0;
        }

        foreach ($rawProfileStatusCounts as $rawStatus => $count) {
            $normalizedKey = match (trim((string)$rawStatus)) {
                'En Attende', 'En_Attende', 'En Attente', 'en attente' => 'En Attente',
                'AffectÃ©(e)', 'Affecté(e)', 'affecté(e)', 'Affecte' => 'Affecté(e)',
                'dISPONIBE', 'Disponible', 'disponible' => 'Disponible',
                'Indisponible', 'indisponible' => 'Indisponible',
                'Injoignable', 'injoignable' => 'Injoignable',
                'Black liste', 'black liste', 'black_liste' => 'Black liste',
                'Dossier incomplet' => 'Dossier incomplet',
                'Suggéré', 'suggere', 'Suggere' => 'Suggéré',
                'Reclamation', 'reclamation' => 'Reclamation',
                default => in_array($rawStatus, Profile::STATUSES) ? $rawStatus : 'En Attente',
            };

            if (isset($profileStatuses[$normalizedKey])) {
                $profileStatuses[$normalizedKey] += (int)$count;
            }
        }

        // -------------------------------------------------------------------------
        // 11. Assignment Status Distribution
        // -------------------------------------------------------------------------
        $assignmentStatuses = Assignment::select('status', DB::raw('count(*) as count'))
            ->when($selectedProjectId, fn($q) => $q->whereHas('client', fn($sq) => $sq->where('project_id', $selectedProjectId)))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // -------------------------------------------------------------------------
        // 12. Monthly Evolution & Time Series (Revenue, Affectations, Clients)
        // Aggregates monthly figures over the selected year for comparative trend charts.
        // -------------------------------------------------------------------------
        $targetYear = ($selectedYear && $selectedYear !== 'all') ? (int)$selectedYear : (int)date('Y');
        $monthlyEvolution = [];
        $monthsFrench = [
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr', 5 => 'Mai', 6 => 'Juin',
            7 => 'Juil', 8 => 'Août', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'
        ];

        for ($m = 1; $m <= 12; $m++) {
            $mStart = Carbon::createFromDate($targetYear, $m, 1)->startOfMonth();
            $mEnd = Carbon::createFromDate($targetYear, $m, 1)->endOfMonth();

            // Monthly Revenue in MAD
            $mRev = (float)Assignment::whereBetween('created_at', [$mStart, $mEnd])
                ->when($selectedProjectId, fn($q) => $q->whereHas('client', fn($sq) => $sq->where('project_id', $selectedProjectId)))
                ->sum('agreed_price');

            // Monthly Affectations count
            $mAss = Assignment::whereBetween('created_at', [$mStart, $mEnd])
                ->when($selectedProjectId, fn($q) => $q->whereHas('client', fn($sq) => $sq->where('project_id', $selectedProjectId)))
                ->count();

            // Monthly Clients registered count
            $mClients = Client::whereBetween('created_at', [$mStart, $mEnd])
                ->when($selectedProjectId, fn($q) => $q->where('project_id', $selectedProjectId))
                ->count();

            $monthlyEvolution[] = [
                'month' => $monthsFrench[$m],
                'month_num' => $m,
                'year' => $targetYear,
                'revenue' => $mRev,
                'affectations' => $mAss,
                'clients' => $mClients,
            ];
        }

        // -------------------------------------------------------------------------
        // 13. Top Projects Analytics (Revenue, Clients, Profiles, Affectations, Conversion)
        // Computes placement conversion rate = (affectations / total_clients) * 100
        // -------------------------------------------------------------------------
        $projectsQuery = Project::query();
        if (!$isAdmin && $userProjectIds !== null) {
            $projectsQuery->whereIn('id', $userProjectIds);
        }

        $projects = $projectsQuery->withCount(['clients', 'profiles'])
            ->get()
            ->map(function ($p) {
                // Revenue generated by this project
                $rev = (float)Assignment::whereHas('client', fn($q) => $q->where('project_id', $p->id))->sum('agreed_price');
                
                // Total placements / assignments executed for this project
                $aff = Assignment::whereHas('client', fn($q) => $q->where('project_id', $p->id))->count();
                
                // Total complaints associated with this project
                $reclamations = Client::where('project_id', $p->id)
                    ->where(function ($q) {
                        $q->where('statut', 'Reclamation')->orWhere('reclamation', '>', 0);
                    })->count();

                // Conversion Rate: ratio of placed candidates to registered client demands
                $conversionRate = $p->clients_count > 0 
                    ? round(($aff / $p->clients_count) * 100, 1) 
                    : 0;

                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'clients_count' => (int)$p->clients_count,
                    'profiles_count' => (int)$p->profiles_count,
                    'affectations_count' => (int)$aff,
                    'revenue' => $rev,
                    'reclamations_count' => (int)$reclamations,
                    'conversion_rate' => $conversionRate,
                ];
            })
            ->sortByDesc('revenue')
            ->values();

        // -------------------------------------------------------------------------
        // 14. Top Jobs / Professions Distribution
        // Identifies the most demanded candidate specialties across the agency pool
        // -------------------------------------------------------------------------
        $topJobs = Profile::select('job', DB::raw('count(*) as total'))
            ->whereNotNull('job')
            ->where('job', '!=', '')
            ->when($selectedProjectId, fn($q) => $q->where('project_id', $selectedProjectId))
            ->groupBy('job')
            ->orderByDesc('total')
            ->take(6)
            ->get()
            ->map(fn($j) => [
                'name' => ucwords(str_replace('_', ' ', (string)$j->job)),
                'total' => (int)$j->total
            ]);

        // -------------------------------------------------------------------------
        // 15. Operational Real-Time Activity Stream
        // -------------------------------------------------------------------------
        $recentClients = Client::latest('created_at')
            ->when($selectedProjectId, fn($q) => $q->where('project_id', $selectedProjectId))
            ->take(3)
            ->get()
            ->map(fn($c) => [
                'id' => 'c_' . $c->id,
                'action' => 'Nouveau Client Inscription',
                'name' => $c->nom ?? 'Client #' . $c->id,
                'status' => $c->statut ?? 'Prospect',
                'time' => $c->created_at ? Carbon::parse($c->created_at)->diffForHumans() : 'Récemment',
                'created_at' => $c->created_at,
            ]);

        $recentAssignments = Assignment::with(['client', 'profile'])
            ->latest('created_at')
            ->when($selectedProjectId, fn($q) => $q->whereHas('client', fn($sq) => $sq->where('project_id', $selectedProjectId)))
            ->take(3)
            ->get()
            ->map(fn($a) => [
                'id' => 'a_' . $a->id,
                'action' => 'Nouvelle Affectation (' . number_format($a->agreed_price, 0) . ' MAD)',
                'name' => ($a->client->nom ?? 'Client') . ' ➔ ' . ($a->profile->full_name ?? 'Candidat'),
                'status' => $a->status ?? 'active',
                'time' => $a->created_at ? Carbon::parse($a->created_at)->diffForHumans() : 'Récemment',
                'created_at' => $a->created_at,
            ]);

        $recentActivity = $recentClients->concat($recentAssignments)
            ->sortByDesc('created_at')
            ->take(5)
            ->values();

        // -------------------------------------------------------------------------
        // 16. Filter Options Payload
        // -------------------------------------------------------------------------
        $availableProjects = $isAdmin
            ? Project::orderBy('name')->get(['id', 'name'])
            : $user->projects()->orderBy('name')->get(['projects.id', 'projects.name']);

        $availableYears = range(date('Y') + 1, 2022);

        return [
            'kpis' => [
                'totalClients' => ['title' => 'Total Clients', 'value' => $totalClients, 'trend' => $clientsTrend],
                'totalProfiles' => ['title' => 'Total Profils Candidats', 'value' => $totalProfiles, 'available' => $availableProfiles, 'trend' => $profilesTrend],
                'totalAssignments' => ['title' => 'Total Affectations', 'value' => $totalAssignments, 'active' => $activeAssignments, 'trend' => $assignmentsTrend],
                'totalRevenue' => ['title' => 'Chiffre d\'Affaires Global', 'value' => $totalRevenue, 'trend' => $revenueTrend],
                'totalReclamations' => ['title' => 'Total Réclamations', 'value' => $totalReclamations, 'clientReclamations' => $clientReclamations, 'profileReclamations' => $profileReclamations, 'trend' => $reclamationsTrend],
                'clientStatuses' => $clientStatuses,
                'profileStatuses' => $profileStatuses,
                'assignmentStatuses' => $assignmentStatuses,
            ],
            'charts' => [
                'monthlyEvolution' => $monthlyEvolution,
                'clientStatuses' => $clientStatuses,
                'profileStatuses' => $profileStatuses,
                'assignmentStatuses' => $assignmentStatuses,
                'projects' => $projects,
                'topJobs' => $topJobs,
            ],
            'filters' => [
                'year' => $selectedYear ?: 'all',
                'month' => $selectedMonth ?: 'all',
                'project_id' => $selectedProjectId ? (int)$selectedProjectId : '',
                'client_id' => $selectedClientId ?: '',
                'profile_id' => $selectedProfileId ?: '',
                'status' => $selectedStatus ?: '',
                'start_date' => $startDate ?: '',
                'end_date' => $endDate ?: '',
            ],
            'options' => [
                'projects' => $availableProjects,
                'years' => $availableYears,
                'clientStatuses' => Client::STATUSES,
                'profileStatuses' => Profile::STATUSES,
            ],
            'recentActivity' => $recentActivity,
        ];
    }
}
