import React, { useState, useMemo } from 'react';
// Search = magnifying glass icon for the search bar
// Plus = + icon on the Add Application button
// Pencil = edit icon in the actions column
// Trash2 = delete icon in the actions column
// ExternalLink = link icon to open job URL
// ChevronUp/Down = sort direction arrows in table headers
import {
	Search, Plus, Pencil, Trash2,
	ExternalLink, ChevronUp, ChevronDown
} from 'lucide-react';
import {
	useApp, Application, Status,
	Source, STATUS_COLORS, STATUSES, SOURCES
} from '../context/AppContext'
import { ApplicationModal } from '../components/ApplicationModal';

// ─── TYPES ───────────────────────────────────────────────────────────────────
// The fields the table can be sorted by
type SortField = 'company' | 'role' | 'status' | 'dateApplied' | 'source';

// Sort direction - ascending or descending
type SortDir = 'asc' | 'desc';

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export function Applications() {
	const { applications, deleteApplication } = useApp();
	// ── FILTER STATE ─────────────────────────────────────────────────────────
	// Text typed in the search box
	const [search, setSearch] = useState('');

	// Dropdown filter values — empty string means "show all"
	const [filterStatus, setFilterStatus] = useState<Status | ''>('');
	const [filterSource, setFilterSource] = useState<Source | ''>('');
	const [filterDate, setFilterDate] = useState('');

	// ── SORT STATE ───────────────────────────────────────────────────────────
	// Default sort — most recently applied first
	const [sortField, setSortField] = useState<SortField>('dateApplied');
	const [sortDir, setSortDir] = useState<SortDir>('desc');

	// ── MODAL STATE ──────────────────────────────────────────────────────────
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
	const [editingApp, setEditingApp] = useState<Application | null>(null);

	// Tracks which row is showing the delete confirmation buttons
	// null means no row is in delete confirmation mode
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

	// ── SORT HANDLER ─────────────────────────────────────────────────────────
	const handleSort = (field: SortField) => {
		if (sortField === field) {
			// Clicking the same column toggles direction
			setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
		} else {
			// Clicking a new column sorts ascending by default
			setSortField(field);
			setSortDir('asc');
		}	
	};

	// ── FILTERED + SORTED LIST ───────────────────────────────────────────────
	// useMemo recalculates only when the dependencies change
	// without it, filtering and sorting would run on every render
	const filtered = useMemo(() => {
		let list = [...applications];

		// Text search — checks company, role, and location
		if (search) {
			const q = search.toLowerCase();
			list = list.filter(a =>
				a.company.toLowerCase().includes(q) ||
				a.role.toLowerCase().includes(q) ||
				a.location.toLowerCase().includes(q)
			);
		}

		// Status filter
		if (filterStatus) list = list.filter(a => a.status === filterStatus);

		// Source filter
		if (filterSource) list = list.filter(a => a.source === filterSource);

		// Date range filter — calculates cutoff from today dynamically
		if (filterDate) {
			const now = new Date();
			const cutoff = new Date();
			if (filterDate === '7d') cutoff.setDate(now.getDate() - 7);
			else if (filterDate === '30d') cutoff.setDate(now.getDate() - 30);
			else if (filterDate === '90d') cutoff.setDate(now.getDate() - 90);
			list = list.filter(a => new Date(a.dateApplied) >= cutoff);
		}

		// Sort the filtered list
		list.sort((a, b) => {
			const va = a[sortField] as string;
			const vb = b[sortField] as string;

			// Date comparison uses timestamps for accuracy
			if (sortField === 'dateApplied') {
				return sortDir === 'asc'
					? new Date(va).getTime() - new Date(vb).getTime()
					: new Date(vb).getTime() - new Date(va).getTime();
			}

			// String comparison for all other fields
			return sortDir === 'asc'
				? va.localeCompare(vb)
				: vb.localeCompare(va);
		});

		return list;
	}, [applications, search, filterStatus, filterSource, filterDate, sortField, sortDir]);

	// ── MODAL HELPERS ────────────────────────────────────────────────────────
	const openAdd = () => {
		setModalMode('add');
		setEditingApp(null);
		setModalOpen(true);
	};

	const openEdit = (app: Application) => {
		setModalMode('edit');
		setEditingApp(app);
		setModalOpen(true);
	};

	// ── SUB COMPONENTS ───────────────────────────────────────────────────────

	// Renders the sort arrow icon in each sortable column header
	// Shows blue arrow for the active sort column, gray for inactive
	const SortIcon = ({ field }: { field: SortField }) => {
		if (sortField !== field) return <ChevronUp size={13} color="#CBD5E1" />;
		return sortDir === 'asc'
			? <ChevronUp size={13} color="#1E3A5F" />
			: <ChevronDown size={13} color="#1E3A5F" />;
	};

	// Renders a sortable table header cell
	const ThCell = ({ field, label }: { field: SortField; label: string }) => (
		<th
			onClick={() => handleSort(field)}
			style={{
				padding: '11px 16px', textAlign: 'left', fontSize: 12,
				fontWeight: 600, color: '#64748B', cursor: 'pointer',
				userSelect: 'none', whiteSpace: 'nowrap',
				background: '#F8FAFC',
			}}
		>
			<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
				{label} <SortIcon field={field} />
			</span>
		</th>
	);

	// ─── RENDER ──────────────────────────────────────────────────────────────

	return (
		<div style={{ padding: '28px 32px', minHeight: '100vh' }}>

			{/* ── PAGE HEADER ──────────────────────────────────────────────── */}
			<div style={{
				display: 'flex', alignItems: 'center',
				justifyContent: 'space-between', marginBottom: 24,
			}}>
				<div>
					<h1 style={{ color: '#1E293B', margin: 0 }}>Applications</h1>
					{/* Shows how many results match the current filters */}
					<p style={{ color: '#64748B', marginTop: 4, fontSize: 14 }}>
						{filtered.length} of {applications.length} applications
					</p>
				</div>
				<button
					onClick={openAdd}
					style={{
						display: 'flex', alignItems: 'center', gap: 8,
						padding: '10px 20px', borderRadius: 10,
						background: '#1E3A5F', color: 'white',
						border: 'none', cursor: 'pointer',
						fontSize: 14, fontWeight: 500,
						boxShadow: '0 2px 8px rgba(30,58,95,0.25)',
					}}
				>
					<Plus size={16} />
					Add Application
				</button>
			</div>

			{/* ── FILTERS BAR ──────────────────────────────────────────────── */}
			<div style={{
				background: 'white', borderRadius: 12, padding: '16px 20px',
				display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
				marginBottom: 16,
				boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9',
			}}>
				{/* Search input with icon */}
				<div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
					<Search
						size={15} color="#94A3B8"
						style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}
					/>
					<input
						value={search}
						onChange={e => setSearch(e.target.value)}
						placeholder="Search company, role, location..."
						style={{
							width: '100%', padding: '9px 12px 9px 34px',
							borderRadius: 8, border: '1px solid #E2E8F0',
							background: '#F8FAFC', fontSize: 14,
							color: '#1E293B', outline: 'none', boxSizing: 'border-box',
						}}
					/>
				</div>

				{/* Status dropdown */}
				<select
					value={filterStatus}
					onChange={e => setFilterStatus(e.target.value as Status | '')}
					style={selectStyle}
				>
					<option value="">All Statuses</option>
					{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
				</select>

				{/* Source dropdown */}
				<select
					value={filterSource}
					onChange={e => setFilterSource(e.target.value as Source | '')}
					style={selectStyle}
				>
					<option value="">All Sources</option>
					{SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
				</select>

				{/* Date range dropdown */}
				<select
					value={filterDate}
					onChange={e => setFilterDate(e.target.value)}
					style={selectStyle}
				>
					<option value="">All Time</option>
					<option value="7d">Last 7 days</option>
					<option value="30d">Last 30 days</option>
					<option value="90d">Last 90 days</option>
				</select>

				{/* Clear filters button — only shows when a filter is active */}
				{(filterStatus || filterSource || filterDate || search) && (
					<button
						onClick={() => {
							setFilterStatus('');
							setFilterSource('');
							setFilterDate('');
							setSearch('');
						}}
						style={{
							padding: '9px 14px', borderRadius: 8,
							border: '1px solid #E2E8F0', background: 'white',
							color: '#64748B', cursor: 'pointer', fontSize: 13,
						}}
					>
						Clear filters
					</button>
				)}
			</div>

			{/* ── TABLE ────────────────────────────────────────────────────── */}
			<div style={{
				background: 'white', borderRadius: 12,
				boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9',
				overflow: 'hidden',
			}}>
				{/* overflowX: auto makes the table scroll horizontally
					on smaller screens instead of breaking the layout */}
				<div style={{ overflowX: 'auto' }}>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead>
							<tr style={{ borderBottom: '1px solid #F1F5F9' }}>
								<ThCell field="company" label="Company" />
								<ThCell field="role" label="Role" />
								<ThCell field="status" label="Status" />
								{/* Location is not sortable — no ThCell */}
								<th style={thStyle}>Location</th>
								<ThCell field="dateApplied" label="Date Applied" />
								<ThCell field="source" label="Source" />
								<th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{/* Empty state — shown when no results match the filters */}
							{filtered.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										style={{
											padding: '48px 16px', textAlign: 'center',
											color: '#94A3B8', fontSize: 14,
										}}
									>
										No applications found. Try adjusting your filters.
									</td>
								</tr>
							) : (
								filtered.map((app, i) => (
									<tr
										key={app.id}
										style={{
											borderBottom: i < filtered.length - 1 ? '1px solid #F8FAFC' : 'none',
											transition: 'background 0.1s',
										}}
										onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFC')}
										onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
									>
										{/* Company — shows initial avatar + name */}
										<td style={tdStyle}>
											<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
												<div style={{
													width: 32, height: 32, borderRadius: 8,
													background: '#F1F5F9',
													display: 'flex', alignItems: 'center', justifyContent: 'center',
													fontSize: 13, fontWeight: 600, color: '#1E3A5F', flexShrink: 0,
												}}>
													{app.company[0]}
												</div>
												<span style={{ fontSize: 14, fontWeight: 500, color: '#1E293B' }}>
													{app.company}
												</span>
											</div>
										</td>

										{/* Role */}
										<td style={tdStyle}>
											<span style={{ fontSize: 14, color: '#475569' }}>{app.role}</span>
										</td>

										{/* Status badge — colored pill with a dot */}
										<td style={tdStyle}>
											<span style={{
												padding: '4px 10px', borderRadius: 999, fontSize: 12,
												background: STATUS_COLORS[app.status].bg,
												color: STATUS_COLORS[app.status].text,
												fontWeight: 500,
												display: 'inline-flex', alignItems: 'center', gap: 5,
											}}>
												<span style={{
													width: 6, height: 6, borderRadius: '50%',
													background: STATUS_COLORS[app.status].dot,
													flexShrink: 0,
												}} />
												{app.status}
											</span>
										</td>

										{/* Location — shows dash if empty */}
										<td style={tdStyle}>
											<span style={{ fontSize: 13, color: '#64748B' }}>
												{app.location || '—'}
											</span>
										</td>

										{/* Date Applied */}
										<td style={tdStyle}>
											<span style={{ fontSize: 13, color: '#64748B' }}>
												{new Date(app.dateApplied).toLocaleDateString('en-US', {
													month: 'short', day: 'numeric', year: 'numeric'
												})}
											</span>
										</td>

										{/* Source */}
										<td style={tdStyle}>
											<span style={{ fontSize: 13, color: '#64748B' }}>{app.source}</span>
										</td>

										{/* Actions — external link, edit, delete */}
										<td style={{ ...tdStyle, textAlign: 'right' }}>
											<div style={{
												display: 'flex', alignItems: 'center',
												justifyContent: 'flex-end', gap: 4,
											}}>
												{/* External link — only shows if job URL exists */}
												{app.jobUrl && (
													<a
														href={app.jobUrl}
														target="_blank"
														rel="noopener noreferrer"
														style={{
															width: 30, height: 30, borderRadius: 6,
															display: 'flex', alignItems: 'center', justifyContent: 'center',
															color: '#94A3B8', textDecoration: 'none',
														}}
														onMouseEnter={e => {
															(e.currentTarget as HTMLElement).style.background = '#F1F5F9';
															(e.currentTarget as HTMLElement).style.color = '#1E3A5F';
														}}
														onMouseLeave={e => {
															(e.currentTarget as HTMLElement).style.background = 'transparent';
															(e.currentTarget as HTMLElement).style.color = '#94A3B8';
														}}
													>
														<ExternalLink size={14} />
													</a>
												)}

												{/* Edit button */}
												<button
													onClick={() => openEdit(app)}
													style={iconBtnStyle}
													onMouseEnter={e => {
														(e.currentTarget as HTMLElement).style.background = '#EFF6FF';
														(e.currentTarget as HTMLElement).style.color = '#1D4ED8';
													}}
													onMouseLeave={e => {
														(e.currentTarget as HTMLElement).style.background = 'transparent';
														(e.currentTarget as HTMLElement).style.color = '#94A3B8';
													}}
												>
													<Pencil size={14} />
												</button>

												{/* Delete — shows confirmation buttons after first click */}
												{deleteConfirm === app.id ? (
													<div style={{ display: 'flex', gap: 4 }}>
														{/* Confirm delete */}
														<button
															onClick={() => {
																deleteApplication(app.id);
																setDeleteConfirm(null);
															}}
															style={{
																padding: '4px 8px', borderRadius: 6, fontSize: 12,
																background: '#FEF2F2', color: '#DC2626',
																border: '1px solid #FCA5A5', cursor: 'pointer',
															}}
														>
															Delete
														</button>
														{/* Cancel delete */}
														<button
															onClick={() => setDeleteConfirm(null)}
															style={{
																padding: '4px 8px', borderRadius: 6, fontSize: 12,
																background: '#F8FAFC', color: '#64748B',
																border: '1px solid #E2E8F0', cursor: 'pointer',
															}}
														>
															Cancel
														</button>
													</div>
												) : (
													<button
														onClick={() => setDeleteConfirm(app.id)}
														style={iconBtnStyle}
														onMouseEnter={e => {
															(e.currentTarget as HTMLElement).style.background = '#FEF2F2';
															(e.currentTarget as HTMLElement).style.color = '#DC2626';
														}}
														onMouseLeave={e => {
															(e.currentTarget as HTMLElement).style.background = 'transparent';
															(e.currentTarget as HTMLElement).style.color = '#94A3B8';
														}}
													>
														<Trash2 size={14} />
													</button>
												)}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal — renders outside the table to avoid z-index issues */}
			<ApplicationModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				mode={modalMode}
				editingApp={editingApp}
			/>
		</div>
	);
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
	padding: '9px 12px', borderRadius: 8,
	border: '1px solid #E2E8F0', background: '#F8FAFC',
	fontSize: 14, color: '#1E293B', cursor: 'pointer',
	outline: 'none', minWidth: 130,
};

const thStyle: React.CSSProperties = {
	padding: '11px 16px', textAlign: 'left', fontSize: 12,
	fontWeight: 600, color: '#64748B', background: '#F8FAFC',
	whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
	padding: '13px 16px', verticalAlign: 'middle',
};

// Base style for the edit and delete icon buttons
const iconBtnStyle: React.CSSProperties = {
	width: 30, height: 30, borderRadius: 6,
	display: 'flex', alignItems: 'center', justifyContent: 'center',
	background: 'transparent', border: 'none',
	cursor: 'pointer', color: '#94A3B8',
	transition: 'background 0.15s, color 0.15s',
};