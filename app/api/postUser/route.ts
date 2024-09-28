import { NextRequest, NextResponse } from "next/server";
const db = require("@/app/api/db");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let {
      street_name,
      city,
      province,
      post_code,
      country,
      user_email,
      user_type,
    } = body;

    let addressGiven = 1;

    // Validate user_email
    if (!user_email) {
      return NextResponse.json(
        { error: "Invalid user email!" },
        { status: 400 },
      );
    }
    user_email = user_email.trim();

    // Check if address is incomplete
    if (!street_name || !city || !province || !post_code || !country) {
      addressGiven = 0;
    } else {
      street_name = street_name.trim();
      city = city.trim();
      province = province.trim();
      post_code = post_code.trim();
      country = country.trim();
    }

    // Validate user_type
    if (!user_type) {
      return NextResponse.json({ error: "Invalid type!" }, { status: 400 });
    }
    user_type = user_type.trim().toLowerCase();

    if (user_type !== "customer" && user_type !== "vendor") {
      return NextResponse.json({ error: "Invalid type!" }, { status: 400 });
    }

    const type_id = user_type === "vendor" ? 1 : 2;

    // Post user data to the database
    await db.postUser(
      street_name,
      city,
      province,
      post_code,
      country,
      user_email,
      type_id,
      addressGiven,
    );

    return NextResponse.json(
      { success: "User added successfully!" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Server failed to add user!" },
      { status: 500 },
    );
  }
}
