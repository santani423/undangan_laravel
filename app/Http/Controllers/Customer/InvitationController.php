<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\EventType;
use App\Models\Package;
use App\Models\Theme;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvitationController extends Controller
{
    public function create()
    {
        $eventTypes = EventType::active()->orderBy('id')->get(['id', 'name', 'label', 'description', 'icon_path']);

        return Inertia::render('customer/invitations/create', [
            'eventTypes' => $eventTypes,
        ]);
    }

    public function selectTheme(Request $request)
    {
        $eventTypeId = $request->query('event_type_id');

        $eventType = EventType::active()->findOrFail($eventTypeId, ['id', 'name', 'label']);

        $themes = Theme::active()
            ->where('event_type', $eventType->name)
            ->orderBy('is_premium')
            ->orderBy('usage_count', 'desc')
            ->get(['id', 'name', 'slug', 'description', 'thumbnail_url', 'preview_image_url', 'color_primary', 'color_secondary', 'is_premium', 'is_exclusive', 'price', 'tags', 'usage_count']);

        $packages = Package::active()
            ->with('features')
            ->get(['id', 'name', 'label', 'description', 'price', 'currency', 'billing_period', 'duration_days', 'max_gallery_uploads']);

        return Inertia::render('customer/invitations/select-theme', [
            'eventType' => $eventType,
            'themes'    => $themes,
            'packages'  => $packages,
        ]);
    }
}
