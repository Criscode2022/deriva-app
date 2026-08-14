/**
 * Generate environment.local.ts files from .env or process.env.
 *
 * Priority:
 * 1. Process environment (CI / Vercel)
 * 2. .env at the monorepo root
 * 3. .env.example as a fallback template (aborts for local dev)
 *
 * The frontend only needs API_BASE_URL. DATABASE_URL stays in apps/api.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..', '..', '..');
const webRoot = path.join(__dirname, '..');
const envPath = path.join(repoRoot, '.env');
const envExamplePath = path.join(repoRoot, '.env.example');

function resolveApiBaseUrl(fromEnv) {
  return fromEnv || '/api';
}

function generateEnvFiles(apiBaseUrl) {
  const envDir = path.join(webRoot, 'src', 'environments');
  fs.mkdirSync(envDir, { recursive: true });

  const devEnvContent = `// Auto-generated from .env or process.env. Do not commit.

export const environment = {
  production: false,
  apiBaseUrl: '${apiBaseUrl}'
};
`;

  const prodEnvContent = `// Auto-generated from .env or process.env. Do not commit.

export const environment = {
  production: true,
  apiBaseUrl: '${apiBaseUrl}'
};
`;

  fs.writeFileSync(path.join(envDir, 'environment.local.ts'), devEnvContent);
  fs.writeFileSync(
    path.join(envDir, 'environment.prod.local.ts'),
    prodEnvContent,
  );

  console.log('Environment files generated');
  console.log('  - apps/web/src/environments/environment.local.ts');
  console.log('  - apps/web/src/environments/environment.prod.local.ts');
}

const processApiBaseUrl = process.env.API_BASE_URL;

if (process.env.CI || process.env.VERCEL || processApiBaseUrl) {
  generateEnvFiles(resolveApiBaseUrl(processApiBaseUrl));
  process.exit(0);
}

if (!fs.existsSync(envPath)) {
  console.error('.env file not found at repo root.');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('Created .env from .env.example');
    console.log('Edit .env and add DATABASE_URL + JWT_SECRET, then retry.');
    process.exit(1);
  }
  console.error('.env.example is also missing.');
  process.exit(1);
}

const envVars = {};
fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .forEach((line) => {
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

generateEnvFiles(resolveApiBaseUrl(envVars.API_BASE_URL));
