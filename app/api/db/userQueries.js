import pool from "./pool";

//Registers a new user along with their address into the database
//Parameters:street_name, city, province, post_code, country, user_email (Strings),   type_id, addressGiven (Integer)
//Returns: Nothing
export async function postUser(
  street_name,
  city,
  province,
  post_code,
  country,
  user_email,
  type_id,
  addressGiven,
) {
  try {
    let address_id = 1;
    if (addressGiven === 1) {
      address_id = await postAddress(
        street_name,
        city,
        province,
        post_code,
        country,
      );
    }
    await pool.query(
      `INSERT INTO userinfo (user_email, address_id) VALUES ($1, $2);`,
      [user_email, address_id],
    );
    await pool.query(
      `INSERT INTO users (user_email, type_id) VALUES ($1, $2);`,
      [user_email, type_id],
    );
  } catch (error) {
    console.error("Error adding user:", error);
  }
}

//Inserts a new address into the database and returns its generated unique ID.
//Parameters:street_name, city, province, post_code, country (Strings)
//Returns: The unique address_id generated by the database for the newly inserted address.
export async function postAddress(
  street_name,
  city,
  province,
  post_code,
  country,
) {
  try {
    const response = await pool.query(
      `INSERT INTO address (street_name, city, province, post_code, country) VALUES ($1, $2, $3, $4, $5) RETURNING address_id;`,
      [street_name, city, province, post_code, country],
    );
    return response.rows[0].address_id;
  } catch (error) {
    console.error("Error adding address:", error);
  }
}

//Fetches the user type for a specified email.
//Parameters: email (String)
//Returns: An array containing the user's type ID and type name. If no type is found, the array will be empty.
export async function getUserTypeByUserEmail(email) {
  try {
    await pool.query(`BEGIN`);
    const result = await pool.query(
      `SELECT users.type_id, usertypes.type FROM users 
      JOIN usertypes ON users.type_id = usertypes.type_id 
      WHERE user_email = $1;`,
      [email],
    );
    await pool.query(`COMMIT`);
    return result.rows;
  } catch (error) {
    await pool.query(`ROLLBACK`);
    console.error("Error retrieving user by email:", error);
  }
}

//Updates the user type for a specific user identified by their email
//Parameters: user_email (String), user_type (String - "vendor" or "customer")
//Returns: None.
export async function patchUserType(user_email, type) {
  try {
    await pool.query(`UPDATE users SET type_id = $1 WHERE user_email = $2`, [
      type,
      user_email,
    ]);
  } catch (error) {
    console.error("Error updating user type:", error);
  }
}

//Updates the address information for a specific user. If the user's address is not already in the database, it adds a new address and then updates the user's address ID to link to the newly added address.
//Parameters: user_email, street_name, city, province, postal code, and country are Strings.
//Return: None
export async function patchUserAddress(
  user_email,
  street_name,
  city,
  province,
  post_code,
  country,
) {
  try {
    const response = await pool.query(
      `INSERT INTO address (street_name, city, province, post_code, country) VALUES ($1, $2, $3, $4, $5) RETURNING address_id;`,
      [street_name, city, province, post_code, country],
    );
    await pool.query(
      `UPDATE userInfo SET address_id = $1 WHERE user_email = $2;`,
      [response.rows[0].address_id, user_email],
    );
  } catch (error) {
    console.error("Error updating user address:", error);
  }
}

//Adds a specified quantity of a product to a user's cart. If the product is already present, it updates the quantity.
//Parameters: user_email (string), quantity, product_id, warehouse_id (integer), delivery (boolean)
export async function postProductToUserCart(
  user_email,
  product_id,
  quantity,
  delivery,
  warehouse_id,
) {
  try {
    await pool.query(`BEGIN`);
    const response = await pool.query(
      `SELECT * FROM usercart WHERE user_email = $1 AND product_id = $2;`,
      [user_email, product_id],
    );
    if (response.rows.length === 0) {
      await pool.query(
        `INSERT INTO usercart (user_email, product_id, quantity, delivery, warehouse_id) VALUES($1, $2, $3, $4, $5);`,
        [user_email, product_id, quantity, delivery, warehouse_id],
      );
    } else {
      await pool.query(
        `UPDATE usercart SET quantity = $1 WHERE user_email = $2 AND product_id = $3;`,
        [response.rows[0].quantity + quantity, user_email, product_id],
      );
    }
    await pool.query(`COMMIT`);
  } catch (error) {
    console.error("Error adding item to cart:", error);
  }
}

