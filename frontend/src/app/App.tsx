import React from 'react';
// RouterProvider connects React Router to the app
// It reads the router config from routes.tsx and handles navigation
import { RouterProvider } from 'react-router';
import { router } from './routes';
// AppProvider wraps everything so every page and component
// have access to the applications data, dark mode, and sidebar state
import { AppProvider } from './context/AppContext';

export default function App() {
    return (
        // AppProvider must be outside RouterProvider so the context
        // is available on every page including during route transitions
        <AppProvider>
            <RouterProvider router={router} />
        </AppProvider>
    );
}
