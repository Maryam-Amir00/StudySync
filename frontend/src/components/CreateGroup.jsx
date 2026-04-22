import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createGroup } from "../api/groupApi";
import { motion } from "framer-motion";

const CreateGroup = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createGroup,
        onSuccess: () => {
            toast.success("Community created successfully! 🚀");
            queryClient.invalidateQueries(["groups"]);
            setName("");
            setDescription("");
        },
        onError: () => {
            toast.error("Failed to create group. Please try again.");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error("Group name is required");
        mutation.mutate({ name, description });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto py-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-[#4F46E5] ml-1">Community Identity</label>
                <input
                    placeholder="e.g. Quantum Physics 101"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-[1.25rem] border border-[#E5E7EB] bg-[#F9FAFB] px-5 py-4 text-sm font-medium text-[#111827] shadow-xs transition-all duration-300 placeholder:text-[#9CA3AF] focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EEF2FF]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-[#4F46E5] ml-1">Mission Statement</label>
                <textarea
                    placeholder="What will this community achieve together?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full rounded-[1.25rem] border border-[#E5E7EB] bg-[#F9FAFB] px-5 py-4 text-sm font-medium text-[#111827] shadow-xs transition-all duration-300 placeholder:text-[#9CA3AF] focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EEF2FF]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full sm:w-auto rounded-[1.25rem] bg-[#4F46E5] px-10 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_12px_24px_-6px_rgba(79,70,229,0.4)] transition-all hover:bg-[#4338CA] hover:shadow-[0_16px_32px_-8px_rgba(79,70,229,0.5)] disabled:cursor-not-allowed disabled:bg-[#A5B4FC] disabled:shadow-none"
              >
                  {mutation.isPending ? "Syncing..." : "Launch Community"}
              </motion.button>
              
              <p className="text-[11px] font-bold text-[#6B7280] leading-tight max-w-[200px]">
                By launching, you agree to lead this community with integrity.
              </p>
            </div>
        </form>
    );
};

export default CreateGroup;