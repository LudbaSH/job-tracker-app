import React, { useState, useEffect } from 'react';
// X is the close button icon in the top right of the modal
import { X } from 'lucide-react';
import {
	Application,
	Status,
	Source,
	STATUSES,
	SOURCES,
	useApp
} from '../context/AppContext';

// ─── TYPES ───────────────────────────────────────────────────────────────────

// Defines what props this component accepts from the parent (Applications.tsx)
interface ModalProps {
	// Controls whether the modal is visible or hidden
	isOpen: boolean;

	// Function called when user clicks Cancel or the X button
	onClose: () => void;

	// 'add' shows "Add Application" title and button
	// 'edit' shows "Edit Application" title and pre-fills the form
	mode: 'add' | 'edit';

	// The application to pre-fill when editing — null when adding
	editingApp?: Application | null;
}

// ─── EMPTY FORM ──────────────────────────────────────────────────────────────

// Default values for a blank form when adding a new application
// dateApplied defaults to today's date automatically
const EMPTY_FORM = {
	company: '',
	role: '',
	status: 'Applied' as Status,
	location: '',
	dateApplied: new Date().toISOString().split('T')[0],
	source: 'LinkedIn' as Source,
	salaryRange: '',
	jobUrl: '',
	notes: '',
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export function ApplicationModal({ isOpen, onClose, mode, editingApp }: ModalProps) {
	const { addApplication, updateApplication } = useApp()

	// form holds all the current values of every input field
	const [form, setForm] = useState(EMPTY_FORM);

	// errors holds validation error messages keyed by field name
	// e.g. { company: 'Company is required' }
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Runs whenever the modal opens or the mode/editingApp changes
	// Resets the form to either empty (add) or pre-filled (edit)
	useEffect(() => {
		if (isOpen) {
			if (mode === 'edit' && editingApp) {
				// Pre-fill every field with the existing application's data
				setForm({
					company: editingApp.company,
					role: editingApp.role,
					status: editingApp.status,
					location: editingApp.location,
					dateApplied: editingApp.dateApplied,
					source: editingApp.source,
					salaryRange: editingApp.salaryRange,
					jobUrl: editingApp.jobUrl,
					notes: editingApp.notes,
				});
			} else {
				// Reset to blank form for adding
				setForm(EMPTY_FORM);
			}
			// Clear any leftover validation errors from previous open
			setErrors({});
		}
	}, [isOpen, mode, editingApp]);

	// ─── VALIDATION ──────────────────────────────────────────────────────────
	// Checks required fields and returns an errors object
	// Empty object means everything is valid
	const validate = () => {
		const e: Record<string, string> = {};
		if (!form.company.trim()) e.company = 'Company is required';
		if (!form.role.trim()) e.role = 'Role is required';
		if (!form.dateApplied) e.dateApplied = 'Date is required';
		return e;
	};

	// ─── SAVE HANDLER ────────────────────────────────────────────────────────
	const handleSave = () => {
		const e = validate();

		// If there are any errors, show them and stop — don't save
		if (Object.keys(e).length > 0) {
			setErrors(e);
			return;
		}

		if (mode === 'add') {
			// addApplication expects everything except id
			// id gets generated automatically in AppContext
			addApplication(form);
		} else if (mode === 'edit' && editingApp) {
			// updateApplication needs the full application including id
			updateApplication({ ...form, id: editingApp.id });
		}

		onClose();
	};

	// ─── FIELD HELPER ────────────────────────────────────────────────────────
	// Updates a single field in the form state
	// Also clears that field's error as soon as the user starts typing
	const set = (field: string, value: string) => {
		setForm(prev => ({ ...prev, [field]: value }));
		if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
	};

	// Don't render anything if modal is closed
	// This keeps the DOM clean when the modal isn't needed
	if (!isOpen) return null;

	return (
		// ── BACKDROP ─────────────────────────────────────────────────────────
		// Semi-transparent dark overlay behind the modal
		// Clicking the backdrop (not the modal itself) closes it
		<div
			style={{
				position: 'fixed', inset: 0, zIndex: 1000,
				background: 'rgba(0,0,0,0.45)',
				display: 'flex', alignItems: 'center', justifyContent: 'center',
				padding: 16,
			}}
			onClick={e => {
				// e.target is what was actually clicked
				// e.currentTarget is the backdrop div itself
				// Only close if the click was directly on the backdrop,
				// not on something inside the modal
				if (e.target === e.currentTarget) onClose();
			}}
		>
			{/* ── MODAL BOX ────────────────────────────────────────────────── */}
			<div
				style={{
					background: 'white', borderRadius: 16,
					width: '100%', maxWidth: 580,
					// maxHeight + overflowY makes the modal scrollable on small screens
					maxHeight: '90vh', overflowY: 'auto',
					boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
				}}
			>
				{/* ── HEADER ───────────────────────────────────────────────── */}
				<div style={{
					display: 'flex', alignItems: 'center', justifyContent: 'space-between',
					padding: '20px 24px 16px',
					borderBottom: '1px solid #F1F5F9',
				}}>
					<h2 style={{ color: '#1E293B', margin: 0 }}>
						{mode === 'add' ? 'Add Application' : 'Edit Application'}
					</h2>
					<button
						onClick={onClose}
						style={{
							border: 'none', background: '#F8FAFC',
							borderRadius: 8, padding: '6px', cursor: 'pointer',
							color: '#64748B', display: 'flex', alignItems: 'center',
						}}
					>
						<X size={18} />
					</button>
				</div>

				{/* ── FORM BODY ────────────────────────────────────────────── */}
				<div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

					{/* Company + Role — side by side in a 2 column grid */}
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
						<Field label="Company *" error={errors.company}>
							<input
								value={form.company}
								onChange={e => set('company', e.target.value)}
								placeholder="e.g. Google"
								style={inputStyle(!!errors.company)}
							/>
						</Field>
						<Field label="Role *" error={errors.role}>
							<input
								value={form.role}
								onChange={e => set('role', e.target.value)}
								placeholder="e.g. Software Engineer"
								style={inputStyle(!!errors.role)}
							/>
						</Field>
					</div>

					{/* Status + Date Applied */}
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
						<Field label="Status">
							<select
								value={form.status}
								onChange={e => set('status', e.target.value)}
								style={inputStyle(false)}
							>
								{/* Maps over the STATUSES array to generate dropdown options */}
								{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
							</select>
						</Field>
						<Field label="Date Applied *" error={errors.dateApplied}>
							<input
								type="date"
								value={form.dateApplied}
								onChange={e => set('dateApplied', e.target.value)}
								style={inputStyle(!!errors.dateApplied)}
							/>
						</Field>
					</div>

					{/* Location + Source */}
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
						<Field label="Location">
							<input
								value={form.location}
								onChange={e => set('location', e.target.value)}
								placeholder="e.g. Remote or New York, NY"
								style={inputStyle(false)}
							/>
						</Field>
						<Field label="Source">
							<select
								value={form.source}
								onChange={e => set('source', e.target.value)}
								style={inputStyle(false)}
							>
								{SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
							</select>
						</Field>
					</div>

					{/* Salary Range + Job URL */}
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
						<Field label="Salary Range">
							<input
								value={form.salaryRange}
								onChange={e => set('salaryRange', e.target.value)}
								placeholder="e.g. $100k - $130k"
								style={inputStyle(false)}
							/>
						</Field>
						<Field label="Job URL">
							<input
								value={form.jobUrl}
								onChange={e => set('jobUrl', e.target.value)}
								placeholder="https://..."
								style={inputStyle(false)}
							/>
						</Field>
					</div>

					{/* Notes — full width textarea */}
					<Field label="Notes">
						<textarea
							value={form.notes}
							onChange={e => set('notes', e.target.value)}
							placeholder="Any additional notes about this application..."
							rows={3}
							style={{
								...inputStyle(false),
								resize: 'vertical',  // lets user resize vertically only
								minHeight: 80,
								fontFamily: 'inherit',
							}}
						/>
					</Field>
				</div>

				{/* ── FOOTER ───────────────────────────────────────────────── */}
				<div style={{
					display: 'flex', justifyContent: 'flex-end', gap: 10,
					padding: '16px 24px 20px',
					borderTop: '1px solid #F1F5F9',
				}}>
					<button
						onClick={onClose}
						style={{
							padding: '9px 20px', borderRadius: 8,
							border: '1px solid #E2E8F0',
							background: 'white', color: '#475569',
							cursor: 'pointer', fontSize: 14, fontWeight: 500,
						}}
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						style={{
							padding: '9px 20px', borderRadius: 8,
							border: 'none',
							background: '#1E3A5F', color: 'white',
							cursor: 'pointer', fontSize: 14, fontWeight: 500,
						}}
					>
						{mode === 'add' ? 'Add Application' : 'Save Changes'}
					</button>
				</div>
			</div>
		</div>
	);
}

// ─── HELPER COMPONENTS ───────────────────────────────────────────────────────
// Field wraps each input with a label and optional error message
// Keeps the form body clean — no repeated label/error markup
function Field({
	label,
	error,
	children
}: {
	label: string;
	error?: string;
	children: React.ReactNode
}) {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
			<label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
				{label}
			</label>
			{children}
			{/* Only renders the error message if one exists */}
			{error && (
				<span style={{ fontSize: 12, color: '#DC2626' }}>{error}</span>
			)}
		</div>
	);
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
// Returns different border/background colors depending on whether
// the field has a validation error
function inputStyle(hasError: boolean): React.CSSProperties {
	return {
		width: '100%',
		padding: '9px 12px',
		borderRadius: 8,
		border: `1px solid ${hasError ? '#FCA5A5' : '#E2E8F0'}`,
		background: hasError ? '#FFF5F5' : '#F8FAFC',
		color: '#1E293B',
		fontSize: 14,
		outline: 'none',
		boxSizing: 'border-box',
		fontFamily: 'inherit',
	};
}