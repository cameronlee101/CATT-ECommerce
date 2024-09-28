import { NextRequest, NextResponse } from "next/server";
const db = require("@/app/api/db");

export async function POST(req: NextRequest) {
  try {
    await db.init();
    await db.insertTestData();
    console.log("Success: Data inserted succesfully!");
    return NextResponse.json(
      { msg: "Success: Data inserted succesfully!" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error: Data Not Inserted.", error);
    return NextResponse.json(
      { msg: "Error: Data Not Inserted." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await db.deleteAllTables();
    console.log("Success: Tables deleted succesfully!");
    return NextResponse.json(
      { msg: "Success: Tables deleted succesfully!" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error: Tables Not deleted.", error);
    return NextResponse.json(
      { msg: "Error: Tables Not deleted." },
      { status: 500 },
    );
  }
}
