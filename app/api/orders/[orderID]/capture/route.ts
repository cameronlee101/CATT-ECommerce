import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";
const handleResponse = require("../../handleResponse");
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const paypal_base = "https://api-m.sandbox.paypal.com";

export async function POST(
  req: NextRequest,
  { params }: { params: { orderID: string } },
) {
  try {
    const { orderID } = params;
    const body = await req.json();
    const { user_email } = body;

    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);

    if (httpStatusCode === 201) {
      await addCartItemsToOrderInfoTable(orderID, user_email);
      await clearUserCart(user_email);
    }

    return NextResponse.json(jsonResponse, { status: httpStatusCode });
  } catch (error) {
    console.error("Failed to capture order:", error);
    return NextResponse.json(
      { error: "Failed to capture order." },
      { status: 500 },
    );
  }
}

/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 * @see https://developer.paypal.com/api/rest/authentication/
 */
const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET,
    ).toString("base64");
    const response = await fetch(`${paypal_base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
};

/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const captureOrder = async (orderID: string) => {
  const accessToken = await generateAccessToken();
  const url = `${paypal_base}/v2/checkout/orders/${orderID}/capture`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
      // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
      // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    },
  });

  return handleResponse(response);
};

async function addCartItemsToOrderInfoTable(order_id: any, user_email: any) {
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
        patchWarehouseStock(warehouse_id, product_id, quantity);
      }
    }
  } catch (error) {
    console.error("Error adding items to order info table:", error);
  }
}

// TODO: consolidate with patchWarehouseStock endpoint
//Updates the stock quantity of a specific product in a warehouse.
//Parameters:warehouse_id (Integer),product_id (Integer),quantity (Integer)
//Returns:
//1 if the operation is successful.
//-1 if the current quantity is less than the requested quantity.
//0 if the product is not found in the warehouse.
async function patchWarehouseStock(
  warehouse_id: any,
  product_id: any,
  quantity: number,
) {
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

//Clears all items from a user's cart.
//Parameters:user_email (String)
//Returns:None
async function clearUserCart(user_email: any) {
  try {
    await pool.query(
      `DELETE FROM usercart
        WHERE user_email = $1;`,
      [user_email],
    );
  } catch (error) {
    console.error("Error clearing user cart:", error);
  }
}
