```markdown
<!-- 中文简体 | Simplified Chinese -->
# 九月✨FM - 个人直播主页

[![License](https://img.shields.io/github/license/Yizutt/SangQinge)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/Yizutt/SangQinge)](https://github.com/Yizutt/SangQinge/commits)
[![Stars](https://img.shields.io/github/stars/Yizutt/SangQinge?style=social)](https://github.com/Yizutt/SangQinge/stargazers)

一个现代化的个人直播主页，具有自适应设备布局、音乐播放器、公告系统和工具箱功能。

✨ 项目特色

· 🎵 跨页面音乐连续播放 - 单页应用架构，音乐不中断
· 🎨 自适应设备主题 - 自动识别设备并应用对应主题风格
· 📱 完全响应式设计 - 完美适配手机、平板、电脑
· 📢 智能公告系统 - 支持多种公告类型，智能时间显示
· 🎶 音乐节奏可视化 - 基于音频分析的粒子效果
· 🎯 实时任务系统 - 直播任务倒计时显示
· 🛠️ 现代化工具箱 - 重新设计的应用下载和统计界面

🚀 快速开始

在线访问

直接访问 GitHub Pages: https://yizutt.github.io/SangQinge/

本地运行

1. 克隆项目

```bash
git clone https://github.com/Yizutt/SangQinge.git
cd SangQinge
```

1. 启动本地服务器

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

1. 浏览器访问 http://localhost:8000

📁 项目结构

```
SangQinge/
├── index.html          # 主页面（单页应用）
├── data.js             # 统一数据配置文件
├── style.css           # 完整样式文件
├── script.js           # 主要功能脚本
└── README.md           # 项目说明文档
```

🎯 功能模块

主页功能

· 🕒 实时时间显示
· 📅 开播天数计算（2025年9月21日首播）
· 👤 主播信息展示
· 📺 直播时间信息（每晚21:30-01:30）
· 🎯 任务系统展示
· 🔗 社交媒体链接

公告系统

· 📢 直播通知 - 365天显示周期
· 🚨 紧急公告 - 按结束时间控制显示
· 🔧 维护公告 - 定时自动结束
· 📝 普通公告 - 长期显示内容
· ⏰ 智能时间显示 - 刚刚、分钟前、小时前、天前、月日、年前

音乐系统

· 🎵 背景音乐播放
· 🔊 音量控制
· 📋 播放列表
· 🎨 音乐节奏粒子效果
· ⏯️ 播放控制（播放/暂停）

工具箱

· 📱 应用下载功能
· 📊 下载次数统计
· 🔍 设备兼容性检测
· 🎁 现代化工具卡片展示

🎨 主题风格

项目自动检测设备类型并应用对应主题：

设备类型 主题颜色 特色功能
💻 PC/Windows 粉蓝渐变 标准圆角设计
📱 iOS设备 蓝白渐变 iOS风格圆角
🤖 Android设备 绿色渐变 Material Design风格
📱 平板设备 紫红渐变 平板优化布局

📢 公告系统详解

公告类型

· 直播通知：显示直播时间等重要信息
· 紧急公告：系统紧急维护等临时通知
· 维护公告：系统维护计划通知
· 普通公告：常规信息发布

时间显示逻辑

· 3天内：显示相对时间（刚刚、分钟前、小时前、天前）
· 超过3天：显示具体日期（月日）
· 超过1年：显示年前

公告管理

· 支持手动关闭单个公告
· 自动根据结束时间隐藏过期公告
· 实时显示剩余时间

🔧 技术栈

· 前端框架: 原生HTML5 + CSS3 + JavaScript
· 响应式设计: CSS Grid + Flexbox + Media Queries
· 音频处理: Web Audio API
· 可视化: Canvas 2D API
· 数据存储: LocalStorage
· 部署平台: GitHub Pages

📱 响应式适配

· 手机端: 单列布局，优化触摸交互
· 平板端: 网格布局，横竖屏适配
· 桌面端: 多列布局，充分利用屏幕空间
· 特殊适配: 手机横屏、平板横竖屏特殊布局

🎵 音乐功能

支持的音频格式

· MP3
· WAV
· OGG

音乐配置

通过 data.js 配置播放列表：

```javascript
musicList: [
  {
    "id": 1,
    "title": "冰的痕迹",
    "artist": "张筱迪",
    "file": "音频文件URL",
    "source": "来源说明"
  }
]
```

⚙️ 自定义配置（data.js 完整示例）

项目所有可变内容已集中到 `data.js` 一份文件，下方给出可直接复制的完整示例，包含音乐列表、公告、任务、应用下载等常用字段。

保存后刷新页面即可生效，无需改动其他代码。

```javascript
// ==========================
// 九月✨FM - 统一配置文件
// ==========================

/* 1. 主播信息 */
const anchorInfo = {
  name: "九月✨FM",
  avatar: "https://yizutt.github.io/SangQinge/assets/avatar.jpg",
  signature: "每晚 21:30 不见不散 ❤",
  social: {
    douyin: "https://v.douyin.com/xxxxxx",
    weibo: "https://weibo.com/xxxxxx",
    qq: "123456789"
  }
};

