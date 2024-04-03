import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import { db } from "./config/db";

const port = process.env.PORT || 4000;
const app: Application = express();

app.listen(port, () => {
  console.log(`Musaik app listening at http://localhost:${port}`);
});

db.connect((err, client) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }

  const createUserTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT NOT NULL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        avatar TEXT NOT NULL
      );
    `;

  const createSessionTableQuery = `
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT NOT NULL PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `;

  client.query(createUserTableQuery);
  client.query(createSessionTableQuery);
});
