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
import { router as publicTokenRouter } from "./router/publicTokens";
import Cookies from "cookies";
import { rateLimit } from "express-rate-limit";

import fileUpload from "express-fileupload";
import cors from "cors";
import { errorHandler } from "./config/errors";
import { COOKIE_KEY, COOKIE_MAX_AGE } from "./constants";
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
app.set("trust proxy", 1); // true
app.use(express.json());
app.use(cors(corsOptions));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));
app.use(errorHandler);

app.use(async (req, res, next) => {
  const cookies = new Cookies(req, res, {});
  const token = cookies.get(COOKIE_KEY);
  const anonUserId = cookies.get("sd_auid");

  if (!token && !anonUserId) {
    res.locals.user = null;
    res.locals.session = null;

    return next();
  }

  if (!token && anonUserId) {
    res.locals.user = null;
    res.locals.session = null;
    res.locals.anon_user_id = anonUserId;

    return next();
  }

  const { session, user } = await validateSessionToken(token);
  if (session?.fresh) {
    cookies.set(COOKIE_KEY, token, {
      secure: isProd(),
      maxAge: 24 * 60 * 60 * 1000, // COOKIE_MAX_AGE // 30 days
    });
  }

  if (!session) {
    cookies.set(COOKIE_KEY, "", { maxAge: 0 });
  }
  res.locals.session = session;
  res.locals.user = user;
  res.locals.anon_user_id = null;

  return next();
});

export const publicPageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes maybe do this 30 minutes
  max: 15, // maybe do this 60 requests per windowMs???
  message: "Too many requests to public page, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) =>
    res.status(429).json({ error: "rate_limit_error" }),
  skip: (_, res) => res.locals?.user?.id,
});

// middleware for public pages
app.use(async (req, res, next) => {
  const cookies = new Cookies(req, res, {});
  const token = cookies.get(COOKIE_KEY);
  const anonUserId = cookies.get("sd_auid");

  if (!token && anonUserId) {
    if (
      req.path.startsWith("/v1/public/tickets") ||
      req.path.startsWith("/v1/user") ||
      req.path.startsWith("/v1/tickets") ||
      req.path.startsWith("/v1/reactions")
    ) {
      return publicPageLimiter(req, res, next);
    }
  }

  return next();
});

app.use("/", authRouter);
app.use("/", projectRouter);
app.use("/", ticketRouter);
app.use("/", invitationRouter);
app.use("/", commentRouter);
app.use("/", roleRouter);
app.use("/", reactionRouter);
app.use("/", publicTokenRouter);

app.listen(port, async () => {
  console.log("Server is up and listening...🎧..🎸.🥁");
});

process.on("uncaughtException", (error: Error) => {
  console.error(error, "global uncaughtException");
  process.exit(1);
});

process.on("unhandledRejection", (error: Error) => {
  console.error(error, "global unhandledRejection");
  process.exit(1);
});

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
