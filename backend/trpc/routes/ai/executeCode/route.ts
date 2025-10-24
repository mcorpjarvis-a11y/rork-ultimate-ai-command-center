import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";

const execAsync = promisify(exec);

const executeCodeSchema = z.object({
  language: z.string().describe("Programming language"),
  code: z.string().describe("Code to execute"),
  environment: z.string().describe("Execution environment"),
});

export const executeCodeProcedure = publicProcedure
  .input(executeCodeSchema)
  .mutation(async ({ input }) => {
    try {
      const tempDir = path.join(process.cwd(), ".temp", "sandbox");
      await fs.mkdir(tempDir, { recursive: true });

      let output = "";
      let exitCode = 0;

      switch (input.language.toLowerCase()) {
        case "javascript":
        case "typescript": {
          const tempFile = path.join(tempDir, "temp.js");
          await fs.writeFile(tempFile, input.code);
          try {
            const result = await execAsync(`node ${tempFile}`, {
              timeout: 10000,
            });
            output = result.stdout;
          } catch (error: any) {
            output = error.stderr || error.stdout || error.message;
            exitCode = error.code || 1;
          }
          await fs.unlink(tempFile);
          break;
        }

        case "python": {
          const tempFile = path.join(tempDir, "temp.py");
          await fs.writeFile(tempFile, input.code);
          try {
            const result = await execAsync(`python3 ${tempFile}`, {
              timeout: 10000,
            });
            output = result.stdout;
          } catch (error: any) {
            output = error.stderr || error.stdout || error.message;
            exitCode = error.code || 1;
          }
          await fs.unlink(tempFile);
          break;
        }

        default:
          throw new Error(`Language ${input.language} is not supported yet`);
      }

      return {
        success: exitCode === 0,
        output,
        exitCode,
        language: input.language,
        environment: input.environment,
      };
    } catch (error: any) {
      console.error("Code execution error:", error);
      return {
        success: false,
        output: error.message,
        exitCode: 1,
        language: input.language,
        environment: input.environment,
      };
    } finally {
      const tempDir = path.join(process.cwd(), ".temp", "sandbox");
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {}
    }
  });

export default executeCodeProcedure;
