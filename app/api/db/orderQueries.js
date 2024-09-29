const pool = require("./pool");

//Calculates the total cost of all items in a user's cart, including delivery fees (if applicable) and taxes.
//Parameters:user_email (String)
//Returns: The total cost of the user's cart . This total includes product costs, delivery fees and taxes.
export async function getOrderTotal(user_email) {
  try {
    const response = await pool.query(
      `SELECT * 
      FROM usercart
      WHERE user_email = $1;`,
      [user_email],
    );
    let total = 0;
    for (let i = 0; i < response.rows.length; i++) {
      let { product_id, quantity, delivery } = response.rows[i];
      let current_price = await pool.query(
        `SELECT current_price
        FROM productprice
        WHERE product_id = $1`,
        [product_id],
      );
      current_price = current_price.rows[0].current_price;
      if (delivery === 1) {
        delivery = 1.1; // 10% delivery
      } else {
        delivery = 1;
      }
      let subTotal = current_price * quantity * delivery * 1.11; //1.11 for taxes
      total += subTotal;
    }
    return total;
  } catch (error) {
    console.error("Error getting all warehouse info:", error);
  }
}
export async function getOrderHistoryByEmail(user_email) {
  try {
    let reply = [];
    const response = await pool.query(
      `
      SELECT o.order_id, o.product_id, o.quantity, o.delivery, o.warehouse_id, o.order_date, p.product_name, p.product_main_img, p.product_description, p.product_date_added, p.product_avg_rating, p.active, pp.base_price, pp.current_price
      FROM orderinfo o
      JOIN product p ON o.product_id = p.product_id
      JOIN productprice pp ON o.product_id = pp.product_id
      WHERE o.user_email = $1;      
      `,
      [user_email],
    );
    response.rows.forEach((row) => {
      let order = reply.find((o) => o.order_id === row.order_id);
      if (!order) {
        order = {
          order_id: row.order_id,
          order_date: row.order_date,
          products: [],
        };
        reply.push(order);
      }
      order.products.push({
        product_id: row.product_id,
        product_name: row.product_name,
        product_main_img: row.product_main_img.toString("base64"),
        product_description: row.product_description,
        quantity: row.quantity,
        delivery: row.delivery,
        warehouse_id: row.warehouse_id,
        product_date_added: row.product_date_added,
        current_price: row.current_price,
        base_price: row.base_price,
      });
    });
    return reply;
  } catch (error) {
    console.error("Error getting order history:", error);
  }
}
export async function addCartItemsToOrderInfoTable(order_id, user_email) {
  try {
    const response = await pool.query(
      `SELECT * FROM usercart WHERE user_email = $1;`,
      [user_email],
    );
    const currentTime = Math.floor(new Date().getTime() / 1000);
    let lastObj = response.rows[response.rows.length - 1];
    let productIdandQuantity = [];
    let qString = `INSERT INTO orderinfo (order_id, user_email, product_id, quantity, delivery, warehouse_id, order_date) VALUES ('${order_id}', '${user_email}', ${lastObj.product_id}, ${lastObj.quantity}, ${lastObj.delivery}, ${lastObj.warehouse_id}, ${currentTime})`;
    productIdandQuantity.push({
      product_id: lastObj.product_id,
      quantity: lastObj.quantity,
      warehouse_id: lastObj.warehouse_id,
      delivery: lastObj.delivery,
    });
    response.rows.pop();
    while (response.rows.length > 0) {
      lastObj = response.rows[response.rows.length - 1];
      qString += `, ('${order_id}','${user_email}',${lastObj.product_id}, ${lastObj.quantity}, ${lastObj.delivery}, ${lastObj.warehouse_id}, ${currentTime})`;
      productIdandQuantity.push({
        product_id: lastObj.product_id,
        quantity: lastObj.quantity,
        warehouse_id: lastObj.warehouse_id,
        delivery: lastObj.delivery,
      });
      response.rows.pop();
    }
    qString += `;`;
    await pool.query(qString);
    for (let i = 0; i < productIdandQuantity.length; i++) {
      let { product_id, quantity, warehouse_id, delivery } =
        productIdandQuantity[i];
      if (delivery == 0) {
        db.patchWarehouseStock(warehouse_id, product_id, quantity);
      }
    }
  } catch (error) {
    console.error("Error adding items to order info table:", error);
  }
}
