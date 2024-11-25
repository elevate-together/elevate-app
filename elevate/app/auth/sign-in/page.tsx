import { redirect } from "next/navigation";
import { SignInPage } from "@/app/auth/sign-in/sign-in";
import { checkIsAuthenticated } from "@/lib/auth/checkIsAuthenticated";

const SignIn: React.FC = async () => {
  const isAuthenticated = await checkIsAuthenticated();

  if (isAuthenticated) {
    redirect("/dashboard");
  } else {
    return <SignInPage />;
  }
};

export default SignIn;