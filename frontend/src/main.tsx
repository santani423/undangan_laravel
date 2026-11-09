import '@/assets/css/app.css';

import { initializeTheme } from '@/hooks/use-appearance';
import { createAppRouter } from '@/routes';
import { ensureCsrfCookie } from '@/services/api';
import { loadAppConfig } from '@/store/app';
import { loadAuthUser } from '@/store/auth';
import { takeFlashFromUrl } from '@/store/page';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

// Light / dark mode before the first paint.
initializeTheme();

// Flash messages handed over in the URL by backend redirects (Google login errors).
takeFlashFromUrl();

// Session bootstrap: XSRF cookie, signed-in user (route guards wait for it), app config.
void ensureCsrfCookie();
void loadAuthUser();
void loadAppConfig();

const router = createAppRouter();

createRoot(document.getElementById('app')!).render(<RouterProvider router={router} />);
