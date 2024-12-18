"use client";
import React, { useState, useTransition } from "react";
import { Button, Input } from "@nextui-org/react";
import { signup } from "@/lib/auth_utils";

function Page() {
  const [responseMessage, setResponseMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSignup = async (formData: FormData) => {
    if (!isPending) {
      startTransition(async () => {
        const response = await signup(formData);

        if (response.error) {
          setResponseMessage("Error: " + response.error);
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="mb-8 text-xl">Create an account</h1>
      <form className="flex flex-col" action={handleSignup}>
        <Input
          className="mb-4"
          type="email"
          name="user_email"
          id="user_email"
          label="Email"
          labelPlacement="outside"
          placeholder="Enter Your Email"
          maxLength={255}
          isRequired
        />
        <Input
          className="mb-4"
          type="password"
          name="password"
          id="password"
          label="Password"
          labelPlacement="outside"
          placeholder="Enter Your Password"
          maxLength={255}
          isRequired
        />
        <Input
          type="password"
          name="confirm_password"
          id="confirm_password"
          label="Confirm Password"
          labelPlacement="outside"
          placeholder="Confirm Your Password"
          maxLength={255}
          isRequired
        />
        <br />
        <Button type="submit" className="max-w-fit self-center">
          {isPending ? "Loading..." : "Continue"}
        </Button>
      </form>
      <div className="mt-4 h-6">
        <p className="text-red-600">{responseMessage}</p>
      </div>
      <div className="flex mb-4 mt-12">
        <p className="mr-2">Already have an account?</p>
        <a className="text-blue-600" href="/signin">
          Sign in
        </a>
      </div>
      <a className="text-blue-600" href="/">
        Back to Home
      </a>
    </main>
  );
}

export default Page;
