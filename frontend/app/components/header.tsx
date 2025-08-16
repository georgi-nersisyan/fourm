"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Nav from "./nav";
import { menuItems } from "./menu-items";
import ProfileIcon from "./profileIcon";
import CreatePostBtn from "./create-post-btn";
import LoginBtn from "./login-btn";
import SigninBtn from "./sign-btn";
import { useAuth } from "../contexts/AuthContext";

export interface isLoggedInProps {
  setIsLoggedIn: (val: boolean) => void;
}

export default function Header() {
  const {isLoggedIn, setIsLoggedIn} = useAuth();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    };

    checkLogin();
  }, []);

  return (
    <header className="flex items-center justify-between px-5 py-0.5 bg-header-bg text-white sticky top-0 z-100">
      <Link href="/">
        <Image
          src="https://pngicon.ru/file/uploads/google.png"
          alt="logo"
          width={120}
          height={40}
          className="object-contain"
        />
      </Link>
      <Nav MenuItems={menuItems} />

      {isLoggedIn ? (
        <div className="flex items-center gap-8">
          <CreatePostBtn />
          <ProfileIcon />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <LoginBtn />
          <SigninBtn />
        </div>
      )}
    </header>
  );
}