import React from 'react';

export const StatCard = ({ label, value, sub, badgeText, badgeColor = 'green' }) => (
  <div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
    {badgeText && <span className={`stat-badge badge-${badgeColor}`}>{badgeText}</span>}
  </div>
);

export const Badge = ({ text, color = 'green' }) => (
  <span className={`stat-badge badge-${color}`}>{text}</span>
);

export const ProgBar = ({ percent, colorClass = '' }) => (
  <div className="prog-bar">
    <div className={`prog-fill ${colorClass}`} style={{ width: `${percent}%` }}></div>
  </div>
);

export const AlertBox = ({ type = 'info', icon, title, message, time }) => (
  <div className={`alert alert-${type}`}>
    {icon && <div className={`notif-icon ${type === 'danger' ? 'red' : type === 'warning' ? 'amber' : 'green'}`} style={{ marginRight: time ? '0' : '12px' }}>{icon}</div>}
    {time ? (
      <div>
        <div className="notif-text">{title || message}</div>
        <div className="notif-time">{time}</div>
      </div>
    ) : (
      <div>
        {title && <strong>{title} </strong>}
        {message}
      </div>
    )}
  </div>
);

export const TimelineItem = ({ dotColor = '', title, meta, icon }) => (
  <div className="tl-item">
    <div className={`tl-dot ${dotColor}`}>{icon}</div>
    <div className="tl-title">{title}</div>
    <div className="tl-meta">{meta}</div>
  </div>
);
