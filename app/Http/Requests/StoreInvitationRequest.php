<?php

namespace App\Http\Requests;

use App\Models\EventType;
use App\Rules\Base64Image;
use App\Services\InvitationSlugService;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class StoreInvitationRequest extends FormRequest
{
    protected function failedValidation(Validator $validator)
    {
        Log::error('StoreInvitationRequest validation failed', [
            'errors' => $validator->errors()->toArray(),
        ]);

        parent::failedValidation($validator);
    }

    protected $dontFlash = [
        'slug',
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
        $rules = [
            'event_type_id'                   => 'required|exists:event_types,id',
            'theme_id'                        => 'required|exists:themes,id',
            'package_id'                      => 'required|exists:packages,id',
            'invitation_code'                 => 'nullable|string|max:100',
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
        ];

        foreach ($this->titleFieldKeys() as $key) {
            $rules["field_values.{$key}"] = 'required|string|max:255';
        }

        return $rules;
    }

    /**
     * Field keys (per the invitation's event type) whose values feed the invitation title,
     * so they must be filled in — otherwise every invitation would fall back to a generic title.
     */
    private function titleFieldKeys(): array
    {
        $eventType = EventType::find($this->input('event_type_id'));

        if (! $eventType) {
            return [];
        }

        return app(InvitationSlugService::class)->titleFieldKeys($eventType->name);
    }
}
