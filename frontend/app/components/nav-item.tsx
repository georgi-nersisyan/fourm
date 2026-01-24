import Link from 'next/link'
<<<<<<< HEAD
import React, { useEffect, useState } from 'react'
import { MenuItem } from './menu-items'
import { useAuth } from '../contexts/AuthContext'
=======
import React from 'react'
import { MenuItem } from './menu-items'
>>>>>>> 3879534 (extend profile and add validation)

interface NavItemProps {
    menuItem: MenuItem
}

export default function NavItem({menuItem}:NavItemProps) {
<<<<<<< HEAD
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user && menuItem.slug === '/chat') {
        try {
          const response = await fetch('http://localhost:5000/chat/unread-count', {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            setUnreadCount(data.unread_count);
          }
        } catch (error) {
          console.error('Ошибка загрузки непрочитанных сообщений:', error);
        }
      }
    };

    fetchUnreadCount();
    // Обновляем каждые 30 секунд
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, menuItem.slug]);

  return (
    <li>
      <Link href={menuItem.slug} className='text-lg flex gap-2 items-center transition-colors hover:text-link relative'>
        {menuItem.title}
        {menuItem.icon}
        {menuItem.slug === '/chat' && unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
=======
  return (
    <li>
      <Link href={menuItem.slug} className='text-lg flex gap-2 items-center transition-colors hover:text-link'>
        {menuItem.title}
        {menuItem.icon}
>>>>>>> 3879534 (extend profile and add validation)
      </Link>
    </li>
  )
}
