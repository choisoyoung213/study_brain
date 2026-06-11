import React, { useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import BrainCharacter from '../components/BrainCharacter'
import ExpBar from '../components/ExpBar'

const QUOTES = [
  '작은 진전도 축하하세요.',
  '한 걸음씩, 오늘도 한뇌.',
  '계속하는 것이 재능이다.',
  '집중은 최고의 투자입니다.'
]

export default function Home() {
  const [records] = useLocalStorage('studyRecords', [])
  const [brain] = useLocalStorage('brainData', { level: 1, exp: 0 })

  const today = useMemo(() => {
    const t = new Date().toISOString().slice(0, 10)
    return records.filter((r) => r.date === t).reduce((s, r) => s + r.time, 0)
  }, [records])

  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)]

  return (
    <div className="page home">
      <section className="card">
        <BrainCharacter exp={brain.exp} />
        <ExpBar exp={brain.exp} />
        <div className="today">오늘 공부 시간: <strong>{today}분</strong></div>
        <div className="motiv">{quote}</div>
      </section>
      <section className="card actions">
        <a className="btn" href="/record">공부 기록하러 가기</a>
      </section>
    </div>
  )
}
