const { helpers } = require("../../db");

export async function GET(
  req: Request,
  { params }: { params: { limit: string } },
) {
  const limit = params.limit ? parseInt(params.limit) : -1; // -1 is unlimited

  try {
    const products = await helpers.getNewestProductsByLimit(limit);

    if (products.length > 0) {
      return Response.json(products, { status: 200 });
    } else {
      return Response.json({ error: "Products not found!" }, { status: 404 });
    }
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Server failed to get products!" },
      { status: 500 },
    );
  }
}
