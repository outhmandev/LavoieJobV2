<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

 = new ZipArchive;
 = ->open('build.zip');
if ( === TRUE) {
    // Extract it to public/build/
    ->extractTo(__DIR__ . '/build/');
    ->close();
    echo 'Extraction successful!';
} else {
    echo 'Failed to open zip file, code: ' . ;
}
