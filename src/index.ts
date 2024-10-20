import express, { Application } from "express";
// import ViteExpress from "vite-express";
import helmet from "helmet";
import { lucia } from "./config/auth.ts";
import { router as authRouter } from "./router/auth.ts";
import { router as projectRouter } from "./router/projects.ts";
import { router as ticketRouter } from "./router/tickets.ts";
import { router as invitationRouter } from "./router/invitations.ts";
import { router as commentRouter } from "./router/comments.ts";
import { router as roleRouter } from "./router/roles.ts";
import { router as reactionRouter } from "./router/reactions.ts";

import fileUpload from "express-fileupload";
import cors from "cors";
import { errorHandler } from "./config/errors.ts";
// import { verifyRequestOrigin } from "lucia";

const port = process.env.PORT || 4000;
const apiUrl =
  process.env.NODE_ENV === "development"
    ? process.env.LOCAL_API_URL
    : process.env.PROD_API_URL;

console.log(process.env.NODE_ENV, "process.env.NODE_ENV");
const app: Application = express();

// TODO: add process.env.CLIENT_APP_URL;
const clientAappUrl = process.env.CLIENT_APP_URL;
const corsOptions = {
  origin: clientAappUrl,
  // origin: "http://localhost:3000",
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
app.use("/", projectRouter);
app.use("/", ticketRouter);
app.use("/", invitationRouter);
app.use("/", commentRouter);
app.use("/", roleRouter);
app.use("/", reactionRouter);

app.listen(port, async () => {
  console.log(`Soundraft api listening at ${apiUrl}`);
  // console.log(`Soundraft api listening at http://localhost:${port}`);
  // await lucia.deleteExpiredSessions();
});

process.on("uncaughtException", (error: any) => {
  console.error(error, "global uncaughtException");
  process.exit(1);
});

process.on("unhandledRejection", (error: any) => {
  console.error(error, "global unhandledRejection");
  process.exit(1);
});
