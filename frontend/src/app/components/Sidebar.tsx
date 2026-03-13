import React from 'react';
// NavLink is like a regular <a> tag but React Router aware
// it automatically knows which link is currently active
import { NavLink, useLocation } from 'react-router';
// Icons from lucide-react — each one maps to a nav item
import {
	LayoutDashboard, // Dashboard icon
	Briefcase, // Applications icon
	BarChart2, // Analytics icon
	Settings, // Settings icon
	ChevronLeft, // Collapse arrow when sidebar is open
	ChevronRight, // Expand arrow when sidebar is closed
	TrendingUp // Logo icon
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Defines the navigation items in one place
// Adding a new page later just means adding an entry here
const NAV_ITEMS = [
	{ path: '/', label: 'Dashboard', icon: LayoutDashboard},
	{ path: '/applications', label: 'Applications', icon: Briefcase},
	{ path: '/analytics', label: 'Analytics', icon: BarChart2},
	{ path: '/settings', label: 'Settings', icon: Settings},
];

export function Sidebar() {
	// Pull sidebar state and dark mode from context
	const { sidebarCollapsed, setSidebarCollapsed } = useApp()
	// useLocation gives us the current URL path
	// used to determine which nav item is active
	const location = useLocation();
	
	return (
		<aside
			style={{
				// Width animates smoothly between collapsed (64px) and expanded (240px)
				width: sidebarCollapsed ? 64 : 240,
				minWidth: sidebarCollapsed ? 64 : 240,
				background: '#1E3A5F',
				// cubic-bezier gives the animation a natural ease in/out feel
				transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
			}}
			className="flex flex-col h-full overflow-hidden relative z-20 shadow-xl"
		>

			{/* ── LOGO SECTION ─────────────────────────────────────── */}
			<div
				className="flex items-center overflow-hidden"
				style={{
					padding: sidebarCollapsed ? '20px 0' : '20px 20px',
					justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
					height: 64,
					borderBottom: '1px solid rgba(255,255,255,0.08)',
				}}
			>
				{/* Logo icon — always visible even when collapsed */}
				<div
					style={{
						width: 32, height: 32, borderRadius: 8,
						background: 'linear-gradient(135deg, #4A90D9 0%, #7BB3F0 100%)',
						display: 'flex', alignItems: 'center', justifyContent: 'center',
						flexShrink: 0,
					}}
				>
					<TrendingUp size={18} color="white" />
				</div>

				{/* App name — hidden when sidebar is collapsed */}
				{!sidebarCollapsed && (
					<span
						style={{
							marginLeft: 10, color: 'white',
							fontSize: 16, fontWeight: 600,
							letterSpacing: '-0.01em', whiteSpace: 'nowrap',
						}}
					>
						JobTrack
					</span>
				)}
			</div>

			{/* ── NAVIGATION ITEMS ─────────────────────────────────── */}
			<nav className="flex-1" style={{ padding: '12px 8px' }}>
				{NAV_ITEMS.map(({ path, label, icon: Icon }) => {

					// Special case for Dashboard — only active on exact "/"
					// Other routes use startsWith so /applications/123 still highlights Applications
					const isActive = path === '/'
						? location.pathname === '/'
						: location.pathname.startsWith(path);

					return (
						<NavLink
							key={path}
							to={path}
							// title shows as a tooltip when sidebar is collapsed
							// so the user knows what each icon means
							title={sidebarCollapsed ? label : undefined}
							style={{
								display: 'flex', alignItems: 'center', gap: 10,
								padding: sidebarCollapsed ? '10px 0' : '10px 12px',
								borderRadius: 8,
								justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
								// Active item gets a subtle white background highlight
								background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
								color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
								textDecoration: 'none',
								transition: 'background 0.15s, color 0.15s',
								fontSize: 14,
								fontWeight: isActive ? 500 : 400,
								whiteSpace: 'nowrap',
								position: 'relative',
								marginBottom: 2,
							}}
							onMouseEnter={e => {
								if (!isActive) {
									(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
									(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
								}
							}}
							onMouseLeave={e => {
								if (!isActive) {
									(e.currentTarget as HTMLElement).style.background = 'transparent';
									(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)';
								}
							}}
						>
							{/* Blue accent bar on the left edge of the active item */}
							{isActive && (
								<span
									style={{
										position: 'absolute', left: 0,
										top: '50%', transform: 'translateY(-50%)',
										width: 3, height: 20, borderRadius: 2,
										background: '#7BB3F0',
									}}
								/>
							)}

							{/* Nav icon — always visible */}
							<Icon size={18} style={{ flexShrink: 0 }} />

							{/* Nav label — hidden when collapsed */}
							{!sidebarCollapsed && <span>{label}</span>}
						</NavLink>
					);
				})}
			</nav>

			{/* ── COLLAPSE BUTTON ──────────────────────────────────── */}
			{/* Sits at the bottom of the sidebar — toggles collapsed state */}
			<div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
				<button
					onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
					style={{
						width: '100%', display: 'flex', alignItems: 'center',
						justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
						gap: 8,
						padding: sidebarCollapsed ? '10px 0' : '10px 12px',
						borderRadius: 8, background: 'transparent',
						color: 'rgba(255,255,255,0.5)', border: 'none',
						cursor: 'pointer', fontSize: 13,
						transition: 'background 0.15s, color 0.15s',
					}}
					onMouseEnter={e => {
						(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
						(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)';
					}}
					onMouseLeave={e => {
						(e.currentTarget as HTMLElement).style.background = 'transparent';
						(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
					}}
				>
					{/* Arrow icon flips direction based on collapsed state */}
					{sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
					{!sidebarCollapsed && <span>Collapse sidebar</span>}
				</button>
			</div>
		</aside>
	);
}