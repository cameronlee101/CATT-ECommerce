import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";
const handleResponse = require("./handleResponse");
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const paypal_base = "https://api-m.sandbox.paypal.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_email, acquisitionMethod } = body;

    const { jsonResponse, httpStatusCode } = await createOrder(user_email);

    return NextResponse.json(jsonResponse, { status: httpStatusCode });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order." },
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
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (user_email: string) => {
  const total = await getOrderTotal(user_email);
  const accessToken = await generateAccessToken();
  const url = `${paypal_base}/v2/checkout/orders`;
  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "CAD",
          value: (total || -1).toFixed(2).toString(),
        },
      },
    ],
  };

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
      // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
      // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

//Calculates the total cost of all items in a user's cart, including delivery fees (if applicable) and taxes.
//Parameters:user_email (String)
//Returns: The total cost of the user's cart . This total includes product costs, delivery fees and taxes.
async function getOrderTotal(user_email: any) {
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
      let price_response = await pool.query(
        `SELECT current_price
        FROM productprice
        WHERE product_id = $1`,
        [product_id],
      );
      let current_price = price_response.rows[0].current_price;
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
