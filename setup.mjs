/**
 * This script helps with setting up environment variables for
 * ElevenLabs and Convex Auth.
 *
 * You can safely delete it and remove it from package.json scripts.
 */

import fs from "fs";
import { config as loadEnvFile } from "dotenv";
import { spawnSync } from "child_process";

if (!fs.existsSync(".env.local")) {
  // Something is off, skip the script.
  process.exit(0);
}

const config = {};
loadEnvFile({ path: ".env.local", processEnv: config, quiet: true });

const runOnceWorkflow = process.argv.includes("--once");

if (runOnceWorkflow && config.SETUP_SCRIPT_RAN !== undefined) {
  // The script has already ran once, skip.
  process.exit(0);
}

// The fallback should never be used.
const deploymentName =
  config.CONVEX_DEPLOYMENT?.split(":").slice(-1)[0] ?? "<your deployment name>";

const variables = JSON.stringify({
  help:
    "Welcome to the ElevenLabs Hackathon Kit! 🎙️\n\n" +
    "This setup will help you configure:\n" +
    "1. ElevenLabs API key (for voice AI features)\n" +
    "2. GitHub OAuth (optional, for sign-in)\n" +
    "3. Resend (optional, for magic link sign-in)",
  providers: [
    {
      name: "ElevenLabs",
      help:
        "Get your ElevenLabs API key from https://elevenlabs.io/api\n\n" +
        "This is required for Text-to-Speech and Conversational AI features.",
      variables: [
        {
          name: "ELEVENLABS_API_KEY",
          description: "your ElevenLabs API key",
        },
      ],
    },
    {
      name: "GitHub OAuth",
      help:
        "Create a GitHub OAuth App, follow the instruction here: " +
        "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app\n\n" +
        `When you're asked for a callback URL use:\n\n` +
        `  https://${deploymentName}.convex.site/api/auth/callback/github`,
      variables: [
        {
          name: "AUTH_GITHUB_ID",
          description: "the Client ID of your GitHub OAuth App",
        },
        {
          name: "AUTH_GITHUB_SECRET",
          description: "the generated client secret",
        },
      ],
    },
    {
      name: "Resend",
      help: "Sign up for Resend at https://resend.com/signup. Then create an API Key.",
      variables: [
        {
          name: "AUTH_RESEND_KEY",
          description: "the API Key",
        },
      ],
    },
  ],
  success:
    "🎉 You're all set! Your ElevenLabs Hackathon Kit is ready.\n\n" +
    "Run `bun run dev` to start building your voice AI app!\n\n" +
    "If you need to reconfigure, run `node setup.mjs`.",
});

console.error(
  "\n🎙️ ElevenLabs Hackathon Kit Setup\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
    "This command will walk you through setting up\n" +
    "the required environment variables.\n",
);

// Prefer bunx when running under Bun, otherwise fall back to npx
const spawnBin = process.env.BUN_ENV || process.versions.bun ? "bunx" : "npx";

const result = spawnSync(
  spawnBin,
  ["@convex-dev/auth", "--variables", variables, "--skip-git-check"],
  { stdio: "inherit" },
);

if (runOnceWorkflow) {
  fs.writeFileSync(".env.local", `\nSETUP_SCRIPT_RAN=1\n`, { flag: "a" });
}

process.exit(result.status);
