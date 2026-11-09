<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\JsonResponse;

/**
 * GET /api/v1/app/config — app-wide values every SPA page may show.
 * Replaces the `name` and `quote` props HandleInertiaRequests used to share.
 */
class AppConfigController extends Controller
{
    public function show(): JsonResponse
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return ApiResponse::ok([
            'name'  => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
        ]);
    }
}
