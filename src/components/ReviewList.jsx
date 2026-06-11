import React from 'react'

export default function ReviewList({ records }) {
  const sorted = records.slice().sort((a, b) => new Date(a.date) - new Date(b.date))
  return (
    <div className="review-list">
      <h3>이전 학습 기록 (오래된 순)</h3>
      <ul>
        {sorted.map((r) => (
          <li key={r.id}>
            <strong>{r.subject}</strong> — {r.content} <small>({r.date} · {r.time}분)</small>
          </li>
        ))}
      </ul>
    </div>
  )
}
