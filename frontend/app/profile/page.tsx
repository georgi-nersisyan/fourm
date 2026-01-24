"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Назад на главную
          </Link>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-300">
              {user.avatar && user.avatar !== 'default.png' ? (
                <Image
                  src={`http://localhost:5000/uploads/${user.avatar}`}
                  alt={`Аватар ${user.username}`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                  {user.username[0].toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{user.username}</h1>
              <p className="text-gray-400">На сайте с {user.created_at ? formatDate(user.created_at) : 'неизвестно'}</p>
              {user.email && (
                <p className="text-gray-300 mt-2">Email: {user.email}</p>
              )}
              {user.bio && (
                <p className="text-gray-300 mt-2 whitespace-pre-wrap">{user.bio}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link 
              href="/profile/settings"
              className="w-full p-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
            >
              ⚙️ Настройки профиля
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🚪 Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
