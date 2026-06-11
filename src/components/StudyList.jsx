import React from 'react'

export default function StudyList({ records, onDelete }) {
  if (!records || records.length === 0) return <div className="empty">기록이 없습니다.</div>

  return (
    <ul className="study-list">
      {records.slice().reverse().map((r) => (
        <li key={r.id} className="record">
          <div className="meta">
            <strong>{r.subject}</strong>
            <span className="time">{r.time}분</span>
          </div>
          <div className="content">{r.content}</div>
          <div className="footer">
            <small>{r.date}</small>
            <button className="link" onClick={() => onDelete(r.id)}>삭제</button>
          </div>
        </li>
      ))}
    </ul>
  )
}
