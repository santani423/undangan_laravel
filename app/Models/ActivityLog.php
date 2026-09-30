<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'changes',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'changes'    => 'array',
            'model_id'   => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Polymorphic relation to the audited model (model_type + model_id).
     * Note: uses non-standard column names so we alias them here.
     */
    public function subject(): MorphTo
    {
        return $this->morphTo('subject', 'model_type', 'model_id');
    }

    private const MODULE_LABELS = [
        User::class                 => 'Pengguna',
        UserProfile::class          => 'Profil Pengguna',
        Invitation::class           => 'Undangan',
        Transaction::class          => 'Transaksi',
        Theme::class                => 'Tema',
        Package::class              => 'Paket',
        EventType::class            => 'Tipe Acara',
        PaymentGatewayConfig::class => 'Payment Gateway',
    ];

    private const ACTION_LABELS = [
        'login'           => 'Login',
        'logout'          => 'Logout',
        'registered'      => 'Registrasi akun',
        'password_reset'  => 'Reset password',
        'viewed'          => 'Membuka detail',
        'created'         => 'Membuat',
        'updated'         => 'Mengubah',
        'deleted'         => 'Menghapus',
        'force_deleted'   => 'Menghapus permanen',
        'restored'        => 'Memulihkan',
    ];

    public function moduleLabel(): ?string
    {
        if (! $this->model_type) {
            return null;
        }

        return self::MODULE_LABELS[$this->model_type] ?? class_basename($this->model_type);
    }

    public function description(): string
    {
        $action = self::ACTION_LABELS[$this->action] ?? $this->action;
        $module = $this->moduleLabel();

        if (! $module) {
            return $action;
        }

        $description = "{$action} {$module} #{$this->model_id}";

        if ($this->action === 'updated' && ! empty($this->changes['attributes'])) {
            $description .= ' (' . implode(', ', array_keys($this->changes['attributes'])) . ')';
        }

        return $description;
    }

    /** Shape shared by the admin user-detail page and the global activity log. */
    public function toAdminArray(): array
    {
        return [
            'id'          => $this->id,
            'action'      => $this->action,
            'description' => $this->description(),
            'module'      => $this->moduleLabel(),
            'model_type'  => $this->model_type ? class_basename($this->model_type) : null,
            'model_id'    => $this->model_id,
            'changes'     => $this->changes,
            'ip_address'  => $this->ip_address,
            'user_agent'  => $this->user_agent,
            'created_at'  => $this->created_at?->toDateTimeString(),
        ];
    }
}
