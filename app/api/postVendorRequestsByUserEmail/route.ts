import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function POST(req: NextRequest) {
  try {
    const { user_email } = await req.json();

    // Validate user_email
    if (!user_email || typeof user_email !== "string") {
      return NextResponse.json(
        { error: "Invalid user email!" },
        { status: 400 },
      );
    }

    // Call the helper function to post the vendor request by user email
    await postVendorRequestsByUserEmail(user_email);
    console.log("Vendor Request Posted Successfully!");

    return NextResponse.json(
      { msg: "Vendor Request Posted Successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to post vendor request:", error);
    return NextResponse.json(
      { error: "Failed to post vendor request." },
      { status: 500 },
    );
  }
}

//Submits a request to become a vendor for a specific user.
//Parameters:user_email (String)
//Returns: None
async function postVendorRequestsByUserEmail(user_email: any) {
  try {
    const response = await pool.query(
      `SELECT *
        FROM vendorrequest
        WHERE user_email = $1;`,
      [user_email],
    );
    if (response.rows.length === 0) {
      await pool.query(
        `INSERT INTO vendorrequest(user_email)
          VALUES ($1);`,
        [user_email],
      );
    }
  } catch (error) {
    console.error("Error creating vendor request:", error);
  }
}
