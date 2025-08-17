import Link from 'next/link';
import React from 'react'
import { CgProfile } from "react-icons/cg";

export default function ProfileIcon() {
  return (
    <Link href={'profile'} className='flex gap-2 items-center'>
      <h4 className='text-xl'>Profile</h4>
      <CgProfile size={50} />
    </Link>
  )
}
