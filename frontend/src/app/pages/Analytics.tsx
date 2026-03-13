import React from 'react';
// Recharts components used across the 4 charts on this page
// LineChart = applications over time
// PieChart/Pie = status distribution donut
// BarChart/Bar = applications by source + application funnel
import {
	LineChart, Line, XAxis, YAxis, CartesianGrid,
	Tooltip, TooltipProps, ResponsiveContainer,
	PieChart, Pie, Cell, Legend,
	BarChart, Bar,
} from 'recharts';
import { useApp, Status } from '../context/AppContext';

// ─── STATIC DATA ─────────────────────────────────────────────────────────────

// Hardcoded for now — replaced with real API data in Step 6
const LINE_DATA = [
	{ month: 'Oct 25', applications: 3 },
	{ month: 'Nov 25', applications: 5 },
	{ month: 'Dec 25', applications: 7 },
	{ month: 'Jan 26', applications: 4 },
	{ month: 'Feb 26', applications: 11 },
	{ month: 'Mar 26', applications: 5 },
];

// Color for each status slice in the donut chart
const PIE_COLORS: Record<Status, string> = {
	Applied:    '#3B82F6',
	Assessment: '#F59E0B',
	Interview:  '#F97316',
	Offer:      '#22C55E',
	Rejected:   '#EF4444',
};

// Colors for the applications by source bar chart
// Uses shades of navy blue to stay on brand
const SOURCE_COLORS = ['#1E3A5F', '#3B82F6', '#7BB3F0', '#93C5FD', '#BFDBFE'];

// Funnel data shows conversion rate at each stage
// These will eventually come from the FastAPI analytics endpoint
const FUNNEL_DATA = [
	{ stage: 'Applied',    count: 20, rate: 100 },
	{ stage: 'Assessment', count: 9,  rate: 45  },
	{ stage: 'Interview',  count: 7,  rate: 35  },
	{ stage: 'Offer',      count: 2,  rate: 10  },
];

