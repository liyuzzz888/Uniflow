# UniFlow

一个给大学生用的轻量时间表。

我做 UniFlow，是因为自己经常在课表、备忘录和待办事项之间来回切换。它现在还不是一个“大而全”的效率平台，只想把上课、临时安排、截止日期和当天的小任务放在一个安静的地方。

当前是第一版冻结版本的维护更新：**0.7.8（构建 19）**。项目以 MIT License 开源，欢迎看看代码，也欢迎提 Issue。

## 先试试看

需要 macOS 和 Node.js。克隆项目后，在项目目录运行：

```bash
npm install
npm run start:mac
```

这会准备离线 OCR 资源并打开 Mac 版。第一次启动可能需要一点时间。

如果只想检查代码：

```bash
npm run check
```

## 目前能做什么

- 导入课表图片，也可以直接拖入或粘贴图片；识别结果确认后才会写入课表
- 保留课程名称、上课地点、上下课时间和上课周数
- 点击“本周”的课程，只删除这一周的这一次
- 添加带起止时间和地点的安排
- 管理待办和当天小任务；未完成的小任务会延续到下一天
- 查看待办与小任务历史，并按标题、日期、类型和完成状态搜索
- 中 / 英 / 日三种语言，浅色 / 深色模式和字号设置
- 数据默认只保存在本机，不需要账号

## 目录大概是这样

```text
dist/       网页界面、样式和课表逻辑
desktop/    Electron 的 Mac 入口
ios/        Capacitor iPhone 工程
scripts/    OCR、版本同步和打包脚本
tests/      课表与历史查询测试
docs/       上架前的技术记录
```

界面没有使用前端框架，主要是原生 HTML、CSS 和 JavaScript。这样做不一定最时髦，但目前更容易读，也方便我自己继续改。

## iPhone 工程

电脑上安装完整 Xcode 后，可以同步并打开 iPhone 工程：

```bash
npm run sync:ios
npm run open:ios
```

正式签名、Bundle ID、隐私声明和 App Store 提交还没有放进第一版冻结范围。Mac 当前生成的是本机测试用的 arm64 `.app`，不是已经签名的商店发行包。

## 版本约定

版本写在 `package.json`：

- `version` 是用户看到的版本号
- `uniflowBuildNumber` 是每次分发构建递增的内部编号

修改版本后运行 `npm run sync:ios`，再用 `npm run check` 检查 Mac、iPhone 和设置页是否同步。

## 开源许可

MIT License。详见 [LICENSE](LICENSE)。
