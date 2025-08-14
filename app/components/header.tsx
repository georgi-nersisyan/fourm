'use client';

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Nav from "./nav";
import { menuItems } from "./menu-items";
import ProfileIcon from "./profileIcon";
import CreatePostBtn from "./create-post-btn";
import { IPost, postItems } from "./post-items";

export default function Header() {
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

      <div className="flex items-center gap-8">
        <CreatePostBtn />
        <ProfileIcon />
      </div>
    </header>
  );
}
