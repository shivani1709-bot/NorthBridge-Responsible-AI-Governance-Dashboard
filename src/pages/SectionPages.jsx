import React, { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import { Badge, EmptyState, Feedback, Modal, SectionHeader } from '../components/UI'
import { api } from '../lib/api'

const info = {
  inventory: ['AI system inventory', 'A database-backed source of truth for every AI system.', 'Add AI system'],
  risk: ['RAI risk assessment', 'Assessments are persisted and linked to governed systems.', 'Start assessment'],
  vetting: ['AI vetting center', 'Review internal use cases and external vendors.', 'New vetting request'],
  roles: ['RAI roles & accountability', 'Persisted ownership across the AI portfolio.', 'Assign role'],
  kpi: ['KPI dashboard', 'Metrics are calculated from persisted governance records.', ''],
  escalation: ['Escalation center', 'Persisted issues routed to the RAI Office.', 'Create escalation'],
  roadmap: ['12-month implementation roadmap', 'Milestone completion is stored in SQLite.', ''],
}

function Field({ label, name, value, onChange, error, type = 'text', options }) {
  return <label className="form-field"><span>{label} *</span>{options ? <select name={name} value={value} onChange={onChange} aria-invalid={Boolean(error)}><option value="">Select...</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input name={name} type={type} value={value} onChange={onChange} aria-invalid={Boolean(error)} />}{error && <small className="field-error">{error}</small>}</label>
}

function Form({ fields, onSubmit, submitLabel = 'Save' }) {
  const [values, setValues] = useState(Object.fromEntries(fields.map((field) => [field.name, '']))); const [errors, setErrors] = useState({})
  const change = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = (event) => { event.preventDefault(); const next = Object.fromEntries(fields.filter((field) => field.required !== false && !values[field.name].trim()).map((field) => [field.name, 'This field is required.'])); setErrors(next); if (!Object.keys(next).length) onSubmit(values) }
  return <form className="modal-form" onSubmit={submit}>{fields.map((field) => <Field key={field.name} {...field} value={values[field.name]} onChange={change} error={errors[field.name]} />)}<button className="button button-dark" type="submit">{submitLabel}</button></form>
}

function useResource(loader, initial = []) {
  const [data, setData] = useState(initial); const [meta, setMeta] = useState({}); const [state, setState] = useState({ loading: true, error: '' })
  const reload = () => { setState({ loading: true, error: '' }); loader().then((result) => { setData(result.data || result); setMeta(result.progress ? { progress: result.progress } : {}); setState({ loading: false, error: '' }) }).catch((error) => setState({ loading: false, error: error.message })) }
  useEffect(reload, [])
  return { data, setData, meta, ...state, reload }
}

function Layout({ children, feedback, setFeedback, onAction, action }) { return <><SectionHeader eyebrow="Responsible AI program" title={children.title} description={children.description} action={action} onAction={onAction} />{feedback && <Feedback message={feedback} onDismiss={() => setFeedback('')} />}{children.content}</> }

function InventoryPage({ onFeedback }) {
  const resource = useResource(() => api.systems()); const [query, setQuery] = useState(''); const [risk, setRisk] = useState('All'); const [status, setStatus] = useState('All'); const [open, setOpen] = useState(false)
  const search = () => resource.reload()
  useEffect(() => { const timer = setTimeout(() => { resource.setData([]); api.systems(new URLSearchParams({ search: query, risk, status }).toString()).then((result) => resource.setData(result.data)).catch(() => {}) }, 250); return () => clearTimeout(timer) }, [query, risk, status])
  return <><div className="toolbar"><div className="search-field"><Icon name="search" size={16} /><input aria-label="Search AI systems" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records..." /></div><select className="filter-button" aria-label="Risk tier filter" value={risk} onChange={(event) => setRisk(event.target.value)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select><select className="filter-button" aria-label="Status filter" value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>In production</option><option>Pilot</option><option>In development</option></select><button className="button button-secondary" onClick={search}>Refresh</button></div><section className="card full-card"><div className="table-wrap">{resource.loading ? <EmptyState title="Loading inventory..." description="Reading persisted systems from the API." /> : resource.error ? <EmptyState title="Unable to load inventory" description={resource.error} /> : resource.data.length ? <table className="wide-table"><thead><tr><th>AI system</th><th>Business owner</th><th>Risk tier</th><th>Status</th><th>Next review</th></tr></thead><tbody>{resource.data.map((item) => <tr key={item.id}><td><div className="system-name"><div className={`system-logo ${item.color}`}>{item.initials}</div><strong>{item.name}</strong></div></td><td>{item.owner}</td><td><Badge tone={item.risk.toLowerCase()}>{item.risk}</Badge></td><td><Badge tone="green">{item.status}</Badge></td><td>{item.review}</td></tr>)}</tbody></table> : <EmptyState title="No systems match" description="Try another search or filter." />}</div></section>{open && <Modal title="Add AI system" onClose={() => setOpen(false)}><Form fields={[{ label: 'System name', name: 'name' }, { label: 'Business owner', name: 'owner' }, { label: 'Risk tier', name: 'risk', options: ['High', 'Medium', 'Low'] }, { label: 'Lifecycle status', name: 'status', options: ['In production', 'Pilot', 'In development'] }]} onSubmit={(values) => api.createSystem(values).then(() => { setOpen(false); onFeedback('AI system saved to the database.'); resource.reload() }).catch((error) => onFeedback(error.message, 'error'))} submitLabel="Add system" /></Modal>}</>
}

function RiskPage({ onFeedback }) {
  const resource = useResource(() => api.assessments()); const [open, setOpen] = useState(false)
  return <><section className="card full-card"><div className="card-heading"><div><h2>Persisted assessments</h2><p>Risk score and status are calculated by the backend.</p></div><button className="button button-secondary" onClick={() => setOpen(true)}>Start assessment</button></div><div className="table-wrap">{resource.loading ? <EmptyState title="Loading assessments..." description="Reading the risk register." /> : resource.data.length ? <table className="wide-table"><thead><tr><th>System</th><th>Category</th><th>Score</th><th>Status</th><th>Owner</th></tr></thead><tbody>{resource.data.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.category}</td><td>{item.score}</td><td><Badge tone={item.status === 'Acceptable' ? 'green' : 'amber'}>{item.status}</Badge></td><td>{item.owner}</td></tr>)}</tbody></table> : <EmptyState title="No assessments" description="Start the first persisted assessment." />}</div></section>{open && <Modal title="Start assessment" onClose={() => setOpen(false)}><Form fields={[{ label: 'AI system', name: 'name' }, { label: 'Risk category', name: 'category', options: ['Fairness & bias', 'Privacy', 'Explainability', 'Safety'] }, { label: 'Score (0-10)', name: 'score', type: 'number' }, { label: 'Owner', name: 'owner' }]} onSubmit={(values) => api.createAssessment({ ...values, score: Number(values.score) }).then(() => { setOpen(false); onFeedback('Risk assessment saved to the database.'); resource.reload() }).catch((error) => onFeedback(error.message, 'error'))} submitLabel="Submit assessment" /></Modal>}</>
}

