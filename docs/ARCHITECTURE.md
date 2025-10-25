# 工作区架构规范

本项目采用 Next.js 14（App Router）+ TypeScript + Jest + Testing Library。以下为统一的目录组织、命名约定与配置规范，便于团队协作与持续演进。

## 顶层结构
- `app/`：页面与路由（App Router）。仅包含页面、路由及与路由强相关的服务端逻辑。
- `components/`：通用、可复用的 UI 组件与复合组件。子目录按领域或组件类型划分（如 `ui/`、`client/`）。
- `hooks/`：React Hooks（如业务/视图状态管理、数据获取等）。
- `lib/`：无 UI 的业务库与工具（API 客户端、验证、日志、密码、CSRF 等）。
- `middleware/`：中间件与与路由无关的服务端管线（鉴权、权限、CSRF、日志、弹性处理）。
- `contexts/`：React Context（全局状态或跨页面共享）。
- `models/`：领域模型与类型声明（数据结构、DTO、模型层）。
- `public/`：静态资源（图片、字体、图标）。
- `styles/`：全局与共享样式（Tailwind、CSS Modules、公共样式）。
- `scripts/`：开发/运维脚本（清理日志、工具脚本）。
- `docs/`：文档（本文件、子系统说明、贡献指南等）。
- `tests/`（可选）：如需集中管理测试，可在此放置端到端或跨模块测试；单元测试可与源码同层。

## 命名与约定
- 组件文件统一使用小写加连字符或语义化命名，如 `login-form.tsx`、`logo-loading.tsx`。
- 测试文件以 `*.test.ts(x)` 或 `*.spec.ts(x)` 命名，尽量与被测文件同层或在相邻的 `__tests__/` 中。
- 使用 `@/*` 路径别名引用根目录资源（已在 `tsconfig.json` 配置）。
- 仅保留一个 Next.js 配置文件：`next.config.mjs`（ESM 导出）。
- 环境变量：使用 `.env.local`、`.env.development.local`、`.env.production` 等并通过 `lib/env.ts` 统一读取与校验。

## 测试规范
- 使用 Jest + Testing Library：组件、Hook 与库函数分别撰写针对性的单测。
- 覆盖率目标：全局 `>= 80%`（见 `jest.config.ts` 的覆盖率阈值）。
- Mock 策略：公共 Mock 放在 `jest.setup.ts`，专用 Mock 在测试内就近定义。

## 安全与中间件
- CSRF：服务端通过 `lib/csrf.ts` 管理令牌生命周期、绑定与验证；客户端 Hook `hooks/use-csrf.ts` 获取令牌。
- Resilience：故障自修复中间件与预设在 `middleware/resilience-middleware.ts`，路由通过默认中间件包装。
- CSP & CORS：在 `next.config.mjs` 中统一配置；开发模式附加 `unsafe-eval` 以支持 HMR。

## 构建与部署
- `output: 'standalone'`：便于容器化部署（已在 `next.config.mjs` 设置）。
- 仅使用一个包管理器（pnpm），锁定版本与 Node 引擎（见 `package.json`）。

## 迁移建议（可选）
- 如需进一步收敛结构，可引入 `src/` 目录：将 `app/`、`components/`、`hooks/`、`lib/`、`middleware/` 等整体移入 `src/` 并将 `tsconfig.json` 中的 `baseUrl` 与 `paths` 指向 `src`。当前项目已稳定运行，建议在发布窗口内规划迁移，以避免大量相对路径调整。

## 目录示例
```
/ (项目根)
├─ app/
├─ components/
├─ hooks/
├─ lib/
├─ middleware/
├─ contexts/
├─ models/
├─ public/
├─ styles/
├─ scripts/
├─ docs/
├─ jest.config.ts
├─ jest.setup.ts
├─ next.config.mjs
├─ package.json
├─ pnpm-lock.yaml
├─ tsconfig.json
```

以上规范旨在保持结构清晰、职责边界明确，并兼顾安全、测试与部署的最佳实践。后续如有新增子系统或跨域模块，可在 `docs/` 中补充详细说明与设计决策。