# 健身打卡

以月历为核心的个人健身打卡工具，支持有氧/无氧记录与数据可视化。数据保存在本机浏览器，可导出/导入同步。

**在线访问：** https://dewyue.github.io/fitness-log/

## 功能

- 月历打卡：按月浏览，日期格子展示训练摘要
- 有氧：卡路里 + 时长
- 无氧：部位多选（肩、背、臀、腿、腹）
- 统计图表：频率、占比、部位分布、卡路里趋势
- 跨设备同步：复制/粘贴或 JSON 文件导入导出
- PWA：可添加到手机主屏幕，支持流量访问

## 本地开发

```bash
bun install
bun run dev
```

## 构建

```bash
bun run build
```

## 部署说明

推送到 `main` 分支后，GitHub Actions 会自动构建并发布到 GitHub Pages。

- 仓库地址：`https://github.com/Dewyue/fitness-log`
- 网站地址：`https://dewyue.github.io/fitness-log/`

> GitHub 仓库用于存放代码，**GitHub Pages** 提供免费静态网站托管，相当于你的公开访问地址。数据仍保存在用户手机/浏览器本地，不经过服务器。
