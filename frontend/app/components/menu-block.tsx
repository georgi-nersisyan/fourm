'use client'
import React from 'react'
import { menuItems } from './menu-items'
import Nav from './nav'

export default function MenuBlock() {
  return (
    <aside className='fixed top-24 w-72 h-screen p-2 bg-header'>
      <Nav MenuItems={menuItems} />
    </aside>
  )
}