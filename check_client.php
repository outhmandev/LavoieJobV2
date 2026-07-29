<?php
$user = App\Models\User::where('email', 'client@portal.com')->first();
echo "User ID: " . $user->id . "\n";
echo "Has Client: " . ($user->client ? 'Yes' : 'No') . "\n";
if ($user->client) {
    echo "Client ID: " . $user->client->id . "\n";
}
