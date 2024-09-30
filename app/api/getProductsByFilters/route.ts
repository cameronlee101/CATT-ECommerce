import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const product_name = searchParams.get("product_name")?.trim() || "";
  const product_avg_rating_min = searchParams.get("product_avg_rating_min")
    ? parseFloat(searchParams.get("product_avg_rating_min") || "0.0")
    : 0.0;
  const product_avg_rating_max = searchParams.get("product_avg_rating_max")
    ? parseFloat(searchParams.get("product_avg_rating_max") || "5.0")
    : 5.0;
  const current_price_min = searchParams.get("current_price_min")
    ? parseFloat(searchParams.get("current_price_min") || "0.0")
    : 0.0;
  const current_price_max = searchParams.get("current_price_max")
    ? parseFloat(searchParams.get("current_price_max") || "2147483647")
    : 2147483647; // SQL MAX INT
  const product_date_added_before = searchParams.get(
    "product_date_added_before",
  )
    ? parseInt(
        searchParams.get("product_date_added_before") ||
          `${new Date().getTime()}`,
      )
    : new Date().getTime();
  const product_date_added_after = searchParams.get("product_date_added_after")
    ? parseInt(searchParams.get("product_date_added_after") || "0")
    : 0;
  const tags = searchParams.get("tags")
    ? searchParams.get("tags")?.trim().split(",") || []
    : [];
  const user_email = searchParams.get("user_email")?.trim() || "";

  let responseIds: number[] = [];

  try {
    // Get products by name
    let response = await getProductIdByName(product_name);
    response?.forEach((row: { product_id: number }) => {
      responseIds.push(row.product_id);
    });

    // Get products by rating
    response = await getProductIdByRating(
      product_avg_rating_min,
      product_avg_rating_max,
    );
    let tempRows = response?.map(
      (row: { product_id: number }) => row.product_id,
    );
    responseIds = responseIds.filter((id) => tempRows?.includes(id));

    // Get products by price
    response = await getProductIdByPrice(current_price_min, current_price_max);
    tempRows = response?.map((row: { product_id: number }) => row.product_id);
    responseIds = responseIds.filter((id) => tempRows?.includes(id));

    // Get products by date added
    response = await getProductIdByDateAdded(
      product_date_added_after,
      product_date_added_before,
    );
    tempRows = response?.map((row: { product_id: number }) => row.product_id);
    responseIds = responseIds.filter((id) => tempRows?.includes(id));

    // Get products by user email
    response = await getProductIdByUserEmail(user_email);
    tempRows = response?.map((row: { product_id: number }) => row.product_id);
    responseIds = responseIds.filter((id) => tempRows?.includes(id));

    // Get products by tags
    if (tags.length > 0) {
      response = await getProductIdByTags(tags);
      tempRows = response?.map((row: { product_id: number }) => row.product_id);
      responseIds = responseIds.filter((id) => tempRows?.includes(id));
    }

    // Fetch product info for filtered product IDs
    let reply: any[] = [];
    for (const id of responseIds) {
      const product = await getProductInfoByPid(id);
      if (product.active === true) {
        reply.push({
          product_id: product.product_id,
          product_name: product.product_name,
          product_main_img: product.product_main_img.toString("base64"),
          product_description: product.product_description,
          product_date_added: product.product_date_added,
          product_avg_rating: product.product_avg_rating,
          user_email: product.user_email,
          base_price: product.base_price,
          current_price: product.current_price,
          tags: product.tags,
          additional_img: product.additional_img,
          active: product.active,
        });
      }
    }

    return NextResponse.json(reply, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server failed to get products!" },
      { status: 500 },
    );
  }
}

// TODO: consolidate this with the getProduct endpoint
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

