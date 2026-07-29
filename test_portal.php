<?php
$user = App\Models\User::where('email', 'client@portal.com')->first();
Auth::login($user);
$request = Illuminate\Http\Request::create('/portal/dashboard', 'GET');
$response = app()->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . substr($response->getContent(), 0, 500) . "\n";
