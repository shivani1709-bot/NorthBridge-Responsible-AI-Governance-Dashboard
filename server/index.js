import express from 'express'
import cors from 'cors'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { db, audit, initials } from './db.js'
import { aiSystemSchema, assessmentSchema, escalationSchema, roleSchema, validate, vettingSchema } from './validation.js'

export const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || true }))
app.use(express.json({ limit: '100kb' }))
const distPath = resolve(process.cwd(), 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
}
const record = (row) => row && ({ ...row, id: String(row.id) })
const missing = (message) => Object.assign(new Error(message), { status: 404 })
const statusForScore = (score) => score >= 7 ? 'Needs mitigation' : score >= 4 ? 'In review' : 'Acceptable'
const update = (table, id, data, allowed) => {
  if (!db.prepare(`SELECT id FROM ${table} WHERE id=?`).get(id)) throw missing('Record not found')
  const fields = Object.keys(data).filter((field) => allowed.includes(field))
  if (!fields.length) throw Object.assign(new Error('At least one valid field is required'), { status: 400 })
  db.prepare(`UPDATE ${table} SET ${fields.map((field) => `${field}=?`).join(',')} WHERE id=?`).run(...fields.map((field) => data[field]), id)
  return record(db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id))
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: 'sqlite' }))
app.get('/api/ai-systems', (req, res) => {
  const search = String(req.query.search || '').trim()
  const rows = db.prepare(`SELECT * FROM ai_systems WHERE (?='' OR lower(name || ' ' || owner) LIKE lower(?)) AND (?='All' OR risk=?) AND (?='All' OR status=?) ORDER BY id DESC`).all(search, `%${search}%`, req.query.risk || 'All', req.query.risk || 'All', req.query.status || 'All', req.query.status || 'All')
  res.json({ data: rows.map(record) })
})
app.get('/api/ai-systems/:id', (req, res) => { const row = db.prepare('SELECT * FROM ai_systems WHERE id=?').get(req.params.id); if (!row) throw missing('AI system not found'); res.json({ data: record(row) }) })
app.post('/api/ai-systems', (req, res) => { const data = validate(aiSystemSchema, req.body); const result = db.prepare('INSERT INTO ai_systems (name,owner,risk,status,review,initials,color) VALUES (?,?,?,?,?,?,?)').run(data.name, data.owner, data.risk, data.status, data.review || '30 Dec 2026', initials(data.name), 'teal'); audit('ai_system', result.lastInsertRowid, 'created', data); res.status(201).json({ data: record(db.prepare('SELECT * FROM ai_systems WHERE id=?').get(result.lastInsertRowid)) }) })
app.put('/api/ai-systems/:id', (req, res) => { const data = validate(aiSystemSchema.partial(), req.body); const result = update('ai_systems', req.params.id, data, ['name', 'owner', 'risk', 'status', 'review']); audit('ai_system', req.params.id, 'updated', data); res.json({ data: result }) })
app.delete('/api/ai-systems/:id', (req, res) => { if (!db.prepare('DELETE FROM ai_systems WHERE id=?').run(req.params.id).changes) throw missing('AI system not found'); audit('ai_system', req.params.id, 'deleted'); res.status(204).end() })

app.get('/api/risk-assessments', (_req, res) => res.json({ data: db.prepare('SELECT * FROM risk_assessments ORDER BY id DESC').all().map(record) }))
app.get('/api/risk-assessments/:id', (req, res) => { const row = db.prepare('SELECT * FROM risk_assessments WHERE id=?').get(req.params.id); if (!row) throw missing('Risk assessment not found'); res.json({ data: record(row) }) })
app.post('/api/risk-assessments', (req, res) => { const data = validate(assessmentSchema, req.body); const result = db.prepare('INSERT INTO risk_assessments (ai_system_id,name,category,score,status,owner,findings) VALUES (?,?,?,?,?,?,?)').run(data.aiSystemId || null, data.name, data.category, data.score, statusForScore(data.score), data.owner, data.findings || ''); audit('risk_assessment', result.lastInsertRowid, 'created', data); res.status(201).json({ data: record(db.prepare('SELECT * FROM risk_assessments WHERE id=?').get(result.lastInsertRowid)) }) })
app.put('/api/risk-assessments/:id', (req, res) => { const data = validate(assessmentSchema.partial(), req.body); if (data.score !== undefined) data.status = statusForScore(data.score); if (data.aiSystemId !== undefined) { data.ai_system_id = data.aiSystemId; delete data.aiSystemId } const result = update('risk_assessments', req.params.id, data, ['ai_system_id', 'name', 'category', 'score', 'status', 'owner', 'findings']); audit('risk_assessment', req.params.id, 'updated', data); res.json({ data: result }) })
app.delete('/api/risk-assessments/:id', (req, res) => { if (!db.prepare('DELETE FROM risk_assessments WHERE id=?').run(req.params.id).changes) throw missing('Risk assessment not found'); res.status(204).end() })