function VettingPage({ onFeedback }) {
  const resource = useResource(() => api.vetting()); const [open, setOpen] = useState(false); const decide = (id, decision) => api.updateVetting(id, { decision }).then(() => { onFeedback(`Request ${decision.toLowerCase()}.`); resource.reload() }).catch((error) => onFeedback(error.message, 'error'))
  return <><section className="card full-card"><div className="card-heading"><div><h2>Vetting requests</h2><p>Approval decisions are persisted with timestamps.</p></div><button className="button button-secondary" onClick={() => setOpen(true)}>New request</button></div><div className="table-wrap">{resource.loading ? <EmptyState title="Loading requests..." description="Reading vetting records." /> : resource.data.length ? <table className="wide-table"><thead><tr><th>Request</th><th>Type</th><th>Submitted by</th><th>Decision</th><th>Actions</th></tr></thead><tbody>{resource.data.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.type}</td><td>{item.submitted}</td><td><Badge tone={item.decision === 'Approved' ? 'green' : 'amber'}>{item.decision}</Badge></td><td><button className="mini-action" onClick={() => decide(item.id, 'Approved')}>Approve</button><button className="mini-action danger" onClick={() => decide(item.id, 'Rejected')}>Reject</button></td></tr>)}</tbody></table> : <EmptyState title="No requests" description="Submit a vetting request to begin." />}</div></section>{open && <Modal title="New vetting request" onClose={() => setOpen(false)}><Form fields={[{ label: 'Request name', name: 'name' }, { label: 'Request type', name: 'type', options: ['Internal use case', 'External vendor'] }, { label: 'Submitted by', name: 'submitted' }]} onSubmit={(values) => api.createVetting(values).then(() => { setOpen(false); onFeedback('Vetting request saved to the database.'); resource.reload() }).catch((error) => onFeedback(error.message, 'error'))} submitLabel="Submit request" /></Modal>}</>
}

