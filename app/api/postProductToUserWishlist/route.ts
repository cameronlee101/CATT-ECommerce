import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

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

    await postProductToUserWishlist(user_email, product_id, quantity);

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

//Adds a product to a user's wishlist. If the product is already in the wishlist, it updates the quantity instead of adding a new entry.
//Parameters:user_email, product_id (string), quantity(integer)
//Return:None
async function postProductToUserWishlist(
  user_email: any,
  product_id: any,
  quantity: any,
) {
  try {
    const response = await pool.query(
      `SELECT * FROM userwishlist WHERE user_email = $1 AND product_id = $2;`,
      [user_email, product_id],
    );
    if (response.rows.length > 0) {
      await pool.query(
        `UPDATE userwishlist 
          SET quantity = $1
          WHERE user_email = $2 AND product_id = $3;`,
        [response.rows[0].quantity + quantity, user_email, product_id],
      );
    } else {
      await pool.query(
        `INSERT INTO userwishlist (user_email, product_id, quantity) VALUES($1, $2, $3);`,
        [user_email, product_id, quantity],
      );
    }
  } catch (error) {
    console.error("Error adding item to wish list:", error);
  }
}
