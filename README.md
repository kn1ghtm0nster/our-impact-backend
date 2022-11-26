# Our Impact - Back-end

By Diego Quintanilla

Back-end setup for Our Impact project which contains main educational, city, weather, and user information that will be served via frontend.

---

## Technologies Used

-   **API :**

    -   [Open Weather API](https://openweathermap.org/api)

-   **CORE TECHNOLOGIES :**
    -   `Node.js`
    -   `Express.js`
    -   `PostgreSQL`
    -   `jsonschema`
    -   `jsonwebtoken`
    -   `bcrypt`

---

## Description

Repo contains the back-end logic that will be displayed via the react front-end. Bulk logic is done via backend `models` files which will create, update, and remove data from the database.

The back-end logic is also responsible for creation and validation of incoming `jsonwebtoken` values that will be kept on the front-end and sent to the back-end routes on each request that requires user authentication.

---

## Getting Started

Clone this repo to your machine.

Install all required dependencies with command: `npm install` OR `npm i`

Create a `database` for the `SQL` starting file to add the seed data for both the development and test databases. File can be found in the top-level directory under the name `capstone-2-schema.sql`

-   **NOTE :** In order for this file to execute as expected, you will need to have `PostgreSQL` installed to your environment.

Configure your `.env` file in order to get data from the external API. Free accounts will have access to the daily weather forecast which will be retrieved by the automatic `cron` job.

Once database has been setup and data has been setup, you can start the application by using command: `npm start`

To run **ALL** tests from the top-level directory, use commant: `npm test`.

-   **NOTE :** DO NOT change this command as it has already been configured to run all tests without creating issues.

---

### Dependencies

-   `axios`
-   `bcrypt`
-   `body-parser`
-   `colors` (terminal dependency)
-   `cors`
-   `cron` (automatic job)
-   `dotenv` (for your .env configuration)
-   `express`
-   `http-proxy-middleware`
-   `jest` (to run tests)
-   `jsonschema` (validation from POST/PATCH requests)
-   `jsonwebtoken` (authentication)
-   `morgan` (logging middleware)
-   `pg` (PostgreSQL package)

    **Dev Dependencies**

    -   `nodemon` (reload application on changes and run npm command)
    -   `supertest` (to run route tests)

---

### Executing program

1. In top-most level of application, `npm install` OR `npm i`.

2. Run the command for seeding the database with the starting cities: `psql < capstone-2-schema.sql`

3. Verify creation of the database within `PostgreSQL` by using command: `psql capstone_2`

    - **NOTE :** It is also highly recommended that you run the comman in step 1 for the test db by uncommenting the lines for the test db so you can run your tests correctly and without issues.

4. Run application with command: `npm start`

5. To run application tests use command: `npm test`

---

### Authors

-   Diego Quintanilla

    -   Email: diego.quintanilla@proton.me
    -   Phone: 214-886-5260
    -   [LinkedIn](https://www.linkedin.com/in/diegoquintanilla/)

-   [Open Weather Team](https://openweathermap.org/)

---
