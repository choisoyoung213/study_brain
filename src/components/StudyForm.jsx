import React, { useState } from 'react'

export default function StudyForm({ onSave }) {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [time, setTime] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const t = Number(time)
    if (!subject.trim() || !content.trim()) return alert('빈 값은 저장할 수 없습니다.')
    if (!time) return alert('시간을 입력해주세요')
    if (Number.isNaN(t) || t <= 0) return alert('공부 시간은 양수 숫자여야 합니다.')

    onSave({ subject: subject.trim(), content: content.trim(), time: t })
    setSubject('')
    setContent('')
    setTime('')
  }

  return (
    <form className="study-form" onSubmit={handleSubmit}>
      <label>
        과목
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="예: 수학" />
      </label>
      <label>
        공부 내용
        <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="예: 삼각함수 정리" />
      </label>
      <label>
        공부 시간(분)
        <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="예: 30" />
      </label>
      <button className="btn" type="submit">저장</button>
    </form>
  )
}
