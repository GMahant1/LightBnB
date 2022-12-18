const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');

const pool = new Pool({
  user: 'gauravmahant',
  password: '',
  host: 'localhost',
  database: 'lightbnb'
});

// the following assumes that you named your connection variable `pool`
// pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})


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
      //console.log(result);
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
  const queryString = `SELECT * FROM users WHERE id = $1`;
  return pool 
    .query(queryString, [id])
    .then((result) => {
      return result.rows;
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
  const queryString = `INSERT INTO users(name, email, password)
  VALUES($1, $2, $3);`
  return pool
    .query(queryString, [user.name, user.email, user.password])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message)
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
  const queryString = `SELECT reservations.*, properties.* FROM reservations JOIN properties ON properties.id = reservations.property_id WHERE guest_id = $1 LIMIT $2;`;
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
  //console.log(limit);
  const queryParams = [];
  const queryString = `SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;
  const priceConverter = (dollars) => {dollars * 100};
  const queryCheck = (param) => {if (param.length < 1) {return `WHERE`} {return `AND`}};

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

  if(options.maximum_price_per_night) {
    const maxPrice = priceConverter(options.maximum_price_per_night);
    queryParams.push(maxPrice);
    if(options.minimum_price_per_night) {
      queryString += `${queryCheck(queryParams)} cost_per_night BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
    }
    if(!options.minimum_price_per_night) {
      queryString += `${queryCheck(queryParams)} cost_per_night <= $${queryParams.length}`;
    }
  }

  if(options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `${queryCheck(queryParams)} property_reviews.rating >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

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
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
