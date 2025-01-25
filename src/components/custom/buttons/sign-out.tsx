import { Button } from "@/components/ui/button";
import { handleSignOut } from "@/lib/signInOutActions";

export const SignOut = ({ ...prop }) => {
  return (
    <Button {...prop} className="w-full" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
};
