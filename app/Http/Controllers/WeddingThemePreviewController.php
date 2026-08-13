<?php

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\BinaryFileResponse;

class WeddingThemePreviewController extends Controller
{
    private const BASE_DIR = 'views/themes/weddingThemes';

    public function show(string $theme): BinaryFileResponse
    {
        return $this->serve($theme, 'index.html');
    }

    public function asset(string $theme, string $path): BinaryFileResponse
    {
        return $this->serve($theme, $path);
    }

    private function serve(string $theme, string $relativePath): BinaryFileResponse
    {
        abort_unless(preg_match('/^[A-Za-z0-9_-]+$/', $theme) === 1, 404);

        $themeDir = resource_path(self::BASE_DIR . DIRECTORY_SEPARATOR . $theme);
        $baseRealPath = realpath($themeDir);

        abort_unless($baseRealPath !== false && is_dir($baseRealPath), 404);

        $relativePath = ltrim(rawurldecode($relativePath), "/\\");
        $targetPath = $relativePath === ''
            ? $baseRealPath . DIRECTORY_SEPARATOR . 'index.html'
            : $baseRealPath . DIRECTORY_SEPARATOR . $relativePath;
        $resolvedPath = realpath($targetPath);

        abort_unless($resolvedPath !== false && is_file($resolvedPath), 404);
        abort_unless($this->isWithinBaseDir($baseRealPath, $resolvedPath), 404);

        return response()->file($resolvedPath);
    }

    private function isWithinBaseDir(string $baseRealPath, string $resolvedPath): bool
    {
        $basePrefix = rtrim($baseRealPath, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;

        return str_starts_with($resolvedPath, $basePrefix) || $resolvedPath === rtrim($baseRealPath, DIRECTORY_SEPARATOR);
    }
}