app.get('/api/vetting-requests', (req, res) => { const rows = db.prepare(`SELECT * FROM vetting_requests WHERE (?='All' OR type=?) AND (?='All' OR decision=?) ORDER BY id DESC`).all(req.query.type || 'All', req.query.type || 'All', req.query.decision || 'All', req.query.decision || 'All'); res.json({ data: rows.map(record) }) })
app.get('/api/vetting-requests/:id', (req, res) => { const row = db.prepare('SELECT * FROM vetting_requests WHERE id=?').get(req.params.id); if (!row) throw missing('Vetting request not found'); res.json({ data: record(row) }) })
app.post('/api/vetting-requests', (req, res) => { const data = validate(vettingSchema, req.body); const result = db.prepare('INSERT INTO vetting_requests (name,type,submitted,due,decision) VALUES (?,?,?,?,?)').run(data.name, data.type, data.submitted, data.due || '30 Sep 2026', data.decision || 'Pending review'); audit('vetting_request', result.lastInsertRowid, 'created', data); res.status(201).json({ data: record(db.prepare('SELECT * FROM vetting_requests WHERE id=?').get(result.lastInsertRowid)) }) })
app.put('/api/vetting-requests/:id', (req, res) => { const data = validate(vettingSchema.partial(), req.body); const result = update('vetting_requests', req.params.id, data, ['name', 'type', 'submitted', 'due', 'decision']); if (data.decision && ['Approved', 'Rejected', 'Approved with conditions'].includes(data.decision)) db.prepare('UPDATE vetting_requests SET decision_at=CURRENT_TIMESTAMP WHERE id=?').run(req.params.id); audit('vetting_request', req.params.id, data.decision === 'Approved' ? 'approved' : data.decision === 'Rejected' ? 'rejected' : 'updated', data); res.json({ data: result }) })
app.delete('/api/vetting-requests/:id', (req, res) => { if (!db.prepare('DELETE FROM vetting_requests WHERE id=?').run(req.params.id).changes) throw missing('Vetting request not found'); res.status(204).end() })

app.get('/api/rai-roles', (_req, res) => res.json({ data: db.prepare('SELECT * FROM rai_roles ORDER BY id DESC').all().map(record) }))
app.post('/api/rai-roles', (req, res) => { const data = validate(roleSchema, req.body); const result = db.prepare('INSERT INTO rai_roles (name,role,area,systems,status,initials,color) VALUES (?,?,?,?,?,?,?)').run(data.name, data.role, data.area, data.systems || '1 system', data.status || 'Active', initials(data.name), 'teal'); audit('rai_role', result.lastInsertRowid, 'created', data); res.status(201).json({ data: record(db.prepare('SELECT * FROM rai_roles WHERE id=?').get(result.lastInsertRowid)) }) })
app.put('/api/rai-roles/:id', (req, res) => res.json({ data: update('rai_roles', req.params.id, validate(roleSchema.partial(), req.body), ['name', 'role', 'area', 'systems', 'status']) }))
app.delete('/api/rai-roles/:id', (req, res) => { if (!db.prepare('DELETE FROM rai_roles WHERE id=?').run(req.params.id).changes) throw missing('RAI role not found'); res.status(204).end() })

app.get('/api/escalations', (_req, res) => res.json({ data: db.prepare('SELECT * FROM escalations ORDER BY id DESC').all().map(record) }))
app.get('/api/escalations/:id', (req, res) => { const row = db.prepare('SELECT * FROM escalations WHERE id=?').get(req.params.id); if (!row) throw missing('Escalation not found'); res.json({ data: record(row) }) })
app.post('/api/escalations', (req, res) => { const data = validate(escalationSchema, req.body); const result = db.prepare('INSERT INTO escalations (reference,system,summary,severity,due,owner,status,resolution) VALUES (?,?,?,?,?,?,?,?)').run(`EXC-${Date.now().toString().slice(-6)}`, data.system, data.summary, data.severity, data.due || 'Due in 7 days', data.owner, data.status || 'Open', data.resolution || ''); audit('escalation', result.lastInsertRowid, 'created', data); res.status(201).json({ data: record(db.prepare('SELECT * FROM escalations WHERE id=?').get(result.lastInsertRowid)) }) })
app.put('/api/escalations/:id', (req, res) => { const data = validate(escalationSchema.partial(), req.body); const result = update('escalations', req.params.id, data, ['system', 'summary', 'severity', 'due', 'owner', 'status', 'resolution']); if (data.status === 'Resolved') db.prepare('UPDATE escalations SET resolved_at=CURRENT_TIMESTAMP WHERE id=?').run(req.params.id); audit('escalation', req.params.id, data.status === 'Resolved' ? 'resolved' : 'updated', data); res.json({ data: result }) })

