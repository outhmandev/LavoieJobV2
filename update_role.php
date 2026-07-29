<?php
$user = App\Models\User::where('email', 'client@portal.com')->first();
$user->update(['role' => 'client']);
$user->syncRoles(['Client']);
echo "Updated role to client!";
