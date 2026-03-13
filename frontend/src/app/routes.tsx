import { createBrowserRouter } from 'react-router';

// Layout is the persistent shell — sidebar + main content area
// It wraps all pages so the sidebar never remounts when navigating
import { Layout } from './components/Layout';

// The 4 main pages
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

// createBrowserRouter defines the URL structure of the app
// Each route maps a URL path to a React component
export const router = createBrowserRouter([
    {
        // The root path "/" uses Layout as the wrapper component
        // Layout renders the sidebar + an <Outlet /> where child pages appear
        path: '/',
        Component: Layout,

        // Children are the pages that render inside Layout's <Outlet />
        // When you navigate to /applications, Layout stays mounted
        // and only the content area swaps to the Applications component
        children: [
            // index: true means this is the default child - loads at '/'
            { index: true, Component: Dashboard },

            // Each path here becomes a URL in the browser
            { path: 'applications', Component: Applications },
            { path: 'analytics', Component: Analytics },
            { path: 'settings', Component: Settings },
        ],
    },
]);