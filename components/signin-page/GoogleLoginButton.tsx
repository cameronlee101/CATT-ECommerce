"use client";

import { createNewUser, getUserType } from "@/axios/user";
import { GoogleCredentials, login } from "@/app/auth";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";
import { UserTypes } from "@/axios/user.types";

// Displays a button that allows the user to log in using their google account
export function GoogleLoginButton() {
  const router = useRouter();

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse: CredentialResponse) => {
        const user_email = (
          jwt.decode(credentialResponse.credential!) as GoogleCredentials
        ).email;
        const user_type = await getUserType(user_email);

        // If the user exists, logs them in
        // If the user does not exist, creates a new customer account for them and logs them in
        if (user_type) {
          await login(credentialResponse, user_type);
        } else {
          await createNewUser(user_email, UserTypes.Customer);
          await login(credentialResponse, UserTypes.Customer);
        }

        router.push("/");
      }}
      onError={() => {
        console.error("Login Failed");
      }}
    />
  );
}
