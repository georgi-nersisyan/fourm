import Link from 'next/link'
import React from 'react'

export default function SigninBtn() {
  return (
    <Link href="/sign" className='w-36 bg-sign p-2 rounded-2xl border-2 border-sign border-solid transition-all flex items-center justify-center cursor-pointer hover:bg-transparent hover:text-xl hover:text-sign'>Sign in</Link>
  )
}