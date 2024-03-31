import { Product, ProductListingCreation } from "./product.types";
import { axios } from "./axios";
import { isAxiosError } from "axios";
import { FiltersType, filtersToQueryString } from "./filters.types";
import { getSessionUserEmail } from "@/app/auth";

// given a product's id, returns all that product's info
export async function getProduct(product_id: number): Promise<Product | null> {
  try {
    let response = await axios.get<Product[]>(`/getProduct/${product_id}`);

    return response.data[0];
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
    const { main_product_img_file, additional_product_img_files, ...rest } =
      formData;
    try {
      await axios.post(
        `/createProductListing`,
        {
          ...rest,
          product_images: [
            main_product_img_file,
            ...additional_product_img_files,
            // this empty file ensures that there will be at least 2 elements in this array and forces this array to be posted as an array.
            // when there's only 1 item in the array it gets posted as an object instead of a single element array
            new File(
              [new Blob([], { type: "image/jpeg" })],
              "placeholder.jpg",
              { type: "image/jpeg" },
            ),
          ],
          user_email: user_email,
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
