const pool = require("./pool");

//Fetches all unique product tags from the database.
//Parameters: none
//Returns: An array of all product tags as strings.
export async function getAllProductTags() {
  try {
    const result = await pool.query("SELECT tag_name FROM tag;");
    return result.rows.map((row) => row.tag_name);
  } catch (error) {
    console.error("Error fetching product tags:", error);
  }
}
