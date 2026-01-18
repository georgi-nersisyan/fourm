"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Posts from "@/app/components/posts";
import { IPost, IUserStats } from "@/app/components/post-items";

interface PublicUser {
  id: number;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  created_at: string;
}

export default function PublicUserPage() {
  const params = useParams();
  const userId = Number(params?.id);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [stats, setStats] = useState<IUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [u, p, s] = await Promise.all([
          fetch(`http://localhost:5000/users/${userId}`).then(r => r.json()),
          fetch(`http://localhost:5000/posts?user_id=${userId}`, { credentials: 'include' }).then(r => r.json()),
          fetch(`http://localhost:5000/users/${userId}/stats`).then(r => r.json())
        ]);
        setUser(u);
        setPosts(p.posts || []);
        setStats(s);
      } catch (e) {
        setError('Ошибка загрузки профиля');
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
  }, [userId]);

  if (loading) return <div className="p-6">Загрузка...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!user) return <div className="p-6">Пользователь не найден</div>;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Назад на главную
          </Link>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-300">
              {user.avatar && user.avatar !== 'default_avatar.png' ? (
                <Image src={`http://localhost:5000/uploads/${user.avatar}`} alt={`Аватар ${user.username}`} width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                  {user.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{user.username}</h1>
              <p className="text-gray-400">На сайте с {formatDate(user.created_at)}</p>
              {user.bio && <p className="text-gray-300 mt-2 whitespace-pre-wrap">{user.bio}</p>}
            </div>
          </div>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Статистика</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.posts_count}</div>
                <div className="text-gray-400 text-sm">Постов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.questions_count}</div>
                <div className="text-gray-400 text-sm">Вопросов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.comments_count}</div>
                <div className="text-gray-400 text-sm">Комментариев</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${stats.reputation >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.reputation >= 0 ? '+' : ''}{stats.reputation}
                </div>
                <div className="text-gray-400 text-sm">Репутация</div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl text-white font-semibold mb-4">Посты пользователя</h2>
          {posts.length ? <Posts postsItems={posts} /> : <div className="text-gray-400">Нет постов</div>}
        </div>
      </div>
    </div>
  );
}

