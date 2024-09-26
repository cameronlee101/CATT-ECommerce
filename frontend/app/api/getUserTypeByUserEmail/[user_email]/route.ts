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
    const users = await helpers.getUserTypeByUserEmail(user_email);

    if (users.length > 0) {
      return Response.json({ type: users[0].type }, { status: 200 });
    } else {
      return Response.json({ error: "User not found!" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Server failed to get user!" },
      { status: 500 },
    );
  }
}
