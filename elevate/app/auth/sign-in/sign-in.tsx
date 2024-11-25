"use client";
import { handleGoogleSignIn } from "@/lib/auth/googleSignInServerAction";

export const SignInPage: React.FC = () => {
  return (
    <div className="signin-page">
      <div className="signin-card">
        <h2>Sign In</h2>
        <div className="social-logins">
          <button className="google" onClick={() => handleGoogleSignIn()}>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};
