import { spawn } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

function start(label, cwd, args) {
  const child = spawn(npmCmd, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
  });
  child.on("exit", (code, signal) => {
    if (signal) return;
    if (code !== 0) {
      console.error(`[dev] ${label} exited with code ${code}`);
      process.exitCode = code ?? 1;
    }
  });
  return child;
}

// scripts/dev.mjs lives in `Skecho/scripts/`
// Use fileURLToPath so Windows gets a proper `D:\...` path (not `/D:/...`).
const rootDir = fileURLToPath(new URL("..", import.meta.url));
const backendDir = fileURLToPath(new URL("../backend", import.meta.url));

const backendProc = start("backend", backendDir, ["run", "dev"]);
const nextProc = start("next", rootDir, ["run", "dev:next"]);

function shutdown(code = 0) {
  try {
    backendProc.kill("SIGINT");
  } catch { }
  try {
    nextProc.kill("SIGINT");
  } catch { }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
