<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Updating Criteria...</h1>";

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

try {
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    
    echo "<h2>Running LALLA LGHALIA Seeder...</h2>";
    $status1 = $kernel->handle(
        $input1 = new Symfony\Component\Console\Input\StringInput('db:seed --class=LallaGhaliaMissionsSeeder --force'),
        $output1 = new Symfony\Component\Console\Output\BufferedOutput()
    );
    echo "<pre>" . $output1->fetch() . "</pre>";

    echo "<h2>Running PRO PRO Seeder...</h2>";
    $status2 = $kernel->handle(
        $input2 = new Symfony\Component\Console\Input\StringInput('db:seed --class=ProProMissionsSeeder --force'),
        $output2 = new Symfony\Component\Console\Output\BufferedOutput()
    );
    echo "<pre>" . $output2->fetch() . "</pre>";
    
    echo "<h2>Done!</h2>";
} catch (\Exception $e) {
    echo "<h2>Exception:</h2>";
    echo "<pre>" . $e->getMessage() . "</pre>";
}
