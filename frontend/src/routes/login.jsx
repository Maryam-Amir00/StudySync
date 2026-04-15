import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

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

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      
      {/* Card */}
      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-8">
        
        {/* Logo / Title */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-[#111827]">
            StudySync
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Collaborate. Learn. Grow.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div>
            <label className="text-sm text-[#374151] block mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EEF2FF] focus:border-[#4F46E5]"
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-[#374151] block mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EEF2FF] focus:border-[#4F46E5]"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-2 rounded-lg transition"
          >
            {mutation.isPending ? "Signing in..." : "Sign In"}
          </button>

          {/* Message */}
          {message && (
            <p
              className={`text-sm text-center mt-2 ${
                message.includes("successful")
                  ? "text-[#10B981]"
                  : "text-[#EF4444]"
              }`}
            >
              {message}
            </p>
          )}
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-[#6B7280] mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate({ to: "/register" })}
            className="text-[#4F46E5] font-medium cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;