import express, { Application } from "express";
// import { db } from "./config/db.ts";
import { lucia } from "./config/auth.ts";
import { router as authRouter } from "./router/auth.ts";
// import { verifyRequestOrigin } from "lucia";

const port = process.env.PORT || 4000;
const app: Application = express();

// app.use(express.urlencoded());
app.use(express.json());

// app.use((req, res, next) => {
//   if (req.method === "GET") {
//     return next();
//   }
//   const originHeader = req.headers.origin ?? null;
//   const hostHeader = req.headers.host ?? null;
//   console.log(originHeader, "originHeader");
//   console.log(hostHeader, "hostHeader");
//   console.log(
//     verifyRequestOrigin(originHeader, [hostHeader]),
//     "verifyRequestOrigin(originHeader, [hostHeader])"
//   );
//   if (
//     !originHeader ||
//     !hostHeader ||
//     !verifyRequestOrigin(originHeader, [hostHeader])
//   ) {
//     return res.status(403).end();
//   }
//   return next();
// });

app.use(async (req, res, next) => {
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
  if (!sessionId) {
    res.locals.user = null;
    res.locals.session = null;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    res.appendHeader(
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    );
  }
  if (!session) {
    res.appendHeader(
      "Set-Cookie",
      lucia.createBlankSessionCookie().serialize()
    );
  }
  res.locals.session = session;
  res.locals.user = user;
  return next();
});

app.use("/", authRouter);

app.listen(port, () => {
  console.log(`Musaik app listening at http://localhost:${port}`);
});

// db.connect((err, client) => {
//   if (err) {
//     return console.error("Error acquiring client", err.stack);
//   }

// const createUserTableQuery = `
// CREATE TABLE IF NOT EXISTS users (
//   id TEXT NOT NULL PRIMARY KEY,
//   username TEXT NOT NULL UNIQUE,
//   password TEXT NOT NULL
// );
//   `;

// const createSessionTableQuery = `
// CREATE TABLE IF NOT EXISTS sessions (
//   id TEXT NOT NULL PRIMARY KEY,
//   expires_at TIMESTAMPTZ NOT NULL,
//   user_id TEXT NOT NULL,
//   FOREIGN KEY (user_id) REFERENCES users(id)
// );
// `;

// client.query(createUserTableQuery);
// client.query(createSessionTableQuery);
// });
// email TEXT,
// first_name TEXT,
// last_name TEXT,
// avatar TEXT
