import { auth } from "@auth";
import { redirect } from "next/navigation";

export const Info = async () => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  // const userId = session.user.id;

  return (
    <div className="container mx-auto p-4 w-full">
      <h1 className="text-2xl font-bold mb-4">
        Make changes to your account here.
      </h1>
    </div>
  );
};
