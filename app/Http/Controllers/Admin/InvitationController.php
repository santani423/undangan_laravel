<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateInvitationRequest;
use App\Models\Invitation;
use App\Services\ActivityLogger;
use App\Services\InvitationEditorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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

    public function show(Invitation $invitation): Response
    {
        ActivityLogger::record('viewed', $invitation);

        $invitation->loadMissing('user:id,name,email');

        return Inertia::render('admin/invitations/show', [
            ...$this->editor->editorProps($invitation),
            'adminMeta' => [
                'invitation_code' => $invitation->invitation_code,
                // The public viewer resolves /{slug}; no slug means nothing to preview.
                'preview_url'     => $invitation->slug ? url('/' . rawurlencode($invitation->slug)) : null,
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

    public function update(UpdateInvitationRequest $request, Invitation $invitation): RedirectResponse
    {
        $this->editor->update($invitation, $request);

        return back()->with('success', 'Undangan berhasil diperbarui!');
    }

    public function updateSettings(Request $request, Invitation $invitation): RedirectResponse
    {
        $this->editor->updateSettings($invitation, $request);

        return redirect()
            ->route('admin.invitations.show', $invitation->id)
            ->with('success', 'Pengaturan berhasil disimpan.');
    }

    public function updateTheme(Request $request, Invitation $invitation): RedirectResponse
    {
        $theme = $this->editor->updateTheme($invitation, $request);

        return back()->with('success', "Tema berhasil diubah ke \"{$theme->name}\".");
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
