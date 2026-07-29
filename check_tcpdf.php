<?php
require 'vendor/autoload.php';
if (class_exists('TCPDF')) {
    echo "TCPDF is installed!\n";
} else {
    echo "TCPDF is NOT installed.\n";
}
