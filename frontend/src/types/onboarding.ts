/**
 * A customer's pre-auth choice, captured from whichever landing-page entry
 * point they started from (theme card, package tier card, or the plain
 * header CTA with nothing chosen yet). Carried through the auth modal /
 * Google OAuth round-trip so the backend can send them back to the right
 * wizard step — every id here is re-validated server-side, never trusted
 * as-is.
 */
export interface OnboardingIntent {
    themeId?: number;
    packageId?: number;
    packageTier?: 'basic' | 'premium' | 'exclusive';
}
