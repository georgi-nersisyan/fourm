"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import MaxLength from "../components/max-length";

export default function SignPage() {
  const [username, setUsername] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);

  const [isError, setIsError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const [usernameErrorText, setUsernameErrorText] = useState("");
  const [emailErrorText, setEmailErrorText] = useState("");
  const [passwordErrorText, setPasswordErrorText] = useState("");

  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setUsernameError(false);
    setEmailError(false);
    setPasswordError(false);

    setUsernameErrorText("");
    setEmailErrorText("");
    setPasswordErrorText("");
    setMessage("");

    let hasError = false;

    if (!username.trim()) {
      setUsernameError(true);
      setUsernameErrorText("The field is empty");
      hasError = true;
    } else if (username.length <= 3) {
      setUsernameError(true);
      setUsernameErrorText("The username must be at least 3 characters long.");
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError(true);
      setEmailErrorText("The field is empty");
      hasError = true;
    }

    if (!password) {
      setPasswordError(true);
      setPasswordErrorText("The field is empty");
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError(true);
      setPasswordErrorText("The password must be at least 8 characters long.");
      hasError = true;
    }

    if (hasError) return;

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("last_name", lastName);
    formData.append("bio", bio);

    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        credentials: "include",
        body: formData, // ⬅️ ВАЖНО
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setIsError(false);
        setIsLoggedIn(true);
        router.push("/profile");
      } else {
        setMessage(data.error || "Ошибка регистрации");
        setIsError(true);
      }
    } catch {
      setMessage("Сервер недоступен");
      setIsError(true);
    }

    setUsername("");
    setLastName("");
    setEmail("");
    setPassword("");
  };

  const handleBio = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 500) {
      setBio(e.target.value);
    }
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-3 justify-center items-center">
      <form onSubmit={handleSubmit} className="w-xl flex flex-col gap-7 p-2.5">
        <h1 className="text-5xl font-bold">Sign in</h1>

        <div className="w-full flex flex-col gap-2">
          <p className="text-red-500 text-sm">{usernameErrorText}</p>

          <input
            type="text"
            placeholder="Username*"
            className={
              "w-full p-2.5 rounded-2xl border-2 text-xl " +
              (usernameError
                ? "border-error text-error"
                : "border-primary-border text-foreground")
            }
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <MaxLength currentLen={username.length} maxLen={20} />
        </div>

        <div className="w-full flex flex-col gap-2">
          <input
            type="text"
            placeholder="Last name"
            className={
              "w-full p-2.5 rounded-2xl border-2 text-xl border-primary-border"
            }
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <MaxLength currentLen={lastName.length} maxLen={50} />
        </div>

        <div className="w-full flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleAvatar}
            className="block w-full p-2.5 rounded-2xl border-2 text-gray-300 border-primary-border hover:border-primary transition-colors cursor-pointer"
          />
        </div>

        <div className="w-full flex flex-col gap-2">
          <p className="text-red-500 text-sm">{emailErrorText}</p>

          <input
            type="email"
            placeholder="Email*"
            className={
              "w-full p-2.5 rounded-2xl border-2 text-xl " +
              (emailError
                ? "border-error text-error"
                : "border-primary-border text-foreground")
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="w-full flex flex-col gap-2">
          <p className="text-red-500 text-sm">{passwordErrorText}</p>
          <input
            type="password"
            placeholder="Password*"
            className={
              "w-full p-2.5 rounded-2xl border-2 text-xl" +
              `${passwordError ? " border-error" : " border-primary-border"} ${
                passwordError ? " text-error" : " text-foreground"
              }`
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <MaxLength currentLen={password.length} maxLen={64} />
        </div>

        <div className="w-full flex flex-col gap-2">
          <textarea
            name=""
            id=""
            rows={11}
            placeholder="bio"
            className="w-full p-2.5 rounded-2xl border-2 text-xl border-primary-border resize-none"
            value={bio}
            onChange={handleBio}
          ></textarea>

          <p>{bio.length}/500</p>
        </div>

        <button
          type="submit"
          className="w-full h-12 p-2 bg-submit border-submit border-2 border-solid transition-all rounded-2xl cursor-pointer hover:bg-transparent hover:text-submit hover:text-xl"
        >
          Зарегистрироваться
        </button>
      </form>

      {message && (
        <p
          className={
            "mt-2 text-lg " + `${isError ? "text-error " : "text-foreground"}`
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}