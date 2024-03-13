import { OnApproveData } from "@paypal/paypal-js";
import { axios } from "./axios"

const baseUrl = "http://localhost:8888"

export async function createOrder() {
  try {
    const response = await axios.post(`${baseUrl}/api/orders`, {
      cart: [
        {
          id: "YOUR_PRODUCT_ID",
          quantity: "YOUR_PRODUCT_QUANTITY",
        },
      ],
    });
  
    return response.data;
  } catch (error:any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error("Paypal error status:", error.response.status);
      console.error("Paypal error data:", error.response.data);

      // Returning error message
      return error.response.data;
    } else {
      console.error("Paypal error occurred: ", error);
    }
  }
}

export async function onTransactionApprove(data: OnApproveData) {
  try {
    const response = await axios.post(`${baseUrl}/api/orders/${data.orderID}/capture`)

    return response.data
  } catch (error:any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error("Paypal error status:", error.response.status);
      console.error("Paypal error data:", error.response.data);

      // Returning error message
      return error.response.data;
    } else {
      console.error("Paypal error occurred: ", error);
    }
  }
}