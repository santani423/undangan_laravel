<?php
$lines = file('storage/logs/laravel.log');
$start = count($lines) - 100;
if ($start < 0) $start = 0;

$found = -1;
for($i = count($lines)-1; $i >= 0; $i--) {
    if(strpos($lines[$i], 'production.ERROR') !== false) {
        $found = $i;
        break;
    }
}
if($found !== -1) {
    for($j = $found; $j < $found + 15 && $j < count($lines); $j++) {
        echo $lines[$j];
    }
}