app.get('/api/roadmap', (_req, res) => { const rows = db.prepare('SELECT * FROM roadmap_milestones ORDER BY quarter,position').all(); const data = Object.values(rows.reduce((group, row) => { group[row.quarter] ||= { q: row.quarter, month: row.month, title: row.title, items: [] }; group[row.quarter].items.push({ id: String(row.id), text: row.milestone, completed: Boolean(row.completed) }); return group }, {})); res.json({ data, progress: { completed: rows.filter((row) => row.completed).length, total: rows.length } }) })
app.put('/api/roadmap/milestones/:id', (req, res) => { if (typeof req.body.completed !== 'boolean') throw Object.assign(new Error('completed must be a boolean'), { status: 422 }); if (!db.prepare('SELECT id FROM roadmap_milestones WHERE id=?').get(req.params.id)) throw missing('Roadmap milestone not found'); db.prepare('UPDATE roadmap_milestones SET completed=? WHERE id=?').run(req.body.completed ? 1 : 0, req.params.id); audit('roadmap_milestone', req.params.id, 'updated', req.body); res.json({ data: db.prepare('SELECT * FROM roadmap_milestones WHERE id=?').get(req.params.id) }) })
app.get('/api/dashboard', (_req, res) => { const systems = db.prepare('SELECT COUNT(*) AS total FROM ai_systems').get().total; const risks = db.prepare('SELECT COUNT(*) AS total,SUM(score>=7) AS high FROM risk_assessments').get(); const escalations = db.prepare("SELECT COUNT(*) AS total FROM escalations WHERE status!='Resolved'").get().total; const roadmap = db.prepare('SELECT SUM(completed) AS completed,COUNT(*) AS total FROM roadmap_milestones').get(); res.json({ data: { systems, openRiskFindings: risks.high || 0, riskAssessments: risks.total, openEscalations: escalations, roadmapProgress: roadmap.total ? Math.round((roadmap.completed / roadmap.total) * 100) : 0 } }) })
app.get('/api/kpis', (_req, res) => { const dashboard = db.prepare('SELECT COUNT(*) AS systems FROM ai_systems').get(); const risk = db.prepare("SELECT COUNT(*) AS total,SUM(status='Acceptable') AS acceptable FROM risk_assessments").get(); const roles = db.prepare('SELECT COUNT(*) AS total FROM rai_roles').get(); const milestones = db.prepare('SELECT SUM(completed) AS completed,COUNT(*) AS total FROM roadmap_milestones').get(); res.json({ data: { inventoryCoverage: dashboard.systems ? 100 : 0, assessmentsComplete: risk.total ? Math.round((risk.acceptable / risk.total) * 100) : 0, ownerAccountability: roles.total ? 100 : 0, roadmapProgress: milestones.total ? Math.round((milestones.completed / milestones.total) * 100) : 0 } }) })
app.get('/api/exports/kpi.csv', (_req, res) => { const rows = db.prepare('SELECT category AS KPI,COUNT(*) AS Value FROM risk_assessments GROUP BY category').all(); res.type('text/csv').send(['KPI,Value', ...rows.map((row) => `${row.KPI},${row.Value}`)].join('\n')) })
app.use((error, _req, res, _next) => res.status(error.status || (error.code === 'SQLITE_CONSTRAINT_UNIQUE' ? 409 : 500)).json({ error: { message: error.status && error.status < 500 ? error.message : 'Internal server error' } }))

app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: { message: 'Route not found' } })
  if (existsSync(resolve(distPath, 'index.html'))) return res.sendFile(resolve(distPath, 'index.html'))
  return res.status(404).json({ error: { message: 'Route not found' } })
})

if (process.env.NODE_ENV !== 'test') app.listen(process.env.PORT || 4000, () => console.log(`NorthBridge API listening on http://localhost:${process.env.PORT || 4000}`))
