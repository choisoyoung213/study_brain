export const LEVELS = [
  { level: 1, threshold: 0, emoji: '🧠', label: 'Lv1' },
  { level: 2, threshold: 100, emoji: '🧠✨', label: 'Lv2' },
  { level: 3, threshold: 300, emoji: '🧠⚡', label: 'Lv3' },
  { level: 4, threshold: 600, emoji: '🧠🚀', label: 'Lv4' },
  { level: 5, threshold: 1000, emoji: '🧠👑', label: 'Lv5' }
]

export function getLevelFromExp(exp) {
  let current = LEVELS[0]
  for (let i = 0; i < LEVELS.length; i++) {
    if (exp >= LEVELS[i].threshold) current = LEVELS[i]
    else break
  }
  return current
}

export function getNextThreshold(exp) {
  for (let i = 0; i < LEVELS.length; i++) {
    if (exp < LEVELS[i].threshold) return LEVELS[i].threshold
  }
  // beyond last
  return LEVELS[LEVELS.length - 1].threshold + 500
}
