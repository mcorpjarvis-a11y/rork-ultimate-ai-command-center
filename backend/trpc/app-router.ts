import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import writeFileProcedure from "./routes/ai/writeFile/route";
import executeCodeProcedure from "./routes/ai/executeCode/route";
import createProjectProcedure from "./routes/ai/createProject/route";
import gitOperationProcedure from "./routes/ai/gitOperation/route";
import manageDependenciesProcedure from "./routes/ai/manageDependencies/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  ai: createTRPCRouter({
    writeFile: writeFileProcedure,
    executeCode: executeCodeProcedure,
    createProject: createProjectProcedure,
    gitOperation: gitOperationProcedure,
    manageDependencies: manageDependenciesProcedure,
  }),
});

export type AppRouter = typeof appRouter;
