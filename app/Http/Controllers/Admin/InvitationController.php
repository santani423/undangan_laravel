<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateInvitationRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Invitation;
use App\Services\ActivityLogger;
use App\Services\InvitationEditorService;
use App\Support\FrontendUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin view and editor for any customer's invitation. Access is granted by
 * the `area:admin` route middleware, so unlike the customer controller there
 * is no ownership check — everything else goes through the same
 * InvitationEditorService the customer editor uses.
 *
 * Routes bind the invitation by id (not slug) so the admin URL stays stable
 * when the slug is edited from the settings tab.
 */
class InvitationController extends Controller
{
    public function __construct(private InvitationEditorService $editor)
    {
    }

    public function show(Invitation $invitation): JsonResponse
    {
        ActivityLogger::record('viewed', $invitation);

        $invitation->loadMissing('user:id,name,email');

        return ApiResponse::ok([
            ...$this->editor->editorProps($invitation),
            'adminMeta' => [
                'invitation_code' => $invitation->invitation_code,
                // The public viewer resolves /{slug}; no slug means nothing to preview.
                'preview_url'     => $invitation->slug ? FrontendUrl::to('/' . rawurlencode($invitation->slug)) : null,
                'is_expired'      => $invitation->isExpired(),
                'created_at'      => $invitation->created_at?->toDateTimeString(),
                'updated_at'      => $invitation->updated_at?->toDateTimeString(),
                'expires_at'      => $invitation->expires_at?->toDateTimeString(),
                'customer'        => $invitation->user ? [
                    'id'    => $invitation->user->id,
                    'name'  => $invitation->user->name,
                    'email' => $invitation->user->email,
                ] : null,
            ],
        ]);
    }

    public function update(UpdateInvitationRequest $request, Invitation $invitation): JsonResponse
    {
        $this->editor->update($invitation, $request);

        return ApiResponse::message('Undangan berhasil diperbarui!');
    }

    public function updateSettings(Request $request, Invitation $invitation): JsonResponse
    {
        $this->editor->updateSettings($invitation, $request);

        return ApiResponse::toRoute('admin.invitations.show', $invitation->id, 'Pengaturan berhasil disimpan.');
    }

    public function updateTheme(Request $request, Invitation $invitation): JsonResponse
    {
        $theme = $this->editor->updateTheme($invitation, $request);

        return ApiResponse::message("Tema berhasil diubah ke \"{$theme->name}\".");
    }

    public function uploadMusic(Request $request, Invitation $invitation): JsonResponse
    {
        return $this->editor->uploadMusic($invitation, $request);
    }

    public function checkSlug(Request $request): JsonResponse
    {
        return $this->editor->checkSlug($request);
    }
}
