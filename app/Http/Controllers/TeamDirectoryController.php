<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;

class TeamDirectoryController extends Controller
{
    /**
     * Display a listing of the team members.
     */
    public function index(Request $request)
    {
        // Don't show clients in the team directory
        $query = User::with(['roles'])->where(function ($q) {
            $q->where('role', '!=', 'Client')
              ->orWhereNull('role');
        });

        // Optional search filtering
        if ($request->has('search') && !empty($request->search)) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(email) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(role) LIKE ?', ["%{$search}%"]);
            });
        }

        $users = $query->latest()->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'roles' => $user->roles->map(function ($role) {
                    return ['name' => $role->name];
                }),
                'is_online' => $user->is_online ?? false,
                'two_factor_enabled' => $user->two_factor_enabled ?? false,
                'status' => $user->status ?? 'active',
            ];
        });

        return Inertia::render('Team/Index', [
            'users' => $users,
            'filters' => $request->only('search')
        ]);
    }
}
