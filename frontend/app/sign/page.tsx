"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
<<<<<<< HEAD
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function SignPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setMessage("Заполните обязательные поля");
      setIsError(true);
      return;
    }

    setLoading(true);
    setIsError(false);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      if (bio) formData.append('bio', bio);
      if (avatar) formData.append('avatar', avatar);

      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setIsError(false);
        router.push("/profile");
      } else {
        setIsError(true);
        setMessage(data.error || "Ошибка регистрации");
      }
    } catch (error) {
      setIsError(true);
      setMessage("Сервер недоступен");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-3 justify-center items-center min-h-screen">
      <div className="mb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Назад на главную
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="w-xl flex flex-col gap-7 p-2.5">
        <h1 className="text-5xl font-bold">Sign up</h1>

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

        <input
          type="email"
          placeholder="Email*"
          className={
            "w-full p-2.5 rounded-2xl border-2 text-xl " +
            (isError
              ? "border-error text-error"
              : "border-primary-border text-foreground")
          }
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password*"
          className={
            "w-full p-2.5 rounded-2xl border-2 text-xl" +
            `${isError ? " border-error" : " border-primary-border"} ${
              isError ? " text-error" : " text-foreground"
            }`
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <textarea
          placeholder="Bio (до 500 символов)"
          maxLength={500}
          className="w-full p-2.5 rounded-2xl border-2 text-xl border-primary-border resize-none"
          rows={6}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files?.[0] || null)}
          className="block w-full p-2.5 rounded-2xl border-2 text-gray-300 border-primary-border hover:border-primary transition-colors cursor-pointer"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 p-2 bg-submit border-submit border-2 border-solid transition-all rounded-2xl cursor-pointer hover:bg-transparent hover:text-submit hover:text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Регистрация..." : "Зарегистрироваться"}
=======
import { useAuth } from "../contexts/AuthContext";
import LengthLimit from "../components/length-limit";

export default function SignPage() {
  const [username, setUsername] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  
  const [isError, setIsError] = useState(false);
  const [isUsernameError, setIsUsernameError] = useState(false);
  const [isEmailError, setIsEmailError] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [isBioError, setIsBioError] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [bioError, setBioError] = useState("");
  
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const router = useRouter();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!username.trim()) {
    setIsUsernameError(true);
    setUsernameError("Username is empty");
    return;
  } else {
    setIsUsernameError(false);
    setUsernameError("");
  }

  if (!email.trim()) {
    setIsEmailError(true);
    setEmailError("Email is empty");
  } else {
    setIsEmailError(false);
    setEmailError("");
  }

  if (!password.trim()) {
    setIsPasswordError(true);
    setPasswordError("Password is empty");
  } else if(password.trim().length < 8) {
    setIsPasswordError(true);
    setPasswordError("The password must be at least 8 characters long.");
  } else {
    setIsPasswordError(false);
    setPasswordError("");
  }

  const formData = new FormData();
  formData.append("username", username);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("lastName", lastName);
  formData.append("bio", bio);

  if (avatar) {
    formData.append("avatar", avatar);
  }

  try {
    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await res.json();

    if (res.ok && password.length >= 8) {
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
};

  const handleAvatar = (e:React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  }

  const handleUsername = (e:React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 25) {
      setUsername(e.target.value);
    }
  }

  const handleLastName = (e:React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 50) {
      setLastName(e.target.value);
    }
  }

  const handleEmail = (e:React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)

  const handlePassword = (e:React.ChangeEvent<HTMLInputElement>) => { 
    if (e.target.value.length <= 64) {
      setPassword(e.target.value)
    }
  }

  const handleBio = (e:React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 500) {
      setBio(e.target.value);
    }
  }
  return (
    <div className="p-4 flex flex-col gap-3 justify-center items-center">
      <form onSubmit={handleSubmit} className="w-xl flex flex-col gap-7 p-2.5">
        <h1 className="text-5xl font-bold">Sign in</h1>

        <div className="w-full flex flex-col gap-2">
          <p className="text-red-500 text-sm">{usernameError}</p>
          
          <input
            type="text"
            placeholder="Username*"
            className={
              "w-full p-2.5 rounded-2xl border-2 text-xl " +
              (isUsernameError
                ? "border-error text-error"
                : "border-primary-border text-foreground")
            }
            value={username}
            onChange={handleUsername}
          />

            <LengthLimit currentLen={username.length} maxLen={25}/>
        </div>
        
        <div className="w-full flex flex-col gap-2">
          <input
            type="text"
            placeholder="Last name"
            className={
              "w-full p-2.5 rounded-2xl border-2 text-xl border-primary-border"
            }
            value={lastName}
            onChange={handleLastName}
            
          />

          <LengthLimit currentLen={lastName.length} maxLen={50}/>
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
          <p className="text-red-500 text-sm">{emailError}</p>

          <input
            type="email"
            placeholder="Email*"
            className={
              "w-full p-2.5 rounded-2xl border-2 text-xl " +
              (isEmailError
                ? "border-error text-error"
                : "border-primary-border text-foreground")
            }
            value={email}
            onChange={handleEmail}
          />
        </div>

        <div className="w-full flex flex-col gap-2">
          <p className="text-red-500 text-sm">{passwordError}</p>

          <input
            type="password"
            placeholder="Password*"
            className={
              "w-full p-2.5 rounded-2xl border-2 text-xl" +
              `${isPasswordError ? " border-error" : " border-primary-border"} ${
                isPasswordError ? " text-error" : " text-foreground"
              }`
            }
            value={password}
            onChange={handlePassword}
          />

          <LengthLimit currentLen={password.length} maxLen={16}/>
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

          <LengthLimit currentLen={bio.length} maxLen={500}/>
        </div>
            
        <button
          type="submit"
          className="w-full h-12 p-2 bg-submit border-submit border-2 border-solid transition-all rounded-2xl cursor-pointer hover:bg-transparent hover:text-submit hover:text-xl"
        >
          Зарегистрироваться
>>>>>>> 3879534 (extend profile and add validation)
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 3879534 (extend profile and add validation)
