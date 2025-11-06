// @ts-nocheck
import Hono from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const honoApp = new Hono();

honoApp.use("*", cors());

honoApp.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

honoApp.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

export default honoApp;
