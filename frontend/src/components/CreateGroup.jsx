import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroup } from "../api/groupApi";

const CreateGroup = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createGroup,
        onSuccess: () => {
            alert("Group created successfully ✅");

            queryClient.invalidateQueries(["groups"]);

            setName("");
            setDescription("");
        },
        onError: () => {
            alert("Error creating group ❌");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        mutation.mutate({
            name,
            description,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                placeholder="Group Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-3 text-[#374151] placeholder:text-[#6B7280] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#EEF2FF] transition-all duration-200"
            />

            <input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-3 text-[#374151] placeholder:text-[#6B7280] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#EEF2FF] transition-all duration-200"
            />

            <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full sm:w-auto rounded-xl bg-[#4F46E5] px-5 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:bg-[#A5B4FC]"
            >
                {mutation.isPending ? "Creating..." : "Create"}
            </button>
        </form>
    );
};

export default CreateGroup;