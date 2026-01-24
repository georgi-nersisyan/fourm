import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { MenuItem } from './menu-items'
import { useAuth } from '../contexts/AuthContext'

interface NavItemProps {
    menuItem: MenuItem
}

export default function NavItem({menuItem}:NavItemProps) {
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
      </Link>
    </li>
  )
}
