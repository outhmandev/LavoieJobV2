<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

function parseEnv($path) {
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $env = [];
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $env[trim($name)] = trim($value);
    }
    return $env;
}

$env = parseEnv(__DIR__.'/../.env');
$host = $env['DB_HOST'];
$db   = $env['DB_DATABASE'];
$user = $env['DB_USERNAME'];
$pass = $env['DB_PASSWORD'];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $profileStatuses = ['Disponible', 'En Attente', 'Affect?(e)', 'Injoignable', 'Indisponible', 'Sugg?r?', 'Dossier incomplet', 'Black liste', 'Reclamation'];
    $clientStatuses = ['Prospect', 'En cours de traitement', 'Valid?', 'En Attente', 'Sugg?r?', 'Reclamation', 'Rejet', 'Black liste'];
    
    $stmt = $pdo->prepare("INSERT INTO manageable_statuses (type, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())");
    
    foreach ($profileStatuses as $name) {
        // check if exists
        $check = $pdo->prepare("SELECT id FROM manageable_statuses WHERE type='profile' AND name=?");
        $check->execute([$name]);
        if ($check->rowCount() == 0) {
            $stmt->execute(['profile', $name]);
        }
    }
    
    foreach ($clientStatuses as $name) {
        $check = $pdo->prepare("SELECT id FROM manageable_statuses WHERE type='client' AND name=?");
        $check->execute([$name]);
        if ($check->rowCount() == 0) {
            $stmt->execute(['client', $name]);
        }
    }
    
    echo "<h1>Successfully inserted statuses!</h1>";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
