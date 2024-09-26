const { helpers } = require("../db");

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    let { user_email, user_type } = body;

    if (!user_email) {
      return Response.json({ error: "Invalid user email!" }, { status: 400 });
    }
    user_email = user_email.trim();

    if (!user_type) {
      return Response.json({ error: "Invalid type!" }, { status: 400 });
    }
    user_type = user_type.trim().toLowerCase();

    if (user_type !== "customer" && user_type !== "vendor") {
      return Response.json({ error: "Invalid type2!" }, { status: 400 });
    }

    const type_id = user_type === "vendor" ? 1 : 2;

    await helpers.patchUserType(user_email, type_id);

    return Response.json(
      { success: "User type modified successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Server failed to modify user type!" },
      { status: 500 },
    );
  }
}
