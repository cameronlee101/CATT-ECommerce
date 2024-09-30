import { validateRequest } from "@/lib/auth_utils";
import { axios } from "./axios";
import { WishlistEntry } from "./product.types";
import { isAxiosError } from "axios";

// Returns all the items in the current user's wishlist
export async function getWishlistProducts(): Promise<WishlistEntry[]> {
  const { user } = await validateRequest();
  if (user) {
    try {
      let response = await axios.get<WishlistEntry[]>(
        `/getUserWishlistByUserEmail/${user.user_email}`,
      );

      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.response?.data || error.response || error);
      } else {
        console.error(error);
      }

      return [];
    }
  } else {
    console.error("Could not retrieve user's wishlist");
    return [];
  }
}

// Adds an item to the current user's wishlist
export async function addToWishlist(
  product_id: number,
  quantity: number,
): Promise<void> {
  const { user } = await validateRequest();
  if (user) {
    try {
      await axios.post("/postProductToUserWishlist", {
        user_email: user.user_email,
        product_id: product_id,
        quantity: quantity,
      });
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.response?.data || error.response || error);
      } else {
        console.error(error);
      }
    }
  } else {
    console.error("Could not add to user's wishlist");
  }
}

// Removes an item from the current user's wishlist
export async function removeFromWishlist(product_id: number): Promise<void> {
  const { user } = await validateRequest();
  if (user) {
    try {
      await axios.delete("/deleteUserWishlistByPidUserEmail", {
        data: {
          user_email: user.user_email,
          product_id: product_id,
        },
      });
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.response?.data || error.response || error);
      } else {
        console.error(error);
      }
    }
  } else {
    console.error("Could not remove item from user's wishlist");
  }
}
