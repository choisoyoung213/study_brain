import React from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import StatsChart from '../components/StatsChart'
import ReviewList from '../components/ReviewList'

export default function StatsPage() {
  const [records] = useLocalStorage('studyRecords', [])

  return (
    <div className="page stats">
      <section className="card">
        <h2>통계 / 복습</h2>
        <StatsChart records={records} />
      </section>

      <section className="card">
        <ReviewList records={records} />
      </section>
    </div>
  )
}
