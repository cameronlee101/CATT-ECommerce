import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function GET(
  req: NextRequest,
  { params }: { params: { limit: string } },
) {
  const limit = params.limit ? parseInt(params.limit) : -1; // -1 is unlimited

  try {
    const products = await getProductsOnSaleByLimit(limit);

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

//Fetches products currently on sale, up to a specified limit. If the limit is set to a non-positive number, it returns all products on sale.
//Parameters:limit (Integer)
//Returns: An array of products on sale, each including product ID, name, description, main image, date added, average rating, base price, and current price. Products are ordered by descending current price.
async function getProductsOnSaleByLimit(limit: number) {
  try {
    let query = `
        SELECT p.product_id, p.product_name, p.product_description, p.product_main_img, p.product_date_added, p.product_avg_rating, pp.base_price, pp.current_price
        FROM product p
        JOIN productprice pp ON p.product_id = pp.product_id
        WHERE pp.current_price < pp.base_price AND p.active = true
        ORDER BY pp.current_price DESC
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
    console.error("Error retrieving products on sale:", error);
  }
}
