const { helpers } = require("../../db");

export async function GET(
  req: Request,
  { params }: { params: { user_email: string } },
) {
  if (!params.user_email.trim()) {
    return Response.json({ error: "Invalid user email!" }, { status: 400 });
  }

  const user_email = params.user_email.trim();

  try {
    const products = await helpers.getUserWishlistByUserEmail(user_email);
    return Response.json(products, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Server failed to get user wishlist!" },
      { status: 500 },
    );
  }
}
