<?php
$suggestion = App\Models\Suggestion::with(['client', 'profile'])->first();
if ($suggestion) {
    echo "Client: " . $suggestion->client->c_nom . "\n";
    echo "Profile: " . $suggestion->profile->full_name . "\n";
    echo "Match Score: " . $suggestion->match_score . "%\n";
} else {
    echo "No suggestion found.\n";
}
