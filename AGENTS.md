# Repository Guidelines

## 项目约定与交付规则

- 本仓库用于维护「须臾之间」个人网站，基于 Amytis；保持现有技术栈和视觉风格，按当前任务做轻量修改，不顺带重构、升级依赖或全仓格式化。
- 默认使用中文沟通。站点身份与功能配置统一维护在 `site.config.ts`；未提供的个人信息、正式内容、域名和外部服务配置不得自行编造。
- 正式内容放在 `content/`；演示与回归测试样本只放在 `tests/fixtures/site/`，不得重新发布到正式内容树。
- 开始修改前检查 Git 分支、远程地址和工作区状态。保留其他聊天、用户及已有的未提交更改，只暂存当前任务的文件或差异块；必要时使用独立工作树。
- 用户已授权：本项目每次任务的更改完成并通过相关检查后，自动提交并推送到 `https://github.com/MatildaHan/BooksandMovies.git`，无需再次询问。用户在具体任务中要求不提交或不推送时，以该要求为准。
- 推送前核对远程确为上述仓库，检查差异与暂存内容，使用 Conventional Commits；向当前任务分支及其 upstream 正常推送。没有 upstream 时，在目标仓库建立同名分支；不要强制推送、覆盖他人提交或擅自合并分支。
- 检查按影响选择：纯文档修改检查内容、链接与 `git diff --check`；代码、内容解析、路由或配置修改执行相应 lint、类型检查与测试；影响静态导出、资源、搜索或站点配置时补充构建，提交 PR 前执行 `bun run validate`。
- 不上传依赖、构建产物、缓存、密钥、环境文件和 `imports/` 原始资料。网络、认证、检查或冲突导致无法交付时，保留本地工作并说明具体阻塞，不得把未执行或失败的检查报告为通过。
- 最终交付说明更改内容、验证结果、分支、提交号、是否已推送及是否进入 `main`，并提供 GitHub 链接。推送成功不等于网站已经部署，只有验证过部署后才能声称网站已更新。

## Project Structure & Module Organization
- `src/app/`: Next.js App Router pages and route handlers (`posts`, `series`, `books`, `flows`, `notes`, `tags`, `authors`, feeds, graph, sitemap, custom `[slug]` routes).
- `src/components/`: Reusable UI building blocks (cards, navigation, search, i18n/theme controls).
- `src/lib/`: Content parsing and shared logic (the `content/` data layer, feed helpers, URL helpers, rehype/remark utilities).
- `content/`: Markdown/MDX source content for posts, series, books, notes, flows, and static pages. Use folder posts (`index.mdx` + `images/` or `assets/`) when media is co-located.
- `tests/`: Integration/e2e/tooling suites; keep focused utility tests near source (example: `src/lib/format-utils.test.ts`).
- `scripts/`: Bun-based authoring/import/build tooling.
- `imports/`: Local-only staging area for chat logs, PDFs, and image folders consumed by import scripts; see `imports/README.md`.
- `packages/create-amytis/`: The `bun create amytis` scaffold CLI; keep its tests aligned with repo scaffolding behavior.
- `site.config.ts` is the sole live site configuration. Content regression tests use `tests/fixtures/site/` in an isolated temporary workspace; never copy those documents into the published content tree.

## Build, Test, and Development Commands
- `bun install`: Install dependencies.
- `bun dev`: Run local dev server at `http://localhost:3000`.
- `bun run build`: Production export build (copy assets, generate graph, Next build, optimize images, generate Pagefind index in `out/pagefind`).
- `bun run build:dev`: Build without export image optimization and generate the dev search index in `public/pagefind`.
- `bun run build:graph`: Regenerate the knowledge graph data.
- `bun run validate`: Run the recommended pre-PR validation sequence (`lint`, `typecheck`, `test`, `build:dev`).
- `bun run clean`: Remove generated outputs (`.next`, `out`, `public/posts`, `public/books`, `public/flows`).
- `bun run lint`: Run ESLint.
- `bun run test` / `bun run test:unit` / `bun run test:int` / `bun run test:e2e` / `bun run test:mobile`: Run all or scoped tests. Use `bun run test`, not bare `bun test` — the bare form sweeps in Playwright e2e specs and fails.
- Content tooling: `bun run new`, `bun run new-series`, `bun run new-note`, `bun run new-flow`, `bun run new-flow-from-chat`, `bun run new-from-pdf`, `bun run new-from-images`, `bun run import-obsidian`, `bun run import-book`, `bun run sync-book`, `bun run series-draft`, `bun run add-series-redirects`.

## Coding Style & Naming Conventions
- Use TypeScript for app and utility code; MDX/Markdown for content.
- Match existing file style and let ESLint enforce consistency.
- Naming: components in PascalCase (`PostCard.tsx`), helpers in camelCase (`getAuthorSlug`), content slugs in kebab-case unless intentionally Unicode.
- Keep business logic in `src/lib/` and keep route files thin.

## Static Export Route Rules (Important)
- Project uses `output: "export"` and `trailingSlash: true` in `next.config.ts`.
- In `generateStaticParams()`, return raw segment values; do not pre-encode with `encodeURIComponent`.
- Never link to route placeholders like `/posts/[slug]`; always link to concrete slugs (for example, `/posts/中文测试文章`).
- Posts default to `/<posts.basePath>/<slug>`, but may also resolve through `series.autoPaths`, `series.customPaths`, and `[slug]/[postSlug]`; preserve URL helpers instead of hardcoding paths.
- Before moving series posts away from the default posts path, run `bun run add-series-redirects --dry-run` and then `bun run add-series-redirects` so legacy URLs keep resolving.
- When touching dynamic routes, verify both ASCII and Unicode paths.

## Testing Guidelines
- Test framework: Bun (`bun:test`). File pattern: `*.test.ts`.
- Add tests when changing slug resolution, content parsing, routing, feed generation, or scaffolding scripts.
- Before PR: run `bun run validate`.
- Search in local dev depends on the Pagefind output from `bun run build:dev`; regenerate it when changing content or search behavior.

## Commit & Pull Request Guidelines
- Follow Conventional Commits used in history (`feat:`, `fix:`, `refactor:`, `docs:`, `release:`).
- Keep commits single-purpose and include impacted paths in PR description.
- PRs should include intent, validation steps, and screenshots for UI changes.
- CI must pass (`bun install --frozen-lockfile`, lint, test, build).
