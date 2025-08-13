"use client";
import { RootState } from "@/store/store";
import React from "react";
import { useSelector } from "react-redux";

const Home = () => {
  // get user from redux store
  const user = useSelector((state: RootState) => state?.auth.user);
  if (!user) {
    console.log(user);
  }

  return <div>Home</div>;
};

export default Home;
