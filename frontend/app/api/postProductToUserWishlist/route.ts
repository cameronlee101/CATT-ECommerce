import { NextRequest, NextResponse } from "next/server";
const { helpers } = require("../db");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { user_email, product_id, quantity } = body;

    if (!user_email) {
      return NextResponse.json(
        { error: "Invalid user email!" },
        { status: 400 },
      );
    }
    user_email = user_email.trim();

    product_id = parseInt(product_id);
    quantity = parseInt(quantity);

    await helpers.postProductToUserWishlist(user_email, product_id, quantity);

    return NextResponse.json(
      { success: "Item added to user wishlist successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Server failed to add product to the user wishlist!" },
      { status: 500 },
    );
  }
}
