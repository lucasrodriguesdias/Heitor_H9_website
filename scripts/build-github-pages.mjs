import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = fileURLToPath(new URL("../out/", import.meta.url));
const nextCli = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);

rmSync(outputDirectory, { recursive: true, force: true });

const result = spawnSync(
  process.execPath,
  [nextCli, "build", "--webpack"],
  {
    cwd: projectRoot,
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      GITHUB_PAGES_BASE_PATH:
        process.env.GITHUB_PAGES_BASE_PATH || "/Heitor_H9_website",
    },
    stdio: "inherit",
  },
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(new URL("../out/.nojekyll", import.meta.url), "");
console.log("GitHub Pages export ready in out/ (including .nojekyll).");
