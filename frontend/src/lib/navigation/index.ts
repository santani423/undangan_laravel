/**
 * Navigation & page-data layer of the SPA.
 *
 * Same API the pages used with Inertia (`Link`, `Head`, `router`, `usePage`,
 * `useForm`), implemented on React Router and the REST API client — so the
 * existing pages kept their code and design when the frontend was split from
 * Laravel. See docs/ARCHITECTURE.md › "Navigation layer".
 */
export { Head, useDocumentTitle } from './head';
export { Link, type LinkProps } from './link';
export { router, toFrontendPath, type Router } from './router';
export type { FormDataLike, Method, Page, PendingVisit, SharedPageProps, VisitOptions } from './types';
export { useForm, type FormProps } from './use-form';
export { usePage } from './use-page';
