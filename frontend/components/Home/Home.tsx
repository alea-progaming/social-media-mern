"use client";
import { RootState } from "@/store/store";
import React from "react";
import { useSelector } from "react-redux";

const Home = () => {
  // test: get user from redux store
  const user = useSelector((state: RootState) => state?.auth.user);
  console.log(user);

  return <div>Home</div>;
};

export default Home;
