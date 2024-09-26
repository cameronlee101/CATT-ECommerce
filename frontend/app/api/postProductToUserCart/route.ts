const { helpers } = require("../../db");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { user_email, product_id, quantity, delivery, warehouse_id } = body;

    if (!user_email) {
      return Response.json({ error: "Invalid user email!" }, { status: 400 });
    }
    user_email = user_email.trim();

    product_id = parseInt(product_id);
    quantity = parseInt(quantity);

    await helpers.postProductToUserCart(
      user_email,
      product_id,
      quantity,
      delivery,
      warehouse_id,
    );

    return Response.json(
      { success: "Item added to user cart successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Server failed to add product to the user cart!" },
      { status: 500 },
    );
  }
}
