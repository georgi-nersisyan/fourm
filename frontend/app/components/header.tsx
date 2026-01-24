'use client';

import Image from "next/image";
import Link from "next/link";
<<<<<<< HEAD
import React from "react";
=======
import React, { useState } from "react";
>>>>>>> 3879534 (extend profile and add validation)
import Nav from "./nav";
import { menuItems } from "./menu-items";
import ProfileIcon from "./profileIcon";
import CreatePostBtn from "./create-post-btn";
<<<<<<< HEAD
=======
import { IPost, postItems } from "./post-items";
>>>>>>> 3879534 (extend profile and add validation)
import LoginBtn from "./login-btn";
import SigninBtn from "./sign-btn";
import { useAuth } from "../contexts/AuthContext";

export default function Header() { 
<<<<<<< HEAD
  const {isLoggedIn} = useAuth();
=======
  const {isLoggedIn, setIsLoggedIn} = useAuth();
>>>>>>> 3879534 (extend profile and add validation)

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
<<<<<<< HEAD
          <CreatePostBtn />
          <ProfileIcon />
=======
        <CreatePostBtn />
        <ProfileIcon />
>>>>>>> 3879534 (extend profile and add validation)
        </div>
        :
        <div className="flex items-center gap-4"> 
          <LoginBtn />
          <SigninBtn />
        </div>
      }
    </header>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 3879534 (extend profile and add validation)
