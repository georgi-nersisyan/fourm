"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';

export default function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Файл слишком большой! Максимум 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Можно загружать только изображения!');
        return;
      }

      setAvatarFile(file);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      setError('Введите текущий пароль');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username !== user.username ? username : undefined,
          current_password: currentPassword,
          new_password: newPassword || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка обновления профиля');
      }

      setMessage('Профиль успешно обновлен!');
      setCurrentPassword('');
      setNewPassword('');
      await refreshUser();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка обновления профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatarFile) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await fetch('http://localhost:5000/profile/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки аватарки');
      }

      setMessage('Аватарка успешно обновлена!');
      setAvatarFile(null);
      setAvatarPreview(null);
      await refreshUser();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка загрузки аватарки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/profile"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Назад к профилю
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-8">Настройки профиля</h1>

        {/* Аватарка */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Аватарка</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-600">
              {avatarPreview ? (
                <Image 
                  src={avatarPreview} 
                  alt="Превью аватарки" 
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : user.avatar && user.avatar !== 'default.png' ? (
                <Image
                  src={`http://localhost:5000/uploads/${user.avatar}`}
                  alt={`Аватар ${user.username}`}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                  {user.username[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="block w-full p-2 rounded-lg border border-gray-600 text-gray-300 bg-gray-700 cursor-pointer mb-2"
              />
              
              {avatarFile && (
                <button
                  onClick={handleUpdateAvatar}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Загрузка...' : 'Обновить аватарку'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Профиль */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Информация профиля</h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Никнейм
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Текущий пароль *
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Новый пароль (оставьте пустым, если не хотите менять)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900 border border-red-700 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-900 border border-green-700 rounded-lg text-green-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}