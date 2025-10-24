import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs/promises";

const execAsync = promisify(exec);

const createProjectSchema = z.object({
  projectType: z.string().describe("Type of project"),
  framework: z.string().describe("Framework to use"),
  projectName: z.string().describe("Name of the project"),
  directory: z.string().describe("Directory where to create the project"),
});

export const createProjectProcedure = publicProcedure
  .input(createProjectSchema)
  .mutation(async ({ input }) => {
    try {
      const projectRoot = process.cwd();
      const allowedDir = path.join(projectRoot, "projects");
      const fullPath = path.resolve(allowedDir, input.directory, input.projectName);

      if (!fullPath.startsWith(allowedDir)) {
        throw new Error("Project directory is outside allowed path");
      }

      await fs.mkdir(fullPath, { recursive: true });

      let command = "";
      const framework = input.framework.toLowerCase();

      if (framework.includes("react") || framework.includes("next")) {
        command = `npx create-next-app@latest ${input.projectName} --typescript --tailwind --app --no-src-dir`;
      } else if (framework.includes("express")) {
        command = `mkdir ${input.projectName} && cd ${input.projectName} && npm init -y && npm install express`;
      } else if (framework.includes("django")) {
        command = `django-admin startproject ${input.projectName}`;
      } else if (framework.includes("react-native")) {
        command = `npx create-expo-app ${input.projectName} --template blank-typescript`;
      } else {
        await fs.writeFile(
          path.join(fullPath, "README.md"),
          `# ${input.projectName}\n\nCreated with ${input.framework}`
        );
        await fs.writeFile(
          path.join(fullPath, "package.json"),
          JSON.stringify(
            {
              name: input.projectName,
              version: "1.0.0",
              description: `${input.projectType} project`,
            },
            null,
            2
          )
        );
      }

      if (command) {
        await execAsync(command, {
          cwd: path.dirname(fullPath),
          timeout: 120000,
        });
      }

      return {
        success: true,
        message: `Project ${input.projectName} created successfully`,
        path: fullPath,
        framework: input.framework,
      };
    } catch (error: any) {
      console.error("Project creation error:", error);
      throw new Error(`Failed to create project: ${error.message}`);
    }
  });

export default createProjectProcedure;
