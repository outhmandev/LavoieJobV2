<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Running Seeder...</h1>";

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

try {
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $status = $kernel->handle(
        $input = new Symfony\Component\Console\Input\StringInput('db:seed --class=StatusSeeder --force'),
        $output = new Symfony\Component\Console\Output\BufferedOutput()
    );
    echo "<pre>";
    echo "Status code: $status\n";
    echo $output->fetch();
    echo "</pre>";
} catch (\Exception $e) {
    echo "<h2>Exception:</h2>";
    echo "<pre>" . $e->getMessage() . "</pre>";
}
