import CreateGroup from "../components/CreateGroup";

const CreateGroupPage = () => {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Create Group</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Start a new study community and invite your classmates.
        </p>
      </div>

      <div className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 shadow-sm">
        <CreateGroup />
      </div>
    </div>
  );
};

export default CreateGroupPage;
