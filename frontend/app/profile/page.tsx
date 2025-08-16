"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/me", {
          method: "GET",
          credentials: "include", // важно для Flask-Login
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          const err = await res.json();
          setMessage(err.error || "Не авторизован");
        }
      } catch (error) {
        setMessage("Ошибка подключения к серверу");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p className="p-4">Загрузка...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Профиль</h1>

      {user ? (
        <div className="mt-4 border p-4 rounded bg-gray-100">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Имя пользователя:</strong> {user.username}</p>
        </div>
      ) : (
        <p className="mt-4 text-red-500">{message}</p>
      )}
    </div>
  );
}

