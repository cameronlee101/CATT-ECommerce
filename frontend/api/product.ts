import {
  OrderHistory,
  Product,
  ProductFull,
  ProductListingCreation,
} from "./product.types";
import { axios } from "./axios";
import { isAxiosError } from "axios";
import { Categories, FiltersType, filtersToQueryString } from "./filters.types";
import { getSessionUserEmail } from "@/app/auth";

// given a product's id, returns all that product's info
export async function getProduct(
  product_id: number,
): Promise<ProductFull | null> {
  try {
    let response = await axios.get<ProductFull>(`/getProduct/${product_id}`);

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(error.response?.data || error.response || error);
    } else {
      console.error(error);
    }

    return null;
  }
}

// returns a number of the newest products
export async function getNewProducts(limit: number): Promise<Product[]> {
  try {
    let response = await axios.get<Product[]>(
      `/getNewestProductsByLimit/${limit}`,
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
}

// returns a number of products that are on sale
export async function getSaleProducts(limit?: number): Promise<Product[]> {
  try {
    let limitNum = limit;
    if (!limitNum) {
      limitNum = -1;
    }

    let response = await axios.get<Product[]>(
      `/getProductsOnSaleByLimit/${limitNum}`,
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
}

// returns basic info on all the products that fulfill a set of filters
export async function getFilteredProducts(
  filters: FiltersType,
): Promise<Product[]> {
  const queryString = filtersToQueryString(filters);

  try {
    let response = await axios.get<Product[]>(
      `/getProductsByFilters?${queryString}`,
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
}

// Creates a new product listing using the submitted form data
export async function createProductListing(formData: ProductListingCreation) {
  const user_email = await getSessionUserEmail();
  if (user_email) {
    const {
      product_tags,
      main_product_img_file,
      additional_product_img_files,
      warehouse_ids,
      quantities,
      ...rest
    } = formData;

    try {
      axios.post(
        `/createProductListing`,
        {
          ...rest,
          user_email: user_email,
          // for each of these attributes below, having a garbage value at the end ensures that there will be at least 2 elements in this array and
          // forces this array to be posted as an array.
          // when there's only 1 item in the array it gets posted as an object instead of a single element array
          product_tags: [...product_tags, "placeholdertag"],
          warehouse_ids: [...warehouse_ids, -1],
          quantities: [...quantities, -1],
          product_images: [
            main_product_img_file,
            ...additional_product_img_files,
            new File(
              [new Blob([], { type: "image/jpeg" })],
              "placeholder.jpg",
              {
                type: "image/jpeg",
              },
            ),
          ],
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.response?.data || error.response || error);
      } else {
        console.error(error);
      }
    }
  } else {
    console.error("Could not create product listing");
  }
}

// gets all available product tags
export async function getProductTags() {
  try {
    let response = await axios.get<string[]>("getAllProductTags");

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(error.response?.data || error.response || error);
    } else {
      console.error(error);
    }

    return [];
  }
}

// gets all of a user's order history
// TODO: double check returned type from backend
export async function getUserOrderHistory(): Promise<OrderHistory[]> {
  const user_email = await getSessionUserEmail();
  if (user_email) {
    try {
      let response = await axios.get<OrderHistory[]>(
        `/getOrderHistoryByEmail?${user_email}`,
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
    console.error("Could not retrieve user order history");
    return [];
  }
}
