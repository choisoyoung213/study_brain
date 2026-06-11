import React from 'react'
import { getLevelFromExp, LEVELS } from '../data/brainLevels'

export default function ExpBar({ exp }) {
  const level = getLevelFromExp(exp)
  // find next threshold
  const currentIndex = LEVELS.findIndex((l) => l.level === level.level)
  const nextThreshold = LEVELS[currentIndex + 1]
  const next = nextThreshold ? nextThreshold.threshold : level.threshold + 500
  const base = level.threshold
  const percent = Math.min(100, Math.round(((exp - base) / (next - base)) * 100))

  return (
    <div className="expbar">
      <div className="expbar-info">
        <span>{level.label}</span>
        <span>{exp} / {next} exp</span>
      </div>
      <div className="bar">
        <div className="filled" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
