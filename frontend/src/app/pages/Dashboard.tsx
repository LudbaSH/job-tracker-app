import React from 'react';
// Recharts components — each one is a building block of the charts
// LineChart/Line = the applications over time chart
// PieChart/Pie/Cell = the status distribution donut chart
// ResponsiveContainer = makes charts resize with the window
import {
	LineChart, Line, XAxis, YAxis, CartesianGrid, 
	Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
// Icons for the stat cards
import { Briefcase, TrendingUp, Award, Calendar } from 'lucide-react';
import { useApp, Status, STATUS_COLORS } from '../context/AppContext';

// ─── STATIC DATA ─────────────────────────────────────────────────────────────

// Hardcoded chart data for now — will be replaced with real API data from FastAPI's /api/analytics endpoint in Step 6
const LINE_DATA = [
	{ month: 'Oct', applications: 3 },
	{ month: 'Nov', applications: 5 },
	{ month: 'Dec', applications: 7 },
	{ month: 'Jan', applications: 4 },
	{ month: 'Feb', applications: 11 },
	{ month: 'Mar', applications: 5 },
];

// Maps each status to its chart color for the donut chart
const PIE_COLORS: Record<Status, string> = {
	Applied:    '#3B82F6',
	Assessment: '#F59E0B',
	Interview:  '#F97316',
	Offer:      '#22C55E',
	Rejected:   '#EF4444',
};

// ─── WEEK HELPER ─────────────────────────────────────────────────────────────
// Dynamically calculates the start of the current week (Monday)
// so "Applied This Week" always reflects the real current week
const getThisWeekStart = () => {
	const now = new Date();
	const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

	// Calculate how many days to subtract to get back to Monday
	// If today is Sunday (0), go back 6 days
	// If today is Monday (1), go back 0 days
	// If today is Tuesday (2), go back 1 day, etc.
	const diff = day === 0 ? 6 : day - 1;

	const monday = new Date(now);
	monday.setDate(now.getDate() - diff);

	// Set to midnight so any application from Monday onwards is included
	monday.setHours(0, 0, 0, 0);
	return monday;
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export function Dashboard() {
	// Pull the applications list from context
	const { applications } = useApp();

	// ── CALCULATIONS ─────────────────────────────────────────────────────────

	const total = applications.length

	// Count applications that reached interview stage or beyond
	const interviews = applications.filter(
		a => a.status === 'Interview' || a.status === 'Offer'
	).length;

	const offers = applications.filter(a => a.status === 'Offer').length;

	// Calculate rates - avoid dividing by 0 if no applications yet
	const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
	const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;

	// Dynamically counts applications from the current week
	const thisWeek = applications.filter(
		a => new Date(a.dateApplied) >= getThisWeekStart()
	).length;

	// Build pie chart data by counting how many applications
	// are in each status — groups them dynamically from real data
	const statusCounts: Record<string, number> = {};
	applications.forEach(a => {
		statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
	});
	const pieData = Object.entries(statusCounts).map(
		([name, value]) => ({ name, value })
	);

	// ── STAT CARDS CONFIG ────────────────────────────────────────────────────
	const stats = [
		{
			label: 'Total Applications',
			value: total,
			icon: Briefcase,
			color: '#1E3A5F',
			lightBg: '#EFF6FF',
			suffix: '',
			trend: '+3 this week',
			trendUp: true,
		},
		{
			label: 'Interview Rate',
			value: interviewRate,
			icon: TrendingUp,
			color: '#F97316',
			lightBg: '#FFF7ED',
			suffix: '%',
			trend: '+5% vs last month',
			trendUp: true,
		},
		{
			label: 'Offer Rate',
			value: offerRate,
			icon: Award,
			color: '#22C55E',
			lightBg: '#F0FDF4',
			suffix: '%',
			trend: '2 active offers',
			trendUp: true,
		},
		{
			label: 'Applied This Week',
			value: thisWeek,
			icon: Calendar,
			color: '#8B5CF6',
			lightBg: '#F5F3FF',
			suffix: '',
			// Dynamically shows the current week's Monday date
			trend: `Week of ${getThisWeekStart().toLocaleDateString('en-US', {
				month: 'short', day: 'numeric'
			})}`,
			trendUp: null,
		},
	];

	return (
		<div style={{ padding: '28px 32px', minHeight: '100vh' }}>

			{/* ── PAGE HEADER ──────────────────────────────────────────────── */}
			<div style={{ marginBottom: 28 }}>
				<h1 style={{ color: '#1E293B', margin: 0 }}>Dashboard</h1>
				<p style={{ color: '#64748B', marginTop: 4, fontSize: 14 }}>
					Welcome back! Here's an overview of your job search.
				</p>
			</div>

			{/* ── STAT CARDS ───────────────────────────────────────────────── */}
			<div style={{
				display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
				gap: 16, marginBottom: 24,
			}}>
				{stats.map(({ label, value, icon: Icon, color, lightBg, suffix, trend, trendUp }) => (
					<div
						key={label}
						style={{
							background: 'white', borderRadius: 12,
							padding: '20px 24px',
							boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
							border: '1px solid #F1F5F9',
						}}
					>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
							<div>
								<p style={{ margin: 0, fontSize: 13, color: '#64748B', fontWeight: 500 }}>
									{label}
								</p>
								<p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 600, color: '#1E293B', lineHeight: 1.1 }}>
									{value}{suffix}
								</p>
								<p style={{ margin: '8px 0 0', fontSize: 12, color: trendUp ? '#15803D' : '#64748B' }}>
									{trendUp === true ? '↑ ' : trendUp === false ? '↓ ' : ''}{trend}
								</p>
							</div>
							<div style={{
								width: 44, height: 44, borderRadius: 10,
								background: lightBg,
								display: 'flex', alignItems: 'center', justifyContent: 'center',
								flexShrink: 0,
							}}>
								<Icon size={22} color={color} />
							</div>
						</div>
					</div>
				))}
			</div>

			{/* ── CHARTS ROW ───────────────────────────────────────────────── */}
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

				{/* Line Chart — Applications Over Time */}
				<div style={{
					background: 'white', borderRadius: 12, padding: '24px',
					boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9',
				}}>
					<div style={{ marginBottom: 20 }}>
						<h3 style={{ margin: 0, color: '#1E293B' }}>Applications Over Time</h3>
						<p style={{ margin: '4px 0 0', fontSize: 13, color: '#94A3B8' }}>Last 6 months</p>
					</div>
					<ResponsiveContainer width="100%" height={240}>
						<LineChart data={LINE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
							<XAxis
								dataKey="month"
								tick={{ fontSize: 12, fill: '#94A3B8' }}
								axisLine={false} tickLine={false}
							/>
							<YAxis
								tick={{ fontSize: 12, fill: '#94A3B8' }}
								axisLine={false} tickLine={false}
							/>
							<Tooltip contentStyle={{
								background: 'white', border: '1px solid #E2E8F0',
								borderRadius: 8, fontSize: 13,
								boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
							}} />
							<Line
								type="monotone"
								dataKey="applications"
								stroke="#1E3A5F" strokeWidth={2.5}
								dot={{ r: 4, fill: '#1E3A5F', strokeWidth: 0 }}
								activeDot={{ r: 6, fill: '#1E3A5F' }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>

				{/* Donut Chart — Status Distribution */}
				<div style={{
					background: 'white', borderRadius: 12, padding: '24px',
					boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9',
				}}>
					<div style={{ marginBottom: 20 }}>
						<h3 style={{ margin: 0, color: '#1E293B' }}>Status Distribution</h3>
						<p style={{ margin: '4px 0 0', fontSize: 13, color: '#94A3B8' }}>
							Current application statuses
						</p>
					</div>
					<ResponsiveContainer width="100%" height={240}>
						<PieChart>
							<Pie
								data={pieData}
								cx="50%" cy="48%"
								innerRadius={65} outerRadius={95}
								dataKey="value"
								paddingAngle={2}
							>
								{pieData.map((entry, index) => (
									<Cell
										key={`dashboard-pie-${entry.name}-${index}`}
										fill={PIE_COLORS[entry.name as Status] || '#CBD5E1'}
									/>
								))}
							</Pie>
							<Tooltip contentStyle={{
								background: 'white', border: '1px solid #E2E8F0',
								borderRadius: 8, fontSize: 13,
								boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
							}} />
							<Legend
								iconType="circle" iconSize={8}
								formatter={(value) => (
									<span style={{ fontSize: 12, color: '#475569' }}>{value}</span>
								)}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* ── RECENT APPLICATIONS ──────────────────────────────────────── */}
			<div style={{
				background: 'white', borderRadius: 12, padding: '24px',
				marginTop: 16,
				boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9',
			}}>
				<h3 style={{ margin: '0 0 16px', color: '#1E293B' }}>Recent Applications</h3>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					{applications.slice(0, 5).map((app, i) => (
						<div
							key={app.id}
							style={{
								display: 'flex', alignItems: 'center',
								justifyContent: 'space-between',
								padding: '12px 0',
								borderBottom: i < 4 ? '1px solid #F8FAFC' : 'none',
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<div style={{
									width: 36, height: 36, borderRadius: 8,
									background: '#F1F5F9',
									display: 'flex', alignItems: 'center', justifyContent: 'center',
									fontSize: 14, fontWeight: 600, color: '#1E3A5F',
								}}>
									{app.company[0]}
								</div>
								<div>
									<p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#1E293B' }}>
										{app.company}
									</p>
									<p style={{ margin: 0, fontSize: 12, color: '#94A3B8' }}>
										{app.role}
									</p>
								</div>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
								<span style={{ fontSize: 12, color: '#94A3B8' }}>
									{new Date(app.dateApplied).toLocaleDateString('en-US', {
										month: 'short', day: 'numeric'
									})}
								</span>
								<span style={{
									padding: '3px 10px', borderRadius: 999, fontSize: 12,
									background: STATUS_COLORS[app.status].bg,
									color: STATUS_COLORS[app.status].text,
									fontWeight: 500,
								}}>
									{app.status}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}