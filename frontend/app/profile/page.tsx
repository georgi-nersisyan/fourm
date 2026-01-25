"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";

export default function ProfilePage() {
  const [user, setUser] = useState<{
    id: number;
    username: string;
    email: string;
    bio:string;
    avatar:string;
    last_name:string;
  } | null>(null);
  console.log(user);

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [isChangeName, setIsChangeName] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [isError, setIsError] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  

  const ChangeNameBtn = () => {
    setIsChangeName(!isChangeName);
    if (!isChangeName && user) setUsername(user.username);
  };

  const ChangePasswordBtn = () => {
    setIsChangePassword(!isChangePassword);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/me", {
          method: "GET",
          credentials: "include", // 🔥 важно!
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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:5000/my-posts", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        // ignore for now
      }
    };

    if (isLoggedIn) fetchPosts();
  }, [isLoggedIn]);

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

  if (loading) return <p className="text-xl">Загрузка...</p>;

  return (
    <div className="p-4 flex flex-col gap-3 justify-center items-center">
      {user ? (
        <div className="w-xl flex flex-col gap-4 items-center bg-profile p-4 rounded-2xl">
          <div className="w-full flex gap-5 items-center">
           <img src={user.avatar} alt="" className="w-20 h-20 object-cover rounded-sm" />

            <div>
              <h3 className="text-6xl">{user.username}</h3>
              <p className="font-bold">{user.last_name}</p>
            </div>
          </div>

          <span className="text-gray-500 break-words break-all min-w-0">
            {user.bio}
          </span>

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
                <p className="text-red-600 text-sm">{}</p>

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
                  onClick={async () => {
                    setIsError(false);
                    setMessage("");
                    try {
                      const res = await fetch("http://localhost:5000/change-username", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ new_username: username }),
                      });

                      const data = await res.json();
                      if (res.ok) {
                        setMessage(data.message || "Username changed");
                        setIsError(false);
                        setIsChangeName(false);
                        setUser((u) => (u ? { ...u, username: data.username || username } : u));
                        setUsername("");
                      } else {
                        setMessage(data.error || "Ошибка");
                        setIsError(true);
                      }
                    } catch (err) {
                      setMessage("Сервер недоступен");
                      setIsError(true);
                    }
                  }}
                  type="button"
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
                  placeholder="Current Password*"
                  className={
                    "w-full p-2.5 rounded-2xl border-2 text-xl" +
                    `${isError ? " border-error" : " border-primary-border"} ${
                      isError ? " text-error" : " text-foreground"
                    }`
                  }
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />

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

                <button
                  onClick={async () => {
                    setIsError(false);
                    setMessage("");
                    try {
                      const res = await fetch("http://localhost:5000/change-password", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          current_password: currentPassword,
                          new_password: newPassword,
                        }),
                      });

                      const data = await res.json();
                      if (res.ok) {
                        setMessage(data.message || "Пароль изменён");
                        setIsError(false);
                        setIsChangePassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                      } else {
                        setMessage(data.error || "Ошибка");
                        setIsError(true);
                      }
                    } catch (err) {
                      setMessage("Сервер недоступен");
                      setIsError(true);
                    }
                  }}
                  type="button"
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
          <div className="w-full mt-6">
            <h4 className="text-2xl mb-2">My posts</h4>
            {posts.length ? (
              <ul className="flex flex-col gap-3">
                {posts.map((p) => (
                  <li key={p.id} className="p-3 border rounded-2xl">
                    <h5 className="text-xl font-semibold">{p.title}</h5>
                    {p.content && <p className="text-sm">{p.content}</p>}
                    <div className="flex gap-2 mt-2">
                      {p.media &&
                        p.media.map((m: any, i: number) =>
                          m.type === "image" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={i} src={m.src} alt={m.name} className="w-24 h-24 object-cover rounded" />
                          ) : (
                            <video key={i} src={m.src} className="w-32 h-24" controls />
                          )
                        )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No posts yet</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-lg text-error">
          {message || "Вы не вошли в аккаунт"}
        </p>
      )}
    </div>
  );
}