/**
 * Runtime configuration from Vite env variables (see .env.example).
 */

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';

/** Absolute base URL of the REST API, e.g. https://be.undesia.com/api/v1 (no trailing slash). */
export const API_BASE_URL = stripTrailingSlash(new URL(import.meta.env.VITE_API_BASE_URL || '/api/v1', origin).toString());

/** Path part of API_BASE_URL, e.g. /api/v1. */
export const API_BASE_PATH = new URL(API_BASE_URL).pathname.replace(/\/+$/, '');

/**
 * Origin of the Laravel backend: Google OAuth redirect, Sanctum CSRF cookie,
 * file downloads. Derived from API_BASE_URL unless VITE_BACKEND_URL is set.
 */
export const BACKEND_URL = stripTrailingSlash(import.meta.env.VITE_BACKEND_URL || API_BASE_URL.replace(/\/api\/v1$/, ''));

// VITE_APP_NAME has shipped as the framework's "Laravel" placeholder before,
// which then ended up in every page title Google indexed.
const envAppName = import.meta.env.VITE_APP_NAME;
export const APP_NAME = envAppName && envAppName !== 'Laravel' ? envAppName : 'Undesia';