function RolesPage({ onFeedback }) { const resource = useResource(() => api.roles()); const [open, setOpen] = useState(false); return <><section className="card full-card"><div className="card-heading"><div><h2>Role assignments</h2><p>Assignments are stored in the database.</p></div><button className="button button-secondary" onClick={() => setOpen(true)}>Assign role</button></div><div className="table-wrap">{resource.loading ? <EmptyState title="Loading roles..." description="Reading accountability records." /> : <table className="wide-table"><thead><tr><th>Person</th><th>Role</th><th>Area</th><th>Coverage</th></tr></thead><tbody>{resource.data.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.role}</td><td>{item.area}</td><td>{item.systems}</td></tr>)}</tbody></table>}</div></section>{open && <Modal title="Assign RAI role" onClose={() => setOpen(false)}><Form fields={[{ label: 'Person', name: 'name' }, { label: 'Role', name: 'role', options: ['Model Owner', 'Independent Reviewer', 'Technical Owner'] }, { label: 'Primary area', name: 'area' }]} onSubmit={(values) => api.createRole(values).then(() => { setOpen(false); onFeedback('Role assignment saved to the database.'); resource.reload() }).catch((error) => onFeedback(error.message, 'error'))} submitLabel="Assign role" /></Modal>}</> }

function EscalationPage({ onFeedback }) { const resource = useResource(() => api.escalations()); const [open, setOpen] = useState(false); const resolve = (id) => api.updateEscalation(id, { status: 'Resolved', resolution: 'Resolved in governance workflow' }).then(() => { onFeedback('Escalation resolved in the database.'); resource.reload() }).catch((error) => onFeedback(error.message, 'error')); return <><section className="card full-card"><div className="card-heading"><div><h2>Open escalations</h2><p>Resolution status is persisted.</p></div><button className="button button-secondary" onClick={() => setOpen(true)}>Create escalation</button></div><div className="escalation-list">{resource.data.filter((item) => item.status !== 'Resolved').map((item) => <div className="escalation-row" key={item.id}><div className="escalation-main"><span>{item.reference} · {item.system}</span><strong>{item.summary}</strong><small>Assigned to {item.owner}</small></div><Badge tone={item.severity.toLowerCase()}>{item.severity}</Badge><button className="mini-action" onClick={() => resolve(item.id)}>Resolve</button></div>)}{!resource.loading && !resource.data.filter((item) => item.status !== 'Resolved').length && <EmptyState title="No open escalations" description="The queue is clear." />}</div></section>{open && <Modal title="Create escalation" onClose={() => setOpen(false)}><Form fields={[{ label: 'AI system', name: 'system' }, { label: 'Issue summary', name: 'summary' }, { label: 'Severity', name: 'severity', options: ['High', 'Medium', 'Low'] }, { label: 'Owner', name: 'owner' }]} onSubmit={(values) => api.createEscalation(values).then(() => { setOpen(false); onFeedback('Escalation saved to the database.'); resource.reload() }).catch((error) => onFeedback(error.message, 'error'))} submitLabel="Create escalation" /></Modal>}</> }

