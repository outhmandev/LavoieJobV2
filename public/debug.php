<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Laravel cPanel Environment Debugger</h1>";

echo "<h2>1. PHP Version</h2>";
echo "Current PHP Version: " . phpversion() . "<br>";
if (version_compare(phpversion(), '8.1.0', '<')) {
    echo "<span style='color:red; font-weight:bold;'>WARNING: Your PHP version is below 8.1. Laravel usually requires at least PHP 8.1 or 8.2. You may need to change this in cPanel (Select PHP Version).</span><br>";
} else {
    echo "<span style='color:green'>PHP Version is OK.</span><br>";
}

echo "<h2>2. Required PHP Extensions</h2>";
$extensions = ['bcmath', 'ctype', 'fileinfo', 'json', 'mbstring', 'openssl', 'pdo', 'tokenizer', 'xml', 'curl'];
$missing = false;
foreach ($extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "<span style='color:green'>[OK] $ext</span><br>";
    } else {
        echo "<span style='color:red; font-weight:bold;'>[MISSING] $ext is required! Enable it in cPanel (Select PHP Version -> Extensions).</span><br>";
        $missing = true;
    }
}

echo "<h2>3. Directory Permissions</h2>";
$paths = [
    '../storage' => '../storage',
    '../storage/logs' => '../storage/logs',
    '../storage/framework/views' => '../storage/framework/views',
    '../bootstrap/cache' => '../bootstrap/cache',
];

foreach ($paths as $name => $path) {
    if (!file_exists($path)) {
        echo "<span style='color:red; font-weight:bold;'>[MISSING] Directory $name does not exist.</span><br>";
    } elseif (!is_writable($path)) {
        echo "<span style='color:red; font-weight:bold;'>[ERROR] Directory $name is NOT writable! Change permissions to 775 in cPanel File Manager.</span><br>";
    } else {
        echo "<span style='color:green'>[OK] $name is writable.</span><br>";
    }
}

echo "<h2>4. Environment File (.env)</h2>";
if (file_exists('../.env')) {
    echo "<span style='color:green'>[OK] .env file exists.</span><br>";
} else {
    echo "<span style='color:red; font-weight:bold;'>[ERROR] .env file is MISSING! Make sure it was uploaded (it is a hidden file).</span><br>";
}

echo "<h2>5. Test Laravel Boot</h2>";
try {
    if (!file_exists(__DIR__.'/../vendor/autoload.php')) {
        throw new Exception("vendor/autoload.php not found. Did you run composer install or upload the vendor folder?");
    }
    require __DIR__.'/../vendor/autoload.php';
    echo "<span style='color:green'>[OK] Autoloader loaded.</span><br>";
    
    $app = require_once __DIR__.'/../bootstrap/app.php';
    echo "<span style='color:green'>[OK] App bootstrapped successfully.</span><br>";
} catch (\Throwable $e) {
    echo "<span style='color:red; font-weight:bold;'>[FATAL ERROR] Laravel failed to boot: " . $e->getMessage() . "</span><br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}

echo "<hr>";
echo "<h3>Next Steps:</h3>";
echo "<p>Please copy all the text on this page (or take a screenshot) and send it back to me!</p>";
