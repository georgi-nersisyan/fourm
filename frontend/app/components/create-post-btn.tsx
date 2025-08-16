import Link from "next/link";
import React from "react";
import { FaPlus } from "react-icons/fa6";

export default function CreatePostBtn() {
  return (
    <Link
      href="/create-post"
      className="group border-2 border-gray-200 rounded-3xl p-2 px-3 transition-colors hover:bg-gray-200 flex gap-1 items-center"
    >
      <FaPlus
        size={18}
        className="text-gray-300 transition-colors group-hover:text-gray-900"
      />
      <span className="text-gray-300 text-xl transition-colors group-hover:text-gray-900">
        Create
      </span>
    </Link>
  );
}