function RoadmapPage({ onFeedback }) {
  const resource = useResource(() => api.roadmap())
  const groups = resource.data
  const progress = resource.meta.progress || { completed: 0, total: 0 }
  const toggle = (id, completed) => api.updateMilestone(id, completed)
    .then(() => { onFeedback('Milestone updated in the database.'); resource.reload() })
    .catch((error) => onFeedback(error.message, 'error'))
  const percentage = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0

  if (resource.loading) return <EmptyState title="Loading 12-month roadmap..." description="Reading persisted milestones from the database." />
  if (resource.error) return <EmptyState title="Unable to load roadmap" description={`The roadmap API could not be reached: ${resource.error}`} />
  if (!groups.length) return <EmptyState title="No roadmap milestones found" description="The database does not contain any roadmap milestones." />

  return <>
    <div className="roadmap-progress">
      <div><span>Program completion</span><strong>{percentage}%</strong></div>
      <div className="progress-bar"><i className="blue" style={{ width: `${percentage}%` }} /></div>
      <small>{progress.completed} of {progress.total} persisted milestones completed</small>
    </div>
    <div className="roadmap-grid">{groups.map((group) => {
      const completed = group.items.filter((item) => item.completed).length
      return <div className="roadmap-card card" key={group.q}>
        <div className="roadmap-card-top"><div className="quarter">{group.q}</div><Badge tone={completed === group.items.length ? 'green' : completed ? 'purple' : 'neutral'}>{completed === group.items.length ? 'Complete' : completed ? 'In progress' : 'Upcoming'}</Badge></div>
        <span className="roadmap-month">{group.month}</span><h2>{group.title}</h2>
        <ul>{group.items.map((item) => <li key={item.id}><label><input type="checkbox" checked={item.completed} onChange={(event) => toggle(item.id, event.target.checked)} />{item.text}</label></li>)}</ul>
        <div className="roadmap-card-footer"><span>{completed} of {group.items.length} milestones</span><Icon name="arrow" size={15} /></div>
      </div>
    })}</div>
  </>
}

function KpiPage({ onFeedback }) {
  const resource = useResource(() => api.kpis(), {}); const data = resource.data
  const download = () => api.downloadKpiCsv().then((blob) => { const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'northbridge-kpi.csv'; anchor.click(); URL.revokeObjectURL(url); onFeedback('KPI CSV generated from database records.') }).catch((error) => onFeedback(error.message, 'error'))
  return <><section className="kpi-grid">{[['Inventory coverage', data.inventoryCoverage], ['Assessments complete', data.assessmentsComplete], ['Owner accountability', data.ownerAccountability], ['Roadmap progress', data.roadmapProgress]].map(([label, value]) => <div className="card kpi-card" key={label}><div className="kpi-top"><span>{label}</span><Icon name="chart" size={18} /></div><strong>{resource.loading ? '...' : `${value || 0}%`}</strong><div className="progress-bar"><i className="green" style={{ width: `${value || 0}%` }} /></div></div>)}</section><div className="card-actions"><button className="button button-secondary" onClick={download}><Icon name="download" size={15} />Export report</button></div></>
}

export default function SectionPage({ page }) {
  const [feedback, setFeedback] = useState(''); const [errorTone, setErrorTone] = useState('success'); const setMessage = (message, tone = 'success') => { setFeedback(message); setErrorTone(tone) }; const action = info[page][2]
  const content = page === 'inventory' ? <InventoryPage onFeedback={setMessage} /> : page === 'risk' ? <RiskPage onFeedback={setMessage} /> : page === 'vetting' ? <VettingPage onFeedback={setMessage} /> : page === 'roles' ? <RolesPage onFeedback={setMessage} /> : page === 'escalation' ? <EscalationPage onFeedback={setMessage} /> : page === 'roadmap' ? <RoadmapPage onFeedback={setMessage} /> : page === 'kpi' ? <KpiPage onFeedback={setMessage} /> : <EmptyState title="Dashboard metrics" description="Use the dashboard overview to view database-backed metrics." />
  return <div className="page"><SectionHeader eyebrow="Responsible AI program" title={info[page][0]} description={info[page][1]} action={action || undefined} onAction={() => setMessage('Use the page workflow to create and manage persisted records.')} />{feedback && <Feedback message={feedback} tone={errorTone} onDismiss={() => setFeedback('')} />}{content}</div>
}
