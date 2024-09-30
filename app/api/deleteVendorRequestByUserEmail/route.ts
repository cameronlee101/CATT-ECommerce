import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function DELETE(req: NextRequest) {
  try {
    const { user_email } = await req.json();

    // Call the helper function to delete the vendor request by user email
    await deleteVendorRequestByUserEmail(user_email);
    console.log("Vendor Request Deleted Successfully!");

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Failed to delete vendor request:", error);
    return NextResponse.json(
      { error: "Failed to delete vendor request." },
      { status: 500 },
    );
  }
}

//Deletes a vendor request for a specific user based on their email.
//Parameters:user_email (String)
//Returns: None
async function deleteVendorRequestByUserEmail(user_email: any) {
  try {
    const response = await pool.query(
      `DELETE FROM vendorrequest
        WHERE user_email = $1;`,
      [user_email],
    );
    return response.rows;
  } catch (error) {
    console.error("Error deleting vendor request:", error);
  }
}