/* 2. 直播信息 */
const liveInfo = {
  startDate: "2025-09-21",
  dailyTime: "21:30-01:30",
  roomNotice: "今晚主题：秋夜陪伴 | 点歌请打“点歌+歌名”"
};

/* 3. 音乐列表 */
const musicList = [
  {
    id: 1,
    title: "冰的痕迹",
    artist: "张筱迪",
    file: "https://yizutt.github.io/SangQinge/music/1.mp3",
    source: "网易云"
  },
  {
    id: 2,
    title: "晚风告白",
    artist: "小阿七",
    file: "https://yizutt.github.io/SangQinge/music/2.mp3",
    source: "QQ 音乐"
  },
  {
    id: 3,
    title: "星空下的约定",
    artist: "房东的猫",
    file: "https://yizutt.github.io/SangQinge/music/3.mp3",
    source: "网易云"
  }
];

/* 4. 公告系统 */
const announcements = [
  {
    id: 1,
    type: "直播通知",
    title: "国庆特别企划",
    publisher: "九月",
    content: "10 月 1 日～3 日连播三天，每晚加赠 30 分钟彩蛋互动！",
    publishTime: "2025-09-28 18:00",
    displayTime: "2025-09-28 18:00",
    endTime: "2025-10-04 00:00",
    important: true,
    show: true
  },
  {
    id: 2,
    type: "普通公告",
    title: "点歌规则更新",
    publisher: "限制",
    content: "每人每天限点 2 首，冷门歌曲需提前 1 小时预约。",
    publishTime: "2025-09-29 12:00",
    displayTime: "2025-09-29 12:00",
    endTime: "",
    important: false,
    show: true
  },
  {
    id: 3,
    type: "维护公告",
    title: "GitHub Pages 迁移维护",
    publisher: "CHEN",
    content: "10 月 6 日 00:00-02:00 可能无法访问，维护完毕自动恢复。",
    publishTime: "2025-09-30 10:00",
    displayTime: "2025-10-05 20:00",
    endTime: "2025-10-06 03:00",
    important: false,
    show: true
  }
];

/* 5. 实时任务（倒计时） */
const tasks = [
  {
    id: 1,
    title: "订阅破万感谢",
    target: 10000,
    current: 9847,
    unit: "订阅",
    endTime: "2025-10-10 00:00"
  },
  {
    id: 2,
    title: "舰长冲 100",
    target: 100,
    current: 87,
    unit: "舰",
    endTime: "2025-10-15 00:00"
  }
];

/* 6. 应用下载 / 工具箱 */
const appDownload = {
  android: {
    url: "https://yizutt.github.io/SangQinge/tools/app-release.apk",
    version: "2.0.0",
    size: "28.3 MB",
    count: 1268
  },
  ios: {
    url: "https://testflight.apple.com/join/xxxxxx",
    version: "2.0.0",
    size: "34.1 MB",
    count: 521
  }
};

/* 7. 对外统一导出 */
window.SangQingeConfig = {
  anchorInfo,
  liveInfo,
  musicList,
  announcements,
  tasks,
  appDownload
};
```

如需修改主题色或新增页面，继续在 `style.css` / `script.js` 中按原说明操作即可。

🚀 部署指南

GitHub Pages

1. Fork 本仓库
2. 仓库设置 → 启用 GitHub Pages
3. 选择部署分支（main 或 gh-pages）
4. 访问 https://你的用户名.github.io/SangQinge

其他平台

项目为纯静态文件，可部署到：

· Netlify / Vercel / Cloudflare Pages
· 阿里云OSS / 腾讯云COS

🤝 贡献指南

1. Fork 项目
2. 创建特性分支：git checkout -b feature/AmazingFeature
3. 提交更改：git commit -m 'Add some AmazingFeature'
4. 推送分支：git push origin feature/AmazingFeature
5. 提交 Pull Request

📝 更新日志

v2.0.0 (2025-09-30)

· ✨ 新增公告系统 - 支持四种公告类型，智能时间显示
· 🎨 工具页面重新设计 - 现代化渐变卡片和悬浮动画
· 🔄 数据文件合并 - 所有配置统一到 data.js
· 🕒 时间系统优化 - 使用实际直播时间和首播日期
· 📱 响应式改进 - 更好的移动端体验

v1.0.0 (2025-09-28)

· ✨ 初始版本发布
· 🎵 音乐播放器功能
· 📱 响应式设计
· 🎨 设备主题适配

📄 许可证

MIT License - 详见 LICENSE 文件

👥 开发团队

· 九月✨FM - 项目发起 & 设计
· CHEN - 测试 & 优化
· 限制 - 开发 & 维护

测试人员

· 九月✨FM
· CHEN
· 限制
· （预留7个测试位置）

📞 联系我们

· 🎥 抖音直播: 九月✨FM
· 📧 项目相关请提交 Issue

🙏 致谢

感谢所有测试人员和用户的支持与反馈！

---

如果这个项目对您有帮助，请给个 ⭐️ 支持！

```