//Retrieves the contents of a user's shopping cart, including product details, prices, and quantities.
//Parameters:email (String)
//Returns: A list of cart items, including product details, prices, and quantities
export async function getUserCartByUserEmail(email) {
  try {
    const query = `
      SELECT 
          product.product_id, 
          product.product_name, 
          product.product_description, 
          product.product_main_img,
          productprice.base_price, 
          productprice.current_price, 
          usercart.quantity,
          usercart.delivery,
          usercart.warehouse_id
      FROM product
      JOIN usercart ON product.product_id = usercart.product_id
      JOIN productprice ON product.product_id = productprice.product_id
      WHERE usercart.user_email = $1;
      `;
    const values = [email];
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      result.rows.forEach((row) => {
        row.product_main_img = row.product_main_img.toString("base64");
      });
    }
    return result.rows;
  } catch (error) {
    console.error("Error retrieving user cart by email:", error);
  }
}

//Deletes a specific product from a user's cart.
//Parameters:user_email (String), product_id (Integer)
//Returns: none
export async function deleteUserCartByPidUserEmail(user_email, product_id) {
  try {
    await pool.query(
      `DELETE FROM usercart WHERE user_email = $1 AND product_id = $2 `,
      [user_email, product_id],
    );
  } catch (error) {
    console.error("Error removing item from cart:", error);
  }
}

//Clears all items from a user's cart.
//Parameters:user_email (String)
//Returns:None
export async function clearUserCart(user_email) {
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

//Adds a product to a user's wishlist. If the product is already in the wishlist, it updates the quantity instead of adding a new entry.
//Parameters:user_email, product_id (string), quantity(integer)
//Return:None
export async function postProductToUserWishlist(
  user_email,
  product_id,
  quantity,
) {
  try {
    const response = await pool.query(
      `SELECT * FROM userwishlist WHERE user_email = $1 AND product_id = $2;`,
      [user_email, product_id],
    );
    if (response.rows.length > 0) {
      await pool.query(
        `UPDATE userwishlist 
          SET quantity = $1
          WHERE user_email = $2 AND product_id = $3;`,
        [response.rows[0].quantity + quantity, user_email, product_id],
      );
    } else {
      await pool.query(
        `INSERT INTO userwishlist (user_email, product_id, quantity) VALUES($1, $2, $3);`,
        [user_email, product_id, quantity],
      );
    }
  } catch (error) {
    console.error("Error adding item to wish list:", error);
  }
}

//Fetches the wishlist items for a specified user, including product details and prices.
//Parameters:email (String)
//Returns: A list of wishlist items, including product details and current prices
export async function getUserWishlistByUserEmail(email) {
  try {
    const query = `
      SELECT 
          product.product_id, 
          product.product_name, 
          product.product_description, 
          product.product_main_img,
          productprice.base_price, 
          productprice.current_price, 
          userwishlist.quantity
      FROM product
      JOIN userwishlist ON product.product_id = userwishlist.product_id
      JOIN productprice ON product.product_id = productprice.product_id
      WHERE userwishlist.user_email = $1;
      `;
    const values = [email];
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      result.rows.forEach((row) => {
        row.product_main_img = row.product_main_img.toString("base64");
      });
    }
    return result.rows;
  } catch (error) {
    console.error("Error retrieving wish list products by email:", error);
  }
}

//Removes a specific product from a user's wishlist.
//Parameters:user_email (String), product_id (Integer)
//Returns: none
export async function deleteUserWishlistByPidUserEmail(user_email, product_id) {
  try {
    await pool.query(
      "DELETE FROM userwishlist WHERE user_email = $1 AND product_id = $2",
      [user_email, product_id],
    );
  } catch (error) {
    console.error("Error removing item from wish list:", error);
  }
}
