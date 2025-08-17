import Link from 'next/link'
import React from 'react'

export default function LoginBtn() {
  return (
    <Link href='login' className='w-36 bg-login p-2 rounded-2xl border-2 border-login border-solid transition-all flex items-center justify-center cursor-pointer hover:bg-transparent hover:text-xl hover:text-login'>Log in</Link>
  )
}
