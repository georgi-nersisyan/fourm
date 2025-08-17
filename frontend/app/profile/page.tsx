"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";

export default function ProfilePage() {
  const [user, setUser] = useState<{
    id: number;
    username: string;
    email: string;
  } | null>(null);
  console.log(user);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isChangeName, setIsChangeName] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [isError, setIsError] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        <div className="w-xl flex flex-col gap-4 items-center">
          <div className="w-full flex gap-5 items-center">
            <Image
              src="/images/logo.png"
              alt=""
              width={80}
              height={80}
              className="object-contain"
            />

            <h3 className="text-6xl font-bold">{user.username}</h3>
          </div>

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
                  type="submit"
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
              <div className={"p-2 rounded-2xl flex-col gap-3 justify-center cursor-pointer " + `${isChangePassword ? "flex " : "hidden"}`}>
              <input
                type="password"
                placeholder="New Password*"
                className={
                  "w-full p-2.5 rounded-2xl border-2 text-xl" +
                  `${isError ? " border-error" : " border-primary-border"} ${
                    isError ? " text-error" : " text-foreground"
                  }`
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

                <button
                  type="submit"
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
