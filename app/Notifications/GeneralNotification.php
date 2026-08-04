<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class GeneralNotification extends Notification
{
    use Queueable;

    protected string $title;
    protected string $message;
    protected string $type;
    protected ?string $actionUrl;

    public function __construct(string $title, string $message, string $type = 'info', ?string $actionUrl = null)
    {
        $this->title = $title;
        $this->message = $message;
        $this->type = $type;
        $this->actionUrl = $actionUrl;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'action_url' => $this->actionUrl,
        ];
    }
}
