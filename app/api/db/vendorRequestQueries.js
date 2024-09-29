import pool from "./pool";

//Submits a request to become a vendor for a specific user.
//Parameters:user_email (String)
//Returns: None
export async function postVendorRequestsByUserEmail(user_email) {
  try {
    const response = await pool.query(
      `SELECT *
        FROM vendorrequest
        WHERE user_email = $1;`,
      [user_email],
    );
    if (response.rows.length === 0) {
      await pool.query(
        `INSERT INTO vendorrequest(user_email)
          VALUES ($1);`,
        [user_email],
      );
    }
  } catch (error) {
    console.error("Error creating vendor request:", error);
  }
}

//Retrieves all vendor requests.
//Returns: An array of all vendor requests in the database.
export async function getAllVendorRequests() {
  try {
    const response = await pool.query(
      `SELECT *
        FROM vendorrequest;`,
    );
    return response.rows;
  } catch (error) {
    console.error("Error retrieving vendor requests:", error);
  }
}

//Deletes a vendor request for a specific user based on their email.
//Parameters:user_email (String)
//Returns: None
export async function deleteVendorRequestByUserEmail(user_email) {
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
