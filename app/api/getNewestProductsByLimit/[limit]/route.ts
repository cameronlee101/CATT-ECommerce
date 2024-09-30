import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function GET(
  req: NextRequest,
  { params }: { params: { limit: string } },
) {
  const limit = params.limit ? parseInt(params.limit) : -1; // -1 is unlimited

  try {
    const products = await getNewestProductsByLimit(limit);

    if (products?.length || 0 > 0) {
      return NextResponse.json(products, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Products not found!" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server failed to get products!" },
      { status: 500 },
    );
  }
}

//Retrieves the most recently added products, subject to a specified limit. If no limit is provided or if the limit is negative, all products considered active are returned.
//Parameters:limit (Integer)
//Returns: An array of the newest products, each including details such as product ID, name, description, main image , date added, average rating,
// base price, and current price. Products are ordered by their addition date, with the most recent first.
async function getNewestProductsByLimit(limit: number) {
  try {
    let query = `
        SELECT p.product_id, p.product_name, p.product_description, p.product_main_img, p.product_date_added, p.product_avg_rating, pp.base_price, pp.current_price
        FROM product p
        JOIN productprice pp ON p.product_id = pp.product_id
        WHERE p.active = true
        ORDER BY p.product_date_added DESC
      `;
    if (limit >= 0) {
      query += ` LIMIT $1;`;
      const result = await pool.query(query, [limit]);
      result.rows.forEach((row) => {
        row.product_main_img = row.product_main_img.toString("base64");
      });
      return result.rows;
    } else {
      const result = await pool.query(query);
      result.rows.forEach((row) => {
        row.product_main_img = row.product_main_img.toString("base64");
      });
      return result.rows;
    }
  } catch (error) {
    console.error("Error retrieving newest products:", error);
  }
}
