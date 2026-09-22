<?php

namespace App\Http\Requests;

use App\Rules\Base64Image;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInvitationRequest extends FormRequest
{
    protected $dontFlash = [
        'slug',
        'field_values',
        'gallery_items',
        'love_story',
    ];

    public function authorize(): bool
    {
        return true; // Already authorized in controller
    }

    public function rules(): array
    {
        return [
            'status'                          => 'nullable|in:draft,active,archived',
            'slug'                            => 'nullable|string|max:255',
            'field_values'                    => 'nullable|array',
            'field_values.*'                  => ['nullable', new Base64Image()],
            'field_values.groom_child_order'  => ['nullable','integer','min:1','max:50'],
            'field_values.bride_child_order'  => ['nullable','integer','min:1','max:50'],
            'acara_events'                    => 'nullable|array',
            'acara_events.*.name'             => 'required_with:acara_events|string|max:255',
            'acara_events.*.date'             => 'required_with:acara_events|date',
            'gallery_items'                   => 'nullable|array',
            'gallery_items.*.preview'         => ['nullable', new Base64Image()],
            'gallery_items.*.caption'         => 'nullable|string|max:255',
            'love_story'                      => 'nullable|array',
            'love_story.*.photo'              => ['nullable', new Base64Image()],
            'love_story.*.title'              => 'nullable|string|max:255',
            'love_story.*.story'              => 'nullable|string',
            'love_story.*.year'               => 'nullable|string|max:50',
            'additional_info'                 => 'nullable|array',
            'additional_info.*.label'         => 'nullable|string|max:255',
            'additional_info.*.value'         => 'nullable|string|max:1000',
            'dress_code_colors'               => 'nullable|array',
            'dress_code_colors.*.name'        => 'nullable|string|max:100',
            'dress_code_colors.*.hex'         => ['nullable', 'string', 'max:9', 'regex:/^#[0-9A-Fa-f]{3,8}$/'],
        ];
    }
}
