import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const gitOperationSchema = z.object({
  operation: z
    .enum(["commit", "push", "pull", "branch", "merge", "status"])
    .describe("Git operation to perform"),
  message: z.string().optional().describe("Commit message"),
  repository: z.string().optional().describe("Repository URL or path"),
  branchName: z.string().optional().describe("Branch name"),
});

export const gitOperationProcedure = publicProcedure
  .input(gitOperationSchema)
  .mutation(async ({ input }) => {
    try {
      const projectRoot = process.cwd();
      let command = "";
      let output = "";

      switch (input.operation) {
        case "status":
          command = "git status";
          break;

        case "commit":
          if (!input.message) {
            throw new Error("Commit message is required");
          }
          command = `git add . && git commit -m "${input.message}"`;
          break;

        case "push":
          command = "git push";
          if (input.repository) {
            command = `git push ${input.repository}`;
          }
          break;

        case "pull":
          command = "git pull";
          if (input.repository) {
            command = `git pull ${input.repository}`;
          }
          break;

        case "branch":
          if (!input.branchName) {
            throw new Error("Branch name is required");
          }
          command = `git checkout -b ${input.branchName}`;
          break;

        case "merge":
          if (!input.branchName) {
            throw new Error("Branch name is required for merge");
          }
          command = `git merge ${input.branchName}`;
          break;

        default:
          throw new Error(`Unknown git operation: ${input.operation}`);
      }

      try {
        const result = await execAsync(command, {
          cwd: projectRoot,
          timeout: 30000,
        });
        output = result.stdout || result.stderr || "Operation completed";
      } catch (error: any) {
        output = error.stderr || error.stdout || error.message;
        if (
          output.includes("nothing to commit") ||
          output.includes("Already up to date")
        ) {
          return {
            success: true,
            operation: input.operation,
            output,
          };
        }
        throw error;
      }

      return {
        success: true,
        operation: input.operation,
        output,
      };
    } catch (error: any) {
      console.error("Git operation error:", error);
      throw new Error(
        `Failed to execute git ${input.operation}: ${error.message}`
      );
    }
  });

export default gitOperationProcedure;
