"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { IChatMessage } from "../../components/post-items";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";

interface ChatUser {
  id: number;
  username: string;
  avatar: string;
}

export default function ChatPage() {
  const params = useParams();
  const { user } = useAuth();
  const otherUserId = Number(params?.id);
  
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        
        // Получаем информацию о пользователе
        const userResponse = await fetch(`http://localhost:5000/users/${otherUserId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setOtherUser(userData);
        }
        
        // Получаем сообщения
        const messagesResponse = await fetch(`http://localhost:5000/chat/messages/${otherUserId}`, {
          credentials: 'include'
        });
        
        if (!messagesResponse.ok) {
          throw new Error('Ошибка загрузки сообщений');
        }
        
        const data = await messagesResponse.json();
        setMessages(data.messages || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        console.error('Ошибка загрузки чата:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && otherUserId) {
      fetchChat();
    }
  }, [user, otherUserId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch('http://localhost:5000/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          receiver_id: otherUserId,
          content: newMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data]);
        setNewMessage('');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Ошибка отправки сообщения');
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      alert('Ошибка отправки сообщения');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
        <div className="text-white text-xl">Загрузка чата...</div>
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
    <div className="min-h-screen flex flex-col">
      {/* Заголовок чата */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link 
              href="/chat"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Назад к чатам
            </Link>
            
            {otherUser && (
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                  {otherUser.avatar && otherUser.avatar !== 'default.png' ? (
                    <Image 
                      src={`http://localhost:5000/uploads/${otherUser.avatar}`} 
                      alt={`Аватар ${otherUser.username}`} 
                      width={40} 
                      height={40} 
                      className="object-cover w-full h-full" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                      {otherUser.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">{otherUser.username}</h1>
                  <p className="text-sm text-gray-400">Онлайн</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {messages.map((message) => {
              const isMyMessage = message.sender_id === user.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isMyMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isMyMessage ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Форма отправки сообщения */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите сообщение..."
              className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              rows={1}
              maxLength={1000}
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
          <div className="text-right text-sm text-gray-400 mt-2">
            {newMessage.length}/1000
          </div>
        </div>
      </div>
    </div>
  );
}
