<?php
// scripts/generate_themes.php
// Run this script to generate 30 Blade and SCSS theme files per invitation type.

$basePath = base_path(); // Laravel base path
$viewBase = $basePath . '/resources/views/themes';
$cssBase = $basePath . '/resources/css/themes';

$types = ['wedding', 'birthday', 'khitanan', 'aqiqah', 'gender_reveal', 'syukuran'];

foreach ($types as $type) {
    $viewDir = "$viewBase/{$type}Themes";
    $cssDir = "$cssBase/{$type}Themes";
    if (!is_dir($viewDir)) {
        mkdir($viewDir, 0755, true);
    }
    if (!is_dir($cssDir)) {
        mkdir($cssDir, 0755, true);
    }
    for ($i = 1; $i <= 30; $i++) {
        $index = str_pad($i, 2, '0', STR_PAD_LEFT);
        $bladeFile = "$viewDir/theme_{$index}.blade.php";
        $scssFile = "$cssDir/theme_{$index}.scss";
        $primary = sprintf('#%06X', random_int(0, 0xFFFFFF));
        $secondary = sprintf('#%06X', random_int(0, 0xFFFFFF));
        // Blade content – extends a generic layout and injects colors via CSS class.
        $bladeContent = "@extends('themes.base')\n\n@section('content')\n<div class=\"theme-{$index}\">\n    <h1>Theme {$index} for {$type}</h1>\n    <p>This is a premium {$type} theme.</p>\n</div>\n@endsection\n";
        file_put_contents($bladeFile, $bladeContent);
        // SCSS content – simple gradient using generated colors.
        $scssContent = ".theme-{$index} {\n    background: linear-gradient(135deg, {$primary}, {$secondary});\n    color: #fff;\n    padding: 2rem;\n    border-radius: 1rem;\n    font-family: 'Inter', sans-serif;\n}\n";
        file_put_contents($scssFile, $scssContent);
    }
}

echo "Theme files generated.\n";
?>
