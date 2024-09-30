import React from "react";
import { Button, Input } from "@nextui-org/react";
import { login } from "@/lib/auth_utils";

function Page() {
  return (
    <>
      <h1>Sign in</h1>
      <form action={login}>
        <label htmlFor="useremail">Email</label>
        <Input name="useremail" id="useremail" />
        <br />
        <label htmlFor="password">Password</label>
        <Input type="password" name="password" id="password" />
        <br />
        <Button type="submit">Continue</Button>
      </form>
      <a className="text-blue-600" href="/signup">
        Sign up
      </a>
      <a className="text-blue-600 ml-6" href="/">
        Home
      </a>
    </>
  );
}

export default Page;
