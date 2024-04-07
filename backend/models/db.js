const { error } = require("console");
const { resolve } = require("path");
const { Pool } = require("pg");

var pool;

pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "root",
  port: "5432",
});

const helpers = {
  init: async function () {
    await pool.query(`BEGIN`);

    //Tables
    await pool.query(`
        CREATE TABLE IF NOT EXISTS address (
        address_id SERIAL PRIMARY KEY,
        street_name VARCHAR(255),
        city VARCHAR(255),
        province VARCHAR(255),
        post_code VARCHAR(255),
        country VARCHAR(255)
        );`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS userinfo (
        user_email VARCHAR(255) PRIMARY KEY,
        address_id INTEGER,
        FOREIGN KEY (address_id) REFERENCES address(address_id)
        );`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS product (
        product_id SERIAL PRIMARY KEY,
        product_name VARCHAR(255),
        product_main_img BYTEA,
        product_description VARCHAR(255),
        product_date_added bigINT,
        user_email VARCHAR(255),
        product_avg_rating FLOAT,
        active BOOLEAN,
        FOREIGN KEY (user_email) REFERENCES userInfo(user_email)
        );`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS productprice (
        product_id INTEGER PRIMARY KEY,
        base_price FLOAT,
        current_price FLOAT,
        FOREIGN KEY (product_id) REFERENCES product(product_id)
        );`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tag (
        tag_id SERIAL PRIMARY KEY,
        tag_name VARCHAR(255)
        );`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS producttags (
        product_id INTEGER,
        tag_id INTEGER,
        PRIMARY KEY (product_id, tag_id),
        FOREIGN KEY (product_id) REFERENCES product(product_id),
        FOREIGN KEY (tag_id) REFERENCES tag(tag_id)
        );`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS usertypes (
        type_id SERIAL PRIMARY KEY,
        type VARCHAR(255)
        );`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        user_email VARCHAR(255) PRIMARY KEY,
        type_id INTEGER,
        FOREIGN KEY (user_email) REFERENCES userInfo(user_email),
        FOREIGN KEY (type_id) REFERENCES userTypes(type_id)
        );`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS userwishlist (
        user_email VARCHAR(255),
        product_id INTEGER,
        quantity INTEGER,
        PRIMARY KEY (user_email, product_id),
        FOREIGN KEY (user_email) REFERENCES userinfo(user_email),
        FOREIGN KEY (product_id) REFERENCES product(product_id)
        );`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS warehouse (
        warehouse_id SERIAL PRIMARY KEY,
        lat FLOAT,
        long FLOAT
        );`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS warehousestock (
        warehouse_id INTEGER,
        product_id INTEGER,
        PRIMARY KEY (warehouse_id, product_id),
        quantity INTEGER,
        FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id),
        FOREIGN KEY (product_id) REFERENCES product(product_id)
        );`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS usercart (
        user_email VARCHAR(255),
        product_id INTEGER,
        quantity INTEGER,
        delivery BOOLEAN,
        warehouse_id INTEGER,
        PRIMARY KEY (user_email, product_id),
        FOREIGN KEY (user_email) REFERENCES userInfo(user_email),
        FOREIGN KEY (product_id) REFERENCES product(product_id),
        FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id)
        );`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS image (
        product_id INTEGER,
        image_id SERIAL,
        image BYTEA,
        PRIMARY KEY (product_id, image_id),
        FOREIGN KEY (product_id) REFERENCES product(product_id)
        );`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS vendorrequest (
        request_id SERIAL PRIMARY KEY,
        user_email VARCHAR(255),
        FOREIGN KEY (user_email) REFERENCES userinfo(user_email)
        );`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS orderinfo (
        order_id INTEGER,
        user_email VARCHAR(255),
        product_id INTEGER,
        quantity INTEGER,
        delivery BOOLEAN,
        warehouse_id INTEGER,
        order_date BIGINT,
        total INTEGER,
        PRIMARY KEY (order_id, user_email, product_id, warehouse_id),
        FOREIGN KEY (product_id) REFERENCES product(product_id),
        FOREIGN KEY (user_email) REFERENCES userinfo(user_email),
        FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id)
        );`);
    //User Types
    let response = await pool.query(`SELECT * FROM usertypes;`);
    if (response.rows.length === 0) {
      await pool.query(`INSERT INTO usertypes (type) VALUES ('vendor');`);
      await pool.query(`INSERT INTO usertypes (type) VALUES ('customer');`);
      await pool.query(`INSERT INTO usertypes (type) VALUES ('admin');`);
    }

    //Placeholder Address
    response = await pool.query(`SELECT * FROM address;`);
    if (response.rows.length === 0) {
      await pool.query(
        `INSERT INTO address (street_name, city, province, post_code, country) VALUES ('This is a placeholder for when the customer does not give address', 'placeholder', 'placeholder', 'placeholder', 'placeholder');`,
      ); //Cameron
    }

    //Placeholder Warehouse
    response = await pool.query(
      `SELECT * FROM warehouse WHERE warehouse_id = $1;`,
      [-1],
    ); //placeholder warehouse_id
    if (response.rows.length === 0) {
      await pool.query(
        `INSERT INTO warehouse (warehouse_id, lat, long) VALUES (-1, 0.0, 0.0);`,
      );
    }
    //Admins
    response = await pool.query(`SELECT * FROM userinfo;`);
    let response1 = await pool.query(`SELECT * FROM users;`);
    if (response.rows.length === 0 && response1.rows.length === 0) {
      await pool.query(
        `INSERT INTO userinfo (user_email, address_id) VALUES ('catchet101@gmail.com', 1);`,
      ); //Cameron
      await pool.query(
        `INSERT INTO userinfo (user_email, address_id) VALUES ('bradwade7@gmail.com', 1);`,
      ); //Tawheed
      await pool.query(
        `INSERT INTO users (user_email, type_id) VALUES ('catchet101@gmail.com', 3);`,
      ); //Cameron
      await pool.query(
        `INSERT INTO users (user_email, type_id) VALUES ('bradwade7@gmail.com', 3);`,
      ); //Tawheed
    }
    await pool.query(`COMMIT`);
  },

  insertTestData: async function () {
    //depricated and used for the users
    try {
      await pool.query(`BEGIN`);
      //Tag Table
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Electronics');`);
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Fashion');`);
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Kitchen');`);
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Home');`);
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Garden');`);
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Toys');`);
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('New Arrival');`);
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Best Seller');`);
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Eco-Friendly');`);
      await pool.query(
        `INSERT INTO tag (tag_name) VALUES ('Tech Innovations');`,
      );
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Smart Home');`);
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Outdoor Gear');`);
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Gaming');`);
      await pool.query(
        `INSERT INTO tag (tag_name) VALUES ('Limited Edition');`,
      );
      await pool.query(
        `INSERT INTO tag (tag_name) VALUES ('Fitness & Health');`,
      );
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Fashion Trends');`);
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Pet Care');`);
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Educational');`);
      await pool.query(
        `INSERT INTO tag (tag_name) VALUES ('Organic & Natural');`,
      );
      await pool.query(
        `INSERT INTO tag (tag_name) VALUES ('Travel Essentials');`,
      );
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Vintage');`);
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('DIY & Crafts');`);
      await pool.query(
        `INSERT INTO tag (tag_name) VALUES ('Professional Tools');`,
      );
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Music & Audio');`);
      await pool.query(
        `INSERT INTO tag (tag_name) VALUES ('Automotive Accessories');`,
      );
      await pool.query(`INSERT INTO tag (tag_name) VALUES ('Home Decor');`);

      //warehouse Table
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (43.6532, -79.3832);`,
      ); // Toronto
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (49.2827, -123.1207);`,
      ); // Vancouver
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (45.5017, -73.5673);`,
      ); // Montreal
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (51.0447, -114.0719);`,
      ); // Calgary
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (45.4215, -75.6972);`,
      ); // Ottawa
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (53.5461, -113.4938);`,
      ); // Edmonton
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (49.8951, -97.1384);`,
      ); // Winnipeg
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (46.8139, -71.2080);`,
      ); // Quebec City
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (52.9399, -106.4509);`,
      ); // Saskatoon
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (50.4452, -104.6189);`,
      ); // Regina
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (44.6488, -63.5752);`,
      ); // Halifax
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (47.5605, -52.7126);`,
      ); // St. John's
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (46.2330, -63.1311);`,
      ); // Charlottetown
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (45.9636, -66.6431);`,
      ); // Fredericton
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (60.7212, -135.0568);`,
      ); // Whitehorse
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (62.4540, -114.3718);`,
      ); // Yellowknife
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (63.7467, -68.5170);`,
      ); // Iqaluit
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (53.1355, -57.6604);`,
      ); // Labrador City
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (49.2673, -123.1456);`,
      ); // Burnaby
      await pool.query(
        `INSERT INTO warehouse (lat, long) VALUES (43.8561, -79.3370);`,
      ); // Markham

      await pool.query(`COMMIT`);
    } catch (error) {
      await pool.query(`ROLLBACK`);
      console.error("Failed to insert test data", error);
    }
  },

  deleteAllTables: async function () {
    try {
      await pool.query(`BEGIN`);
      await pool.query(`DROP TABLE IF EXISTS warehousestock CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS warehouse CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS userwishlist CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS users CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS usertypes CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS usercart CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS producttags CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS tag CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS productprice CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS product CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS userinfo CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS address CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS image CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS vendorrequest CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS orderinfo CASCADE;`);
      await pool.query(`COMMIT`);
      console.log("All tables deleted successfully.");
    } catch (error) {
      await pool.query(`ROLLBACK`);
      console.error("Error deleting tables:", error);
    }
  },

  getProductInfoByPid: async function (id) {
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
  },

  getProductIdByName: async function (product_name) {
    try {
      let response;
      let queryStr = `SELECT product_id FROM product `;
      if (product_name !== "") {
        response = await pool.query((queryStr += `WHERE product_name = $1;`), [
          product_name,
        ]);
      } else {
        response = await pool.query((queryStr += `;`));
      }
      return response.rows;
    } catch (error) {
      console.error("Error in getProductIdByName:", error);
    }
  },

  getProductIdByRating: async function (
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
  },

  getProductIdByPrice: async function (product_price_min, product_price_max) {
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
  },

  getProductIdByDateAdded: async function (
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
  },

  getProductIdByUserEmail: async function (user_email) {
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
  },

  getProductIdByTags: async function (tags) {
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
  },

  getProductsOnSaleByLimit: async function (limit) {
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
  },

  getNewestProductsByLimit: async function (limit) {
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
  },

  postUser: async function (
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
        address_id = await helpers.postAddress(
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
  },

  postAddress: async function (
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
  },

  getUserTypeByUserEmail: async function (email) {
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
  },

  patchUserType: async function (user_email, type) {
    try {
      await pool.query(`UPDATE users SET type_id = $1 WHERE user_email = $2`, [
        type,
        user_email,
      ]);
    } catch (error) {
      console.error("Error updating user type:", error);
    }
  },

  patchUserAddress: async function (
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
  },

  postProductToUserWishlist: async function (user_email, product_id, quantity) {
    try {
      const response = await pool.query(
        `
      SELECT *
      FROM userwishlist
      WHERE user_email = $1 AND product_id = $2;`,
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
  },

  getUserWishlistByUserEmail: async function (email) {
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
  },

  deleteUserWishlistByPidUserEmail: async function (user_email, product_id) {
    try {
      await pool.query(
        "DELETE FROM userwishlist WHERE user_email = $1 AND product_id = $2",
        [user_email, product_id],
      );
    } catch (error) {
      console.error("Error removing item from wish list:", error);
    }
  },

  postProductToUserCart: async function (
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
  },

  getUserCartByUserEmail: async function (email) {
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
  },

  deleteUserCartByPidUserEmail: async function (user_email, product_id) {
    try {
      await pool.query(
        `DELETE FROM usercart WHERE user_email = $1 AND product_id = $2 `,
        [user_email, product_id],
      );
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  },

  patchWarehouseStock: async function (warehouse_id, product_id, quantity) {
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
  },
  createProductListing: async function (
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
        `INSERT INTO product (product_name, product_main_img, product_description, product_date_added, user_email, product_avg_rating)
            VALUES ($1, $2, $3, $4, $5, $6) returning product_id;`,
        [
          product_name,
          product_images[0],
          product_description,
          new Date().getTime(),
          user_email,
          parseFloat((Math.random() * 5).toFixed(1)),
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
  },
  clearUserCart: async function (user_email) {
    try {
      await pool.query(
        `DELETE FROM usercart
            WHERE user_email = $1;`,
        [user_email],
      );
    } catch (error) {
      console.error("Error adjusting warehouse stock:", error);
    }
  },
  handleResponse: async function (response) {
    try {
      const jsonResponse = await response.json();
      return { jsonResponse, httpStatusCode: response.status };
    } catch (err) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
  },
  postVendorRequestsByUserEmail: async function (user_email) {
    try {
      const response = await pool.query(
        `SELECT *
            FROM vendorrequest
            WHERE user_email = $1;`,
        [user_email],
      );
      if (response.rows.length === 0) {
        await pool.query(
          `INSERT INTO vendorrequest(user_email)
                VALUES ($1);`,
          [user_email],
        );
      }
    } catch (error) {
      console.error("Error creating vendor request:", error);
    }
  },
  getAllVendorRequests: async function () {
    try {
      const response = await pool.query(`SELECT *
            FROM vendorrequest;`);
      return response.rows;
    } catch (error) {
      console.error("Error creating vendor request:", error);
    }
  },
  deleteVendorRequestByUserEmail: async function (user_email) {
    try {
      const response = await pool.query(
        `DELETE FROM vendorrequest
      WHERE user_email = $1;`,
        [user_email],
      );
      return response.rows;
    } catch (error) {
      console.error("Error deleting vendor request:", error);
    }
  },
  getInStockWarehouses: async function (product_id, quantity) {
    try {
      const response = await pool.query(
        `SELECT * 
      FROM warehousestock whs
      JOIN warehouse wh
      ON whs.warehouse_id = wh.warehouse_id
      WHERE product_id = $1 AND quantity >= $2;`,
        [product_id, quantity],
      );
      return response.rows;
    } catch (error) {
      console.error("Error getting warehouse stock:", error);
    }
  },
  getWarehouseInfo: async function (warehouse_id) {
    try {
      const response = await pool.query(
        `SELECT * 
      FROM warehouse
      WHERE warehouse_id = $1;`,
        [warehouse_id],
      );
      return response.rows;
    } catch (error) {
      console.error("Error getting warehouse info:", error);
    }
  },
  getAllWarehouseInfo: async function () {
    try {
      const response = await pool.query(
        `SELECT * 
      FROM warehouse;`,
      );
      response.rows = response.rows.filter((row) => row.warehouse_id !== -1);
      return response.rows;
    } catch (error) {
      console.error("Error getting all warehouse info:", error);
    }
  },
  getOrderTotal: async function (user_email) {
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
  },
  getAllProductTags: async function () {
    try {
      const result = await pool.query(`SELECT tag_name FROM tag;`);
      return result.rows.map((row) => row.tag_name);
    } catch (error) {
      console.error("Error fetching product tags:", error);
    }
  },
  deleteProductListingByProductId: async function (product_id) {
    try {
      await pool.query(`
      UPDATE product
      SET active = false
      WHERE product_id = $1;`, [product_id]);
    } catch (error) {
      console.error("Error deleting product listing:", error);
    }
  },
  getOrderHistoryByEmail: async function (user_email) {
    try {
      let reply = [];
      const response = await pool.query(`
      SELECT o.order_id, o.product_id, o.quantity, o.delivery, o.warehouse_id, o.order_date, p.product_name, p.product_main_img, p.product_description, p.product_date_added, p.product_avg_rating, p.active, pp.base_price, pp.current_price
      FROM orderinfo o
      JOIN product p ON o.product_id = p.product_id
      JOIN productprice pp ON o.product_id = pp.product_id
      WHERE o.user_email = $1;      
      `, [user_email]);
      response.rows.forEach(row => {
        let order = reply.find(o => o.order_id === row.order_id);
        if (!order) {
          order = {
            order_id: row.order_id,
            order_date: row.order_date,
            products: []
          };
          reply.push(order);
        }
        order.products.push({
          product_id: row.product_id,
          product_name: row.product_name,
          product_main_img: row.product_main_img.toString('base64'),
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
  },
  addCartItemsToOrderInfoTable: async function (order_id, user_email) {
    try {
        const response = await pool.query(`SELECT * FROM usercart WHERE user_email = $1;`, [user_email]);
        const currentTime = Math.floor(new Date().getTime() / 1000);
        let lastObj = response.rows[response.rows.length-1];
        let string = `INSERT INTO orderinfo (order_id, user_email, product_id, quantity, delivery, warehouse_id, order_date) VALUES (${order_id},${user_email},${lastObj.product_id}, ${lastObj.quantity}, ${lastObj.delivery}, ${lastObj.warehouse_id}, ${currentTime})`;
        response.rows.pop();
        while(response.rows.length > 0){
            lastObj = response.rows[response.rows.length-1];
            string+=`, (${order_id},${user_email},${lastObj.product_id}, ${lastObj.quantity}, ${lastObj.delivery}, ${lastObj.warehouse_id}, ${currentTime})`;
            response.rows.pop();
        }
        string+=`;`;
        await pool.query(string);
      } catch (error) {
        console.error("Error adding items to order info table:", error);
      }
  }
};


module.exports = {
  helpers,
};
