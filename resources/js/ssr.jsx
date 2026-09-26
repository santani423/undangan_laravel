/* prettier-ignore */
import {
createInertiaApp
} from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import { route } from 'ziggy-js';
import { pageTitle } from './lib/page-title';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: pageTitle,
        resolve: (name) => {
            const pages = import.meta.glob('./pages/**/*.tsx', {
                eager: true,
            });
            return pages[`./pages/${name}.tsx`];
        },
        // prettier-ignore
        setup: ({ App, props }) => {
            // Components call the global route() that @routes provides in the browser.
            global.route = (name, params, absolute) =>
                route(name, params, absolute, { ...page.props.ziggy, location: new URL(page.props.ziggy.location) });

            return <App {...props} />;
        },
    }),
);
