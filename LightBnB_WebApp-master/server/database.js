const { Pool } = require('pg');

const pool = new Pool({
  user: 'gauravmahant',
  password: '',
  host: 'localhost',
  database: 'lightbnb'
});

// the following assumes that you named your connection variable `pool`
//pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = (email) => {

  const queryString = `SELECT * FROM users WHERE users.email = $1`;

  return pool
    .query(queryString, [email])
    .then((result) => {

      if (result.rows === []) {
        return null;
      }
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = (id) => {

  const queryString = `SELECT * FROM users WHERE users.id = $1`;

  return pool
    .query(queryString, [id])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = (user) => {

  const queryString = `INSERT INTO users (name, email, password)
  VALUES($1, $2, $3) RETURNING *;`;

  return pool
    .query(queryString, [user.name, user.email, user.password])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {

  const queryString = `SELECT reservations.*, properties.*, AVG(property_reviews.rating) as average_rating
  FROM reservations
  JOIN properties ON properties.id = reservations.property_id
  JOIN property_reviews on properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY reservations.id, properties.id
  LIMIT $2;`;

  return pool
    .query(queryString, [guest_id, limit])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {

  let queryParams = [];
  //original basic query 
  let queryString = `SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;
  const priceConverter = (dollars) => { return dollars * 100; };
  const queryCheck = (param) => { if (param.length < 1) { return `WHERE`; } { return `AND`; } };

  //query modification based on user search criteria

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `${queryCheck(queryParams)} owner_id = $${queryParams.length}`;
  }

  if (options.minimum_price_per_night) {
    const minPrice = priceConverter(options.minimum_price_per_night);
    queryParams.push(minPrice);
    queryString += `${queryCheck(queryParams)} cost_per_night >= $${queryParams.length}`;
  }

  if (options.maximum_price_per_night) {
    const maxPrice = priceConverter(options.maximum_price_per_night);
    queryParams.push(maxPrice);
    if (options.minimum_price_per_night) {
      queryString += `${queryCheck(queryParams)} cost_per_night BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
    }
    if (!options.minimum_price_per_night) {
      queryString += `${queryCheck(queryParams)} cost_per_night <= $${queryParams.length}`;
    }
  }

  //add group by 
  queryString += `
  GROUP BY properties.id
  `;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING avg(property_reviews.rating) >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  //test for final query sent to SQL database
  //console.log(queryString);

  return pool
    .query(queryString, queryParams)
    .then((result) => {
      //console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const queryParams = Object.values(property);
  const queryString = `INSERT INTO properties(
    title,
    description,
    number_of_bedrooms,
    number_of_bathrooms,
    parking_spaces,
    cost_per_night,
    thumbnail_photo_url,
    cover_photo_url,
    street,
    country,
    city,
    province,
    post_code,
    owner_id)
  VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *;`;

  return pool
    .query(queryString, queryParams)
    .then((result) => {
      return result.rows[0];
    })
    .catch((error) => {
      console.log(error.message);
    });
};
exports.addProperty = addProperty;
