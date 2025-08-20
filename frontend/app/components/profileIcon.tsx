<<<<<<< HEAD
import Image from 'next/image'
=======
import Link from 'next/link';
>>>>>>> c80ee0c (add-posts)
import React from 'react'
import { CgProfile } from "react-icons/cg";

export default function ProfileIcon() {
  return (
<<<<<<< HEAD
    <div className='flex gap-2 items-center'>
      <h4 className='text-xl'>Profile</h4>

      <CgProfile size={30} />
    </div>
=======
    <Link href={'profile'} className='flex gap-2 items-center'>
      <h4 className='text-xl'>Profile</h4>
      <CgProfile size={50} />
    </Link>
>>>>>>> c80ee0c (add-posts)
  )
}
