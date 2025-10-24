import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import * as fs from "fs/promises";
import * as path from "path";

const writeFileSchema = z.object({
  filePath: z.string().describe("Path where to save the file"),
  content: z.string().describe("The code content to write"),
  language: z.string().describe("Programming language"),
  action: z.enum(["create", "update", "append"]).describe("Action to perform"),
});

export const writeFileProcedure = publicProcedure
  .input(writeFileSchema)
  .mutation(async ({ input }) => {
    try {
      const projectRoot = process.cwd();
      const allowedPaths = [
        path.join(projectRoot, "app"),
        path.join(projectRoot, "components"),
        path.join(projectRoot, "services"),
        path.join(projectRoot, "utils"),
        path.join(projectRoot, "types"),
        path.join(projectRoot, "config"),
        path.join(projectRoot, "constants"),
      ];

      const fullPath = path.resolve(projectRoot, input.filePath);

      const isAllowed = allowedPaths.some((allowedPath) =>
        fullPath.startsWith(allowedPath)
      );

      if (!isAllowed) {
        throw new Error(
          "File path is outside allowed directories for security reasons"
        );
      }

      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });

      if (input.action === "create" || input.action === "update") {
        await fs.writeFile(fullPath, input.content, "utf-8");
      } else if (input.action === "append") {
        await fs.appendFile(fullPath, "\n" + input.content, "utf-8");
      }

      return {
        success: true,
        message: `File ${input.action}d successfully at ${input.filePath}`,
        path: input.filePath,
      };
    } catch (error: any) {
      console.error("File write error:", error);
      throw new Error(`Failed to ${input.action} file: ${error.message}`);
    }
  });

export default writeFileProcedure;
