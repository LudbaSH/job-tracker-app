import React from 'react';
// Outlet is a React Router component — it acts as a placeholder
// that renders whichever child page is currently active
// e.g. when you're on /applications, Outlet renders Applications.tsx
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';

export function Layout() {
    return (
        // The outer div is the full screen container
        // flex makes sidebar and main content sit side by side
        // h-screen makes it exactly the height of the viewport
        // overflow-hidden prevents double scrollbars
        <div className="flex h-screen overflow-hidden" style={{ background: '#F4F6F9' }}>
            {/* Sidebar sits on the left — its width is controlled
                internally by the collapsed/expanded state in AppContext */}
            <Sidebar />
            {/* Main content area takes up all remaining space (flex-1)
                overflow-y-auto makes only this area scrollable, not the whole page
                minWidth: 0 prevents content from overflowing the flex container */}
            <main
                className="flex-1 overflow-y-auto"
                style={{ background: '#F4F6F9', minWidth: 0 }}
            >
                {/* Outlet renders the current page here — Dashboard, Applications, Analytics, or Settings */}
                <Outlet />
            </main>
        </div>
    );
}