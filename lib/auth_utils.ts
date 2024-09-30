"use server";

import { cookies } from "next/headers";
import { Session, User } from "lucia";
import { lucia } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cache } from "react";
import { verify } from "@node-rs/argon2";
import pool from "@/lib/pool";
import { hash } from "@node-rs/argon2";
import { UserTypes } from "@/axios/user.types";
import { generateIdFromEntropySize } from "lucia";

export async function signup(formData: FormData): Promise<ActionResult> {
  const userEmail = formData.get("useremail");
  if (
    typeof userEmail !== "string" ||
    userEmail.length < 3 ||
    userEmail.length > 31 ||
    !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(userEmail)
  ) {
    return {
      error: "Invalid useremail",
    };
  }
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  const passwordHash = await hash(password, {
    // recommended minimum parameters
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  const userId = generateIdFromEntropySize(10); // 16 characters long

  // TODO: check if user email is already used
  try {
    let address_id = 1;
    await pool.query(
      `INSERT INTO userinfo (user_email, address_id) VALUES ($1, $2);`,
      [userEmail, address_id],
    );
    await pool.query(
      `INSERT INTO users (id, user_email, user_type, password_hash) VALUES ($1, $2, $3, $4);`,
      [userId, userEmail, UserTypes.Customer, passwordHash],
    );
  } catch (error) {
    console.error("Error adding user:", error);
  }

  const session = await lucia.createSession(userId, {
    user_type: UserTypes.Customer,
  });
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

export async function login(formData: FormData): Promise<ActionResult> {
  const useremail = formData.get("useremail");
  if (
    typeof useremail !== "string" ||
    useremail.length < 3 ||
    useremail.length > 31 ||
    !/^[a-z0-9@._-]+$/.test(useremail)
  ) {
    return {
      error: "Invalid useremail",
    };
  }
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  const existingUsers = (
    await pool.query<User>(`SELECT * FROM users WHERE user_email = $1`, [
      useremail,
    ])
  ).rows;
  if (!existingUsers) {
    // NOTE:
    // Returning immediately allows malicious actors to figure out valid useremails from response times,
    // allowing them to only focus on guessing passwords in brute-force attacks.
    // As a preventive measure, you may want to hash passwords even for invalid useremails.
    // However, valid useremails can be already be revealed with the signup page among other methods.
    // It will also be much more resource intensive.
    // Since protecting against this is non-trivial,
    // it is crucial your implementation is protected against brute-force attacks with login throttling etc.
    // If useremails are public, you may outright tell the user that the useremail is invalid.
    return {
      error: "Incorrect useremail or password",
    };
  }

  const existingUser = existingUsers[0];

  const validPassword = await verify(existingUser.password_hash, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  if (!validPassword) {
    return {
      error: "Incorrect useremail or password",
    };
  }

  const session = await lucia.createSession(existingUser.id, {
    user_type: existingUser.user_type,
  });
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

export async function logout(): Promise<ActionResult> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/login");
}

interface ActionResult {
  error: string;
}

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);
    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch {}
    return result;
  },
);
