import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────────

// Status is a union type — it can only be one of these exact strings
// TypeScript will throw an error if user tries to assign anything else
export type Status = 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Rejected';

// Same pattern for source
export type Source = 'LinkedIn' | 'Indeed' | 'Company Website' | 'Referral' | 'Other';

// This defines the shape of a single job application object
// Every application in the app must have exactly these fields
export interface Application {
    id: string;
    company: string;
    role: string;
    status: Status;
    location: string;
    dateApplied: string;
    source: Source;
    salaryRange: string;
    jobUrl: string;
    notes: string;
}

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
// Temporary fake data so the app has something to display while being built
// This gets replaced with real API calls to FastAPI in Step 6
const MOCK_APPLICATIONS: Application[] = [
    { id: '1', company: 'Google', role: 'Senior Software Engineer', status: 'Interview', location: 'Remote', dateApplied: '2026-02-15', source: 'LinkedIn', salaryRange: '$180k - $220k', jobUrl: 'https://careers.google.com', notes: 'Had a great initial call with the recruiter.' },
    { id: '2', company: 'Meta', role: 'Product Manager', status: 'Rejected', location: 'Menlo Park, CA', dateApplied: '2026-02-10', source: 'LinkedIn', salaryRange: '$170k - $200k', jobUrl: 'https://careers.meta.com', notes: 'Did not pass the case study round.' },
    { id: '3', company: 'Apple', role: 'iOS Developer', status: 'Assessment', location: 'Cupertino, CA', dateApplied: '2026-02-20', source: 'Company Website', salaryRange: '$160k - $190k', jobUrl: 'https://jobs.apple.com', notes: 'Technical assessment sent on Feb 22.' },
    { id: '4', company: 'Netflix', role: 'Senior Platform Engineer', status: 'Offer', location: 'Los Gatos, CA', dateApplied: '2026-01-25', source: 'Referral', salaryRange: '$200k - $250k', jobUrl: 'https://jobs.netflix.com', notes: 'Offer received! Deadline March 20.' },
    { id: '5', company: 'Amazon', role: 'Backend Engineer', status: 'Interview', location: 'Seattle, WA', dateApplied: '2026-02-28', source: 'Indeed', salaryRange: '$155k - $185k', jobUrl: 'https://amazon.jobs', notes: 'Loop interview scheduled for March 15.' },
];

// ─── CONTEXT TYPE ─────────────────────────────────────────────────────────────
// Defines exactly what the context exposes to the rest of the app
// Any component that calls useApp() gets access to all of these
interface AppContextType {
    // The list of all applications
    applications: Application[]

    // CRUD functions - each one updates the applications list
    addApplication: (app: Omit<Application, 'id'>) => void;
    // Omit<Application, 'id'> means "an Application without the id field"
    // because the id gets generated automatically, not provided by the user

    updateApplication: (app: Application) => void;
    deleteApplication: (id: string) => void;

    // Dark mode state and toggle function
    darkMode: boolean;
    toggleDarkMode: () => void;

    // Sidebar collapsed state - shared between Sidebar and Layout
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (v: boolean) => void;
}

// ─── CONTEXT CREATION ────────────────────────────────────────────────────────
// Creates the context with undefined as default — the useApp() hook
// below throws an error if you try to use it outside of AppProvider
const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── PROVIDER COMPONENT ──────────────────────────────────────────────────────
// Wraps the entire app in App.tsx — everything inside it can access the context
export function AppProvider({ children }: { children: ReactNode}) {
    // The main applications list — starts with mock data for now
    const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);

    // Dark mode state - starts as false (light mode)
    const [darkMode, setDarkMode] = useState(false);

    // Sidebar state - starts expanded
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Whenever darkMode changes, add or remove the "dark" class from
    // the html element — this is what triggers the dark mode CSS variables
    // defined in theme.css to activate
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Adds a new application to the top of the list
    // Date.now().toString() generates a unique id from the current timestamp
    const addApplication = (app: Omit<Application, 'id'>) => {
        const newApp: Application = { ...app, id: Date.now().toString() };
        setApplications(prev => [newApp, ...prev]);
    };

    // Replaces the application that has the matching id with the updated one
    const updateApplication = (app: Application) => {
    setApplications(prev => prev.map(a => a.id === app.id ? app : a));
    };

    // Removes the application with the matching id from the list
    const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(a => a.id !== id));
    };

    const toggleDarkMode = () => setDarkMode(prev => !prev);

        return (
    <AppContext.Provider value={{
        applications, addApplication, updateApplication, deleteApplication,
        darkMode, toggleDarkMode, sidebarCollapsed, setSidebarCollapsed
    }}>
        {children}
    </AppContext.Provider>
    );
}

// ─── CUSTOM HOOK ──────────────────────────────────────────────────────────────
// Any component imports and calls useApp() to get access to all the context values
// The error prevents using it accidentally outside of AppProvider
export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
        return ctx;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
// Color definitions for each status badge — used in the table and dashboard
// Each status has a background color, text color, and dot color
export const STATUS_COLORS: Record<Status, { bg: string; text: string; dot: string }> = {
    Applied:    { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
    Assessment: { bg: '#FEF9C3', text: '#B45309', dot: '#F59E0B' },
    Interview:  { bg: '#FFF7ED', text: '#C2410C', dot: '#F97316' },
    Offer:      { bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' },
    Rejected:   { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444' },
};

// The full list of statuses and sources — used to populate dropdowns
export const STATUSES: Status[] = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'];
export const SOURCES: Source[] = ['LinkedIn', 'Indeed', 'Company Website', 'Referral', 'Other'];