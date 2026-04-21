import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";

import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(data);
      setMessage("Login successful!");

      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 1000);
    },
    onError: () => {
      setMessage("Invalid username or password");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    mutation.mutate(form);
  };

  // Animation variants (UI only)
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
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-[400px] h-[400px] bg-[#EEF2FF] rounded-full blur-3xl top-[-100px] left-[-100px]" />
      <div className="absolute w-[300px] h-[300px] bg-[#EEF2FF] rounded-full blur-3xl bottom-[-80px] right-[-80px]" />

      {/* Card */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative w-full max-w-md bg-white/90 backdrop-blur-sm border border-[#E5E7EB] rounded-2xl shadow-lg p-8"
      >

        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#4F46E5] rounded-t-2xl" />

        {/* Title */}
        <motion.div variants={item} className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#111827] tracking-tight">
            StudySync
          </h1>
          <p className="text-sm text-[#6B7280] mt-2">
            A calm space to collaborate and learn
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Username */}
          <motion.div variants={item}>
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
          </motion.div>

          {/* Password */}
          <motion.div variants={item}>
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
          </motion.div>

          {/* Button */}
          <motion.button
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
          </motion.button>

          {/* Message */}
          <AnimatePresence mode="wait">
            {message && (
              <motion.p
                key={message}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`text-sm text-center mt-2 ${message.includes("successful")
                    ? "text-[#10B981]"
                    : "text-[#EF4444]"
                  }`}
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>
        </form>

        {/* Footer */}
        <div className="relative mt-6 h-6">

          <motion.p
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
          </motion.p>

        </div>
      </motion.div>
    </div>
    
  );
};

export default Login;