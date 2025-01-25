import { Button } from "@/components/ui/button";
import { handleSignIn } from "@/lib/signInOutActions";

const SignInPage = () => {
  return <Button onClick={handleSignIn}>Sign In</Button>;
};

export default SignInPage;
