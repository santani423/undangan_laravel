<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvitationRequest extends FormRequest
{
    protected $dontFlash = [
        'field_values',
        'gallery_items',
        'love_story',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event_type_id'                   => 'required|exists:event_types,id',
            'theme_id'                        => 'required|exists:themes,id',
            'package_id'                      => 'required|exists:packages,id',
            'invitation_code'                 => 'nullable|string|max:100',
            'field_values'                    => 'nullable|array',
            'field_values.*'                  => 'nullable',
            'field_values.groom_child_order'  => ['nullable','integer','min:1','max:50'],
            'field_values.bride_child_order'  => ['nullable','integer','min:1','max:50'],
            'acara_events'                    => 'nullable|array',
            'acara_events.*.name'             => 'required_with:acara_events|string|max:255',
            'acara_events.*.date'             => 'required_with:acara_events|date',
            'gallery_items'                   => 'nullable|array',
            'love_story'                      => 'nullable|array',
        ];
    }
}
