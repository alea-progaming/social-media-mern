import Image from "next/image";
import React from "react";
import PasswordInput from "./PasswordInput";

const Signup = () => {
  return (
    <div className="relative w-full h-screen bg-cover bg-[url('/images/Banner.jpg')]">
      <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-white rounded-2xl w-75 h-fit p-6 flex flex-col items-center">
        <h1 className="text-xl font-bold sm:text-2xl text-center">
          Sign up with <span className="text-blue-600">Photogram</span>
        </h1>
        <form className="w-[90%] mt-4">
          <div className="mb-4">
            <label htmlFor="name" className="font-semibold mb-2 block">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              id="name"
              className="px-4 py-2 bg-gray-200 rounded-lg w-full block outline-none"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="font-semibold mb-2 block">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              id="email"
              className="px-4 py-2 bg-gray-200 rounded-lg w-full block outline-none"
            />
          </div>
          <div className="mb-4">
            <PasswordInput
              label="Password"
              name="password"
              placeholder="Enter password"
            />
          </div>
          <div className="mb-4">
            <PasswordInput
              name="passConfirm"
              label="Confirm Password"
              placeholder="Confirm Password"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
