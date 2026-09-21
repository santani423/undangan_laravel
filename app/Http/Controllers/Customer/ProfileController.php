<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\UpdateProfileRequest;
use App\Models\User;
use App\Services\UploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user    = $request->user();
        $profile = $user->profile;
        $prefs   = $profile?->notification_preferences ?? [];

        return Inertia::render('customer/profile/index', [
            'profile' => [
                'name'            => $user->name,
                'email'           => $user->email,
                'phone_number'    => $user->phone_number,
                'bio'             => $profile?->bio,
                'language'        => $profile?->language ?? 'id',
                'timezone'        => $profile?->timezone ?? 'Asia/Jakarta',
                'notify_email'    => (bool) ($prefs['email'] ?? true),
                'notify_whatsapp' => (bool) ($prefs['whatsapp'] ?? true),
                'photo_url'       => $user->displayAvatar(),
                'has_custom_photo' => (bool) $profile?->profile_photo_url,
                'email_verified'  => $user->email_verified_at !== null,
                'member_since'    => $user->created_at?->translatedFormat('d F Y'),
                'invitations'     => $user->invitations()->count(),
                'transactions'    => $user->transactions()->count(),
            ],
        ]);
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $data = $request->validated();

        DB::transaction(function () use ($request, $user, $data) {
            $user->fill([
                'name'         => $data['name'],
                'email'        => $data['email'],
                'phone_number' => $data['phone_number'] ?? null,
            ]);

            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }

            $user->save();

            $profile   = $user->profile()->firstOrNew();
            $photoPath = $profile->profile_photo_url;

            try {
                if ($request->hasFile('photo')) {
                    $photoPath = UploadService::uploadImage(
                        $request->file('photo'),
                        'avatars/' . $user->id,
                        $photoPath,
                        400,
                    );
                } elseif ($request->boolean('remove_photo')) {
                    UploadService::deleteFile($photoPath);
                    $photoPath = null;
                }
            } catch (\RuntimeException $e) {
                throw ValidationException::withMessages(['photo' => $e->getMessage()]);
            }

            $profile->fill([
                'bio'                      => $data['bio'] ?? null,
                'language'                 => $data['language'],
                'timezone'                 => $data['timezone'],
                'profile_photo_url'        => $photoPath,
                'notification_preferences' => [
                    'email'    => $request->boolean('notify_email'),
                    'whatsapp' => $request->boolean('notify_whatsapp'),
                ],
            ]);

            $user->profile()->save($profile);
        });

        return back()->with('success', 'Profil berhasil diperbarui.');
    }
}
