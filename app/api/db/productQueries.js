const pool = require("./pool");

// Creates a new product listing, including product details, price, associated warehouse stock, images, and tags.
//Parameters:product_name (String),product_description (String),base_price (Float),current_price (Float), user_email (String),warehouse_ids (Array of Integers),quantities (Array of Integers),product_images (Array of BYTEA),product_tags (Array of Strings)
//Returns:None
export async function createProductListing(
  product_name,
  product_description,
  base_price,
  current_price,
  user_email,
  warehouse_ids,
  quantities,
  product_images,
  product_tags,
) {
  try {
    const product_date_added = Math.floor(new Date().getTime() / 1000);
    await pool.query(`BEGIN`);
    let response = await pool.query(
      `INSERT INTO product (product_name, product_main_img, product_description, product_date_added, user_email, product_avg_rating, active)
            VALUES ($1, $2, $3, $4, $5, $6, $7) returning product_id;`,
      [
        product_name,
        product_images[0],
        product_description,
        new Date().getTime(),
        user_email,
        parseFloat((Math.random() * 5).toFixed(1)),
        true,
      ],
    );
    const product_id = response.rows[0].product_id;
    await pool.query(
      `INSERT INTO productprice (product_id, base_price, current_price)
            VALUES ($1, $2, $3);`,
      [product_id, base_price, current_price],
    );
    if (product_images.length > 1) {
      for (let i = 1; i < product_images.length; i++) {
        await pool.query(
          `INSERT INTO image (product_id, image)
                    VALUES ($1, $2);`,
          [product_id, product_images[i]],
        );
      }
    }
    for (let i = 0; i < warehouse_ids.length; i++) {
      let response = await pool.query(
        `SELECT warehouse_id FROM warehouse WHERE warehouse_id = $1;`,
        [warehouse_ids[i]],
      );
      if (response.rows.length === 0) {
        throw new Error("Warehouse id not found");
      }
      await pool.query(
        `INSERT INTO warehousestock (warehouse_id, product_id, quantity)
                VALUES ($1, $2, $3);`,
        [warehouse_ids[i], product_id, quantities[i]],
      );
    }
    let tag_id;
    for (let i = 0; i < product_tags.length; i++) {
      response = await pool.query(
        `SELECT * 
            FROM tag
            WHERE tag_name = $1;`,
        [product_tags[i]],
      );
      if (response.rows.length === 0) {
        resp = await pool.query(
          `INSERT INTO tag(tag_name)
                VALUES ($1)
                RETURNING tag_id;`,
          [product_tags[i]],
        );
        tag_id = resp.rows[0].tag_id;
      } else {
        tag_id = response.rows[0].tag_id;
      }
      await pool.query(
        `INSERT INTO producttags(product_id, tag_id)
                VALUES ($1, $2);`,
        [product_id, tag_id],
      );
    }
    await pool.query(`COMMIT`);
  } catch (error) {
    console.error("Error creating product listing:", error);
  }
}
export async function deleteProductListingByProductId(product_id) {
  try {
    await pool.query(
      `
      UPDATE product
      SET active = false
      WHERE product_id = $1;`,
      [product_id],
    );
  } catch (error) {
    console.error("Error deleting product listing:", error);
  }
}
// Retrieves detailed information about a product by its product ID.
//Parameters:id (Integer)
//Returns: An object containing the product's details or an empty object if the product cannot be found.

