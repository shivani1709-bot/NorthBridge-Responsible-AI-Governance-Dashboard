export const navGroups = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
      { id: 'inventory', label: 'AI Inventory', icon: 'database', badge: '24' },
      { id: 'risk', label: 'RAI Risk Assessment', icon: 'shield' },
    ],
  },
  {
    label: 'Governance',
    items: [
      { id: 'vetting', label: 'AI Vetting', icon: 'check' },
      { id: 'roles', label: 'RAI Roles', icon: 'users' },
      { id: 'escalation', label: 'Escalation Center', icon: 'alert', badge: '3', alert: true },
    ],
  },
  {
    label: 'Performance',
    items: [
      { id: 'kpi', label: 'KPI Dashboard', icon: 'chart' },
      { id: 'roadmap', label: '12-Month Roadmap', icon: 'calendar' },
    ],
  },
]

export const stats = [
  { label: 'AI systems governed', value: '24', change: '+3 this quarter', tone: 'blue', icon: 'database' },
  { label: 'Open risk findings', value: '07', change: '2 high priority', tone: 'amber', icon: 'alert' },
  { label: 'Policy compliance', value: '94.2%', change: '+4.8% vs. last month', tone: 'green', icon: 'shield' },
  { label: 'Reviews due this month', value: '05', change: 'Next due in 3 days', tone: 'purple', icon: 'calendar' },
]

export const systems = [
  { name: 'Credit Decision Engine', owner: 'Lending & Credit', tier: 'High', status: 'In production', review: '18 Sep 2026', risk: 'High', initials: 'CD', color: 'navy' },
  { name: 'ClientAssist Chatbot', owner: 'Client Experience', tier: 'Limited', status: 'In production', review: '04 Oct 2026', risk: 'Medium', initials: 'CA', color: 'teal' },
  { name: 'Fraud Signal Monitor', owner: 'Financial Crime', tier: 'High', status: 'Pilot', review: '22 Sep 2026', risk: 'High', initials: 'FS', color: 'purple' },
  { name: 'Market Insights Copilot', owner: 'Research', tier: 'Minimal', status: 'In development', review: '12 Nov 2026', risk: 'Low', initials: 'MI', color: 'orange' },
  { name: 'Document Intelligence', owner: 'Operations', tier: 'Limited', status: 'In production', review: '30 Oct 2026', risk: 'Medium', initials: 'DI', color: 'blue' },
]

export const activities = [
  { title: 'New risk assessment submitted', detail: 'Credit Decision Engine · Maya Patel', time: '18 min ago', type: 'risk' },
  { title: 'Vetting approval recorded', detail: 'ClientAssist Chatbot · Jordan Lee', time: '2 hrs ago', type: 'approved' },
  { title: 'Policy exception escalated', detail: 'Fraud Signal Monitor · Priya Shah', time: 'Yesterday', type: 'alert' },
  { title: 'System added to inventory', detail: 'Market Insights Copilot · Alex Chen', time: 'Yesterday', type: 'system' },
]

export const kpis = [
  { label: 'Inventory coverage', value: '100%', target: '100%', progress: 100, trend: 'On target', tone: 'green' },
  { label: 'High-risk assessments complete', value: '87%', target: '90%', progress: 87, trend: '3% behind', tone: 'amber' },
  { label: 'Owner accountability', value: '96%', target: '95%', progress: 96, trend: 'Above target', tone: 'green' },
  { label: 'Open findings resolved', value: '78%', target: '85%', progress: 78, trend: '7% behind', tone: 'red' },
]

export const roadmap = [
  { q: 'Q1', month: 'Months 1–3', title: 'Establish the foundation', status: 'Complete', items: ['Stand up RAI steering committee', 'Publish responsible AI principles', 'Complete initial inventory'] },
  { q: 'Q2', month: 'Months 4–6', title: 'Assess & prioritize', status: 'In progress', items: ['Risk-tier all AI systems', 'Launch model card standard', 'Train first-line owners'] },
  { q: 'Q3', month: 'Months 7–9', title: 'Operationalize controls', status: 'Upcoming', items: ['Deploy monitoring dashboards', 'Embed vendor vetting workflow', 'Run tabletop exercise'] },
  { q: 'Q4', month: 'Months 10–12', title: 'Measure & mature', status: 'Upcoming', items: ['Board reporting cadence', 'Independent effectiveness review', '2027 program planning'] },
]

export const roles = [
  { name: 'Elena Rodriguez', role: 'Chief Risk Officer', area: 'Executive sponsor', systems: 'All systems', status: 'Active', initials: 'ER', color: 'navy' },
  { name: 'Marcus Thompson', role: 'RAI Program Lead', area: 'Governance & policy', systems: 'All systems', status: 'Active', initials: 'MT', color: 'teal' },
  { name: 'Maya Patel', role: 'Model Owner', area: 'Lending & Credit', systems: '4 systems', status: 'Active', initials: 'MP', color: 'purple' },
  { name: 'Jordan Lee', role: 'Independent Reviewer', area: 'Model risk', systems: '8 systems', status: 'Active', initials: 'JL', color: 'orange' },
]
