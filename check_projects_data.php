<?php
$projects = \App\Models\Project::all();
echo "Count: " . $projects->count() . "\n";
echo "Projects JSON: " . json_encode($projects->toArray()) . "\n";
