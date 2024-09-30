import { DatabaseUserAttributes, Lucia } from "lucia";
import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import { UserTypes } from "@/axios/user.types";
import pool from "@/lib/pool";

const adapter = new NodePostgresAdapter(pool, {
  user: "users",
  session: "user_session",
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // this sets cookies with super long expiration
    // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
    expires: false,
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes: DatabaseUserAttributes) => {
    return {
      user_email: attributes.user_email,
      user_type: attributes.user_type,
      password_hash: attributes.password_hash,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
  interface DatabaseUserAttributes {
    user_email: string;
    user_type: UserTypes;
    password_hash: string;
  }
}
