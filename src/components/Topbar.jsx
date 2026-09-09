import React from 'react'
import Icon from './Icon'

export default function Topbar({ title, onMenu, onNotice }) {
  return <header className="topbar">
    <button className="menu-button" onClick={onMenu} aria-label="Open navigation"><Icon name="menu" /></button>
    <div className="breadcrumbs"><span>RAI Office</span><Icon name="chevron" size={13} /><strong>{title}</strong></div>
    <div className="topbar-actions">
      <button className="icon-button search-btn" aria-label="Search" title="Global search is available within each page" onClick={() => onNotice('Use the page search and filters to find governance records.') }><Icon name="search" size={18} /></button>
      <button className="icon-button notification-btn" aria-label="Notifications" title="View notifications" onClick={() => onNotice('You have 3 open escalations requiring attention.') }><Icon name="bell" size={18} /><i /></button>
      <div className="topbar-date"><span>Reporting period</span><strong>Q3 2026</strong></div>
    </div>
  </header>
}
