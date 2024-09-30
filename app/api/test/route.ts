import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function POST(req: NextRequest) {
  try {
    await init();
    await insertTestData();
    console.log("Success: Data inserted succesfully!");
    return NextResponse.json(
      { msg: "Success: Data inserted succesfully!" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error: Data Not Inserted.", error);
    return NextResponse.json(
      { msg: "Error: Data Not Inserted." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await deleteAllTables();
    console.log("Success: Tables deleted succesfully!");
    return NextResponse.json(
      { msg: "Success: Tables deleted succesfully!" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error: Tables Not deleted.", error);
    return NextResponse.json(
      { msg: "Error: Tables Not deleted." },
      { status: 500 },
    );
  }
}

async function init() {
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
        user_email TEXT PRIMARY KEY,
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
        CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        user_email TEXT REFERENCES userInfo(user_email),
        user_type TEXT,
        password_hash TEXT
        );`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_session (
      id TEXT PRIMARY KEY,
      expires_at TIMESTAMPTZ NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id),
      user_type TEXT
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
        order_id VARCHAR(255),
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

  //Placeholder Address
  let response = await pool.query(`SELECT * FROM address;`);
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
  // if (response.rows.length === 0 && response1.rows.length === 0) {
  //   await pool.query(
  //     `INSERT INTO userinfo (user_email, address_id) VALUES ('catchet101@gmail.com', 1);`,
  //   );
  //   await pool.query(
  //     `INSERT INTO users (user_email, type_id) VALUES ('catchet101@gmail.com', 3);`,
  //   );
  // }
  await pool.query(`COMMIT`);
}

async function insertTestData() {
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
    await pool.query(`INSERT INTO tag (tag_name) VALUES ('Tech Innovations');`);
    await pool.query(`INSERT INTO tag (tag_name) VALUES ('Smart Home');`);
    await pool.query(`INSERT INTO tag (tag_name) VALUES ('Outdoor Gear');`);
    await pool.query(`INSERT INTO tag (tag_name) VALUES ('Gaming');`);
    await pool.query(`INSERT INTO tag (tag_name) VALUES ('Limited Edition');`);
    await pool.query(`INSERT INTO tag (tag_name) VALUES ('Fitness & Health');`);
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
}
//This function asynchronously drops all tables from the database, ensuring that all data and schema definitions are removed
//Parameters: None
//Returns: None
async function deleteAllTables() {
  try {
    await pool.query(`BEGIN`);
    await pool.query(`DROP TABLE IF EXISTS user_session CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS warehousestock CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS warehouse CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS userwishlist CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS users CASCADE;`);
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
}
