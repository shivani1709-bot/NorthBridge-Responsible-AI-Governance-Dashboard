import React from 'react'
import Icon from './Icon'
import { navGroups } from '../data/mockData'

export default function Sidebar({ activePage, onNavigate, open, onClose, onNotice }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><span>N</span><i /></div>
        <div><strong>NorthBridge</strong><small>Responsible AI Office</small></div>
        <button className="mobile-close" onClick={onClose} aria-label="Close menu">×</button>
      </div>
      <div className="workspace-switcher">
        <div className="workspace-avatar">NB</div>
        <div><span>Workspace</span><strong>Enterprise Governance</strong></div>
        <Icon name="chevron" size={14} />
      </div>
      <nav>
        {navGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <p>{group.label}</p>
            {group.items.map((item) => (
              <button className={`nav-item ${activePage === item.id ? 'active' : ''}`} key={item.id} onClick={() => { onNavigate(item.id); onClose?.() }}>
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
                {item.badge && <em className={item.alert ? 'badge-alert' : ''}>{item.badge}</em>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="help-card" onClick={() => onNotice('The RAI playbook is represented by this educational prototype.') }><div className="help-icon">?</div><div><strong>Need help?</strong><span>Visit the RAI playbook</span></div><Icon name="arrow" size={15} /></button>
        <div className="user-profile"><div className="avatar">SC</div><div><strong>Sarah Chen</strong><span>Program administrator</span></div><button aria-label="User options" onClick={() => onNotice('User settings are not connected in this mock application.')}>•••</button></div>
      </div>
    </aside>
  )
}
