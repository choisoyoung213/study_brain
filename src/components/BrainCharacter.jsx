import React from 'react'
import { getLevelFromExp } from '../data/brainLevels'

export default function BrainCharacter({ exp }) {
  const lvl = getLevelFromExp(exp)
  return (
    <div className="brain-card">
      <div className="brain-emoji">{lvl.emoji}</div>
      <div className="brain-info">
        <div className="level">{lvl.label}</div>
        <div className="exp">{exp} exp</div>
      </div>
    </div>
  )
}
