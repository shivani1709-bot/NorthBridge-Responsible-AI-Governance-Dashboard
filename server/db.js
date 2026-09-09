import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const filename = process.env.DB_PATH || resolve(process.cwd(), 'data/northbridge.sqlite')
mkdirSync(dirname(filename), { recursive: true })
export const db = new DatabaseSync(filename)
db.exec(`
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS ai_systems (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL UNIQUE,owner TEXT NOT NULL,risk TEXT NOT NULL,status TEXT NOT NULL,review TEXT NOT NULL,initials TEXT NOT NULL,color TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP,updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS risk_assessments (id INTEGER PRIMARY KEY AUTOINCREMENT,ai_system_id INTEGER,name TEXT NOT NULL,category TEXT NOT NULL,score REAL NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,findings TEXT DEFAULT '',created_at TEXT DEFAULT CURRENT_TIMESTAMP,updated_at TEXT DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(ai_system_id) REFERENCES ai_systems(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS vetting_requests (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,type TEXT NOT NULL,submitted TEXT NOT NULL,decision TEXT NOT NULL DEFAULT 'Pending review',due TEXT NOT NULL,decision_at TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP,updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS rai_roles (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,role TEXT NOT NULL,area TEXT NOT NULL,systems TEXT DEFAULT '1 system',status TEXT DEFAULT 'Active',initials TEXT NOT NULL,color TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS escalations (id INTEGER PRIMARY KEY AUTOINCREMENT,reference TEXT NOT NULL UNIQUE,system TEXT NOT NULL,summary TEXT NOT NULL,severity TEXT NOT NULL,due TEXT NOT NULL,owner TEXT NOT NULL,status TEXT DEFAULT 'Open',resolution TEXT DEFAULT '',created_at TEXT DEFAULT CURRENT_TIMESTAMP,resolved_at TEXT);
CREATE TABLE IF NOT EXISTS roadmap_milestones (id INTEGER PRIMARY KEY AUTOINCREMENT,quarter TEXT NOT NULL,month TEXT NOT NULL,title TEXT NOT NULL,milestone TEXT NOT NULL,completed INTEGER DEFAULT 0,position INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS audit_events (id INTEGER PRIMARY KEY AUTOINCREMENT,entity TEXT NOT NULL,entity_id TEXT NOT NULL,action TEXT NOT NULL,details TEXT DEFAULT '{}',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`)

export function audit(entity, entityId, action, details = {}) {
  db.prepare('INSERT INTO audit_events (entity,entity_id,action,details) VALUES (?,?,?,?)').run(entity, String(entityId), action, JSON.stringify(details))
}

const initials = (name) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
if (db.prepare('SELECT COUNT(*) AS count FROM ai_systems').get().count === 0) {
  const insert = db.prepare('INSERT INTO ai_systems (name,owner,risk,status,review,initials,color) VALUES (?,?,?,?,?,?,?)')
  ;[['Credit Decision Engine','Lending & Credit','High','In production','18 Sep 2026','CD','navy'],['ClientAssist Chatbot','Client Experience','Medium','In production','04 Oct 2026','CA','teal'],['Fraud Signal Monitor','Financial Crime','High','Pilot','22 Sep 2026','FS','purple'],['Market Insights Copilot','Research','Low','In development','12 Nov 2026','MI','orange'],['Document Intelligence','Operations','Medium','In production','30 Oct 2026','DI','blue']].forEach((row) => insert.run(...row))
  const systems = Object.fromEntries(db.prepare('SELECT id,name FROM ai_systems').all().map((row) => [row.name, row.id]))
  const risk = db.prepare('INSERT INTO risk_assessments (ai_system_id,name,category,score,status,owner) VALUES (?,?,?,?,?,?)')
  ;[[systems['Credit Decision Engine'],'Credit Decision Engine','Fairness & bias',7.8,'Needs mitigation','Maya Patel'],[systems['Fraud Signal Monitor'],'Fraud Signal Monitor','Explainability',6.4,'In review','Daniel Wu'],[systems['ClientAssist Chatbot'],'ClientAssist Chatbot','Privacy',3.1,'Acceptable','Jordan Lee']].forEach((row) => risk.run(...row))
  const role = db.prepare('INSERT INTO rai_roles (name,role,area,systems,status,initials,color) VALUES (?,?,?,?,?,?,?)')
  ;[['Elena Rodriguez','Chief Risk Officer','Executive sponsor','All systems','Active','ER','navy'],['Marcus Thompson','RAI Program Lead','Governance & policy','All systems','Active','MT','teal'],['Maya Patel','Model Owner','Lending & Credit','4 systems','Active','MP','purple'],['Jordan Lee','Independent Reviewer','Model risk','8 systems','Active','JL','orange']].forEach((row) => role.run(...row))
  const escalation = db.prepare('INSERT INTO escalations (reference,system,summary,severity,due,owner) VALUES (?,?,?,?,?,?)')
  ;[['EXC-1042','Credit Decision Engine','Potential disparate impact in approval outcomes','High','Due today','Maya Patel'],['EXC-1041','Fraud Signal Monitor','Data retention period exceeds policy threshold','Medium','Due in 4 days','Daniel Wu'],['EXC-1038','ClientAssist Chatbot','Third-party model card documentation incomplete','Low','Due in 9 days','Jordan Lee']].forEach((row) => escalation.run(...row))
  const milestones = [['Q1','Months 1–3','Establish the foundation','Stand up RAI steering committee',1,0],['Q1','Months 1–3','Establish the foundation','Publish responsible AI principles',1,1],['Q1','Months 1–3','Establish the foundation','Complete initial inventory',1,2],['Q2','Months 4–6','Assess & prioritize','Risk-tier all AI systems',0,0],['Q2','Months 4–6','Assess & prioritize','Launch model card standard',0,1],['Q2','Months 4–6','Assess & prioritize','Train first-line owners',0,2],['Q3','Months 7–9','Operationalize controls','Deploy monitoring dashboards',0,0],['Q3','Months 7–9','Operationalize controls','Embed vendor vetting workflow',0,1],['Q3','Months 7–9','Operationalize controls','Run tabletop exercise',0,2],['Q4','Months 10–12','Measure & mature','Board reporting cadence',0,0],['Q4','Months 10–12','Measure & mature','Independent effectiveness review',0,1],['Q4','Months 10–12','Measure & mature','2027 program planning',0,2]]
  const milestone = db.prepare('INSERT INTO roadmap_milestones (quarter,month,title,milestone,completed,position) VALUES (?,?,?,?,?,?)')
  milestones.forEach((row) => milestone.run(...row))
}

export { initials }
