<?php

namespace App\Http\Controllers;

use App\Models\TimeEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;

class TimeTrackingController extends Controller
{
    public function currentStatus()
    {
        $activeWork = TimeEntry::where('user_id', auth()->id())
            ->where('type', 'work')
            ->whereNull('ended_at')
            ->first();

        $activeBreak = TimeEntry::where('user_id', auth()->id())
            ->where('type', 'break')
            ->whereNull('ended_at')
            ->first();

        $accumulatedWorkSeconds = 0;
        $accumulatedBreakSeconds = 0;

        if ($activeWork) {
            $breaks = TimeEntry::where('user_id', auth()->id())
                ->where('type', 'break')
                ->where('started_at', '>=', $activeWork->started_at)
                ->get();

            foreach ($breaks as $break) {
                if ($break->ended_at) {
                    $accumulatedBreakSeconds += $break->started_at->diffInSeconds($break->ended_at);
                } else {
                    $accumulatedBreakSeconds += $break->started_at->diffInSeconds(now());
                }
            }

            $totalElapsed = $activeWork->started_at->diffInSeconds(now());
            $accumulatedWorkSeconds = $totalElapsed - $accumulatedBreakSeconds;
        }

        return response()->json([
            'is_working' => $activeWork !== null,
            'is_on_break' => $activeBreak !== null,
            'work_started_at' => $activeWork ? $activeWork->started_at : null,
            'break_started_at' => $activeBreak ? $activeBreak->started_at : null,
            'accumulated_work_seconds' => $accumulatedWorkSeconds,
            'accumulated_break_seconds' => $accumulatedBreakSeconds,
        ]);
    }

    public function startWork()
    {
        // End any dangling work sessions that were left open
        $activeWorks = TimeEntry::where('user_id', auth()->id())
            ->where('type', 'work')
            ->whereNull('ended_at')
            ->get();

        if ($activeWorks->count() > 0) {
            // Either return error or automatically close them. Let's return error for now.
            return response()->json(['message' => 'Already working'], 400);
        }

        TimeEntry::create([
            'user_id' => auth()->id(),
            'type' => 'work',
            'started_at' => now(),
        ]);

        return response()->json(['message' => 'Work started']);
    }

    public function startBreak()
    {
        // Must be working to take a break
        $activeWork = TimeEntry::where('user_id', auth()->id())
            ->where('type', 'work')
            ->whereNull('ended_at')
            ->first();

        if (!$activeWork) {
            return response()->json(['message' => 'Not working'], 400);
        }

        $activeBreaks = TimeEntry::where('user_id', auth()->id())
            ->where('type', 'break')
            ->whereNull('ended_at')
            ->count();

        if ($activeBreaks > 0) {
            return response()->json(['message' => 'Already on break'], 400);
        }

        TimeEntry::create([
            'user_id' => auth()->id(),
            'type' => 'break',
            'started_at' => now(),
        ]);

        return response()->json(['message' => 'Break started']);
    }

    public function endBreak()
    {
        $activeBreaks = TimeEntry::where('user_id', auth()->id())
            ->where('type', 'break')
            ->whereNull('ended_at')
            ->get();

        if ($activeBreaks->isEmpty()) {
            return response()->json(['message' => 'Not on break'], 400);
        }

        $endedAt = now();
        
        foreach ($activeBreaks as $break) {
            $duration = $break->started_at->diffInMinutes($endedAt);
            $break->update([
                'ended_at' => $endedAt,
                'duration_minutes' => $duration
            ]);
        }

        return response()->json(['message' => 'Break ended']);
    }

    public function stopWork()
    {
        $activeWork = TimeEntry::where('user_id', auth()->id())
            ->where('type', 'work')
            ->whereNull('ended_at')
            ->first();

        if (!$activeWork) {
            return response()->json(['message' => 'Not working'], 400);
        }

        // Also end ALL active breaks
        $activeBreaks = TimeEntry::where('user_id', auth()->id())
            ->where('type', 'break')
            ->whereNull('ended_at')
            ->get();

        $endedAt = now();
        
        foreach ($activeBreaks as $break) {
            $duration = $break->started_at->diffInMinutes($endedAt);
            $break->update([
                'ended_at' => $endedAt,
                'duration_minutes' => $duration
            ]);
        }

        $endedAt = now();
        // Calculate total work duration (excluding breaks if needed? Usually duration is total time from start to end)
        $duration = $activeWork->started_at->diffInMinutes($endedAt);

        // We can subtract break time from work time if desired, but for now we track them separately.
        
        $activeWork->update([
            'ended_at' => $endedAt,
            'duration_minutes' => $duration
        ]);

        return response()->json(['message' => 'Work stopped']);
    }
}
