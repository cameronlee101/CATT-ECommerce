const { helpers } = require("../db");

export async function GET() {
  try {
    const tags = await helpers.getAllProductTags();
    return new Response(JSON.stringify(tags), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch product tags" }),
      { status: 500 },
    );
  }
}
