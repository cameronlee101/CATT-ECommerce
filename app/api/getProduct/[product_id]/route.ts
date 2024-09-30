import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function GET(
  req: NextRequest,
  { params }: { params: { product_id: string } },
) {
  if (!params.product_id) {
    return NextResponse.json({ error: "Invalid product ID!" }, { status: 400 });
  }

  let product_id = parseInt(params.product_id);

  try {
    // Check for non-positive product_id
    if (product_id <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID!" },
        { status: 400 },
      );
    }

    const response = await getProductInfoByPid(product_id);

    if (response?.length || 0 === 0) {
      return NextResponse.json(
        { error: "Product not found!" },
        { status: 404 },
      );
    } else {
      return NextResponse.json(response, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Server failed to get product!" },
      { status: 500 },
    );
  }
}

// Retrieves detailed information about a product by its product ID.
//Parameters:id (Integer)
//Returns: An object containing the product's details or an empty object if the product cannot be found.
async function getProductInfoByPid(id: number) {
  try {
    let productResponse = await pool.query(
      `
        SELECT p.product_id, p.product_name, p.product_main_img, p.product_description, p.product_date_added, p.user_email, p.product_avg_rating, p.active, pp.base_price, pp.current_price
        FROM product p
        JOIN productprice pp ON p.product_id = pp.product_id
        WHERE p.product_id = $1;
      `,
      [id],
    );
    let reply: any;
    if (productResponse.rows.length > 0) {
      let product = productResponse.rows[0];
      reply = {
        product_id: product.product_id,
        product_name: product.product_name,
        product_main_img: product.product_main_img.toString("base64"),
        product_description: product.product_description,
        product_date_added: product.product_date_added,
        user_email: product.user_email,
        product_avg_rating: product.product_avg_rating,
        base_price: product.base_price,
        current_price: product.current_price,
        tags: [],
        additional_img: [],
        active: product.active,
      };
      let tagsResponse = await pool.query(
        `
          SELECT pt.tag_id, t.tag_name 
          FROM producttags pt
          JOIN tag t ON pt.tag_id = t.tag_id
          WHERE pt.product_id = $1;
        `,
        [id],
      );
      reply.tags = tagsResponse.rows.map((tag) => ({
        id: tag.tag_id,
        tag: tag.tag_name,
      }));
      let imagesResponse = await pool.query(
        `
          SELECT image 
          FROM image
          WHERE product_id = $1;
        `,
        [id],
      );
      reply.additional_img = imagesResponse.rows.map((imgRow) =>
        imgRow.image.toString("base64"),
      );
    }

    return reply;
  } catch (error) {
    console.error("Error retrieving product information:", error);
  }
}
