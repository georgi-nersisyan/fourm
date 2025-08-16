import React from 'react'

export default function Login() {
  return (
    <div className='w-full p-6 flex flex-col justify-center items-center'>

      <form action="/profile" className='w-xl flex flex-col gap-7 p-2.5'>
        <h3 className='text-5xl text-start'>Log in</h3>
        
        <div className="w-full flex flex-col gap-2">
          <input
            type="text"
            placeholder="Enter Your First Name*"
            className={"w-full p-2.5 rounded-2xl border-2 border-primary-border text-xl"}
          />
        </div>

        <div className="w-full flex flex-col gap-2">
          <input
            type="email"
            placeholder="Enter Your Email*"
            className={"w-full p-2.5 rounded-2xl border-2 border-primary-border text-xl"}
          />
        </div>

        <div className="w-full flex flex-col gap-2">
          <input
            type="password"
            placeholder="Enter Your Password*"
            className={"w-full p-2.5 rounded-2xl border-2 border-primary-border text-xl"}
          />
        </div>

        <input
          type="submit"
          value="Create"
          className="w-full p-2 bg-submit border-submit border-2 border-solid transition-all rounded-2xl cursor-pointer hover:bg-transparent hover:text-submit"
        />
      </form>
    </div>
  )
}