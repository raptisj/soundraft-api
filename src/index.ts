import express, { Application } from "express";
import { lucia } from "./config/auth.ts";
import { router as authRouter } from "./router/auth.ts";
import { router as projectRouter } from "./router/projects.ts";
import { router as ticketRouter } from "./router/tickets.ts";
import { router as invitationRouter } from "./router/invitations.ts";
import { router as commentRouter } from "./router/comments.ts";

import fileUpload from "express-fileupload";
import cors from "cors";
import { errorHandler } from "./config/errors.ts";
// import { verifyRequestOrigin } from "lucia";

const port = process.env.PORT || 4000;
const app: Application = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));

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

app.use(errorHandler);

app.listen(port, async () => {
  console.log(`Musaik app listening at http://localhost:${port}`);
  // await lucia.deleteExpiredSessions();
});
