<?php
$fp = fopen('storage/logs/laravel.log', 'r');
if (!$fp) die("Cannot open log file");
fseek($fp, -500000, SEEK_END);
$content = fread($fp, 500000);
fclose($fp);
$lines = explode("\n", $content);
$errors = [];
foreach (array_reverse($lines) as $line) {
    if (strpos($line, 'production.ERROR') !== false || strpos($line, 'Exception') !== false || strpos($line, 'Error') !== false) {
        $errors[] = $line;
    }
}
$errors = array_slice($errors, 0, 50);
foreach (array_reverse($errors) as $err) {
    echo $err . "\n";
}
