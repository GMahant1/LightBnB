# LightBnB

## Project Structure

```
├── public
│   ├── index.html
│   ├── javascript
│   │   ├── components 
│   │   │   ├── header.js
│   │   │   ├── login_form.js
│   │   │   ├── new_property_form.js
│   │   │   ├── property_listing.js
│   │   │   ├── property_listings.js
│   │   │   ├── search_form.js
│   │   │   └── signup_form.js
│   │   ├── index.js
│   │   ├── libraries
│   │   ├── network.js
│   │   └── views_manager.js
│   └── styles
├── sass
└── server
  ├── apiRoutes.js
  ├── database.js
  ├── json
  ├── server.js
  └── userRoutes.js
```

* `public` contains all of the HTML, CSS, and client side JavaScript. 
  * `index.html` is the entry point to the application. It's the only html page because this is a single page application.
  * `javascript` contains all of the client side javascript files.
    * `index.js` starts up the application by rendering the listings.
    * `network.js` manages all ajax requests to the server.
    * `views_manager.js` manages which components appear on screen.
    * `components` contains all of the individual html components. They are all created using jQuery.
* `sass` contains all of the sass files. 
* `server` contains all of the server side and database code.
  * `server.js` is the entry point to the application. This connects the routes to the database.
  * `apiRoutes.js` and `userRoutes.js` are responsible for any HTTP requests to `/users/something` or `/api/something`. 
  * `json` is a directory that contains a bunch of dummy data in `.json` files.
  * `database.js` is responsible for all queries to the database. It doesn't currently connect to any database, all it does is return data from `.json` files.

* Use `npm run local` to start server.
* Run the schema and seed files provided to create tables and fake data.
* Use PSQL command `\dt` to view all tables used for the project.

Project used to practice connecting an app to a database, and create safe queries,changing queries based on user picked filters. 

## Dependencies

* Install all required dependencies using `npm install`.
* bcrypt: ^3.0.6
* body-parser: ^1.19.0
* cookie-session: ^1.3.3
* express: ^4.17.1
* nodemon": ^1.19.1
* pg: ^8.8.0

## How to Use 

* After installing dependencies, start local server with `npm run local`.
* Server is hosted on port 3000 , visit `http://localhost:3000/`.
* Create the database, then use migrations/01_schema.sql to build tables
* Populate tables with seeds/02_seeds.sql
* Log in with credentials used to seed table, filter different types of listings based on your preferences.




