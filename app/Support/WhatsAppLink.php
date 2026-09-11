<?php

namespace App\Support;

class WhatsAppLink
{
    /**
     * Build a wa.me link, optionally pre-filling a message. Centralizes the
     * digit-stripping + encoding so no caller hand-rolls a wa.me URL.
     */
    public static function build(string $rawPhone, ?string $message = null): string
    {
        $digits = preg_replace('/\D/', '', $rawPhone);
        $link = "https://wa.me/{$digits}";

        if ($message !== null && $message !== '') {
            $link .= '?text='.rawurlencode($message);
        }

        return $link;
    }
}
