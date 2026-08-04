<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Notifications\GeneralNotification;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Get recent notifications and unread count for the current user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->take(20)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->data['title'] ?? 'Notification',
                    'message' => $notification->data['message'] ?? '',
                    'type' => $notification->data['type'] ?? 'info',
                    'action_url' => $notification->data['action_url'] ?? null,
                    'read_at' => $notification->read_at ? $notification->read_at->toIso8601String() : null,
                    'created_at' => $notification->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json([
            'status' => 'success',
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'status' => 'success',
            'unread_count' => 0,
        ]);
    }

    /**
     * Send a test notification to the current user (for testing).
     */
    public function sendTest(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->notify(new GeneralNotification(
            'Bienvenue sur La Voie Job',
            'Votre système de notifications est maintenant actif et fonctionnel !',
            'success',
            '/dashboard'
        ));

        return response()->json([
            'status' => 'success',
            'message' => 'Notification de test envoyée avec succès !',
        ]);
    }
}
