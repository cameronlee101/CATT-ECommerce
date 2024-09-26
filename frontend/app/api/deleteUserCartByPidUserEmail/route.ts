const { helpers } = require("../db");

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    let { user_email, product_id } = body;

    if (!user_email) {
      return Response.json({ error: "Invalid user email!" }, { status: 400 });
    }
    user_email = user_email.trim();

    product_id = parseInt(product_id);

    await helpers.deleteUserCartByPidUserEmail(user_email, product_id);

    return Response.json(
      { success: "Item removed from user cart successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Server failed to delete product from user cart!" },
      { status: 500 },
    );
  }
}
