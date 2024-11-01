import express, { type Application } from "express";
import helmet from "helmet";
import { validateSessionToken } from "./config/auth";
import { router as authRouter } from "./router/auth";
import { router as projectRouter } from "./router/projects";
import { router as ticketRouter } from "./router/tickets";
import { router as invitationRouter } from "./router/invitations";
import { router as commentRouter } from "./router/comments";
import { router as roleRouter } from "./router/roles";
import { router as reactionRouter } from "./router/reactions";
import Cookies from "cookies";

import fileUpload from "express-fileupload";
import cors from "cors";
import { errorHandler } from "./config/errors";
import { COOKIE_KEY } from "./constants";

const port = process.env.PORT || 4000;
const apiUrl =
  process.env.NODE_ENV === "development"
    ? process.env.LOCAL_API_URL
    : process.env.PROD_API_URL;

console.log(process.env.NODE_ENV, "process.env.NODE_ENV");
const app: Application = express();

const whitelistOrigins = [
  // "http://localhost:3000",
  // "http://localhost:4173",
  "https://soundraft-ui-t9r8z.ondigitalocean.app",
  "https://app.soundraft.app",
];

const corsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? ["http://localhost:3000", "http://localhost:4173"]
      : [...whitelistOrigins],
  credentials: true,
};

app.use(helmet());
app.use(express.json());
app.use(cors(corsOptions));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));
app.use(errorHandler);

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
  const cookies = new Cookies(req, res, {});
  const token = cookies.get(COOKIE_KEY);

  if (!token) {
    res.locals.user = null;
    res.locals.session = null;

    return next();
  }

  const { session, user } = await validateSessionToken(token);
  if (session?.fresh) {
    cookies.set(COOKIE_KEY, token);
  }

  if (!session) {
    cookies.set(COOKIE_KEY, null);
  }
  res.locals.session = session;
  res.locals.user = user;

  return next();
});

app.use("/", authRouter);
app.use("/", projectRouter);
app.use("/", ticketRouter);
app.use("/", invitationRouter);
app.use("/", commentRouter);
app.use("/", roleRouter);
app.use("/", reactionRouter);

app.listen(port, async () => {
  console.log(`Soundraft api listening at ${apiUrl}`);
  // TODO: delete expired sessions
});

process.on("uncaughtException", (error: Error) => {
  console.error(error, "global uncaughtException");
  process.exit(1);
});

process.on("unhandledRejection", (error: Error) => {
  console.error(error, "global unhandledRejection");
  process.exit(1);
});
