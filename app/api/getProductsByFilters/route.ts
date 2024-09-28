import { NextRequest, NextResponse } from "next/server";
const { helpers } = require("../db");

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
    let response = await helpers.getProductIdByName(product_name);
    response.forEach((row: { product_id: number }) => {
      responseIds.push(row.product_id);
    });

    // Get products by rating
    response = await helpers.getProductIdByRating(
      product_avg_rating_min,
      product_avg_rating_max,
    );
    let tempRows = response.map(
      (row: { product_id: number }) => row.product_id,
    );
    responseIds = responseIds.filter((id) => tempRows.includes(id));

    // Get products by price
    response = await helpers.getProductIdByPrice(
      current_price_min,
      current_price_max,
    );
    tempRows = response.map((row: { product_id: number }) => row.product_id);
    responseIds = responseIds.filter((id) => tempRows.includes(id));

    // Get products by date added
    response = await helpers.getProductIdByDateAdded(
      product_date_added_after,
      product_date_added_before,
    );
    tempRows = response.map((row: { product_id: number }) => row.product_id);
    responseIds = responseIds.filter((id) => tempRows.includes(id));

    // Get products by user email
    response = await helpers.getProductIdByUserEmail(user_email);
    tempRows = response.map((row: { product_id: number }) => row.product_id);
    responseIds = responseIds.filter((id) => tempRows.includes(id));

    // Get products by tags
    if (tags.length > 0) {
      response = await helpers.getProductIdByTags(tags);
      tempRows = response.map((row: { product_id: number }) => row.product_id);
      responseIds = responseIds.filter((id) => tempRows.includes(id));
    }

    // Fetch product info for filtered product IDs
    let reply: any[] = [];
    for (const id of responseIds) {
      const product = await helpers.getProductInfoByPid(id);
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
