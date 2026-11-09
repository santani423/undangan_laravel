import { APP_NAME } from '@/lib/env';
import { api } from '@/services/api';
import { createStore } from './create-store';

/** App-wide values (GET /api/v1/app/config) — the former Inertia shared props `name` and `quote`. */
export interface AppConfig {
    name: string;
    quote: { message: string; author: string };
}

export const appStore = createStore<AppConfig>({ name: APP_NAME, quote: { message: '', author: '' } });

export function loadAppConfig(): Promise<void> {
    return api
        .get<AppConfig>('/app/config')
        .then((res) => {
            if (res.data) appStore.set(res.data);
        })
        .catch(() => undefined);
}
