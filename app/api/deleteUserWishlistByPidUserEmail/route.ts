import { NextRequest, NextResponse } from "next/server";
const { helpers } = require("../db");

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    let { user_email, product_id } = body;

    if (!user_email) {
      return NextResponse.json(
        { error: "Invalid user email!" },
        { status: 400 },
      );
    }
    user_email = user_email.trim();

    product_id = parseInt(product_id);

    await helpers.deleteUserWishlistByPidUserEmail(user_email, product_id);

    return NextResponse.json(
      { msg: "Item removed from user wishlist successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Server failed to delete product from user wishlist!" },
      { status: 500 },
    );
  }
}
