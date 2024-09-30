import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function POST(req: NextRequest) {
  try {
    const formData: FormData = await req.formData();

    const product_name: string | null =
      formData.get("product_name")?.toString() || null;
    const product_description: string | null =
      formData.get("product_description")?.toString() || null;
    const base_price: string | null =
      formData.get("base_price")?.toString() || null;
    const current_price: string | null =
      formData.get("current_price")?.toString() || null;
    const user_email: string | null =
      formData.get("user_email")?.toString() || null;
    const product_images: Buffer[] = [];
    for (const val of formData.getAll("product_images[]")) {
      const arrayBuffer = await (val as File).arrayBuffer();
      product_images.push(Buffer.from(arrayBuffer));
    }
    const warehouse_ids: string[] = [];
    formData
      .getAll("warehouse_ids[]")
      .forEach((val) => warehouse_ids.push(val.toString()));
    const quantities: string[] = [];
    formData
      .getAll("quantities[]")
      .forEach((val) => quantities.push(val.toString()));
    const product_tags: string[] = [];
    formData
      .getAll("product_tags[]")
      .forEach((val) => product_tags.push(val.toString()));

    await createProductListing(
      product_name,
      product_description,
      base_price,
      current_price,
      user_email,
      warehouse_ids,
      quantities,
      product_images,
      product_tags,
    );
    return NextResponse.json(
      { msg: "Product Created Successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 },
    );
  }
}

// Creates a new product listing, including product details, price, associated warehouse stock, images, and tags.
//Parameters:product_name (String),product_description (String),base_price (Float),current_price (Float), user_email (String),warehouse_ids (Array of Integers),quantities (Array of Integers),product_images (Array of BYTEA),product_tags (Array of Strings)
//Returns:None
async function createProductListing(
  product_name: any,
  product_description: any,
  base_price: any,
  current_price: any,
  user_email: any,
  warehouse_ids: any[],
  quantities: any[],
  product_images: any[],
  product_tags: any[],
) {
  try {
    const product_date_added = Math.floor(new Date().getTime() / 1000);
    await pool.query(`BEGIN`);
    let response = await pool.query(
      `INSERT INTO product (product_name, product_main_img, product_description, product_date_added, user_email, product_avg_rating, active)
            VALUES ($1, $2, $3, $4, $5, $6, $7) returning product_id;`,
      [
        product_name,
        product_images[0],
        product_description,
        new Date().getTime(),
        user_email,
        parseFloat((Math.random() * 5).toFixed(1)),
        true,
      ],
    );
    const product_id = response.rows[0].product_id;
    await pool.query(
      `INSERT INTO productprice (product_id, base_price, current_price)
            VALUES ($1, $2, $3);`,
      [product_id, base_price, current_price],
    );
    if (product_images.length > 1) {
      for (let i = 1; i < product_images.length; i++) {
        await pool.query(
          `INSERT INTO image (product_id, image)
                    VALUES ($1, $2);`,
          [product_id, product_images[i]],
        );
      }
    }
    for (let i = 0; i < warehouse_ids.length; i++) {
      let response = await pool.query(
        `SELECT warehouse_id FROM warehouse WHERE warehouse_id = $1;`,
        [warehouse_ids[i]],
      );
      if (response.rows.length === 0) {
        throw new Error("Warehouse id not found");
      }
      await pool.query(
        `INSERT INTO warehousestock (warehouse_id, product_id, quantity)
                VALUES ($1, $2, $3);`,
        [warehouse_ids[i], product_id, quantities[i]],
      );
    }
    let tag_id;
    for (let i = 0; i < product_tags.length; i++) {
      response = await pool.query(
        `SELECT * 
            FROM tag
            WHERE tag_name = $1;`,
        [product_tags[i]],
      );
      if (response.rows.length === 0) {
        let resp = await pool.query(
          `INSERT INTO tag(tag_name)
                VALUES ($1)
                RETURNING tag_id;`,
          [product_tags[i]],
        );
        tag_id = resp.rows[0].tag_id;
      } else {
        tag_id = response.rows[0].tag_id;
      }
      await pool.query(
        `INSERT INTO producttags(product_id, tag_id)
                VALUES ($1, $2);`,
        [product_id, tag_id],
      );
    }
    await pool.query(`COMMIT`);
  } catch (error) {
    console.error("Error creating product listing:", error);
  }
}
