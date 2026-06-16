<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreDigitalWalletRequest;
use App\Models\DigitalWallet;
use App\Models\Invitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DigitalWalletController extends Controller
{
    public function index(): Response
    {
        $wallets = DigitalWallet::where('user_id', auth()->id())
            ->latest()
            ->get()
            ->map(fn ($w) => [
                'id'             => $w->id,
                'provider'       => $w->provider,
                'provider_label' => $w->provider_label,
                'account_number' => $w->account_number,
                'account_name'   => $w->account_name,
                'logo_url'       => $w->logo_url,
                'is_active'      => $w->is_active,
            ]);

        return Inertia::render('customer/digital-wallets/index', [
            'wallets'   => $wallets,
            'providers' => DigitalWallet::$providers,
        ]);
    }

    public function store(StoreDigitalWalletRequest $request): RedirectResponse
    {
        $logoPath = null;
        if ($request->filled('logo') && str_starts_with($request->logo, 'data:image/')) {
            $logoPath = $this->saveBase64Image($request->logo, 'digital-wallets/' . auth()->id());
        }

        DigitalWallet::create([
            'user_id'        => auth()->id(),
            'provider'       => $request->provider,
            'provider_label' => $request->provider_label,
            'account_number' => $request->account_number,
            'account_name'   => $request->account_name,
            'logo_path'      => $logoPath,
            'is_active'      => $request->boolean('is_active', true),
        ]);

        return redirect()->route('customer.digital-wallets.index')
            ->with('success', 'Dompet digital berhasil ditambahkan.');
    }

    public function update(StoreDigitalWalletRequest $request, DigitalWallet $digitalWallet): RedirectResponse
    {
        abort_if($digitalWallet->user_id !== auth()->id(), 403);

        $logoPath = $digitalWallet->logo_path;

        if ($request->filled('logo')) {
            if (str_starts_with($request->logo, 'data:image/')) {
                // Delete old logo
                if ($logoPath) {
                    Storage::disk('public')->delete($logoPath);
                }
                $logoPath = $this->saveBase64Image($request->logo, 'digital-wallets/' . auth()->id());
            } elseif ($request->logo === 'remove') {
                if ($logoPath) {
                    Storage::disk('public')->delete($logoPath);
                }
                $logoPath = null;
            }
        }

        $digitalWallet->update([
            'provider'       => $request->provider,
            'provider_label' => $request->provider_label,
            'account_number' => $request->account_number,
            'account_name'   => $request->account_name,
            'logo_path'      => $logoPath,
            'is_active'      => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Dompet digital berhasil diperbarui.');
    }

    public function destroy(DigitalWallet $digitalWallet): RedirectResponse
    {
        abort_if($digitalWallet->user_id !== auth()->id(), 403);

        if ($digitalWallet->logo_path) {
            Storage::disk('public')->delete($digitalWallet->logo_path);
        }

        $digitalWallet->delete();

        return back()->with('success', 'Dompet digital berhasil dihapus.');
    }

    // ── Pengaitan dompet ke undangan ──────────────────────────────────────────

    public function invitationWallets(Invitation $invitation): Response
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $myWallets = DigitalWallet::where('user_id', auth()->id())
            ->active()
            ->get(['id', 'provider', 'provider_label', 'account_number', 'account_name', 'logo_path', 'is_active']);

        $linked = $invitation->digitalWallets()
            ->get(['digital_wallets.id', 'invitation_digital_wallets.is_displayed', 'invitation_digital_wallets.display_order'])
            ->keyBy('id');

        $wallets = $myWallets->map(fn ($w) => [
            'id'             => $w->id,
            'provider'       => $w->provider,
            'provider_label' => $w->provider_label,
            'account_number' => $w->account_number,
            'account_name'   => $w->account_name,
            'logo_url'       => $w->logo_url,
            'is_linked'      => $linked->has($w->id),
            'is_displayed'   => $linked->has($w->id) ? (bool) $linked[$w->id]->pivot->is_displayed : false,
            'display_order'  => $linked->has($w->id) ? $linked[$w->id]->pivot->display_order : 99,
        ])->sortBy('display_order')->values();

        return Inertia::render('customer/digital-wallets/invitation-wallets', [
            'invitation' => [
                'id'    => $invitation->id,
                'slug'  => $invitation->slug,
                'title' => $invitation->title,
            ],
            'wallets' => $wallets,
        ]);
    }

    public function syncInvitationWallets(Request $request, Invitation $invitation): RedirectResponse
    {
        abort_if($invitation->user_id !== auth()->id(), 403);

        $request->validate([
            'wallets'               => 'nullable|array',
            'wallets.*.id'          => 'required|exists:digital_wallets,id',
            'wallets.*.is_displayed'=> 'boolean',
            'wallets.*.display_order' => 'integer|min:0',
        ]);

        $syncData = [];
        foreach ($request->input('wallets', []) as $item) {
            // Only allow wallets owned by the authenticated user
            $wallet = DigitalWallet::where('id', $item['id'])
                ->where('user_id', auth()->id())
                ->first();
            if (!$wallet) {
                continue;
            }
            $syncData[$item['id']] = [
                'is_displayed'  => $item['is_displayed'] ?? true,
                'display_order' => $item['display_order'] ?? 0,
            ];
        }

        $invitation->digitalWallets()->sync($syncData);

        return back()->with('success', 'Pengaturan dompet digital undangan berhasil disimpan.');
    }

    private function saveBase64Image(string $dataUrl, string $directory): string
    {
        $parts     = explode(',', $dataUrl, 2);
        $imageData = base64_decode($parts[1] ?? '');
        $filename  = Str::uuid() . '.jpg';
        $path      = "{$directory}/{$filename}";
        Storage::disk('public')->put($path, $imageData);
        return $path;
    }
}
