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
    
    echo "<h1>Database Sanitization Progress (Pass 3)</h1>";
    echo "<ul>";
    
    // Define mappings for profiles
    $suggere = "Sugg\u{00E9}r\u{00E9}";
    $affecte = "Affect\u{00E9}(e)";
    
    $profileMappings = [
        $suggere => ['Sugg2r', "Sugg\u{00E9}r\u{00E9}", 'suggere', 'Sugg?r?', 'Sugg?r?'],
        $affecte => ["Affect\u{00E9}(e)", 'Affecte', "Affect\u{00C3}\u{00A9}(e)", 'Affect?e', 'Affect?(e)'],
        'En Attente' => ['En_Attende', 'En Attende'],
        'Disponible' => ['dISPONIBE', 'disponible', ''],
        'Black liste' => ['SUPPRIMER']
    ];
    
    // Fix profiles
    echo "<li><b>Starting profiles table...</b><ul>";
    $stmt = $pdo->prepare("UPDATE profiles SET status = ? WHERE status = ?");
    foreach ($profileMappings as $correct => $incorrectList) {
        foreach ($incorrectList as $incorrect) {
            $stmt->execute([$correct, $incorrect]);
            $count = $stmt->rowCount();
            if ($count > 0) {
                echo "<li>Updated $count profiles from '$incorrect' to '$correct'</li>";
            }
        }
    }
    echo "</ul></li>";

    // Define mappings for clients
    $valide = "Valid\u{00E9}";
    $clientMappings = [
        $suggere => ['Sugg2r', "Sugg\u{00E9}r\u{00E9}", 'suggere', 'Sugg?r?', 'Sugg?r?'],
        $valide => ["Valid\u{00E9}", 'Valide', 'Valid?', 'Valid?'],
        'Prospect' => ['']
    ];
    
    // Fix clients
    echo "<li><b>Starting clients table...</b><ul>";
    $stmt = $pdo->prepare("UPDATE clients SET statut = ? WHERE statut = ?");
    foreach ($clientMappings as $correct => $incorrectList) {
        foreach ($incorrectList as $incorrect) {
            $stmt->execute([$correct, $incorrect]);
            $count = $stmt->rowCount();
            if ($count > 0) {
                echo "<li>Updated $count clients from '$incorrect' to '$correct'</li>";
            }
        }
    }
    echo "</ul></li>";
    
    echo "</ul>";
    echo "<h2>Sanitization Complete! OK</h2>";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
