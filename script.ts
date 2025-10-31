import { config as dotenvConfig } from 'dotenv';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

dotenvConfig({ path: path.resolve(__dirname, '.env') });

function parseCli(argv: string[]): Record<string, string> {
  const flags: Record<string, string> = {};

  let i = 0;
  while (i < argv.length) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      i += 1;
      continue;
    }

    const eqIdx = token.indexOf('=');
    let key = token.slice(2, eqIdx > -1 ? eqIdx : undefined);
    let value = '';

    if (eqIdx > -1) {
      value = token.slice(eqIdx + 1);
    } else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
      value = argv[i + 1];
      i += 1;
    } else {
      if (key.startsWith('no-')) {
        key = key.slice(3);
        value = 'false';
      } else {
        value = 'true';
      }
    }

    flags[key] = value;

    i += 1;
  }

  return flags;
}

function findScriptFiles(): Record<string, string> {
  const scripts: Record<string, string> = {};
  const workspacePackages = ['backend', 'frontend', 'infra'];

  for (const pkg of workspacePackages) {
    const scriptsDir = path.join(__dirname, pkg, 'scripts');

    try {
      if (!statSync(scriptsDir).isDirectory()) continue;
    } catch {
      continue;
    }

    const files = readdirSync(scriptsDir).filter((n) => /\.(ts|js)$/.test(n) && !/^run\.(ts|js)$/.test(n));

    for (const fileName of files) {
      const scriptName = fileName.replace(/\.(ts|js)$/, '').replace(/\.script$/, '');
      const fullPath = path.join(scriptsDir, fileName);

      if (scripts[scriptName]) {
        const existingPath = scripts[scriptName];
        const existingPkg = path.relative(__dirname, existingPath).split(path.sep)[0];
        console.warn(`⚠️  Duplicate script name "${scriptName}" found in ${pkg} and ${existingPkg}`);
      }
      scripts[scriptName] = fullPath;
    }
  }

  return scripts;
}

async function resolveScript(scriptName: string): Promise<(args: Record<string, string>) => Promise<void>> {
  const scripts = findScriptFiles();
  const scriptPath = scripts[scriptName];

  if (!scriptPath) {
    throw new Error(`Unknown script: ${scriptName}`);
  }

  try {
    const relativePath = `./${path.relative(__dirname, scriptPath).replace(/\\/g, '/')}`;
    console.log('Importing script', relativePath);
    const module = await import(relativePath);
    if (typeof module.run === 'function') {
      return module.run;
    }
    throw new Error(`Script ${scriptName} does not export a "run" function`);
  } catch (error) {
    throw new Error(`Failed to import script ${scriptName}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main(): Promise<void> {
  const [, , ...rawArgs] = process.argv;

  if (rawArgs.length === 0) {
    const scripts = findScriptFiles();
    const available = Object.keys(scripts).sort();

    console.error('Usage: pnpm script <script-name> [--key value|--flag|--key=value]');
    console.error('Available scripts:', available.join(', '));
    console.error('\nScript locations:');
    for (const [name, fullPath] of Object.entries(scripts)) {
      const relativePath = path.relative(__dirname, fullPath);
      console.error(`  ${name}: ${relativePath}`);
    }
    process.exit(1);
  }

  const [scriptName, ...scriptArgv] = rawArgs;
  const parsed = parseCli(scriptArgv);

  try {
    const script = await resolveScript(scriptName);
    await script(parsed);
  } catch (error) {
    console.error(`❌ Script failed: ${scriptName}`);
    console.error(error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Runner failed unexpectedly');
  console.error(error);
  process.exit(1);
});
