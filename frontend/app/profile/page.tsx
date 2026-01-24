"use client";

<<<<<<< HEAD
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
              {user.avatar && user.avatar !== 'default_avatar.png' ? (
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
=======
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";

export default function ProfilePage() {
  const [user, setUser] = useState<{
    id: number;
    username: string;
    email: string;
    lastName?: string;
    bio?: string;
    avatar?: string;
  } | null>(null);
  console.log(user);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isChangeName, setIsChangeName] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [isError, setIsError] = useState(false);
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  const ChangeNameBtn = () => {
    setIsChangeName(!isChangeName);
  };

  const ChangePasswordBtn = () => {
    setIsChangePassword(!isChangePassword);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data);
          setMessage("");
          setIsLoggedIn(true);
        } else {
          setMessage(data.error || "Не авторизован");
          setIsLoggedIn(false);
        }
      } catch (err) {
        setMessage("Сервер недоступен");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setMessage("Вы вышли из аккаунта");
      setIsLoggedIn(false);
    } catch {
      setMessage("Ошибка выхода");
    }
  };

  const handleChangePassword = async () => {
  const res = await fetch("http://localhost:5000/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      oldPassword,
      newPassword,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    setMessage("Пароль успешно изменён");
    setOldPassword("");
    setNewPassword("");
  } else {
    setMessage(data.error || "Ошибка смены пароля");
  }
};

const handleChangeUsername = async () => {
  const res = await fetch("http://localhost:5000/change-username", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username }),
  });

  const data = await res.json();

  if (res.ok) {
    setUser((prev) => prev ? { ...prev, username } : prev);
    setMessage("Имя успешно изменено");
    setIsChangeName(false);
    setUsername("");
  } else {
    setMessage(data.error || "Ошибка смены имени");
  }
};

  if (loading) return <p className="text-xl">Загрузка...</p>;

  return (
    <div className="p-4 flex flex-col gap-3 justify-center items-center">
      {user ? (
        <div className="w-xl flex flex-col gap-4 items-center bg-profile p-4 rounded-2xl">
          <div className="w-full flex gap-5 items-center">
            <img
              src={`http://localhost:5000/uploads/${user.avatar}`}
              alt=""
              className="w-24 h-24 object-cover"
            />

            <div className="flex flex-col gap-2">
              <h3 className="text-6xl font-bold">{user.username}</h3>
              <p>{user.lastName}</p>
            </div>
          </div>

          <span className="block max-w-full break-words">{user.bio}</span>

          <div className="w-full border-2 border-primary-border rounded-2xl">
            <div className="flex flex-col">
              <div className={"p-2 justify-center cursor-pointer flex"}>
                <h4 onClick={ChangeNameBtn}>
                  {isChangeName ? "Cancel" : "Change username"}
                </h4>
              </div>

              <div
                className={
                  " p-2 rounded-2xl flex-col gap-3 justify-center cursor-pointer" +
                  `${isChangeName ? " flex " : " hidden"}`
                }
              >
                <input
                  type="text"
                  placeholder="Username*"
                  className={
                    "w-full p-2.5 rounded-2xl border-2 text-xl " +
                    (isError
                      ? "border-error text-error"
                      : "border-primary-border text-foreground")
                  }
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <button
                  onClick={handleChangeUsername}
                  className="w-full h-12 p-2 bg-sign border-sign border-2 border-solid transition-all rounded-2xl cursor-pointer hover:bg-transparent hover:text-sign hover:text-xl"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              <div className={"p-2 justify-center cursor-pointer flex"}>
                <h4 onClick={ChangePasswordBtn}>
                  {isChangePassword ? "Cancel" : "Change password"}
                </h4>
              </div>
              <div
                className={
                  "p-2 rounded-2xl flex-col gap-3 justify-center cursor-pointer " +
                  `${isChangePassword ? "flex " : "hidden"}`
                }
              >
                <input
                  type="password"
                  placeholder="New Password*"
                  className={
                    "w-full p-2.5 rounded-2xl border-2 text-xl" +
                    `${isError ? " border-error" : " border-primary-border"} ${
                      isError ? " text-error" : " text-foreground"
                    }`
                  }
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Old Password*"
                  className={
                    "w-full p-2.5 rounded-2xl border-2 text-xl" +
                    `${isError ? " border-error" : " border-primary-border"} ${
                      isError ? " text-error" : " text-foreground"
                    }`
                  }
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />

                <button
                  onClick={handleChangePassword}
                  className="w-full h-12 p-2 bg-sign border-sign border-2 border-solid transition-all rounded-2xl cursor-pointer hover:bg-transparent hover:text-sign hover:text-xl"
                >
                  Change
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full p-2 bg-logout text-white rounded-xl transition-colors hover:bg-white hover:text-logout"
          >
            Logout
          </button>
        </div>
      ) : (
        <p className="text-lg text-error">
          {message || "Вы не вошли в аккаунт"}
        </p>
      )}
    </div>
  );
}
>>>>>>> 3879534 (extend profile and add validation)
