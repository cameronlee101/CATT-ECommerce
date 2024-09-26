const { helpers } = require("../../../db");
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const paypal_base = "https://api-m.sandbox.paypal.com";

export async function POST(
  req: Request,
  { params }: { params: { orderID: string } },
) {
  try {
    const { orderID } = params;
    const body = await req.json();
    const { user_email } = body;

    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);

    if (httpStatusCode === 201) {
      await helpers.addCartItemsToOrderInfoTable(orderID, user_email);
      await helpers.clearUserCart(user_email);
    }

    return Response.json(jsonResponse, { status: httpStatusCode });
  } catch (error) {
    console.error("Failed to capture order:", error);
    return Response.json(
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

  return helpers.handleResponse(response);
};
