<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Serves standalone HTML wedding themes (resources/views/themes/weddingThemes/{theme})
 * so they can be viewed before they are integrated into the main theme system.
 */
class WeddingThemePreviewController extends Controller
{
    private const BASE_DIR = 'views/themes/weddingThemes';

    public function show(string $theme): Response
    {
        $entry = $this->entryFile($this->themeDir($theme), $theme);

        abort_if($entry === null, 404);

        $html = file_get_contents($entry);

        // Themes exported as bare fragments (no doctype/head) would otherwise render
        // in quirks mode without a viewport, which breaks the layout on phones.
        if (preg_match('/^\s*<!doctype/i', $html) !== 1) {
            $html = $this->wrapFragment($html);
        }

        return response($html)->header('Content-Type', 'text/html; charset=UTF-8');
    }

    public function asset(string $theme, string $path): BinaryFileResponse
    {
        $assetsDir = realpath($this->themeDir($theme) . DIRECTORY_SEPARATOR . 'assets');

        abort_unless($assetsDir !== false && is_dir($assetsDir), 404);

        $relativePath = ltrim(rawurldecode($path), "/\\");
        $resolvedPath = realpath($assetsDir . DIRECTORY_SEPARATOR . $relativePath);

        abort_unless($resolvedPath !== false && is_file($resolvedPath), 404);
        abort_unless($this->isWithinBaseDir($assetsDir, $resolvedPath), 404);

        return response()->file($resolvedPath);
    }

    private function themeDir(string $theme): string
    {
        abort_unless(preg_match('/^[A-Za-z0-9_-]+$/', $theme) === 1, 404);

        $themeDir = realpath(resource_path(self::BASE_DIR . DIRECTORY_SEPARATOR . $theme));

        abort_unless($themeDir !== false && is_dir($themeDir), 404);

        return $themeDir;
    }

    /**
     * Entry page of a theme: index.html, else {theme}.html, else the first .html file.
     */
    private function entryFile(string $themeDir, string $theme): ?string
    {
        foreach (['index.html', $theme . '.html'] as $name) {
            $candidate = $themeDir . DIRECTORY_SEPARATOR . $name;

            if (is_file($candidate)) {
                return $candidate;
            }
        }

        $htmlFiles = glob($themeDir . DIRECTORY_SEPARATOR . '*.html') ?: [];

        return $htmlFiles[0] ?? null;
    }

    private function wrapFragment(string $html): string
    {
        return "<!doctype html>\n<html lang=\"id\">\n<head>\n"
            . "<meta charset=\"utf-8\">\n"
            . "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n"
            . $html
            . "\n</body>\n</html>\n";
    }

    private function isWithinBaseDir(string $baseRealPath, string $resolvedPath): bool
    {
        $basePrefix = rtrim($baseRealPath, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;

        return str_starts_with($resolvedPath, $basePrefix);
    }
}
