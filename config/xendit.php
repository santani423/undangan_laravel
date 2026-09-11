<?php

return [
    // api_key / webhook_token are no longer read from here — XenditService
    // pulls them from payment_gateway_configs (Admin → Settings → Pembayaran).
    'base_url' => 'https://api.xendit.co',
];
