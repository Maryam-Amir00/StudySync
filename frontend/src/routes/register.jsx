import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { registerUser } from "../api/authApi";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: registerUser,

    onSuccess: () => {
      setMessage("Account created successfully!");

      setTimeout(() => {
        navigate({ to: "/" }); 
      }, 1000);
    },

    onError: () => {
      setMessage("Registration failed. Try a different username.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-[#111827]">
            Create Account
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Join StudySync and start collaborating
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-[#374151] block mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EEF2FF] focus:border-[#4F46E5]"
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm text-[#374151] block mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EEF2FF] focus:border-[#4F46E5]"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm text-[#374151] block mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EEF2FF] focus:border-[#4F46E5]"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-2 rounded-lg transition"
          >
            {mutation.isPending ? "Creating account..." : "Register"}
          </button>
          {message && (
            <p
              className={`text-sm text-center mt-2 ${
                message.includes("success")
                  ? "text-[#10B981]"
                  : "text-[#EF4444]"
              }`}
            >
              {message}
            </p>
          )}
        </form>
        <p className="text-center text-sm text-[#6B7280] mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate({ to: "/" })}
            className="text-[#4F46E5] font-medium cursor-pointer hover:underline"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;