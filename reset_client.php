<?php
$client = App\Models\User::where('email', 'client@portal.com')->first()->client;
$client->update(['project_id' => null, 'c_ville_a' => null]);
echo "Test client criteria wiped for onboarding.\n";
