<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\EventType;
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
}
