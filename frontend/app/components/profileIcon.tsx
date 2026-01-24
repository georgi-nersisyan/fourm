import Link from 'next/link';
import React from 'react'
import { CgProfile } from "react-icons/cg";

export default function ProfileIcon() {
  return (
<<<<<<< HEAD
    <Link href={'/profile'} className='flex gap-2 items-center'>
=======
    <Link href={'profile'} className='flex gap-2 items-center'>
>>>>>>> 3879534 (extend profile and add validation)
      <h4 className='text-xl'>Profile</h4>
      <CgProfile size={50} />
    </Link>
  )
}
