"use client";
import React, { useState } from "react";
import { Button, Input } from "@nextui-org/react";
import { signup } from "@/lib/auth_utils";

function Page() {
  const [responseMessage, setResponseMessage] = useState("");

  const handleSignup = async (formData: FormData) => {
    const response = await signup(formData);

    if (response.error) {
      setResponseMessage("Error: " + response.error);
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
          type="password"
          name="password"
          id="password"
          label="Password"
          labelPlacement="outside"
          placeholder="Enter Your Password"
          maxLength={255}
          isRequired
        />
        <br />
        <Button type="submit" className="max-w-fit self-center">
          Continue
        </Button>
      </form>
      {responseMessage && (
        <div className="mt-4">
          {responseMessage.includes("Success") ? (
            <p className="text-green-600">{responseMessage}</p>
          ) : (
            <p className="text-red-600">{responseMessage}</p>
          )}
        </div>
      )}

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
