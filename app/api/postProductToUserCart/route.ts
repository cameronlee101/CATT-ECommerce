import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { user_email, product_id, quantity, delivery, warehouse_id } = body;

    if (!user_email) {
      return NextResponse.json(
        { error: "Invalid user email!" },
        { status: 400 },
      );
    }
    user_email = user_email.trim();

    product_id = parseInt(product_id);
    quantity = parseInt(quantity);

    await postProductToUserCart(
      user_email,
      product_id,
      quantity,
      delivery,
      warehouse_id,
    );

    return NextResponse.json(
      { success: "Item added to user cart successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Server failed to add product to the user cart!" },
      { status: 500 },
    );
  }
}

//Adds a specified quantity of a product to a user's cart. If the product is already present, it updates the quantity.
//Parameters: user_email (string), quantity, product_id, warehouse_id (integer), delivery (boolean)
async function postProductToUserCart(
  user_email: any,
  product_id: any,
  quantity: any,
  delivery: any,
  warehouse_id: any,
) {
  try {
    await pool.query(`BEGIN`);
    const response = await pool.query(
      `SELECT * FROM usercart WHERE user_email = $1 AND product_id = $2;`,
      [user_email, product_id],
    );
    if (response.rows.length === 0) {
      await pool.query(
        `INSERT INTO usercart (user_email, product_id, quantity, delivery, warehouse_id) VALUES($1, $2, $3, $4, $5);`,
        [user_email, product_id, quantity, delivery, warehouse_id],
      );
    } else {
      await pool.query(
        `UPDATE usercart SET quantity = $1 WHERE user_email = $2 AND product_id = $3;`,
        [response.rows[0].quantity + quantity, user_email, product_id],
      );
    }
    await pool.query(`COMMIT`);
  } catch (error) {
    console.error("Error adding item to cart:", error);
  }
}
