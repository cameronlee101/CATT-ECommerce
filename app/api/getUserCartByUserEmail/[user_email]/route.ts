import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function GET(
  req: NextRequest,
  { params }: { params: { user_email: string } },
) {
  if (!params.user_email.trim()) {
    return NextResponse.json({ error: "Invalid user email!" }, { status: 400 });
  }

  const user_email = params.user_email.trim();

  try {
    const products = await getUserCartByUserEmail(user_email);
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Server failed to get user cart!" },
      { status: 500 },
    );
  }
}

//Retrieves the contents of a user's shopping cart, including product details, prices, and quantities.
//Parameters:email (String)
//Returns: A list of cart items, including product details, prices, and quantities
async function getUserCartByUserEmail(email: string) {
  try {
    const query = `
      SELECT 
          product.product_id, 
          product.product_name, 
          product.product_description, 
          product.product_main_img,
          productprice.base_price, 
          productprice.current_price, 
          usercart.quantity,
          usercart.delivery,
          usercart.warehouse_id
      FROM product
      JOIN usercart ON product.product_id = usercart.product_id
      JOIN productprice ON product.product_id = productprice.product_id
      WHERE usercart.user_email = $1;
      `;
    const values = [email];
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      result.rows.forEach((row) => {
        row.product_main_img = row.product_main_img.toString("base64");
      });
    }
    return result.rows;
  } catch (error) {
    console.error("Error retrieving user cart by email:", error);
  }
}
