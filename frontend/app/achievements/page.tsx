"use client";

import { useEffect, useState } from "react";
import { IAchievement } from "../components/post-items";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";

export default function AchievementsPage() {
  const { user } = useAuth();
  const [allAchievements, setAllAchievements] = useState<IAchievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<IAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const [allResponse, userResponse] = await Promise.all([
          fetch('http://localhost:5000/achievements'),
          user ? fetch(`http://localhost:5000/users/${user.id}/achievements`) : Promise.resolve({ json: () => ({ achievements: [] }) })
        ]);
        
        const allData = await allResponse.json();
        const userData = await userResponse.json();
        
        setAllAchievements(allData.achievements || []);
        setUserAchievements(userData.achievements || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        console.error('Ошибка загрузки достижений:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const isAchievementEarned = (achievementId: number) => {
    return userAchievements.some(ua => ua.id === achievementId);
  };

  const getEarnedDate = (achievementId: number) => {
    const userAchievement = userAchievements.find(ua => ua.id === achievementId);
    return userAchievement?.earned_at;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white text-xl">Загрузка достижений...</div>
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Назад на главную
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-8">🏆 Достижения</h1>

        {user && (
          <div className="mb-8 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">Ваш прогресс</h2>
            <p className="text-gray-300">
              Получено достижений: {userAchievements.length} из {allAchievements.length}
            </p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(userAchievements.length / allAchievements.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allAchievements.map((achievement) => {
            const earned = isAchievementEarned(achievement.id);
            const earnedDate = getEarnedDate(achievement.id);
            
            return (
              <div 
                key={achievement.id} 
                className={`p-6 rounded-lg border transition-all duration-300 ${
                  earned 
                    ? 'bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-600 shadow-lg shadow-yellow-900/20' 
                    : 'bg-gray-800 border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-4xl ${earned ? 'animate-pulse' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-2 ${
                      earned ? 'text-yellow-300' : 'text-gray-300'
                    }`}>
                      {achievement.name}
                    </h3>
                    <p className="text-gray-400 mb-3 text-sm">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Условие: {achievement.condition_value} {achievement.condition_type}
                      </span>
                      {earned && earnedDate && (
                        <span className="text-xs text-yellow-400">
                          Получено {formatDate(earnedDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {earned && (
                  <div className="mt-4 pt-3 border-t border-yellow-600/30">
                    <div className="flex items-center gap-2 text-yellow-300 text-sm">
                      <span>🏆</span>
                      <span>Достижение получено!</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {allAchievements.length === 0 && (
          <div className="text-center text-gray-400 text-xl">
            Достижения пока не добавлены
          </div>
        )}
      </div>
    </div>
  );
}
