import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <h1 className="brand">공부했뇌?</h1>
        <nav>
          <NavLink to="/" end className={({isActive}) => isActive? 'active':''}>홈</NavLink>
          <NavLink to="/record" className={({isActive}) => isActive? 'active':''}>공부기록</NavLink>
          <NavLink to="/stats" className={({isActive}) => isActive? 'active':''}>통계/복습</NavLink>
        </nav>
      </div>
    </header>
  )
}
