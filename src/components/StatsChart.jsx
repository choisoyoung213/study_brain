import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

const COLORS = ['#7C83FD', '#96BAFF', '#F6A6FF', '#FFD97C', '#A3F7BF']

export default function StatsChart({ records }) {
  const byDate = useMemo(() => {
    const map = {}
    records.forEach((r) => {
      map[r.date] = (map[r.date] || 0) + r.time
    })
    return Object.keys(map)
      .sort()
      .map((d) => ({ date: d, time: map[d] }))
  }, [records])

  const bySubject = useMemo(() => {
    const map = {}
    records.forEach((r) => {
      map[r.subject] = (map[r.subject] || 0) + r.time
    })
    return Object.keys(map).map((k) => ({ name: k, value: map[k] }))
  }, [records])

  return (
    <div className="stats-grid">
      <section className="chart-card">
        <h3>날짜별 공부 시간</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={byDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="time" stroke="#7C83FD" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-card">
        <h3>과목별 비율</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={bySubject} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
              {bySubject.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}
