'use client';

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import ProfileIcon from "./profileIcon";
import CreatePostBtn from "./create-post-btn";
import LoginBtn from "./login-btn";
import SigninBtn from "./sign-btn";
import { useAuth } from "../contexts/AuthContext";
import Posts from "./posts"
import FindBlock from "./find-block";

export default function Header() { 
  const {isLoggedIn} = useAuth();
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleResults = (results: any[]) => {
    setSearchResults(results);
  }

  return (
    <header className="w-full sticky flex items-center justify-between px-5 py-2 bg-header text-white left-0 top-0 z-50">
      <Link href="/" >
        <Image
          src="/images/logo.png"
          alt="logo"
          width={80}
          height={30}
          className="object-contain"
        />
      </Link>

      <FindBlock />

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