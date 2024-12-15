import { UserTypes } from "@/axios/user.types";
import { isAuthenticated } from "@/lib/auth_utils";
import React from "react";

async function layout({ children }: { children: any }) {
  await isAuthenticated(UserTypes.Vendor);

  return <>{children}</>;
}

export default layout;
