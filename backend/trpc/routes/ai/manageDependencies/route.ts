import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const manageDependenciesSchema = z.object({
  action: z.enum(["install", "update", "remove"]).describe("Action to perform"),
  packages: z.array(z.string()).describe("List of package names"),
  packageManager: z
    .enum(["npm", "yarn", "pnpm", "bun", "pip", "cargo", "composer"])
    .describe("Package manager to use"),
});

export const manageDependenciesProcedure = publicProcedure
  .input(manageDependenciesSchema)
  .mutation(async ({ input }) => {
    try {
      const projectRoot = process.cwd();
      let command = "";
      const packagesStr = input.packages.join(" ");

      switch (input.packageManager) {
        case "npm":
          if (input.action === "install") command = `npm install ${packagesStr}`;
          else if (input.action === "update")
            command = `npm update ${packagesStr}`;
          else if (input.action === "remove")
            command = `npm uninstall ${packagesStr}`;
          break;

        case "yarn":
          if (input.action === "install") command = `yarn add ${packagesStr}`;
          else if (input.action === "update")
            command = `yarn upgrade ${packagesStr}`;
          else if (input.action === "remove")
            command = `yarn remove ${packagesStr}`;
          break;

        case "pnpm":
          if (input.action === "install") command = `pnpm add ${packagesStr}`;
          else if (input.action === "update")
            command = `pnpm update ${packagesStr}`;
          else if (input.action === "remove")
            command = `pnpm remove ${packagesStr}`;
          break;

        case "bun":
          if (input.action === "install") command = `bun add ${packagesStr}`;
          else if (input.action === "update")
            command = `bun update ${packagesStr}`;
          else if (input.action === "remove")
            command = `bun remove ${packagesStr}`;
          break;

        case "pip":
          if (input.action === "install") command = `pip install ${packagesStr}`;
          else if (input.action === "update")
            command = `pip install --upgrade ${packagesStr}`;
          else if (input.action === "remove")
            command = `pip uninstall -y ${packagesStr}`;
          break;

        case "cargo":
          if (input.action === "install") command = `cargo add ${packagesStr}`;
          else if (input.action === "update")
            command = `cargo update ${packagesStr}`;
          else if (input.action === "remove")
            command = `cargo remove ${packagesStr}`;
          break;

        case "composer":
          if (input.action === "install")
            command = `composer require ${packagesStr}`;
          else if (input.action === "update")
            command = `composer update ${packagesStr}`;
          else if (input.action === "remove")
            command = `composer remove ${packagesStr}`;
          break;

        default:
          throw new Error(`Unknown package manager: ${input.packageManager}`);
      }

      let output = "";
      try {
        const result = await execAsync(command, {
          cwd: projectRoot,
          timeout: 180000,
        });
        output = result.stdout || result.stderr || "Operation completed";
      } catch (error: any) {
        output = error.stderr || error.stdout || error.message;
        console.error("Package management error:", output);
        throw error;
      }

      return {
        success: true,
        action: input.action,
        packages: input.packages,
        packageManager: input.packageManager,
        output,
      };
    } catch (error: any) {
      console.error("Dependency management error:", error);
      throw new Error(
        `Failed to ${input.action} packages: ${error.message}`
      );
    }
  });

export default manageDependenciesProcedure;
