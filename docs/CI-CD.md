# CI/CD 与高可用

- 仓库地址：`https://github.com/YYC-Cube/yyc3-smart-office.git`
- 联系邮箱：`admin@0379.email`

本文档概述本项目的 CI/CD 工作流、容器化方案与 Kubernetes 高可用部署。

## CI 工作流（.github/workflows/ci.yml）
- 触发：推送或 PR 到 `main`。
- 步骤：
  - `pnpm` + Node 20 环境，缓存依赖。
  - `pnpm install --frozen-lockfile`。
  - `pnpm lint`、`npx tsc --noEmit` 类型检查。
  - `pnpm test --ci`，产出 `junit.xml` 测试报告并作为 Artifact 上传。
  - `pnpm build` 构建 Next.js。

## CD 工作流（.github/workflows/cd.yml）
- 触发：推送版本标签 `v*.*.*` 或手动触发（需要选择环境）。
- 镜像：使用 `docker/build-push-action` 构建并推送到 GHCR（`ghcr.io/<owner>/<repo>:<tag>` 与 `:latest`）。
- 可选部署：若配置 `KUBE_CONFIG` Secret，则自动使用 `infra/k8s/*.yaml` 部署到集群。

### 所需 Secrets
- `KUBE_CONFIG`：KubeConfig 内容（可选，用于 CD 阶段自动部署）。
- 如使用自定义镜像仓库，需新增 `DOCKER_USERNAME` / `DOCKER_PASSWORD` 并修改工作流登录步骤。

## 容器化
- `Dockerfile`：多阶段构建，利用 Next.js `output: 'standalone'`，启动 `server.js`，并带 `/api/health` 健康检查。
- `.dockerignore`：精简镜像体积，排除缓存、日志、本地环境文件等。
- `docker-compose.yml`：本地/Swarm 运行，包含健康检查与（Swarm 模式）双副本配置。

## Kubernetes 高可用
- `infra/k8s/namespace.yaml`：命名空间 `yyc`。
- `infra/k8s/configmap.yaml`：基础环境变量（按需扩展）。
- `infra/k8s/deployment.yaml`：
  - 副本数 `replicas: 2`，滚动更新 `start-first` 效果由工作流/容器策略保证。
  - `readinessProbe` / `livenessProbe` 调用 `/api/health`。
  - 资源请求/限制：`100m/128Mi` 请求，`500m/512Mi` 限制。
- `infra/k8s/service.yaml`：`ClusterIP` 暴露端口 80 → 容器 3000。
- `infra/k8s/ingress.yaml`：示例基于 Nginx Ingress，按需调整域名与注解。
- `infra/k8s/hpa.yaml`：HPA（CPU 平均利用率 70%），最小 2，最大 10 副本。

### 部署镜像占位符
- `infra/k8s/deployment.yaml` 使用 `IMAGE_PLACEHOLDER`，CD 工作流在部署前以构建产出的镜像名进行替换。

## 健康检查与中间件
- `app/api/health/route.ts`：健康接口，返回 `{ status: 'ok' }`。
- `middleware.ts`：将 `/api/health` 纳入 `publicPaths`，无需鉴权与 CSRF，便于探针访问。

## 本地验证
- 构建镜像：`docker build -t yyc-smart-office:latest .`
- 运行：`docker compose up -d --build`
- 健康：`curl http://localhost:3000/api/health`

## 常见问题
- 若 `pnpm` 版本不一致导致 CI 安装失败，请更新 `package.json` 的 `packageManager` 或工作流中的 `pnpm` 版本。
- Next 构建忽略 ESLint/TS 错误（`next.config.mjs`），CI 仍通过 `lint` 与 `tsc` 把关类型与规范。
- K8s Ingress/证书需按实际环境配置（如 TLS、WAF、会话保持）。
