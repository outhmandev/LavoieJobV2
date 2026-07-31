<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastSeenAt
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            $user = $request->user();
            // Only update at most once a minute to reduce DB load
            if (!$user->last_seen_at || $user->last_seen_at->lt(now()->subMinute())) {
                $user->forceFill(['last_seen_at' => now()])->save();
            }
        }

        return $next($request);
    }
}
