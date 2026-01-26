import React from 'react'

interface LengthLimitProps {
    maxLen:number;
    currentLen:number;
}

export default function MaxLength({maxLen, currentLen}:LengthLimitProps) {
  return (
    <p className='text-gray-500 text-sm'>{currentLen}/{maxLen}</p>
  )
}
