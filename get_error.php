<?php
$lines = file('storage/logs/laravel.log');
$errors = [];
foreach (array_reverse($lines) as $l) {
    if (strpos($l, 'production.ERROR') !== false) {
        $errors[] = $l;
        if (count($errors) > 5) break;
    }
}
foreach (array_reverse($errors) as $err) {
    echo $err . "\n";
}
