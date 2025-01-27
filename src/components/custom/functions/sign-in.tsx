import { Button } from "@/components/ui/button";
import { handleSignIn } from "@/lib/signInOutActions";
import { LogIn } from "lucide-react";

export const SignIn = ({ ...prop }) => {
  return (
    <div className="w-full">
      <Button className="w-full" onClick={handleSignIn} {...prop}>
        <LogIn />
        Sign In
      </Button>
    </div>
  );
};
