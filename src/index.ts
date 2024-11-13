import express, { type Application } from "express";
import helmet from "helmet";
import { validateSessionToken } from "./libs/auth";
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
import { isProd } from "./utils";

const port = process.env.PORT || 4000;
const app: Application = express();

const whitelistOrigins = [
  "https://soundraft-ui-t9r8z.ondigitalocean.app",
  "https://app.soundraft.app",
];

const localWhitelistOrigins = [
  "http://localhost:3000",
  "http://localhost:4173",
];

const corsOptions = {
  origin: isProd() ? [...whitelistOrigins] : [...localWhitelistOrigins],
  credentials: true,
};

app.use(helmet());
app.set("trust proxy", true);
app.use(express.json());
app.use(cors(corsOptions));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));
app.use(errorHandler);

// app.use((req, res, next) => {
//   //   if (req.method === "GET") {
//   //     return next();
//   //   }
//   const originHeader = req.headers.origin ?? null;
//   const hostHeader = req.headers.host ?? null;
//   // console.log(originHeader, "originHeader");
//   // console.log(hostHeader, "hostHeader");
//   //   console.log(
//   //     verifyRequestOrigin(originHeader, [hostHeader]),
//   //     "verifyRequestOrigin(originHeader, [hostHeader])"
//   //   );
//   //   if (
//   //     !originHeader ||
//   //     !hostHeader ||
//   //     !verifyRequestOrigin(originHeader, [hostHeader])
//   //   ) {
//   //     return res.status(403).end();
//   //   }
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
    cookies.set(COOKIE_KEY, token, { secure: isProd() });
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
  console.log("Server is up and listening...🎧..🎸.🥁");
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