//Retrieves the IDs of products matching a specific name.
//Parameters:product_name (String)
//Returns: An array of objects, each containing the product_id of a product that matches the specified name.
async function getProductIdByName(product_name: string) {
  try {
    let response;
    let queryStr = `SELECT product_id FROM product `;
    if (product_name !== "") {
      response = await pool.query(
        (queryStr += `WHERE product_name ILIKE $1;`),
        [`%${product_name}%`],
      );
    } else {
      response = await pool.query((queryStr += `;`));
    }
    return response.rows;
  } catch (error) {
    console.error("Error in getProductIdByName:", error);
  }
}
//Fetches the IDs of products within a specified rating range.
//Parameters:product_rating_min (Float),   product_rating_max (Float)
//Returns: An array of objects, each containing the product_id of a product whose average rating falls within the specified range.
async function getProductIdByRating(
  product_rating_min: number,
  product_rating_max: number,
) {
  try {
    const response = await pool.query(
      `
          SELECT product_id 
          FROM product 
          WHERE product_avg_rating >= $1 AND product_avg_rating <= $2;
        `,
      [product_rating_min, product_rating_max],
    );
    return response.rows;
  } catch (error) {
    console.error("Error in getProductIdByRating:", error);
  }
}
//Retrieves the IDs of products whose price falls within a specified range.
//Parameters: product_price_min (Float) ,   product_price_max (Float):
//Returns: An array of objects, each containing the product_id of a product whose current price is within the specified range.
async function getProductIdByPrice(
  product_price_min: number,
  product_price_max: number,
) {
  try {
    const response = await pool.query(
      `
        SELECT product_id 
        FROM productprice 
        WHERE current_price >= $1 AND current_price <= $2;
      `,
      [product_price_min, product_price_max],
    );
    return response.rows;
  } catch (error) {
    console.error("Error in getProductIdByPrice:", error);
  }
}
// Fetches the IDs of products added to the catalog within a specified date range.
//Parameters: product_date_added_after (BigInt),    product_date_added_before (BigInt)
//Returns: An array of objects, each containing the product_id of a product that was added to the catalog within the specified date range.
async function getProductIdByDateAdded(
  product_date_added_after: number,
  product_date_added_before: number,
) {
  try {
    const response = await pool.query(
      `
        SELECT product_id 
        FROM product 
        WHERE product_date_added >= $1 AND product_date_added <= $2;
      `,
      [product_date_added_after, product_date_added_before],
    );
    return response.rows;
  } catch (error) {
    console.error("Error in getProductIdByDateAdded:", error);
  }
}
//Retrieves product IDs associated with a specific user's email.
//Parameters: user_email (String)
//Returns: An array of product IDs associated with the given user's email.

async function getProductIdByUserEmail(user_email: string) {
  try {
    let response;
    let queryStr = `SELECT product_id FROM product `;
    if (user_email !== "") {
      response = await pool.query((queryStr += `WHERE user_email = $1;`), [
        user_email,
      ]);
    } else {
      response = await pool.query((queryStr += `;`));
    }
    return response.rows;
  } catch (error) {
    console.error("Error in getProductIdByUserEmail:", error);
  }
}
//Fetches product IDs that match a list of tags.
//Parameters: tags (Array<String>)
//Returns: An array of product objects that match the specified tags. Each object includes product details. If no matching products are found, returns an empty array.
async function getProductIdByTags(tags: string[]) {
  try {
    const tagResponse = await pool.query(
      "SELECT tag_id FROM tag WHERE tag_name = ANY($1);",
      [tags],
    );
    const tagIds = tagResponse.rows.map((row) => row.tag_id);
    let productIds: any[] = [];
    for (const tagId of tagIds) {
      const response = await pool.query(
        `SELECT product_id FROM producttags WHERE tag_id = $1;`,
        [tagId],
      );
      response.rows.forEach((row) => {
        if (!productIds.includes(row.product_id)) {
          productIds.push(row.product_id);
        }
      });
    }
    if (productIds.length > 0) {
      const response = await pool.query(
        `SELECT * FROM product WHERE product_id = ANY($1);`,
        [productIds],
      );
      return response.rows;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error in getProductIdByTags:", error);
  }
}
