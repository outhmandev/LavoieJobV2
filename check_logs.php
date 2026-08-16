<?php
 = __DIR__.'/../storage/logs/laravel.log';
if(file_exists()) {
    echo "Log exists. Last 2000 chars:\n";
     = file_get_contents();
    echo substr(, -2000);
} else {
    echo "No log found.";
}
