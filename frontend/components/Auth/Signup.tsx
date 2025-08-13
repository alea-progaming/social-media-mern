"use client";

import Image from "next/image";
import React, { ChangeEvent, FormEvent, useState } from "react";
import PasswordInput from "./PasswordInput";
import LoadingButton from "../Helper/LoadingButton";
import Link from "next/link";
import { BASE_API_URL } from "@/server";
import axios from "axios";
import { handleAuthRequest } from "../utils/apiRequest";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import { useRouter } from "next/navigation";

interface FormData {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const Signup = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // create request
    const signupReq = async () =>
      await axios.post(`${BASE_API_URL}/users/signup`, formData, {
        withCredentials: true,
      });
    const result = await handleAuthRequest(signupReq, setIsLoading);

    if (result) {
      // * console.log(result); this works

      // ! this doesnt work
      // console.log("Get user:", result.data.data.user);

      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message);
      router.push("/");
      // Add a GMS using Redux. Configure redux store so that user is store in a Global State so it could be used anywhere we want
      // TODO :
      // 1. Redirect to Homepage
      // 2. Add user to redux store
    }
  };

  return (
    <div className="relative w-full h-screen bg-cover bg-center bg-[url('/images/Banner.jpg')]">
      <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-white rounded-2xl w-100 md:w-125 lg:w-125 xl:w-150 h-fit p-6 flex flex-col items-center">
        <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl text-center">
          Sign up with <span className="text-blue-600">Photogram</span>
        </h1>
        <form
          className="w-[90%] mt-4"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="font-semibold mb-2 block"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              id="name"
              className="px-4 py-2 bg-gray-200 rounded-lg w-full block outline-none"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="font-semibold mb-2 block"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              id="email"
              className="px-4 py-2 bg-gray-200 rounded-lg w-full block outline-none"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <PasswordInput
              label="Password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <PasswordInput
              name="passwordConfirm"
              label="Confirm Password"
              placeholder="Confirm Password"
              value={formData.passwordConfirm}
              onChange={handleChange}
            />
          </div>
          <LoadingButton
            size={"lg"}
            className="w-full mt-3"
            type="submit"
            isLoading={isLoading}
          >
            Sign Up
          </LoadingButton>
          <h2 className="mt-4 text-md text-center text-gray-800">
            Already have an account?
            <Link href="auth/login">
              <span className="text-blue-800 underline cursor-pointer font-medium">
                Login here
              </span>
            </Link>
          </h2>
        </form>
      </div>
    </div>
  );
};

export default Signup;
