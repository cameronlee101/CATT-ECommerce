import pool from "./pool";

//Updates the stock quantity of a specific product in a warehouse.
//Parameters:warehouse_id (Integer),product_id (Integer),quantity (Integer)
//Returns:
//1 if the operation is successful.
//-1 if the current quantity is less than the requested quantity.
//0 if the product is not found in the warehouse.

export async function patchWarehouseStock(warehouse_id, product_id, quantity) {
  try {
    let response = await pool.query(
      `SELECT quantity FROM warehousestock WHERE warehouse_id = $1 AND product_id = $2;`,
      [warehouse_id, product_id],
    );
    if (response.rows[0].quantity >= quantity) {
      await pool.query(
        `UPDATE warehousestock SET quantity = quantity - $3 WHERE warehouse_id = $1 AND product_id = $2;`,
        [warehouse_id, product_id, quantity],
      );
      return 1;
    }
    return 0;
  } catch (error) {
    console.error("Error adjusting warehouse stock:", error);
  }
}

//Retrieves warehouses that have a specified quantity of a particular product in stock.
//Parameters:product_id (Integer),quantity (Integer)
//Returns: A list of warehouses meeting the criteria or logs an error if the operation fails.

export async function getInStockWarehouses(product_id, quantity) {
  try {
    const response = await pool.query(
      `SELECT * 
      FROM warehousestock whs
      JOIN warehouse wh
      ON whs.warehouse_id = wh.warehouse_id
      WHERE product_id = $1 AND quantity >= $2;`,
      [product_id, quantity],
    );
    return response.rows;
  } catch (error) {
    console.error("Error getting warehouse stock:", error);
  }
}

//Fetches detailed information for a specific warehouse by its ID.
//Parameters:warehouse_id (Integer)
//Returns: Detailed information for the specified warehouse

export async function getWarehouseInfo(warehouse_id) {
  try {
    const response = await pool.query(
      `SELECT * 
      FROM warehouse
      WHERE warehouse_id = $1;`,
      [warehouse_id],
    );
    return response.rows;
  } catch (error) {
    console.error("Error getting warehouse info:", error);
  }
}

// Retrieves information for all warehouses in the database.
//Parameters: None.
//Returns: A list containing information for all warehouses

export async function getAllWarehouseInfo() {
  try {
    const response = await pool.query(
      `SELECT * 
      FROM warehouse;`,
    );
    response.rows = response.rows.filter((row) => row.warehouse_id !== -1);
    return response.rows;
  } catch (error) {
    console.error("Error getting all warehouse info:", error);
  }
}
