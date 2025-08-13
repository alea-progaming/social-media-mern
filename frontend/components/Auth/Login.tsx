"use client";

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
  email: string;
  password: string;
}

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // create request
    const loginReq = async () =>
      await axios.post(`${BASE_API_URL}/users/login`, formData, {
        withCredentials: true,
      });
    const result = await handleAuthRequest(loginReq, setIsLoading);

    if (result) {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message);
      router.push("/");
    }
  };

  return (
    <div className="relative w-full h-screen bg-cover bg-center bg-[url('/images/Banner.jpg')]">
      <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-white rounded-2xl w-100 md:w-125 lg:w-125 xl:w-150 h-fit p-6 flex flex-col items-center">
        <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl text-center">
          Login with <span className="text-blue-600">Photogram</span>
        </h1>
        <form
          className="w-[90%] mt-4"
          onSubmit={handleSubmit}
        >
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
            <Link
              href="/auth/forgot-password"
              className="mt-2 text-red-600 block font-semibold text-base cursor-pointer text-right"
            >
              Forgot password?
            </Link>
          </div>
          <LoadingButton
            size={"lg"}
            className="w-full mt-3"
            type="submit"
            isLoading={isLoading}
          >
            Log in
          </LoadingButton>
          <h2 className="mt-4 text-md text-center text-gray-800">
            Don&apos;t have an account yet?
            <Link href="/auth/signup">
              <span className="text-blue-800 underline cursor-pointer font-medium">
                &nbsp;Sign up here
              </span>
            </Link>
          </h2>
        </form>
      </div>
    </div>
  );
};

export default Login;
