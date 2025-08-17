'use client';

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Nav from "./nav";
import { menuItems } from "./menu-items";
import ProfileIcon from "./profileIcon";
import CreatePostBtn from "./create-post-btn";
import { IPost, postItems } from "./post-items";
import LoginBtn from "./login-btn";
import SigninBtn from "./sign-btn";

export default function Header() { 
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  return (
    <header className="flex items-center justify-between px-5 py-2 bg-header-bg text-white sticky top-0 z-100">
      <Link href="/" >
        <Image
          src="/images/logo.png"
          alt="logo"
          width={80}
          height={30}
          className="object-contain"
        />
      </Link>
      <Nav MenuItems={menuItems} />

      {
        isLoggedIn ?
        <div className="flex items-center gap-8">
        <CreatePostBtn />
        <ProfileIcon />
        </div>
        :
        <div className="flex items-center gap-4"> 
          <LoginBtn />
          <SigninBtn />
        </div>
      }
    </header>
  );
}
