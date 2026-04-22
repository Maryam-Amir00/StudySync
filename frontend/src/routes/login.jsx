import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { motion as _motion } from "framer-motion";
import { toast } from "react-hot-toast";

import { loginUser } from "../api/authApi";
import { useAuth } from "../context/useAuth";
import logo from "../assets/logo.png";

const Login = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(data);
      toast.success("Login successful!");

      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 1000);
    },
    onError: (error) => {
      const message = typeof error === 'string' ? error : (error.detail || "Invalid username or password");
      toast.error(message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F8FAFF] via-[#EEF2FF] to-[#F9FAFB] flex items-center justify-center px-4 relative overflow-hidden">

      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_15%_20%,#C7D2FE_0,transparent_35%),radial-gradient(circle_at_80%_10%,#A5B4FC_0,transparent_28%),radial-gradient(circle_at_85%_85%,#C4B5FD_0,transparent_32%)]" />
      <div className="absolute w-105 h-105 bg-[#C7D2FE]/50 rounded-full blur-3xl -top-30 -left-30" />
      <div className="absolute w-85 h-85 bg-[#A5B4FC]/40 rounded-full blur-3xl -bottom-25 -right-25" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(#4F46E5_1px,transparent_1px),linear-gradient(90deg,#4F46E5_1px,transparent_1px)] bg-size-[42px_42px]" />

      <_motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative w-full max-w-md bg-white/90 backdrop-blur-sm border border-[#E5E7EB] rounded-2xl shadow-lg p-8"
      >

        <div className="absolute top-0 left-0 w-full h-1 bg-[#4F46E5] rounded-t-2xl" />

        <_motion.div variants={item} className="mb-8 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-white/85 border border-[#E5E7EB] shadow-sm flex items-center justify-center">
            <img src={logo} alt="StudySync logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-[#111827] tracking-tight">
            StudySync
          </h1>
          <p className="text-sm text-[#6B7280] mt-2">
            A calm space to collaborate and learn
          </p>
        </_motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">


          <_motion.div variants={item}>
            <label className="text-sm font-medium text-[#374151] block mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg 
            bg-white/80 backdrop-blur-sm
            focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]
            transition-all duration-300 ease-in-out
            hover:border-[#4F46E5] focus:shadow-md"
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />
          </_motion.div>

          <_motion.div variants={item}>
            <label className="text-sm font-medium text-[#374151] block mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg 
            bg-white/80 backdrop-blur-sm
            focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]
            transition-all duration-300 ease-in-out
            hover:border-[#4F46E5] focus:shadow-md"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </_motion.div>

          <_motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            whileHover={{
              scale: 1.02,
              transition: { type: "spring", stiffness: 320, damping: 20 },
            }}
            whileTap={{
              scale: 0.985,
              transition: { type: "spring", stiffness: 420, damping: 24 },
            }}
            type="submit"
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-2.5 rounded-lg font-medium 
          transition-colors duration-200 shadow-sm hover:shadow-lg"
          >
            {mutation.isPending ? "Signing in..." : "Sign In"}
          </_motion.button>
        </form>

        <div className="relative mt-6 h-6">

          <_motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute inset-0 text-center text-sm text-[#6B7280]"
          >
            Don’t have an account?{" "}
            <span
              onClick={() => navigate({ to: "/register" })}
              className="text-[#4F46E5] font-medium cursor-pointer hover:underline"
            >
              Register
            </span>
          </_motion.p>

        </div>
      </_motion.div>
    </div>
    
  );
};

export default Login;