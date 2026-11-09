import type { User } from '@/types';

/** Laravel validation errors: { field: [messages] }. */
export type ValidationErrors = Record<string, string[]>;

/**
 * The JSON envelope every /api/v1 endpoint answers with
 * (backend: App\Http\Responses\ApiResponse, docs/API_DOCUMENTATION.md).
 */
export interface ApiEnvelope<T = unknown> {
    success: boolean;
    /** Flash message for the user. */
    message?: string;
    /** Only present when the message is not a plain success/error. */
    message_type?: 'success' | 'error' | 'info';
    data?: T;
    /** Frontend path (or absolute URL) to continue on. */
    redirect?: string;
    /** External URL for a full page load (payment gateway checkout). */
    location?: string;
    /** 422 validation errors. */
    errors?: ValidationErrors;
    /** Status string some auth / settings endpoints return (e.g. "verification-link-sent"). */
    status?: string;
    /** Present when the response changed the session's user (login, logout, profile update). */
    auth?: { user: User | null };
    /** 5xx details while APP_DEBUG=true. */
    debug?: {
        exception: string;
        message: string;
        file: string;
        line: number;
        trace: string[];
    };
    [key: string]: unknown;
}

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface RequestProgress {
    loaded: number;
    total?: number;
    percentage?: number;
}

export interface RequestOptions {
    /** Query string parameters (GET) — for other methods use `data`. */
    query?: Record<string, unknown>;
    /** JSON body, a FormData, or an object containing File/Blob values (sent as multipart). */
    data?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    /** Upload progress (multipart requests). */
    onUploadProgress?: (progress: RequestProgress) => void;
    /** Force multipart/form-data even without files (Inertia's forceFormData). */
    forceFormData?: boolean;
}
