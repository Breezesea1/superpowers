# 为 OpenCode 安装 Superpowers

## 前置条件

- 已安装 [OpenCode](https://opencode.ai)

## 安装

在你的全局或项目级 `opencode.json` 的 `plugin` 数组中添加 Superpowers：

```json
{
  "plugin": ["superpowers@git+https://github.com/Breezesea1/superpowers.git"]
}
```

重启 OpenCode。插件会自动注册内置的 skills 和推荐的 `superpowers-orchestrator` / `sp-*` agents。

通过以下提问验证是否生效：

```text
Tell me about your superpowers
```

## 推荐 Agents

插件会注册以下 agents（若你已定义同名 agent 则不覆盖）：

- `superpowers-orchestrator` - Superpowers 工作流主协调器。
- `sp-explorer` - 只读仓库探索。
- `sp-debugger` - 系统化调试与根因分析。
- `sp-planner` - 只读实现规划。
- `sp-implementer` - 带编辑权限的聚焦实现。
- `sp-reviewer` - 只读代码评审。
- `sp-docs-researcher` - 外部文档与社区资料研究。

### 为单个 Agent 指定模型

插件会浅合并你的定义到默认值上，所以你可以只写 `model` 而保留插件的 prompt/permission：

```json
{
  "agent": {
    "sp-implementer": {
      "model": "anthropic/claude-sonnet-4-20250514"
    }
  }
}
```

将某个 agent 设为 `false` 可完全禁用它：

```json
{
  "agent": {
    "sp-debugger": false
  }
}
```

## 更新

OpenCode 通过 git-backed package spec 安装 Superpowers。某些 OpenCode 和 Bun 版本会将解析后的 git 依赖固定在 lockfile 或缓存中，因此重启可能不会拉取到最新提交。如果更新未生效，请清除 OpenCode 的包缓存或重新安装插件。

固定指定版本：

```json
{
  "plugin": ["superpowers@git+https://github.com/Breezesea1/superpowers.git#v6.0.3"]
}
```

## 排障

### 插件未加载

1. 检查日志：`opencode run --print-logs "hello" 2>&1 | grep -i superpowers`
2. 确认 `opencode.json` 中的 plugin 配置行正确
3. 确保运行的是较新版本的 OpenCode

### Windows 安装问题

某些 Windows 版 OpenCode 对 git-backed plugin spec 存在上游安装器问题，包括 `git+https` URL 的缓存路径，以及 Bun 在普通终端中可用却找不到 `git.exe`。如果 OpenCode 无法安装插件，可尝试用系统 npm 安装并指向本地包：

```powershell
npm install superpowers@git+https://github.com/Breezesea1/superpowers.git --prefix "$HOME\.config\opencode"
```

然后在 `opencode.json` 中使用已安装的包路径：

```json
{
  "plugin": ["~/.config/opencode/node_modules/superpowers"]
}
```

### Skills 未找到

1. 用 OpenCode 的 `skill` 工具列出可用 skills
2. 确认插件已加载（见上文）
3. 检查每个 skill 目录是否包含带 frontmatter 的 `SKILL.md` 文件

## 工具映射

Skills 以动作描述来表达。在 OpenCode 中它们对应到：

- 创建或更新 todos -> `todowrite`
- 派发聚焦工作 -> `task` 配合 `sp-*` agents
- 调用 skill -> OpenCode 原生 `skill` 工具
- 读取文件 -> `read`
- 创建、编辑或删除文件 -> `apply_patch`
- 运行 shell 命令 -> `bash`
- 搜索 -> `grep` 和 `glob`
- 抓取 URL -> `webfetch`
