import Link from 'next/link'
import React from 'react'
import { MenuItem } from './menu-items'

interface NavItemProps {
    menuItem: MenuItem
}

export default function NavItem({menuItem}:NavItemProps) {
  return (
    <li>
      <Link href={menuItem.slug} className='text-lg flex gap-2 items-center transition-colors hover:text-link'>
        {menuItem.title}
        {menuItem.icon}
      </Link>
    </li>
  )
}
