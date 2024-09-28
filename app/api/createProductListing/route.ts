import { NextRequest, NextResponse } from "next/server";
const { helpers } = require("../db");

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
    const product_images: ArrayBuffer[] = [];
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

    await helpers.createProductListing(
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