export async function getProductInfoByPid(id) {
  try {
    let productResponse = await pool.query(
      `
        SELECT p.product_id, p.product_name, p.product_main_img, p.product_description, p.product_date_added, p.user_email, p.product_avg_rating, p.active, pp.base_price, pp.current_price
        FROM product p
        JOIN productprice pp ON p.product_id = pp.product_id
        WHERE p.product_id = $1;
      `,
      [id],
    );
    let reply = {};
    if (productResponse.rows.length > 0) {
      let product = productResponse.rows[0];
      reply = {
        product_id: product.product_id,
        product_name: product.product_name,
        product_main_img: product.product_main_img.toString("base64"),
        product_description: product.product_description,
        product_date_added: product.product_date_added,
        user_email: product.user_email,
        product_avg_rating: product.product_avg_rating,
        base_price: product.base_price,
        current_price: product.current_price,
        tags: [],
        additional_img: [],
        active: product.active,
      };
      let tagsResponse = await pool.query(
        `
          SELECT pt.tag_id, t.tag_name 
          FROM producttags pt
          JOIN tag t ON pt.tag_id = t.tag_id
          WHERE pt.product_id = $1;
        `,
        [id],
      );
      reply.tags = tagsResponse.rows.map((tag) => ({
        id: tag.tag_id,
        tag: tag.tag_name,
      }));
      let imagesResponse = await pool.query(
        `
          SELECT image 
          FROM image
          WHERE product_id = $1;
        `,
        [id],
      );
      reply.additional_img = imagesResponse.rows.map((imgRow) =>
        imgRow.image.toString("base64"),
      );
    }

    return reply;
  } catch (error) {
    console.error("Error retrieving product information:", error);
  }
}
//Retrieves the IDs of products matching a specific name.
//Parameters:product_name (String)
//Returns: An array of objects, each containing the product_id of a product that matches the specified name.

export async function getProductIdByName(product_name) {
  try {
    let response;
    let queryStr = `SELECT product_id FROM product `;
    if (product_name !== "") {
      response = await pool.query(
        (queryStr += `WHERE product_name ILIKE $1;`),
        [`%${product_name}%`],
      );
    } else {
      response = await pool.query((queryStr += `;`));
    }
    return response.rows;
  } catch (error) {
    console.error("Error in getProductIdByName:", error);
  }
}
//Fetches the IDs of products within a specified rating range.
//Parameters:product_rating_min (Float),   product_rating_max (Float)
//Returns: An array of objects, each containing the product_id of a product whose average rating falls within the specified range.
export async function getProductIdByRating(
  product_rating_min,
  product_rating_max,
) {
  try {
    const response = await pool.query(
      `
          SELECT product_id 
          FROM product 
          WHERE product_avg_rating >= $1 AND product_avg_rating <= $2;
        `,
      [product_rating_min, product_rating_max],
    );
    return response.rows;
  } catch (error) {
    console.error("Error in getProductIdByRating:", error);
  }
}
//Retrieves the IDs of products whose price falls within a specified range.
//Parameters: product_price_min (Float) ,   product_price_max (Float):
//Returns: An array of objects, each containing the product_id of a product whose current price is within the specified range.
export async function getProductIdByPrice(
  product_price_min,
  product_price_max,
) {
  try {
    const response = await pool.query(
      `
        SELECT product_id 
        FROM productprice 
        WHERE current_price >= $1 AND current_price <= $2;
      `,
      [product_price_min, product_price_max],
    );
    return response.rows;
  } catch (error) {
    console.error("Error in getProductIdByPrice:", error);
  }
}
// Fetches the IDs of products added to the catalog within a specified date range.
//Parameters: product_date_added_after (BigInt),    product_date_added_before (BigInt)
//Returns: An array of objects, each containing the product_id of a product that was added to the catalog within the specified date range.
export async function getProductIdByDateAdded(
  product_date_added_after,
  product_date_added_before,
) {
  try {
    const response = await pool.query(
      `
        SELECT product_id 
        FROM product 
        WHERE product_date_added >= $1 AND product_date_added <= $2;
      `,
      [product_date_added_after, product_date_added_before],
    );
    return response.rows;
  } catch (error) {
    console.error("Error in getProductIdByDateAdded:", error);
  }
}
//Retrieves product IDs associated with a specific user's email.
//Parameters: user_email (String)
//Returns: An array of product IDs associated with the given user's email.

