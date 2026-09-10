<?php

namespace App\Exceptions\Auth;

use RuntimeException;

/**
 * Thrown for Google OAuth failures that are safe to surface directly to the
 * user (e.g. missing/unverified email). Message must never contain
 * credentials or internal details — it is flashed straight to the UI.
 */
class GoogleAuthException extends RuntimeException {}
