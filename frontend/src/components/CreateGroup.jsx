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
        <form onSubmit={handleSubmit}>
            <input
                placeholder="Group Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating..." : "Create"}
            </button>
        </form>
    );
};

export default CreateGroup;