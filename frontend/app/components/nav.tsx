import React from 'react'
import { MenuItem } from './menu-items'
import NavItem from './nav-item'

interface MenuItemsProps {
    MenuItems: MenuItem[]
}

export default function Nav({MenuItems}:MenuItemsProps) {
  return (
    <nav>
        <ul className='flex gap-6 justify-center items-center'>
             {
                MenuItems.map((item) => {
                    return <NavItem key={'menu-item-'+item.id} menuItem={item} />
                })
             }
        </ul>
    </nav>
  )
}
