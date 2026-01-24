"use client";

import { useEffect, useState } from "react";
import { IChatRoom } from "../components/post-items";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";

export default function ChatListPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<IChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/chat/rooms', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Ошибка загрузки чатов');
        }
        
        const data = await response.json();
        setRooms(data.rooms || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        console.error('Ошибка загрузки чатов:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRooms();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-400 text-xl">
            Необходимо войти в систему для просмотра чатов
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white text-xl">Загрузка чатов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Назад на главную
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-8">💬 Мои чаты</h1>

        {rooms.length > 0 ? (
          <div className="space-y-4">
            {rooms.map((room) => (
              <Link
                key={room.room_id}
                href={`/chat/${room.other_user.id}`}
                className="block p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                    {room.other_user.avatar && room.other_user.avatar !== 'default.png' ? (
                      <Image 
                        src={`http://localhost:5000/uploads/${room.other_user.avatar}`} 
                        alt={`Аватар ${room.other_user.username}`} 
                        width={48} 
                        height={48} 
                        className="object-cover w-full h-full" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {room.other_user.username[0].toUpperCase()}
                      </div>
                    )}
                    {room.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {room.unread_count > 9 ? '9+' : room.unread_count}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {room.other_user.username}
                      </h3>
                      <span className="text-sm text-gray-400">
                        {formatDate(room.last_message.created_at)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${
                      room.unread_count > 0 ? 'text-white' : 'text-gray-400'
                    }`}>
                      {room.last_message.is_from_me ? 'Вы: ' : ''}
                      {room.last_message.content || 'Нет сообщений'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 text-xl">
            У вас пока нет чатов. Начните общение с другими пользователями!
          </div>
        )}
      </div>
    </div>
  );
}
