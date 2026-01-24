import React from 'react'

interface LengthLimitProps {
    currentLen: number;
    maxLen: number;
}

export default function LengthLimit({currentLen,maxLen}:LengthLimitProps) {
  return (
     <p className='text-gray-500 text-sm'>{currentLen}/{maxLen}</p>
  )
}
