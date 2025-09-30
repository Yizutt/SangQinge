// data.js - 九月✨FM 数据配置文件
window.AppData = {
  // 首播时间
  firstLiveDate: '2025-09-21T00:00:00',
  
  // 直播时间
  liveSchedule: {
    start: '21:30',
    end: '01:30'
  },
  
  // 测试人员
  testers: [
    { name: "九月✨FM", avatar: "https://s21.ax1x.com/2025/09/28/pVoEhWD.jpg" },
    { name: "CHEN", avatar: "https://s21.ax1x.com/2025/09/29/pVonDbj.jpg" },
    { name: "限制", avatar: "https://s21.ax1x.com/2025/09/29/pVonsVs.jpg" }
    // 预留7个位置
    // { name: "预留位置1", avatar: "" },
    // { name: "预留位置2", avatar: "" },
    // { name: "预留位置3", avatar: "" },
    // { name: "预留位置4", avatar: "" },
    // { name: "预留位置5", avatar: "" },
    // { name: "预留位置6", avatar: "" },
    // { name: "预留位置7", avatar: "" }
  ],
  
  // 任务系统
  tasks: [
    {
      "name": "收集新人\"天鹅之梦\"",
      "start": "2025-09-21T00:00:00",
      "end": "2025-10-05T23:59:59"
    }
    // 预留其他任务位置
    // {
    //   "name": "任务名称",
    //   "start": "开始时间",
    //   "end": "结束时间"
    // }
  ],
  
  // 音乐配置
  musicList: [
    {
      "id": 1,
      "title": "冰的痕迹",
      "artist": "张筱迪",
      "file": "https://raw.githubusercontent.com/Yizutt/SangQinge/main/bjmusic.mp3",
      "source": "网络来源"
    }
    // 预留其他音乐位置
    // {
    //   "id": 2,
    //   "title": "歌名",
    //   "artist": "歌手",
    //   "file": "音频文件URL",
    //   "source": "来源"
    // }
  ],
  
  // 公告系统 - 新的格式
  announcements: [
    {
      id: 1,
      type: "直播通知",
      title: "直播时间通知",
      publisher: "系统管理员",
      content: "直播时间21:30-1:30！",
      publishTime: "2025-09-27T20:53:00", // 发布时间
      displayTime: "2025-09-27T20:53:00", // 显示时间
      endTime: "2026-09-27T20:53:00", // 365天后结束
      important: true,
      show: true
    },
    {
      id: 2,
      type: "紧急公告",
      title: "系统紧急维护",
      publisher: "技术维护",
      content: "系统将于今晚进行紧急维护，预计持续30分钟",
      publishTime: "2025-09-30T10:00:00",
      displayTime: "2025-09-30T10:00:00",
      endTime: "2025-09-30T23:59:59", // 当天结束
      important: true,
      show: true
    },
    {
      id: 3,
      type: "维护公告",
      title: "系统维护通知",
      publisher: "技术团队",
      content: "抱歉网页正在进行维护！可能会出现卡顿！望谅解！",
      publishTime: "2025-09-30T14:00:00",
      displayTime: "2025-09-30T14:00:00",
      endTime: "2025-09-30T19:00:00", // 5小时后结束
      important: true,
      show: true
    },
    {
      id: 4,
      type: "普通公告",
      title: "加入测试或添加音乐",
      publisher: "九月✨FM",
      content: "如果想加入测试或者添加更多音乐！请联系：主播[九月✨FM] 管理员[CHEN] 维护员[限制]",
      publishTime: "2025-09-30T00:00:00",
      displayTime: "2025-09-30T00:00:00",
      endTime: null, // 暂定，无结束时间
      important: false,
      show: true
    }
    // 预留其他公告位置
    // {
    //   id: 5,
    //   type: "公告类型",
    //   title: "公告标题",
    //   publisher: "发布人员",
    //   content: "公告内容",
    //   publishTime: "发布时间",
    //   displayTime: "显示时间",
    //   endTime: "结束时间",
    //   important: false,
    //   show: true
    // }
  ]
};