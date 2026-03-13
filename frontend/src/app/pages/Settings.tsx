import React, { useState } from 'react';
// Icons for each settings section and row
import {
	Download,        // CSV export button
	FileSpreadsheet, // Excel export button
	Moon,            // Dark mode icon
	Sun,             // Light mode icon
	Database,        // Backup button + section header
	Check,           // Success state on buttons after action
	Shield,          // Privacy mode row
	Bell,            // Email notifications row
	User,            // Account section header
	Palette,         // Appearance section header
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function Settings() {
	const { applications, darkMode, toggleDarkMode } = useApp();

	// Each export button briefly shows a success state after clicking
	// These booleans control that — they reset after 2.5 seconds
	const [csvDone, setCsvDone] = useState(false);
	const [xlsDone, setXlsDone] = useState(false);
	const [backupDone, setBackupDone] = useState(false);

	// ── EXPORT HANDLERS ──────────────────────────────────────────────────────

	const exportCSV = () => {
		// Define the column headers for the CSV file
		const headers = [
			'Company', 'Role', 'Status', 'Location',
			'Date Applied', 'Source', 'Salary Range', 'Job URL', 'Notes'
		];

		// Map each application to a row of values
		// Fields with commas are wrapped in quotes to prevent CSV breaking
		const rows = applications.map(a => [
			`"${a.company}"`, `"${a.role}"`, a.status,
			`"${a.location}"`, a.dateApplied, `"${a.source}"`,
			`"${a.salaryRange}"`, a.jobUrl, `"${a.notes}"`,
		]);

		// Join headers and rows into a single CSV string
		const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

		// Create a downloadable blob from the CSV string
		// A Blob is a file-like object that exists only in memory
		const blob = new Blob([csv], { type: 'text/csv' });

		// Create a temporary URL pointing to the blob
		const url = URL.createObjectURL(blob);

		// Create a hidden anchor tag, click it to trigger download,
		// then remove it — this is the standard browser download trick
		const a = document.createElement('a');
		a.href = url;
		a.download = 'jobtrack_applications.csv';
		a.click();

		// Clean up the temporary URL to free memory
		URL.revokeObjectURL(url);

		// Show success state on button for 2.5 seconds
		setCsvDone(true);
		setTimeout(() => setCsvDone(false), 2500);
	};

	const exportExcel = () => {
		// Tab-separated values (.xls) — Excel opens this natively
		// Same structure as CSV but uses tabs instead of commas
		const headers = [
			'Company', 'Role', 'Status', 'Location',
			'Date Applied', 'Source', 'Salary Range', 'Job URL', 'Notes'
		];

		const rows = applications.map(a => [
			a.company, a.role, a.status, a.location,
			a.dateApplied, a.source, a.salaryRange, a.jobUrl, a.notes,
		]);

		const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');

		const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'jobtrack_applications.xls';
		a.click();
		URL.revokeObjectURL(url);

		setXlsDone(true);
		setTimeout(() => setXlsDone(false), 2500);
	};

	const backupDatabase = () => {
		// Exports the full applications array as a JSON file
		// JSON.stringify with indent of 2 makes it human readable
		const data = JSON.stringify(applications, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		// Filename includes today's date for easy identification
		a.download = `jobtrack_backup_${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);

		setBackupDone(true);
		setTimeout(() => setBackupDone(false), 2500);
	};

	// ─── RENDER ──────────────────────────────────────────────────────────────

	return (
		<div style={{ padding: '28px 32px', minHeight: '100vh', maxWidth: 720 }}>

			{/* ── PAGE HEADER ──────────────────────────────────────────────── */}
			<div style={{ marginBottom: 28 }}>
				<h1 style={{ color: '#1E293B', margin: 0 }}>Settings</h1>
				<p style={{ color: '#64748B', marginTop: 4, fontSize: 14 }}>
					Manage your preferences, data, and account options.
				</p>
			</div>

			{/* ── DATA MANAGEMENT SECTION ──────────────────────────────────── */}
			<SectionHeader icon={Database} label="Data Management" />
			<div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>

				<SettingRow
					icon={Download}
					iconColor="#1D4ED8"
					iconBg="#EFF6FF"
					title="Export as CSV"
					description={`Download all ${applications.length} applications as a CSV file for use in Excel or Google Sheets.`}
					action={
						<button
							onClick={exportCSV}
							style={csvDone ? doneBtn : primaryBtn}
						>
							{/* Switches between normal and success state */}
							{csvDone
								? <><Check size={14} /> Exported!</>
								: <><Download size={14} /> Export CSV</>
							}
						</button>
					}
				/>

				<SettingRow
					icon={FileSpreadsheet}
					iconColor="#15803D"
					iconBg="#F0FDF4"
					title="Export as Excel"
					description="Download your application data as an Excel-compatible file."
					action={
						<button
							onClick={exportExcel}
							style={xlsDone ? doneBtn : outlineBtn}
						>
							{xlsDone
								? <><Check size={14} /> Exported!</>
								: <><FileSpreadsheet size={14} /> Export Excel</>
							}
						</button>
					}
				/>

				<SettingRow
					icon={Database}
					iconColor="#7C3AED"
					iconBg="#F5F3FF"
					title="Backup Database"
					description="Create a full JSON backup of your application data for safekeeping."
					action={
						<button
							onClick={backupDatabase}
							style={backupDone ? doneBtn : outlineBtn}
						>
							{backupDone
								? <><Check size={14} /> Backed up!</>
								: <><Database size={14} /> Backup</>
							}
						</button>
					}
				/>
			</div>

			{/* ── APPEARANCE SECTION ───────────────────────────────────────── */}
			<SectionHeader icon={Palette} label="Appearance" />
			<div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
				<SettingRow
					icon={darkMode ? Moon : Sun}
					iconColor={darkMode ? '#6366F1' : '#F59E0B'}
					iconBg={darkMode ? '#EEF2FF' : '#FEF9C3'}
					title={`${darkMode ? 'Dark' : 'Light'} Mode`}
					description="Toggle between light and dark mode for the application interface."
					action={
						<button
							onClick={toggleDarkMode}
							style={{
								...outlineBtn,
								display: 'flex', alignItems: 'center', gap: 8,
								// Button appearance flips based on current mode
								background: darkMode ? '#1E3A5F' : 'white',
								color: darkMode ? 'white' : '#475569',
								borderColor: darkMode ? '#1E3A5F' : '#E2E8F0',
							}}
						>
							{darkMode ? <Moon size={14} /> : <Sun size={14} />}
							{darkMode ? 'Dark Mode' : 'Light Mode'}
						</button>
					}
				/>
			</div>

			{/* ── ACCOUNT SECTION ──────────────────────────────────────────── */}
			<SectionHeader icon={User} label="Account" />
			<div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
				<SettingRow
					icon={Bell}
					iconColor="#F97316"
					iconBg="#FFF7ED"
					title="Email Notifications"
					description="Receive reminders for follow-ups and application deadlines."
					action={<Toggle defaultOn={true} />}
				/>
				<SettingRow
					icon={Shield}
					iconColor="#DC2626"
					iconBg="#FEF2F2"
					title="Privacy Mode"
					description="Hide sensitive salary and company information in screenshots."
					action={<Toggle defaultOn={false} />}
				/>
			</div>

			{/* ── STATS FOOTER ─────────────────────────────────────────────── */}
			{/* Shows a quick summary of app data at the bottom of settings */}
			<div style={{
				background: 'white', borderRadius: 12, padding: '18px 20px',
				border: '1px solid #F1F5F9',
				boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
				display: 'flex', gap: 24, flexWrap: 'wrap',
			}}>
				{[
					{
						label: 'Total Applications',
						// Updates live as applications are added/deleted
						value: applications.length
					},
					{
						label: 'Data Size',
						// Rough estimate of how much data is stored
						value: `~${Math.round(JSON.stringify(applications).length / 1024)} KB`
					},
					{
						label: 'Last Updated',
						// Shows today's date dynamically
						value: new Date().toLocaleDateString('en-US', {
							month: 'long', day: 'numeric', year: 'numeric'
						})
					},
					{
						label: 'Version',
						value: '1.0.0'
					},
				].map(item => (
					<div key={item.label}>
						<p style={{
							margin: 0, fontSize: 11, color: '#94A3B8',
							textTransform: 'uppercase', letterSpacing: '0.05em',
						}}>
							{item.label}
						</p>
						<p style={{ margin: '3px 0 0', fontSize: 15, fontWeight: 500, color: '#1E293B' }}>
							{item.value}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

// ─── HELPER COMPONENTS ───────────────────────────────────────────────────────

// Section header with icon and uppercase label
// Used to visually separate Data, Appearance, and Account sections
function SectionHeader({
	icon: Icon,
	label
}: {
	icon: React.ElementType;
	label: string
}) {
	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
			<Icon size={15} color="#64748B" />
			<span style={{
				fontSize: 12, fontWeight: 600, color: '#64748B',
				textTransform: 'uppercase', letterSpacing: '0.06em',
			}}>
				{label}
			</span>
		</div>
	);
}

// Individual setting row — icon, title, description, and action button
// Used for every row in every section to keep layout consistent
function SettingRow({
	icon: Icon, iconColor, iconBg,
	title, description, action
}: {
	icon: React.ElementType;
	iconColor: string;
	iconBg: string;
	title: string;
	description: string;
	action: React.ReactNode;
}) {
	return (
		<div style={{
			background: 'white', borderRadius: 12, padding: '18px 20px',
			border: '1px solid #F1F5F9',
			boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
			display: 'flex', alignItems: 'center',
			justifyContent: 'space-between', gap: 16,
		}}>
			<div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
				{/* Colored icon box */}
				<div style={{
					width: 40, height: 40, borderRadius: 10,
					background: iconBg,
					display: 'flex', alignItems: 'center', justifyContent: 'center',
					flexShrink: 0,
				}}>
					<Icon size={18} color={iconColor} />
				</div>
				<div style={{ minWidth: 0 }}>
					<p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#1E293B' }}>
						{title}
					</p>
					<p style={{ margin: '3px 0 0', fontSize: 13, color: '#64748B' }}>
						{description}
					</p>
				</div>
			</div>
			{/* Action goes on the right — button or toggle */}
			<div style={{ flexShrink: 0 }}>{action}</div>
		</div>
	);
}

// Animated toggle switch for boolean settings
// defaultOn controls the initial state
function Toggle({ defaultOn }: { defaultOn: boolean }) {
	const [on, setOn] = useState(defaultOn);
	return (
		<button
			onClick={() => setOn(prev => !prev)}
			style={{
				width: 44, height: 24, borderRadius: 999,
				// Navy when on, gray when off
				background: on ? '#1E3A5F' : '#E2E8F0',
				border: 'none', cursor: 'pointer',
				position: 'relative',
				transition: 'background 0.2s',
				padding: 0,
			}}
		>
			{/* The white circle that slides left/right */}
			<span style={{
				position: 'absolute', top: 3,
				// Slides right when on, left when off
				left: on ? 23 : 3,
				width: 18, height: 18, borderRadius: '50%',
				background: 'white',
				transition: 'left 0.2s',
				boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
			}} />
		</button>
	);
}

// ─── BUTTON STYLES ───────────────────────────────────────────────────────────

// Navy filled button — used for the primary export CSV action
const primaryBtn: React.CSSProperties = {
	display: 'inline-flex', alignItems: 'center', gap: 6,
	padding: '8px 16px', borderRadius: 8,
	background: '#1E3A5F', color: 'white',
	border: 'none', cursor: 'pointer',
	fontSize: 13, fontWeight: 500,
};

// White outlined button — used for secondary actions
const outlineBtn: React.CSSProperties = {
	display: 'inline-flex', alignItems: 'center', gap: 6,
	padding: '8px 16px', borderRadius: 8,
	background: 'white', color: '#475569',
	border: '1px solid #E2E8F0',
	cursor: 'pointer', fontSize: 13, fontWeight: 500,
};

// Green success button — shown briefly after a successful export
const doneBtn: React.CSSProperties = {
	display: 'inline-flex', alignItems: 'center', gap: 6,
	padding: '8px 16px', borderRadius: 8,
	background: '#F0FDF4', color: '#15803D',
	border: '1px solid #BBF7D0',
	cursor: 'default', fontSize: 13, fontWeight: 500,
};