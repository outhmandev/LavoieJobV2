<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::with(['jobs', 'missions'])->latest()->get();
        return Inertia::render('Admin/Projects/Index', [
            'projects' => $projects
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:projects',
            'status' => 'required|in:active,inactive',
        ]);

        Project::create($validated);

        return redirect()->back()->with('success', 'Project created successfully.');
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:projects,name,' . $project->id,
            'status' => 'required|in:active,inactive',
        ]);

        $project->update($validated);

        return redirect()->back()->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return redirect()->back()->with('success', 'Project deleted successfully.');
    }

    // Add Job (Type de personnel)
    public function storeJob(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $project->jobs()->create($validated);

        return redirect()->back()->with('success', 'Job added successfully.');
    }

    public function destroyJob(Project $project, $jobId)
    {
        $project->jobs()->where('id', $jobId)->delete();
        return redirect()->back()->with('success', 'Job deleted successfully.');
    }

    // Add Mission
    public function storeMission(Request $request, Project $project)
    {
        $validated = $request->validate([
            'group_name' => 'nullable|string|max:255',
            'name' => 'required|string|max:255',
        ]);

        $project->missions()->create($validated);

        return redirect()->back()->with('success', 'Mission added successfully.');
    }

    public function destroyMission(Project $project, $missionId)
    {
        $project->missions()->where('id', $missionId)->delete();
        return redirect()->back()->with('success', 'Mission deleted successfully.');
    }
}
