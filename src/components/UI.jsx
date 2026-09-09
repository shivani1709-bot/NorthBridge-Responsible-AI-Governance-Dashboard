import React from 'react'
import Icon from './Icon'

export function Badge({ children, tone = 'neutral' }) { return <span className={`status-badge ${tone}`}>{children}</span> }

export function SectionHeader({ eyebrow, title, description, action, onAction }) {
  return <div className="section-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <button className="button button-secondary" onClick={onAction}>{action}<Icon name="arrow" size={15} /></button>}</div>
}

export function StatCard({ stat }) {
  return <div className="stat-card"><div className={`stat-icon ${stat.tone}`}><Icon name={stat.icon} size={20} /></div><div className="stat-copy"><span>{stat.label}</span><strong>{stat.value}</strong><small className={stat.tone === 'amber' ? 'warning' : ''}>{stat.change}</small></div><div className="stat-spark"><span /><span /><span /><span /><span /></div></div>
}

export function EmptyState({ title, description }) { return <div className="empty-state" role="status"><div className="empty-mark"><Icon name="database" size={22} /></div><strong>{title}</strong><p>{description}</p></div> }

export function Feedback({ message, tone = 'success', onDismiss }) {
  if (!message) return null
  return <div className={`inline-notice ${tone}`} role="status"><Icon name={tone === 'error' ? 'alert' : 'check'} size={16} />{message}<button aria-label="Dismiss message" onClick={onDismiss}>×</button></div>
}

export function Modal({ title, children, onClose }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><h2 id="modal-title">{title}</h2><button aria-label="Close dialog" onClick={onClose}>×</button></div>{children}</section></div>
}
