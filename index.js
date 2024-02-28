const express = require('express');
const pg = require('pg');
const path = require('path');

const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_flavor_db')

const app = express();
app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/"), (req, res, next) =>
res.sendFile(path.join(__dirname, 'index.html'));

app.get("/api/flavor", async (req, res, next) => {
    try {
      res.send((await client.query("SELECT * FROM flavor")).rows);
      const SQL = "SELECT * FROM flavor";
      const response = await client.query(SQL);
      res.send(response.rows);
    } catch (ex) {
      next(ex);
    }
  });

  app.post("/api/flavor", async (req, res, next) => {
    try {
      res.send(
        (
          await client.query("INSERT INTO flavor(name) VALUES($1) RETURNING *", [
            req.body.name,
          ])
        ).rows[0]
      );
      const SQL = "INSERT INTO flavor(name) VALUES($1) RETURNING *";
      const response = await client.query(SQL, [req.body.name]);
      res.send(response.rows[0]);
    } catch (ex) {
      next(ex);
    }
  });


  app.put("/api/flavor/:id", async (req, res, next) => {
    try {
      res.send(
        (
          await client.query(
            "UPDATE flavors SET name=$1 WHERE id=$2 RETURNING *",
            [req.body.name, req.params.id]
          )
        ).rows[0]
      );
      const SQL = "UPDATE flavor SET name=$1 WHERE id=$2 RETURNING *";
      const response = await client.query(SQL, [req.body.name, req.params.id]);
      res.send(response.rows[0]);
    } catch (ex) {
      next(ex);
    }
  });

  app.delete("/api/flavor/:id", async (req, res, next) => {
    try {
      res.send(
        (
          await client.query("DELETE FROM flavor WHERE id=$1 RETURNING *", [
            req.params.id,
          ])
        ).rows[0]
      );
      const SQL = "DELETE FROM flavor WHERE id=$1 RETURNING *";
      const response = await client.query(SQL, [req.params.id]);
      res.send(response.rows[0]);
    } catch (ex) {
      next(ex);
    }
  });

  const init = async () => {
    await client.connect();
    const SQL = `
          DROP TABLE IF EXISTS flavor;
          CREATE TABLE flavor(
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  
          );
          INSERT INTO flavors(name) VALUES('Vanilla');
          INSERT INTO flavors(name) VALUES('mango');
          INSERT INTO flavors(name) VALUES('Cookies&Cream');
          INSERT INTO flavors(name) VALUES('Pecan');
          
          `;
    await client.query(SQL);
    console.log("database has been seeded");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`App listening in port ${PORT}`));
  };
  init();
  
  