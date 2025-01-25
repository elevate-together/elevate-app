import { Button } from "@/components/ui/button";
import { handleSignIn } from "@/lib/signInOutActions";

export const SignIn = ({ ...prop }) => {
  return (
    <Button {...prop} className="w-full" onClick={handleSignIn}>
      Sign In
    </Button>
  );
};
