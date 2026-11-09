import { APP_NAME } from '@/lib/env';

// Titles that already carry the brand (e.g. the landing page's SEO title) are used as-is.
export const pageTitle = (title: string) => (!title ? APP_NAME : title.includes(APP_NAME) ? title : `${title} - ${APP_NAME}`);
