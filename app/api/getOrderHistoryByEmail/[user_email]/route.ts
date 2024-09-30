import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function GET(
  req: NextRequest,
  { params }: { params: { user_email: string } },
) {
  try {
    const { user_email } = params;

    // Get the order history based on the email
    const history = await getOrderHistoryByEmail(user_email);

    return NextResponse.json(history, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to get order History" },
      { status: 500 },
    );
  }
}

async function getOrderHistoryByEmail(user_email: string) {
  try {
    let reply: any[] = [];
    const response = await pool.query(
      `
      SELECT o.order_id, o.product_id, o.quantity, o.delivery, o.warehouse_id, o.order_date, p.product_name, p.product_main_img, p.product_description, p.product_date_added, p.product_avg_rating, p.active, pp.base_price, pp.current_price
      FROM orderinfo o
      JOIN product p ON o.product_id = p.product_id
      JOIN productprice pp ON o.product_id = pp.product_id
      WHERE o.user_email = $1;      
      `,
      [user_email],
    );
    response.rows.forEach((row) => {
      let order = reply.find((o) => o.order_id === row.order_id);
      if (!order) {
        order = {
          order_id: row.order_id,
          order_date: row.order_date,
          products: [],
        };
        reply.push(order);
      }
      order.products.push({
        product_id: row.product_id,
        product_name: row.product_name,
        product_main_img: row.product_main_img.toString("base64"),
        product_description: row.product_description,
        quantity: row.quantity,
        delivery: row.delivery,
        warehouse_id: row.warehouse_id,
        product_date_added: row.product_date_added,
        current_price: row.current_price,
        base_price: row.base_price,
      });
    });
    return reply;
  } catch (error) {
    console.error("Error getting order history:", error);
  }
}
