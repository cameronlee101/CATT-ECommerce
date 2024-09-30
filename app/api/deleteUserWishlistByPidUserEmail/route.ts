import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

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

    await deleteUserWishlistByPidUserEmail(user_email, product_id);

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

//Removes a specific product from a user's wishlist.
//Parameters:user_email (String), product_id (Integer)
//Returns: none
async function deleteUserWishlistByPidUserEmail(
  user_email: any,
  product_id: any,
) {
  try {
    await pool.query(
      "DELETE FROM userwishlist WHERE user_email = $1 AND product_id = $2",
      [user_email, product_id],
    );
  } catch (error) {
    console.error("Error removing item from wish list:", error);
  }
}
