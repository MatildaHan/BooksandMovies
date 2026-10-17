import { cpSync, mkdtempSync, readdirSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Content regression tests use an isolated site. They must never depend on,
// create files in, or publish sample documents into the personal content tree.
const root = process.cwd();
const suite = process.argv[2] ?? 'all';
const suites: Record<string, string[][]> = {
  unit: [['test', 'src', 'tests/unit', 'packages/create-amytis/src']],
  integration: [['test', 'tests/integration']],
  dom: [['test', 'tests/dom', '--preload', './tests/dom/setup.ts']],
  all: [
    ['test', 'src', 'tests/unit', 'tests/tooling', 'packages/create-amytis/src'],
    ['test', 'tests/integration'],
    ['test', 'tests/dom', '--preload', './tests/dom/setup.ts'],
  ],
};

if (!Object.hasOwn(suites, suite)) {
  throw new Error(`Unknown test suite: ${suite}`);
}

const workspace = mkdtempSync(path.join(tmpdir(), 'xuyu-tests-'));
function testFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? testFiles(target) : /\.test\.tsx?$/.test(entry.name) ? [target] : [];
  }).sort();
}

let exitCode = 0;
try {
  for (const entry of ['src', 'scripts', 'tests', 'packages', 'package.json', 'tsconfig.json']) {
    cpSync(path.join(root, entry), path.join(workspace, entry), { recursive: true });
  }
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isFile()) cpSync(path.join(root, entry.name), path.join(workspace, entry.name));
  }
  for (const entry of ['docs', 'public', '.github']) {
    cpSync(path.join(root, entry), path.join(workspace, entry), { recursive: true });
  }
  cpSync(path.join(root, 'tests/fixtures/site/content'), path.join(workspace, 'content'), { recursive: true });
  cpSync(path.join(root, 'tests/fixtures/site/site.config.ts'), path.join(workspace, 'site.config.ts'));
  symlinkSync(path.join(root, 'node_modules'), path.join(workspace, 'node_modules'), 'dir');
  // The UTF-8 guard enumerates tracked sources. Source ZIPs have no .git, so
  // index the disposable snapshot; never initialize or change the user's repo.
  for (const args of [['init', '--quiet'], ['add', '--all']]) {
    const result = Bun.spawnSync(['git', ...args], { cwd: workspace, stdout: 'inherit', stderr: 'inherit' });
    if (result.exitCode !== 0) throw new Error('Could not prepare the temporary source index.');
  }
  for (const args of suites[suite]) {
    const preloadIndex = args.indexOf('--preload');
    const directories = args.slice(1, preloadIndex < 0 ? args.length : preloadIndex);
    const options = preloadIndex < 0 ? [] : args.slice(preloadIndex);
    // mock.module() is process-global in Bun. Give each test file a fresh
    // process so route/component stubs cannot replace another file's modules.
    for (const directory of directories) {
      for (const file of testFiles(path.join(workspace, directory))) {
        const result = Bun.spawnSync([process.execPath, 'test', file, ...options], {
          cwd: workspace, stdout: 'inherit', stderr: 'inherit',
        });
        if (result.exitCode !== 0) exitCode = result.exitCode;
      }
    }
  }
} finally {
  rmSync(workspace, { recursive: true, force: true });
}

if (exitCode === 0 && suite === 'all') {
  exitCode = Bun.spawnSync([process.execPath, 'test', 'tests/site'], {
    cwd: root, stdout: 'inherit', stderr: 'inherit',
  }).exitCode;
}
process.exit(exitCode);
