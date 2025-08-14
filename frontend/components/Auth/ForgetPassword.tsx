"use client";

import { KeySquareIcon } from "lucide-react";
import React, { useState } from "react";
import LoadingButton from "../Helper/LoadingButton";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { handleApiRequest } from "../utils/apiRequest";
import { toast } from "sonner";

const ForgetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    const forgetPassReq = async () =>
      await axios.post(
        `${BASE_API_URL}/users/forget-password`,
        { email },
        { withCredentials: true }
      );

    const result = await handleApiRequest(forgetPassReq, setIsLoading);
    if (result) {
      console.log(result.data.message);
      toast.success(result.data.message);
    } else toast.error("Failed to send reset instructions. Please try again.");
  };

  return (
    <div className="flex items-center justify-center flex-col w-fll h-screen">
      <KeySquareIcon className="w-20 h-20 sm:w-32 sm:h-32 text-red-600 mb-12" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">
        Forgot your password?
      </h1>
      <p className="mb-6 text-sm sm:text-base text-center text-gray-600 font-medium">
        Enter your email and we will send instructions to help you reset your
        password.
      </p>
      <input
        type="email"
        placeholder="Enter your email"
        className="px-6 py-3.5 rounded-lg outline-none bg-gray-200 block w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] mx-auto"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <LoadingButton
        onClick={handleSubmit}
        className="w-40 mt-4"
        size={"lg"}
        isLoading={isLoading}
      >
        Continue
      </LoadingButton>
    </div>
  );
};

export default ForgetPassword;
