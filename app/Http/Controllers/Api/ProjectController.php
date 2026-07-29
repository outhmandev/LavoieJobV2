<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::where('status', 'active')
            ->with(['jobs', 'missions'])
            ->get();
            
        // Format missions into grouped format for the frontend
        $projects->transform(function ($project) {
            $groupedMissions = [];
            foreach ($project->missions as $mission) {
                $group = $mission->group_name ?? 'Autre';
                if (!isset($groupedMissions[$group])) {
                    $groupedMissions[$group] = [];
                }
                $groupedMissions[$group][] = $mission->name;
            }
            $project->grouped_missions = $groupedMissions;
            return $project;
        });

        return response()->json($projects);
    }
}