export async function getProductIdByUserEmail(user_email) {
  try {
    let response;
    let queryStr = `SELECT product_id FROM product `;
    if (user_email !== "") {
      response = await pool.query((queryStr += `WHERE user_email = $1;`), [
        user_email,
      ]);
    } else {
      response = await pool.query((queryStr += `;`));
    }
    return response.rows;
  } catch (error) {
    console.error("Error in getProductIdByUserEmail:", error);
  }
}
//Fetches product IDs that match a list of tags.
//Parameters: tags (Array<String>)
//Returns: An array of product objects that match the specified tags. Each object includes product details. If no matching products are found, returns an empty array.
export async function getProductIdByTags(tags) {
  try {
    const tagResponse = await pool.query(
      "SELECT tag_id FROM tag WHERE tag_name = ANY($1);",
      [tags],
    );
    const tagIds = tagResponse.rows.map((row) => row.tag_id);
    let productIds = [];
    for (const tagId of tagIds) {
      const response = await pool.query(
        `SELECT product_id FROM producttags WHERE tag_id = $1;`,
        [tagId],
      );
      response.rows.forEach((row) => {
        if (!productIds.includes(row.product_id)) {
          productIds.push(row.product_id);
        }
      });
    }
    if (productIds.length > 0) {
      const response = await pool.query(
        `SELECT * FROM product WHERE product_id = ANY($1);`,
        [productIds],
      );
      return response.rows;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error in getProductIdByTags:", error);
  }
}

//Fetches products currently on sale, up to a specified limit. If the limit is set to a non-positive number, it returns all products on sale.
//Parameters:limit (Integer)
//Returns: An array of products on sale, each including product ID, name, description, main image, date added, average rating, base price, and current price. Products are ordered by descending current price.
export async function getProductsOnSaleByLimit(limit) {
  try {
    let query = `
        SELECT p.product_id, p.product_name, p.product_description, p.product_main_img, p.product_date_added, p.product_avg_rating, pp.base_price, pp.current_price
        FROM product p
        JOIN productprice pp ON p.product_id = pp.product_id
        WHERE pp.current_price < pp.base_price AND p.active = true
        ORDER BY pp.current_price DESC
      `;
    if (limit >= 0) {
      query += ` LIMIT $1;`;
      const result = await pool.query(query, [limit]);
      result.rows.forEach((row) => {
        row.product_main_img = row.product_main_img.toString("base64");
      });
      return result.rows;
    } else {
      const result = await pool.query(query);
      result.rows.forEach((row) => {
        row.product_main_img = row.product_main_img.toString("base64");
      });
      return result.rows;
    }
  } catch (error) {
    console.error("Error retrieving products on sale:", error);
  }
}
//Retrieves the most recently added products, subject to a specified limit. If no limit is provided or if the limit is negative, all products considered active are returned.
//Parameters:limit (Integer)
//Returns: An array of the newest products, each including details such as product ID, name, description, main image , date added, average rating,
// base price, and current price. Products are ordered by their addition date, with the most recent first.
export async function getNewestProductsByLimit(limit) {
  try {
    let query = `
        SELECT p.product_id, p.product_name, p.product_description, p.product_main_img, p.product_date_added, p.product_avg_rating, pp.base_price, pp.current_price
        FROM product p
        JOIN productprice pp ON p.product_id = pp.product_id
        WHERE p.active = true
        ORDER BY p.product_date_added DESC
      `;
    if (limit >= 0) {
      query += ` LIMIT $1;`;
      const result = await pool.query(query, [limit]);
      result.rows.forEach((row) => {
        row.product_main_img = row.product_main_img.toString("base64");
      });
      return result.rows;
    } else {
      const result = await pool.query(query);
      result.rows.forEach((row) => {
        row.product_main_img = row.product_main_img.toString("base64");
      });
      return result.rows;
    }
  } catch (error) {
    console.error("Error retrieving newest products:", error);
  }
}
export async function updateProductPriceByProductId(product_id, new_price) {
  try {
    const response = await pool.query(
      `
        UPDATE productprice
        SET current_price = $1
        WHERE product_id = $2`,
      [new_price, product_id],
    );
  } catch (error) {
    console.error("Error updating product price in productprice table:", error);
  }
}
