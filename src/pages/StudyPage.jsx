import React from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import StudyForm from '../components/StudyForm'
import StudyList from '../components/StudyList'
import { getLevelFromExp } from '../data/brainLevels'

export default function StudyPage() {
  const [records, setRecords, clearRecords] = useLocalStorage('studyRecords', [])
  const [brain, setBrain, clearBrain] = useLocalStorage('brainData', { level: 1, exp: 0 })

  function saveRecord({ subject, content, time }) {
    const date = new Date().toISOString().slice(0, 10)
    const id = Date.now()
    const rec = { id, subject, content, time, date }
    setRecords((prev) => [...prev, rec])

    // add exp
    const newExp = (brain.exp || 0) + time
    const newLevel = getLevelFromExp(newExp)
    setBrain((prev) => ({ ...prev, exp: newExp, level: newLevel.level }))

    // level up alert
    if (newLevel.level > (brain.level || 1)) {
      setTimeout(() => alert(`레벨업! ${newLevel.label} ${newLevel.emoji}`), 200)
    }
  }

  function handleDelete(id) {
    if (!confirm('삭제하시겠습니까?')) return
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  function handleReset() {
    if (!confirm('모든 데이터를 초기화합니다. 계속할까요?')) return
    clearRecords()
    clearBrain()
  }

  return (
    <div className="page study">
      <section className="card">
        <h2>공부 기록하기</h2>
        <StudyForm onSave={saveRecord} />
      </section>

      <section className="card">
        <h2>기록 목록</h2>
        <StudyList records={records} onDelete={handleDelete} />
        <div className="actions-row">
          <button className="btn ghost" onClick={handleReset}>데이터 초기화</button>
        </div>
      </section>
    </div>
  )
}
