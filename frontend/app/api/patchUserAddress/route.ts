const { helpers } = require("../db");

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    let { user_email, street_name, city, province, post_code, country } = body;

    if (!user_email) {
      return Response.json({ error: "Invalid user email!" }, { status: 400 });
    }
    user_email = user_email.trim();

    if (!street_name) {
      return Response.json({ error: "Invalid street name!" }, { status: 400 });
    }
    street_name = street_name.trim();

    if (!city) {
      return Response.json({ error: "Invalid city!" }, { status: 400 });
    }
    city = city.trim();

    if (!province) {
      return Response.json({ error: "Invalid province!" }, { status: 400 });
    }
    province = province.trim();

    if (!post_code) {
      return Response.json({ error: "Invalid post code!" }, { status: 400 });
    }
    post_code = post_code.trim();

    if (!country) {
      return Response.json({ error: "Invalid country!" }, { status: 400 });
    }
    country = country.trim();

    await helpers.patchUserAddress(
      user_email,
      street_name,
      city,
      province,
      post_code,
      country,
    );

    return Response.json(
      { success: "User address modified successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Server failed to modify user address!" },
      { status: 500 },
    );
  }
}
