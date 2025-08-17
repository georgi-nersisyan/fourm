import Image from 'next/image'
import React from 'react'
import { CgProfile } from "react-icons/cg";

export default function ProfileIcon() {
  return (
    <div className='flex gap-2 items-center'>
      <h4 className='text-xl'>Profile</h4>

      <CgProfile size={30} />
    </div>
  )
}
