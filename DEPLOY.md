# 部署说明（Cloudflare / GitHub Pages / 学校服务器）

> 本作品是**纯静态站点**：没有构建步骤、没有 npm 依赖、不联网也能跑。
> 所以部署的核心只有一句话：**把整个文件夹原样发布，入口是 `index.html`**。

---

## 方案 A：Cloudflare Pages（推荐，最简单）

### A-1 走 Git 连接（解决你遇到的报错）

在 Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**，选好仓库后，构建配置这样填：

| 设置项 | 填什么 | 说明 |
|---|---|---|
| Framework preset（框架预设） | **None** | 不要选 Next.js / Vite，会强制 `npm run build` 之外的东西 |
| Build command（构建命令） | **留空**（若不允许留空，填 `npm run build`） | 仓库里已放了 `package.json`，这条命令只会打印一行日志、不做任何事 |
| Build output directory（构建输出目录） | **`/`**（某些界面写 `.` 也等价） | 整个仓库根目录就是发布目录 |
| Root directory | 留空（仓库根） | 你的 `index.html` 就在根目录 |

保存后重新部署即可。你之前那两个报错的原因是：

- `未找到 Wrangler 配置文件` → 现在仓库里已经有 `wrangler.jsonc`，不会再报；
- `ENOENT /opt/buildhome/repo/package.json` → 现在仓库里已经有 `package.json`，`npm run build` 能正常执行并退出 0。

### A-2 直接上传（完全绕开构建）

Dashboard → Workers & Pages → Create → Pages → **Upload assets**，把解压后的整个文件夹（含 `index.html` 和 `assets/`）拖进去。不需要 Git、不需要构建设置，几秒出网址。
> 适合只想先拿到一个能打开的公网链接。

---

## 方案 B：Workers + 静态资源（仓库里已配好）

本仓库的 `wrangler.jsonc` 已声明「整个目录都是静态资源」：

```jsonc
{
  "name": "cad-lab-vsim",
  "compatibility_date": "2025-09-01",
  "assets": { "directory": "./", "not_found_handling": "none" }
}
```

在 **Workers Builds** 里配置：

- Build command：`npm run build`
- Deploy command：`npx wrangler deploy`

即可自动读取配置并发布。想在本机手动发布（需装 Node.js）：

```bash
npm i -D wrangler
npx wrangler deploy
```

---

## 方案 C：其它平台

| 平台 | 做法 |
|---|---|
| **GitHub Pages** | 推仓库 → Settings → Pages → Source 选 `main` / 根目录 → 几分钟后得到 `https://用户名.github.io/仓库名/`（相对路径已适配子目录，可直接用） |
| **Netlify / Vercel** | 选静态站点，Build command 留空，Publish directory 填 `.` |
| **学校内网服务器** | 把文件夹丢进 Nginx/IIS 站点根目录，`index.html` 为默认文档；纯静态、无需 Node、无需后端 |
| **不带服务器演示** | 直接双击 `index.html`（Chrome / Edge），U 盘拷走也能用 |

---

## 部署后自检（1 分钟）

1. 打开首页 → 能看到「计算机辅助设计实验室 / A-305」与机房平面图；
2. 点 **三维机房** → 能拖动环视、点设备出弹窗（说明 `three.min.js` 加载成功）；
3. 点 **设备台账** → 输关键词能筛（说明 `data.js` 加载成功）；
4. 点 **实训项目** → 绘图板能画矩形（说明 `cad.js` 正常）；
5. 手机上打开 → 导航折叠成 ☰，排版不溢出。

任一步白屏，按 **F12 → Console** 看报错：绝大多数是「路径大小写」问题（Linux 服务器区分大小写，`Assets/` ≠ `assets/`）。

---

## 常见报错对照表

| 报错 | 原因 | 处理 |
|---|---|---|
| `ENOENT ... package.json` | 平台默认执行 `npm run build` | 已在仓库放 `package.json`，或把 Build command 留空 |
| `未找到 Wrangler 配置文件` | Workers 构建需要 wrangler 配置 | 已放 `wrangler.jsonc`，或改用 Pages |
| 部署成功但页面 404 | 输出目录填错（填了 `dist` 等不存在目录） | 输出目录改为 `/` 或 `.` |
| 页面样式丢失 / 图标不见了 | 大小写或子目录路径问题 | 确认 `assets/css/theme.css` 实际路径一致 |
| 三维页黑屏 | 浏览器禁用 WebGL | 换 Chrome/Edge 并开启硬件加速 |

---

## 需要改的部署相关文件（就这三个）

- `package.json` —— 让平台的默认 `npm run build` 不报错（内容为空构建）；
- `wrangler.jsonc` —— Workers 静态资源模式配置（`assets.directory = "./"`）；
- `.gitignore` —— 忽略本地截图、临时目录，避免仓库变胖。

**注意**：提交给大赛的 zip 与部署用的是同一套文件，改完数据（`assets/js/data.js`）后记得**重新部署 / 重新打包**。