// Shared tooltip style used across all 4 charts for consistency
const TOOLTIP_STYLE = {
	background: 'white',
	border: '1px solid #E2E8F0',
	borderRadius: 8,
	fontSize: 13,
	boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

// Custom tooltip component — replaces the formatter prop entirely
// Recharts passes payload containing the hovered bar's data
function FunnelTooltip({ active, payload }: {
	active?: boolean;
	payload?: Array<{ value: number; name: string }>;
}) {
	// active is true when hovering over a bar
	// payload contains the data for that specific bar
	if (!active || !payload || payload.length === 0) return null;

	return (
		<div style={TOOLTIP_STYLE}>
			<p style={{ margin: '8px 12px', fontSize: 13, color: '#1E293B' }}>
				Conversion Rate: <strong>{payload[0].value}%</strong>
			</p>
		</div>
	);
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function Analytics() {
	const { applications } = useApp();

	// ── CALCULATIONS ─────────────────────────────────────────────────────────

	const total = applications.length;

	// Count how many reached interview or offer stage
	const interviewCount = applications.filter(
		a => ['Interview', 'Offer'].includes(a.status)
	).length;

	const offerCount = applications.filter(
		a => a.status === 'Offer'
	).length;

	// Build status distribution data for the donut chart
	// Groups applications by status and counts each one
	const statusCounts: Record<string, number> = {};
	applications.forEach(a => {
		statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
	});
	const pieData = Object.entries(statusCounts).map(
		([name, value]) => ({ name, value })
	);

	// Build source distribution data for the bar chart
	// Groups by source, sorts by count descending so biggest bar is first
	const sourceCounts: Record<string, number> = {};
	applications.forEach(a => {
		sourceCounts[a.source] = (sourceCounts[a.source] || 0) + 1;
	});
	const sourceData = Object.entries(sourceCounts)
		.sort((a, b) => b[1] - a[1])
		.map(([source, count]) => ({ source, count }));

	// ─── RENDER ──────────────────────────────────────────────────────────────

	return (
		<div style={{ padding: '28px 32px', minHeight: '100vh' }}>

			{/* ── PAGE HEADER ──────────────────────────────────────────────── */}
			<div style={{ marginBottom: 28 }}>
				<h1 style={{ color: '#1E293B', margin: 0 }}>Analytics</h1>
				<p style={{ color: '#64748B', marginTop: 4, fontSize: 14 }}>
					Insights and trends from your job search data.
				</p>
			</div>

			{/* ── SUMMARY STRIP ────────────────────────────────────────────── */}
			{/* 3 quick stat cards at the top — simpler than the dashboard cards */}
			<div style={{
				display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
				gap: 12, marginBottom: 20,
			}}>
				{[
					{
						label: 'Total Applications',
						value: total,
						color: '#1E3A5F'
					},
					{
						label: 'Interview Conversion',
						// Percentage of applications that reached interview
						value: `${total > 0 ? Math.round((interviewCount / total) * 100) : 0}%`,
						color: '#F97316'
					},
					{
						label: 'Offer Conversion',
						// Percentage of applications that resulted in an offer
						value: `${total > 0 ? Math.round((offerCount / total) * 100) : 0}%`,
						color: '#22C55E'
					},
				].map(item => (
					<div
						key={item.label}
						style={{
							background: 'white', borderRadius: 10,
							padding: '16px 20px',
							border: '1px solid #F1F5F9',
							boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
							display: 'flex', alignItems: 'center', gap: 14,
						}}
					>
						{/* Colored left accent bar — each card has its own color */}
						<div style={{
							width: 4, height: 36, borderRadius: 2,
							background: item.color, flexShrink: 0,
						}} />
						<div>
							<p style={{ margin: 0, fontSize: 12, color: '#94A3B8' }}>
								{item.label}
							</p>
							<p style={{
								margin: 0, fontSize: 24, fontWeight: 600,
								color: '#1E293B', lineHeight: 1.2,
							}}>
								{item.value}
							</p>
						</div>
					</div>
				))}
			</div>

			{/* ── 2x2 CHART GRID ───────────────────────────────────────────── */}
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

				{/* Chart 1 — Applications Over Time (Line Chart) */}
				<ChartCard
					title="Applications Over Time"
					subtitle="Monthly application volume"
				>
					<ResponsiveContainer width="100%" height={230}>
						<LineChart
							data={LINE_DATA}
							margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
							<XAxis
								dataKey="month"
								tick={{ fontSize: 11, fill: '#94A3B8' }}
								axisLine={false} tickLine={false}
							/>
							<YAxis
								tick={{ fontSize: 11, fill: '#94A3B8' }}
								axisLine={false} tickLine={false}
							/>
							<Tooltip contentStyle={TOOLTIP_STYLE} />
							<Line
								type="monotone"
								dataKey="applications"
								stroke="#1E3A5F" strokeWidth={2.5}
								dot={{ r: 4, fill: '#1E3A5F', strokeWidth: 0 }}
								activeDot={{ r: 6 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</ChartCard>

				{/* Chart 2 — Status Distribution (Donut Chart) */}
				<ChartCard
					title="Status Distribution"
					subtitle="Current breakdown by status"
				>
					<ResponsiveContainer width="100%" height={230}>
						<PieChart>
							<Pie
								data={pieData}
								cx="50%" cy="46%"
								innerRadius={58} outerRadius={88}
								dataKey="value"
								paddingAngle={2}
							>
								{pieData.map((entry, idx) => (
									<Cell
										key={`analytics-pie-${entry.name}-${idx}`}
										fill={PIE_COLORS[entry.name as Status] || '#CBD5E1'}
									/>
								))}
							</Pie>
							<Tooltip contentStyle={TOOLTIP_STYLE} />
							<Legend
								iconType="circle" iconSize={8}
								formatter={v => (
									<span style={{ fontSize: 12, color: '#475569' }}>{v}</span>
								)}
							/>
						</PieChart>
					</ResponsiveContainer>
				</ChartCard>

				{/* Chart 3 — Applications by Source (Bar Chart) */}
				<ChartCard
					title="Applications by Source"
					subtitle="Where you're finding opportunities"
				>
					<ResponsiveContainer width="100%" height={230}>
						<BarChart
							data={sourceData}
							margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
						>
							{/* vertical={false} removes vertical grid lines — cleaner look */}
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="#F1F5F9"
								vertical={false}
							/>
							<XAxis
								dataKey="source"
								tick={{ fontSize: 11, fill: '#94A3B8' }}
								axisLine={false} tickLine={false}
							/>
							<YAxis
								tick={{ fontSize: 11, fill: '#94A3B8' }}
								axisLine={false} tickLine={false}
							/>
							<Tooltip contentStyle={TOOLTIP_STYLE} />
							{/* radius rounds the top corners of each bar */}
							<Bar dataKey="count" radius={[4, 4, 0, 0]}>
								{sourceData.map((entry, idx) => (
									<Cell
										key={`analytics-src-${entry.source}-${idx}`}
										// Cycles through SOURCE_COLORS using modulo
										// so it never runs out of colors
										fill={SOURCE_COLORS[idx % SOURCE_COLORS.length]}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</ChartCard>

				{/* Chart 4 — Application Funnel (Horizontal Bar Chart) */}
				<ChartCard
					title="Application Funnel"
					subtitle="Conversion rate at each stage"
				>
					<ResponsiveContainer width="100%" height={230}>
						{/* layout="vertical" flips the chart so bars go horizontal */}
						<BarChart
							data={FUNNEL_DATA}
							layout="vertical"
							margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
						>
							{/* horizontal={false} removes horizontal grid lines */}
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="#F1F5F9"
								horizontal={false}
							/>
							{/* For vertical layout, XAxis shows the values (numbers)
								and YAxis shows the categories (stage names) */}
							<XAxis
								type="number"
								domain={[0, 100]}
								tick={{ fontSize: 11, fill: '#94A3B8' }}
								axisLine={false} tickLine={false}
								// Adds % symbol to axis labels
								tickFormatter={v => `${v}%`}
							/>
							<YAxis
								type="category"
								dataKey="stage"
								tick={{ fontSize: 12, fill: '#64748B' }}
								axisLine={false} tickLine={false}
								width={80}
							/>
							<Tooltip content={<FunnelTooltip />} />
							{/* radius rounds the right corners of each horizontal bar */}
							<Bar dataKey="rate" radius={[0, 4, 4, 0]}>
								{FUNNEL_DATA.map((entry, idx) => {
									// Each stage gets its own color matching the status colors
									const colors = ['#3B82F6', '#F59E0B', '#F97316', '#22C55E'];
									return (
										<Cell
											key={`analytics-funnel-${entry.stage}-${idx}`}
											fill={colors[idx]}
										/>
									);
								})}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</ChartCard>
			</div>
		</div>
	);
}

// ─── CHART CARD WRAPPER ───────────────────────────────────────────────────────

// Reusable card component used by all 4 charts
// Keeps the chart grid clean — no repeated card styling markup
function ChartCard({
	title,
	subtitle,
	children
}: {
	title: string;
	subtitle: string;
	children: React.ReactNode
}) {
	return (
		<div style={{
			background: 'white', borderRadius: 12,
			padding: '22px 24px',
			boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
			border: '1px solid #F1F5F9',
		}}>
			{/* Card header */}
			<div style={{ marginBottom: 18 }}>
				<h3 style={{ margin: 0, color: '#1E293B' }}>{title}</h3>
				<p style={{ margin: '3px 0 0', fontSize: 12, color: '#94A3B8' }}>
					{subtitle}
				</p>
			</div>
			{/* Chart renders here via children prop */}
			{children}
		</div>
	);
}