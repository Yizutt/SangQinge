// 九月✨FM - 自适应设备布局脚本

// 全局变量
let currentMusicIndex = 0;
let musicList = [];
let tasks = [];
let announcements = [];
let audioContext = null;
let analyser = null;
let source = null;
let dataArray = null;
let bufferLength = null;

// 拖动相关变量
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let announcementPosition = { x: 20, y: 20 }; // 默认位置

// 页面内容缓存
const pageCache = {};

// 设备检测函数
function detectDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isPortrait = height > width;
  
  // 检测设备类型
  const isIOS = /iphone|ipod|ipad/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isWindows = /windows/.test(userAgent);
  const isMac = /macintosh|mac os x/.test(userAgent);
  
  // 清除现有类
  document.body.className = '';
  
  // 判断设备类型和样式类
  let deviceType = '未知设备';
  let styleClass = 'pc'; // 默认样式
  
  // 手机设备检测
  if ((width < 768 && isPortrait) || (width < 1024 && !isPortrait && (width < height * 1.5))) {
    if (isIOS) {
      deviceType = 'iPhone';
      styleClass = 'ios';
    } else if (isAndroid) {
      deviceType = 'Android';
      styleClass = 'android';
    }
  }
  // 平板设备检测
  else if ((width >= 768 && width <= 1024 && isPortrait) || 
           (width >= 1024 && width <= 1366 && !isPortrait) ||
           /tablet|ipad/.test(userAgent)) {
    if (isIOS) {
      deviceType = 'iPad';
      styleClass = 'ios';
    } else if (isAndroid) {
      deviceType = 'Android 平板';
      styleClass = 'android';
    } else {
      deviceType = '平板设备';
      styleClass = 'tablet';
    }
  }
  // 电脑设备检测
  else if (width > 1024) {
    if (isIOS || isMac) {
      deviceType = 'Mac';
      styleClass = 'ios';
    } else {
      deviceType = 'Windows';
      styleClass = 'pc';
    }
  }
  
  // 应用设备类
  document.body.classList.add(styleClass);
  
  // 更新设备指示器
  document.getElementById('deviceType').textContent = deviceType;
}

// 方向检测函数
function detectOrientation() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isPortrait = height > width;
  
  // 更新方向指示器
  document.getElementById('orientationType').textContent = isPortrait ? '竖屏' : '横屏';
}

// 时间处理函数
function formatRelativeTime(publishTime) {
  const now = new Date();
  const publishDate = new Date(publishTime);
  const diffInSeconds = Math.floor((now - publishDate) / 1000);
  
  if (diffInSeconds < 60) {
    return '刚刚';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分钟前`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}小时前`;
  } else if (diffInSeconds < 2592000) { // 30天
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}天前`;
  } else if (diffInSeconds < 31536000) { // 1年
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}月前`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years}年前`;
  }
}

function formatAbsoluteTime(dateTime) {
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function formatDisplayTime(announcement) {
  const now = new Date();
  const publishTime = new Date(announcement.publishTime);
  const displayTime = new Date(announcement.displayTime);
  const endTime = announcement.endTime ? new Date(announcement.endTime) : null;
  
  // 如果当前时间在显示时间之前，不显示
  if (now < displayTime) {
    return null;
  }
  
  // 如果公告已过期，不显示
  if (endTime && now > endTime) {
    return null;
  }
  
  // 计算发布时间距离现在的天数
  const daysDiff = Math.floor((now - publishTime) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 3) {
    // 3天内显示相对时间
    return formatRelativeTime(announcement.publishTime);
  } else {
    // 超过3天显示具体日期
    const date = new Date(announcement.publishTime);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  }
}

// 页面加载完成后开始检测
window.addEventListener('load', function() {
  // 优先执行关键UI渲染
  detectDevice();
  detectOrientation();
  
  // 初始化单页应用
  initSPA();
  
  // 初始化公告系统
  initAnnouncementSystem();
  
  // 延迟执行非关键加载任务
  setTimeout(() => {
    loadAppData(); // 替换原来的 loadTasks 和 loadMusicList
    updateLiveInfo(); // 更新直播时间显示
    
    // 初次打开自动显示公告
    setTimeout(() => {
      if (announcements.length > 0) {
        showAnnouncements();
      }
    }, 1000);
  }, 500);
  
  // 启动公告定时器
  startAnnouncementTimer();
});

// 监听窗口大小变化，重新检测设备和方向
window.addEventListener('resize', function() {
  detectDevice();
  detectOrientation();
});

// 实时更新左上角时间
function updateTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const timeTag = document.getElementById('timeTag');
  if (timeTag) {
    timeTag.textContent = `${h}:${m}:${s}`;
  }
}

// 实时计算开播天数（2025-09-21 开播）
function updateDayTag() {
  const start = new Date(AppData.firstLiveDate);
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
  const dayTag = document.getElementById('dayTag');
  if (dayTag) {
    dayTag.textContent = `开播第${diff}天`;
  }
}

// 更新直播时间显示
function updateLiveInfo() {
  const liveInfo = document.querySelector('.live-info');
  if (liveInfo) {
    liveInfo.innerHTML = `直播时间：晚上 ${AppData.liveSchedule.start}~${AppData.liveSchedule.end}<br>音乐点歌 | 聊天治愈 | 倾听树洞`;
  }
}

// ---------------- 数据加载 ----------------
async function loadAppData() {
  try {
    // 直接从全局 AppData 对象获取数据
    if (window.AppData) {
      // 更新任务数据
      tasks = AppData.tasks.map(task => ({
        ...task,
        start: new Date(task.start),
        end: new Date(task.end)
      }));
      
      // 更新音乐数据
      musicList = AppData.musicList.map(music => ({
        ...music,
        file: music.file.startsWith('http') ? music.file : 
              'https://raw.githubusercontent.com/Yizutt/SangQinge/main/' + music.file
      }));
      
      // 更新公告数据
      const now = new Date();
      announcements = AppData.announcements.filter(ann => {
        // 检查公告是否应该显示
        if (!ann.show) return false;
        
        const displayTime = new Date(ann.displayTime);
        const endTime = ann.endTime ? new Date(ann.endTime) : null;
        
        // 当前时间在显示时间之后，且在结束时间之前（如果有结束时间）
        return now >= displayTime && (!endTime || now <= endTime);
      });
      
      console.log('应用数据加载成功');
      updateAnnouncementBadge();
      initMusicPlayer();
    }
  } catch (error) {
    console.error('加载应用数据失败:', error);
    // 使用默认数据
    loadDefaultData();
  }
}

function loadDefaultData() {
  // 默认任务数据
  tasks = [
    {
      name: "收集新人\"天鹅之梦\"",
      start: new Date("2025-09-21T00:00:00"),
      end: new Date("2025-10-05T23:59:59")
    }
  ];
  
  // 默认音乐数据
  musicList = [
    {
      id: 1,
      title: "冰的痕迹-张筱迪",
      file: "https://raw.githubusercontent.com/Yizutt/SangQinge/main/bjmusic.mp3"
    }
  ];
  
  // 默认公告数据
  announcements = [];
}

// ---------------- 任务系统 ----------------
function formatCountdown(ms) {
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const arr = [];
  if (d) arr.push(`${d}天`);
  if (h) arr.push(`${h}时`);
  if (m) arr.push(`${m}分`);
  arr.push(`${s}秒`);
  return arr.join('');
}

function renderMissions() {
  const now = new Date();
  const box = document.getElementById('missionBox');
  if (!box) return;
  
  box.innerHTML = '';
  let hasTask = false;

  tasks.forEach(task => {
    if (now >= task.start && now <= task.end) {
      hasTask = true;
      const left = task.end - now;
      const item = document.createElement('div');
      item.className = 'mission-item';
      item.innerHTML = `任务：${task.name}<span class="countdown">(剩${formatCountdown(left)})</span>`;
      box.appendChild(item);
    }
  });

  if (!hasTask) {
    box.style.display = 'none';
    box.innerHTML = '<div class="mission-item">当前没有进行中的任务</div>';
  } else {
    box.style.display = 'block';
  }
}

// 每秒更新任务显示
setInterval(renderMissions, 1000);

// 延长任务数据更新间隔（从10秒改为60秒）
setInterval(loadAppData, 60000);

// ---------------- 音乐系统 ----------------
function initMusicPlayer() {
  const bgMusic = document.getElementById('bgMusic');
  const musicControl = document.getElementById('musicControl');
  const musicInfo = document.getElementById('musicInfo');
  const musicTitle = musicInfo.querySelector('.music-title');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeValue = document.querySelector('.volume-value');
  const musicListToggle = document.getElementById('musicListToggle');
  const musicListPanel = document.getElementById('musicList');
  const closeList = document.getElementById('closeList');
  const musicItems = document.getElementById('musicItems');
  
  // 初始化音量
  const initialVolume = 0.5;
  bgMusic.volume = initialVolume;
  volumeSlider.value = initialVolume * 100;
  volumeValue.textContent = Math.round(initialVolume * 100) + '%';
  
  // 添加错误事件监听
  bgMusic.addEventListener('error', function(e) {
    console.error('音频加载错误:', e);
    console.error('音频源:', bgMusic.src);
    musicControl.classList.remove('playing');
  });
  
  bgMusic.addEventListener('loadeddata', function() {
    console.log('音频数据已加载，可以播放');
  });
  
  bgMusic.addEventListener('canplay', function() {
    console.log('音频可以开始播放');
  });
  
  // 设置第一首音乐
  if (musicList.length > 0) {
    loadMusic(currentMusicIndex);
  }
  
  // 音量控制
  volumeSlider.addEventListener('input', function() {
    const volume = this.value / 100;
    bgMusic.volume = volume;
    volumeValue.textContent = this.value + '%';
  });
  
  // 音乐控制按钮点击事件
  musicControl.addEventListener('click', function() {
    if (bgMusic.paused) {
      bgMusic.play().then(() => {
        musicControl.classList.add('playing');
        showMusicInfo();
        initAudioAnalyser(); // 初始化音频分析器
      }).catch(error => {
        console.log('播放失败:', error);
        // 添加用户交互后自动播放的逻辑
        document.addEventListener('click', function enableAudio() {
          bgMusic.play().then(() => {
            console.log('用户交互后播放成功');
            musicControl.classList.add('playing');
            initAudioAnalyser(); // 初始化音频分析器
          }).catch(e => {
            console.log('用户交互后播放仍然失败:', e);
          });
          document.removeEventListener('click', enableAudio);
        }, { once: true });
      });
    } else {
      bgMusic.pause();
      musicControl.classList.remove('playing');
    }
  });
  
  // 显示音乐信息
  function showMusicInfo() {
    musicInfo.classList.add('show');
    setTimeout(() => {
      musicInfo.classList.remove('show');
    }, 3000);
  }
  
  // 加载音乐
  function loadMusic(index) {
    if (index < 0 || index >= musicList.length) return;
    
    currentMusicIndex = index;
    const music = musicList[index];
    
    console.log('正在加载音乐:', music);
    
    // 先暂停当前音乐
    bgMusic.pause();
    musicControl.classList.remove('playing');
    
    // 设置新的音乐源
    bgMusic.src = music.file;
    musicTitle.textContent = music.title;
    
    // 更新音乐列表中的活动项
    updateActiveMusicItem();
    
    // 加载新的音乐
    bgMusic.load();
    
    // 监听加载完成事件
    bgMusic.addEventListener('canplay', function onCanPlay() {
      console.log('音乐可以播放了');
      bgMusic.removeEventListener('canplay', onCanPlay);
      
      // 尝试自动播放（需要用户交互）
      tryAutoPlay();
    });
    
    // 添加加载超时处理
    setTimeout(() => {
      if (bgMusic.readyState === 0) {
        console.error('音乐加载超时');
      }
    }, 10000);
  }
  
  // 尝试自动播放
  function tryAutoPlay() {
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('自动播放成功');
        musicControl.classList.add('playing');
        showMusicInfo();
        initAudioAnalyser(); // 初始化音频分析器
      }).catch(error => {
        console.log('自动播放被阻止，等待用户交互:', error);
        musicControl.classList.remove('playing');
      });
    }
  }
  
  // 更新音乐列表中的活动项
  function updateActiveMusicItem() {
    const items = musicItems.querySelectorAll('.music-item');
    items.forEach((item, index) => {
      if (index === currentMusicIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
  
  // 生成音乐列表
  function renderMusicList() {
    musicItems.innerHTML = '';
    musicList.forEach((music, index) => {
      const li = document.createElement('li');
      li.className = `music-item ${index === currentMusicIndex ? 'active' : ''}`;
      li.innerHTML = `
        <svg class="music-item-icon" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <span class="music-item-title">${music.title}</span>
      `;
      li.addEventListener('click', () => {
        loadMusic(index);
        hideMusicList();
      });
      musicItems.appendChild(li);
    });
  }
  
  // 显示音乐列表
  function showMusicList() {
    renderMusicList();
    musicListPanel.classList.add('show');
  }
  
  // 隐藏音乐列表
  function hideMusicList() {
    musicListPanel.classList.remove('show');
  }
  
  // 音乐列表切换按钮
  musicListToggle.addEventListener('click', showMusicList);
  closeList.addEventListener('click', hideMusicList);
}

// ---------------- 音乐节奏粒子效果 ----------------
function initAudioAnalyser() {
  const bgMusic = document.getElementById('bgMusic');
  
  // 如果已经存在分析器，先清理
  if (audioContext) {
    try {
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
    } catch (e) {
      console.log('清理旧的音频分析器:', e);
    }
  }
  
  try {
    // 创建音频上下文
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(bgMusic);
    
    // 连接音频节点
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // 配置分析器
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    // 创建粒子系统
    createParticles();
    
    console.log('音频分析器初始化成功');
  } catch (error) {
    console.error('音频分析器初始化失败:', error);
  }
}

function createParticles() {
  // 检查是否已存在canvas，如果存在则移除
  const existingCanvas = document.getElementById('particleCanvas');
  if (existingCanvas) {
    existingCanvas.remove();
  }
  
  // 创建canvas元素
  const canvas = document.createElement('canvas');
  canvas.id = 'particleCanvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1'; // 置于底层
  canvas.style.pointerEvents = 'none'; // 不干扰用户交互
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  
  // 设置canvas尺寸
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // 创建粒子数组
  const particles = [];
  const particleCount = Math.min(100, Math.floor(window.innerWidth / 10));
  
  // 粒子类
  class Particle {
    constructor() {
      this.reset();
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 2 - 1;
      this.speedY = Math.random() * 2 - 1;
      this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    
    update(frequencyData) {
      // 根据音频频率更新粒子
      const frequencyIndex = Math.floor((this.x / canvas.width) * bufferLength);
      const frequencyValue = frequencyData[frequencyIndex] / 255;
      
      // 粒子大小随频率变化
      this.size = frequencyValue * 5 + 1;
      
      // 粒子移动
      this.x += this.speedX;
      this.y += this.speedY;
      
      // 边界检查
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      
      // 随机改变方向
      if (Math.random() < 0.01) {
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }
  
  // 初始化粒子
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  // 动画循环
  function animate() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 获取频率数据
    if (analyser && dataArray) {
      analyser.getByteFrequencyData(dataArray);
      
      // 更新和绘制粒子
      particles.forEach(particle => {
        particle.update(dataArray);
        particle.draw();
      });
      
      // 绘制连接线（基于距离）
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  // 开始动画
  animate();
}

// ---------------- 公告系统 ----------------
function initAnnouncementSystem() {
  const announcementIcon = document.getElementById('announcementIcon');
  const announcementPanel = document.getElementById('announcementPanel');
  const closeAnnouncements = document.getElementById('closeAnnouncements');
  const announcementHeader = announcementPanel.querySelector('.announcement-header');
  
  // 初始化位置
  loadAnnouncementPosition();
  updateAnnouncementPosition();
  
  // 显示/隐藏公告面板
  announcementIcon.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleAnnouncements();
  });
  
  // 关闭公告面板
  closeAnnouncements.addEventListener('click', function(e) {
    e.stopPropagation();
    hideAnnouncements();
  });
  
  // 点击外部关闭公告面板
  document.addEventListener('click', function(e) {
    if (!announcementPanel.contains(e.target) && !announcementIcon.contains(e.target)) {
      hideAnnouncements();
    }
  });
  
  // 阻止公告面板内部点击事件冒泡
  announcementPanel.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  // 初始化拖动功能
  initDragFunction(announcementIcon, announcementPanel, announcementHeader);
}

// 初始化拖动功能
function initDragFunction(iconElement, panelElement, headerElement) {
  let startX, startY, initialX, initialY;
  
  // 图标拖动
  iconElement.addEventListener('mousedown', startDrag);
  iconElement.addEventListener('touchstart', startDrag);
  
  // 面板头部拖动
  headerElement.addEventListener('mousedown', startPanelDrag);
  headerElement.addEventListener('touchstart', startPanelDrag);
  
  function startDrag(e) {
    e.preventDefault();
    isDragging = true;
    iconElement.classList.add('dragging');
    
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    startX = clientX - announcementPosition.x;
    startY = clientY - announcementPosition.y;
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
  }
  
  function startPanelDrag(e) {
    if (e.target.classList.contains('close-announcements')) return;
    
    e.preventDefault();
    isDragging = true;
    
    const rect = panelElement.getBoundingClientRect();
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    startX = clientX - rect.left;
    startY = clientY - rect.top;
    
    document.addEventListener('mousemove', dragPanel);
    document.addEventListener('touchmove', dragPanel);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
  }
  
  function drag(e) {
    if (!isDragging) return;
    
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    announcementPosition.x = clientX - startX;
    announcementPosition.y = clientY - startY;
    
    // 边界检查
    const maxX = window.innerWidth - iconElement.offsetWidth;
    const maxY = window.innerHeight - iconElement.offsetHeight;
    
    announcementPosition.x = Math.max(10, Math.min(announcementPosition.x, maxX - 10));
    announcementPosition.y = Math.max(10, Math.min(announcementPosition.y, maxY - 10));
    
    updateAnnouncementPosition();
  }
  
  function dragPanel(e) {
    if (!isDragging) return;
    
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    announcementPosition.x = clientX - startX;
    announcementPosition.y = clientY - startY;
    
    // 边界检查
    const maxX = window.innerWidth - panelElement.offsetWidth;
    const maxY = window.innerHeight - panelElement.offsetHeight;
    
    announcementPosition.x = Math.max(10, Math.min(announcementPosition.x, maxX - 10));
    announcementPosition.y = Math.max(10, Math.min(announcementPosition.y, maxY - 10));
    
    updateAnnouncementPosition();
  }
  
  function stopDrag() {
    isDragging = false;
    iconElement.classList.remove('dragging');
    
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mousemove', dragPanel);
    document.removeEventListener('touchmove', dragPanel);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
    
    // 保存位置到本地存储
    saveAnnouncementPosition();
  }
}

// 更新公告位置
function updateAnnouncementPosition() {
  const announcementSystem = document.querySelector('.announcement-system');
  announcementSystem.style.left = announcementPosition.x + 'px';
  announcementSystem.style.top = announcementPosition.y + 'px';
  announcementSystem.style.right = 'auto';
}

// 保存公告位置到本地存储
function saveAnnouncementPosition() {
  localStorage.setItem('announcementPosition', JSON.stringify(announcementPosition));
}

// 从本地存储加载公告位置
function loadAnnouncementPosition() {
  const savedPosition = localStorage.getItem('announcementPosition');
  if (savedPosition) {
    announcementPosition = JSON.parse(savedPosition);
  }
}

// 显示公告
function showAnnouncements() {
  const announcementPanel = document.getElementById('announcementPanel');
  announcementPanel.classList.add('show');
  renderAnnouncements();
}

// 隐藏公告
function hideAnnouncements() {
  const announcementPanel = document.getElementById('announcementPanel');
  announcementPanel.classList.remove('show');
}

// 切换公告显示状态
function toggleAnnouncements() {
  const announcementPanel = document.getElementById('announcementPanel');
  if (announcementPanel.classList.contains('show')) {
    hideAnnouncements();
  } else {
    showAnnouncements();
  }
}

// 更新渲染公告函数 - 移除关闭按钮
function renderAnnouncements() {
  const announcementList = document.getElementById('announcementList');
  if (!announcementList) return;
  
  announcementList.innerHTML = '';
  
  if (announcements.length === 0) {
    announcementList.innerHTML = '<div class="no-announcements">暂无公告</div>';
    return;
  }
  
  announcements.forEach(announcement => {
    const displayTimeText = formatDisplayTime(announcement);
    if (!displayTimeText) return; // 不显示未到时间的公告
    
    const announcementItem = document.createElement('div');
    announcementItem.className = `announcement-item ${announcement.important ? 'important' : ''}`;
    announcementItem.setAttribute('data-id', announcement.id);
    
    // 计算剩余时间（如果有结束时间）
    let timeInfo = '';
    if (announcement.endTime) {
      const now = new Date();
      const endTime = new Date(announcement.endTime);
      const timeLeft = endTime - now;
      
      if (timeLeft > 0) {
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        timeInfo = `<div class="time-left">剩余: ${hoursLeft}小时${minutesLeft}分钟</div>`;
      }
    }
    
    announcementItem.innerHTML = `
      <div class="announcement-meta">
        <span class="announcement-type ${announcement.type === '紧急公告' ? 'urgent' : 
                                      announcement.type === '直播通知' ? 'live' : 
                                      announcement.type === '维护公告' ? 'maintenance' : 'normal'}">
          ${announcement.type}
        </span>
        <span class="announcement-time">${displayTimeText}</span>
      </div>
      <div class="announcement-title">${announcement.title}</div>
      <div class="announcement-publisher">发布人员：${announcement.publisher}</div>
      <div class="announcement-content">${announcement.content}</div>
      <div class="announcement-details">
        <div class="publish-time">发布时间：${formatAbsoluteTime(announcement.publishTime)}</div>
        <div class="display-time">显示时间：${formatAbsoluteTime(announcement.displayTime)}</div>
        ${announcement.endTime ? 
          `<div class="end-time">结束时间：${formatAbsoluteTime(announcement.endTime)}</div>` : 
          '<div class="end-time">结束时间：暂定</div>'
        }
        ${timeInfo}
      </div>
    `;
    
    announcementList.appendChild(announcementItem);
  });
}

// 更新公告徽章
function updateAnnouncementBadge() {
  const badge = document.getElementById('announcementBadge');
  if (badge) {
    const count = announcements.length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// 添加定时更新公告时间的函数
function startAnnouncementTimer() {
  // 每分钟更新一次公告时间显示
  setInterval(() => {
    if (document.getElementById('announcementPanel').classList.contains('show')) {
      renderAnnouncements();
    }
    updateAnnouncementBadge();
  }, 60000); // 每分钟更新一次
}

// 窗口大小变化时更新边界
window.addEventListener('resize', function() {
  // 确保公告图标在可视区域内
  const announcementSystem = document.querySelector('.announcement-system');
  const iconElement = document.getElementById('announcementIcon');
  
  const maxX = window.innerWidth - iconElement.offsetWidth;
  const maxY = window.innerHeight - iconElement.offsetHeight;
  
  announcementPosition.x = Math.max(10, Math.min(announcementPosition.x, maxX - 10));
  announcementPosition.y = Math.max(10, Math.min(announcementPosition.y, maxY - 10));
  
  updateAnnouncementPosition();
});

// ---------------- 单页应用系统 ----------------
function initSPA() {
  // 监听导航链接点击
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetPage = this.getAttribute('data-page');
      navigateToPage(targetPage);
    });
  });
  
  // 监听URL哈希变化
  window.addEventListener('hashchange', function() {
    const page = window.location.hash.substring(1) || 'home';
    navigateToPage(page);
  });
  
  // 初始加载首页
  const initialPage = window.location.hash.substring(1) || 'home';
  navigateToPage(initialPage);
}

// 导航到指定页面
async function navigateToPage(page) {
  // 更新导航状态
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    }
  });
  
  // 更新URL
  window.location.hash = page;
  
  // 加载页面内容
  await loadPageContent(page);
}

// 加载页面内容
async function loadPageContent(page) {
  const container = document.getElementById('page-container');
  
  // 显示加载状态
  container.innerHTML = '<div class="loading-spinner">加载中...</div>';
  
  // 检查缓存
  if (pageCache[page]) {
    container.innerHTML = pageCache[page];
    initPageSpecificFeatures(page);
    return;
  }
  
  try {
    let content = '';
    
    switch(page) {
      case 'home':
        content = await loadHomePage();
        break;
      case 'tools':
        content = await loadToolsPage();
        break;
      default:
        content = '<div class="error-page">页面未找到</div>';
    }
    
    // 缓存内容
    pageCache[page] = content;
    container.innerHTML = content;
    initPageSpecificFeatures(page);
    
  } catch (error) {
    console.error('加载页面失败:', error);
    container.innerHTML = '<div class="error-page">页面加载失败</div>';
  }
}

// 加载首页内容
async function loadHomePage() {
  return `
    <div class="card">
      <div class="time-tag" id="timeTag">--:--:--</div>
      <div class="day-tag" id="dayTag">开播第？天</div>
      <img src="https://s21.ax1x.com/2025/09/28/pVoEhWD.jpg" alt="头像" class="avatar" 
           loading="lazy" decoding="async">
      <div class="name">九月✨FM</div>
      <div class="bio">
        我们生下来是需要去感受这个世界的，要去看花开，去听流水，去遇见一些有趣的朋友，去懂一些道理。
      </div>
      <div class="live-info">
        直播时间：晚上 21:30~01:30<br>
        音乐点歌 | 聊天治愈 | 倾听树洞
      </div>
      <div class="ip">📍IP：四川内江</div>

      <div class="mission-box" id="missionBox"></div>

      <div class="btn-box">
        <a class="btn" href="https://v.douyin.com/XmqD7uEcg6c/" target="_blank">
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.358 19.1399C15.4694 18.8558 11.3762 20.9553 9.07838 25.4384C5.63169 32.163 8.48026 43.1666 19.9788 43.1666C31.4774 43.1666 31.81 32.0554 31.81 30.8914C31.81 30.1154 31.81 25.7764 31.81 17.8746C34.2694 19.4323 36.343 20.37 38.0308 20.6877C39.7186 21.0053 40.7915 21.1461 41.2497 21.11V14.6343C39.6886 14.4461 38.3386 14.0873 37.1997 13.5581C35.4913 12.7643 32.1037 10.5611 32.1037 7.33208C32.106 7.34787 32.106 6.51493 32.1037 4.83325H24.9857C24.9645 20.6493 24.9645 29.3353 24.9857 30.8914C25.0175 33.2255 23.2068 36.4905 19.5355 36.4905C15.8642 36.4905 14.0535 33.2281 14.0535 31.1239C14.0535 29.8357 14.496 27.9685 16.3251 26.5858C17.4098 25.7658 18.9153 25.4384 21.358 25.4384C21.358 24.6828 21.358 22.5833 21.358 19.1399Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
          </svg>
          关注
        </a>
        <a class="btn" href="https://v.douyin.com/OOFiHbUxKs0/" target="_blank">
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.358 19.1399C15.4694 18.8558 11.3762 20.9553 9.07838 25.4384C5.63169 32.163 8.48026 43.1666 19.9788 43.1666C31.4774 43.1666 31.81 32.0554 31.81 30.8914C31.81 30.1154 31.81 25.7764 31.81 17.8746C34.2694 19.4323 36.343 20.37 38.0308 20.6877C39.7186 21.0053 40.7915 21.1461 41.2497 21.11V14.6343C39.6886 14.4461 38.3386 14.0873 37.1997 13.5581C35.4913 12.7643 32.1037 10.5611 32.1037 7.33208C32.106 7.34787 32.106 6.51493 32.1037 4.83325H24.9857C24.9645 20.6493 24.9645 29.3353 24.9857 30.8914C25.0175 33.2255 23.2068 36.4905 19.5355 36.4905C15.8642 36.4905 14.0535 33.2281 14.0535 31.1239C14.0535 29.8357 14.496 27.9685 16.3251 26.5858C17.4098 25.7658 18.9153 25.4384 21.358 25.4384C21.358 24.6828 21.358 22.5833 21.358 19.1399Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
          </svg>
          直播间
        </a>
        <a class="btn nav-link" href="#tools" data-page="tools">工具</a>
      </div>

      <div class="footer">
        本页面由"九月文化有限电台"的"限制"持续维护与更新
      </div>

      <div class="testers">
        测试人员：
        <span><img src="https://s21.ax1x.com/2025/09/28/pVoEhWD.jpg" alt="九月✨FM" loading="lazy" />九月✨FM</span>
        <span><img src="https://s21.ax1x.com/2025/09/29/pVonDbj.jpg" alt="CHEN" loading="lazy" />CHEN</span>
        <span><img src="https://s21.ax1x.com/2025/09/29/pVonsVs.jpg" alt="限制" loading="lazy" />限制</span>
      </div>
    </div>
  `;
}

// 加载工具箱页面内容
async function loadToolsPage() {
  return `
    <div class="tools-page">
      <!-- 背景装饰 -->
      <div class="bg-decoration">
        <div class="bg-circle"></div>
        <div class="bg-circle"></div>
        <div class="bg-circle"></div>
      </div>

      <!-- 头部栏 -->
      <div class="header-bar">
        <a class="back-btn nav-link" href="#home" data-page="home">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回主页
        </a>
        <div class="page-title">九月✨FM 工具箱</div>
        <div class="header-stats">
          <span class="stat-item">
            <span class="stat-number" id="counter">0</span>
            <span class="stat-label">累计下载</span>
          </span>
        </div>
      </div>

      <!-- 工具网格 -->
      <div class="tools-grid">
        <!-- 工具1：九月FM粉丝专用 -->
        <div class="tool-card" data-pkg="com.jiuyue.fm.app">
          <div class="tool-badge">热门</div>
          <div class="tool-head">
            <div class="tool-icon-wrapper">
              <img class="tool-icon" src="https://s21.ax1x.com/2025/09/28/pVoEhWD.jpg" alt="九月FM图标">
              <div class="icon-overlay"></div>
            </div>
            <div class="tool-title-area">
              <div class="tool-title">九月FM粉丝专用</div>
              <div class="tool-meta">
                <span class="version">v1.0.0</span>
                <span class="size">10.8 MB</span>
                <span class="tool-tag">官方应用</span>
              </div>
            </div>
          </div>
          <div class="tool-desc">
            九月✨FM官方粉丝版客户端，集成自动点赞、自动场控等功能，为粉丝提供更好的直播互动体验。（目前处于开发阶段，敬请期待）
          </div>
          <div class="tool-features">
            <span class="feature-tag">自动点赞</span>
            <span class="feature-tag">场控助手</span>
            <span class="feature-tag">粉丝专属</span>
          </div>
          <button class="tool-down" data-url="https://github.com/Yizutt/SangQinge/releases/download/v1.0.0/SangQinge-v1.0.0.apk">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            检测中...
          </button>
          <div class="download-progress">
            <div class="download-progress-bar"></div>
          </div>
        </div>
        
        <!-- 工具2：直播助手 -->
        <div class="tool-card" data-pkg="com.jiuyue.live.assistant">
          <div class="tool-badge">推荐</div>
          <div class="tool-head">
            <div class="tool-icon-wrapper">
              <div class="icon-placeholder" style="background: linear-gradient(135deg, #8b5cf6, #a78bfa);">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z"/>
                  <rect x="3" y="6" width="12" height="12" rx="2"/>
                </svg>
              </div>
            </div>
            <div class="tool-title-area">
              <div class="tool-title">直播助手</div>
              <div class="tool-meta">
                <span class="version">v2.1.0</span>
                <span class="size">15.2 MB</span>
                <span class="tool-tag">专业工具</span>
              </div>
            </div>
          </div>
          <div class="tool-desc">
            专业的直播辅助工具，提供弹幕管理、礼物统计、自动回复等功能，帮助主播更好地与观众互动。
          </div>
          <div class="tool-features">
            <span class="feature-tag">弹幕管理</span>
            <span class="feature-tag">礼物统计</span>
            <span class="feature-tag">自动回复</span>
          </div>
          <button class="tool-down" data-url="#">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
            即将上线
          </button>
        </div>
        
        <!-- 工具3：音频工具箱 -->
        <div class="tool-card" data-pkg="com.jiuyue.audio.tools">
          <div class="tool-head">
            <div class="tool-icon-wrapper">
              <div class="icon-placeholder" style="background: linear-gradient(135deg, #10b981, #34d399);">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18V5l12-2v13M9 18l12 2M9 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0zm12 2a3 3 0 1 0 6 0 3 3 0 0 0-6 0z"/>
                </svg>
              </div>
            </div>
            <div class="tool-title-area">
              <div class="tool-title">音频工具箱</div>
              <div class="tool-meta">
                <span class="version">v1.5.0</span>
                <span class="size">8.3 MB</span>
                <span class="tool-tag">音频处理</span>
              </div>
            </div>
          </div>
          <div class="tool-desc">
            音频处理工具集，包含音频剪辑、格式转换、音量调整等功能，满足日常音频处理需求。
          </div>
          <div class="tool-features">
            <span class="feature-tag">音频剪辑</span>
            <span class="feature-tag">格式转换</span>
            <span class="feature-tag">音量调整</span>
          </div>
          <button class="tool-down" data-url="#">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            开发中
          </button>
        </div>

        <!-- 工具4：美颜相机 -->
        <div class="tool-card" data-pkg="com.jiuyue.beauty.camera">
          <div class="tool-head">
            <div class="tool-icon-wrapper">
              <div class="icon-placeholder" style="background: linear-gradient(135deg, #ec4899, #f472b6);">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M16 5h4"/>
                </svg>
              </div>
            </div>
            <div class="tool-title-area">
              <div class="tool-title">美颜相机</div>
              <div class="tool-meta">
                <span class="version">v3.2.1</span>
                <span class="size">25.6 MB</span>
                <span class="tool-tag">拍摄美化</span>
              </div>
            </div>
          </div>
          <div class="tool-desc">
            专为主播设计的美颜相机，提供多种滤镜、美颜效果和直播特效，让你的直播更加精彩。
          </div>
          <div class="tool-features">
            <span class="feature-tag">实时美颜</span>
            <span class="feature-tag">多种滤镜</span>
            <span class="feature-tag">直播特效</span>
          </div>
          <button class="tool-down" data-url="#">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            立即下载
          </button>
        </div>
      </div>

      <!-- 系统提示 -->
      <div class="system-tip">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        提示：部分工具仅支持Android系统，iOS用户请等待后续版本
      </div>
    </div>
  `;
}

// 初始化页面特定功能
function initPageSpecificFeatures(page) {
  switch(page) {
    case 'home':
      initHomePage();
      break;
    case 'tools':
      initToolsPage();
      break;
  }
}

// 初始化首页功能
function initHomePage() {
  // 更新时间标签
  updateTime();
  setInterval(updateTime, 1000);
  
  // 更新天数标签
  updateDayTag();
  setInterval(updateDayTag, 60 * 1000);
  
  // 加载并渲染任务
  renderMissions();
  
  // 重新绑定导航链接
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetPage = this.getAttribute('data-page');
      navigateToPage(targetPage);
    });
  });
}

// 初始化工具箱页面功能
function initToolsPage() {
  // 初始化下载计数器
  document.getElementById('counter').textContent = getDownloadCount();
  
  // 初始化工具下载按钮
  initToolButtons();
  
  // 重新绑定导航链接
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetPage = this.getAttribute('data-page');
      navigateToPage(targetPage);
    });
  });
}

// 获取下载计数
function getDownloadCount() {
  const pkgKey = 'jiuyue_fm_download_count';
  return Number(localStorage.getItem(pkgKey) || 0);
}

// 增加下载计数
function incDownloadCount() {
  const pkgKey = 'jiuyue_fm_download_count';
  const c = getDownloadCount() + 1;
  localStorage.setItem(pkgKey, c);
  document.getElementById('counter').textContent = c;
}

// 初始化工具按钮
function initToolButtons() {
  document.querySelectorAll('.tool-card').forEach(card => {
    const pkg = card.dataset.pkg;
    const btn = card.querySelector('.tool-down');
    const apkUrl = btn.dataset.url;

    // 检测是否为安卓设备
    const isAndroid = /android/i.test(navigator.userAgent);
    
    // 设置按钮状态
    const setButtonState = (text, disabled = false, isInstalled = false) => {
      btn.textContent = text;
      btn.disabled = disabled;
      if (disabled) {
        btn.classList.add('disabled');
      } else {
        btn.classList.remove('disabled');
      }
      
      // 如果已安装，更改按钮样式
      if (isInstalled) {
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 13l4 4L19 7"/>
          </svg>
          ${text}
        `;
        btn.style.background = 'linear-gradient(45deg, #10b981, #34d399)';
      }
    };

    // 模拟检测是否已安装
    const isInstalled = () => {
      return false;
    };

    // 初始化按钮状态
    if (apkUrl === '#') {
      // 对于未上线的工具
      setButtonState('即将上线', true);
    } else {
      // 对于可下载的工具
      if (isAndroid) {
        const installed = isInstalled();
        if (installed) {
          setButtonState('打开应用', false, true);
          btn.onclick = () => {
            // 尝试打开应用
            window.location.href = `intent://${pkg}#Intent;scheme=package;end`;
          };
        } else {
          setButtonState('立即下载', false);
          btn.onclick = () => {
            incDownloadCount();
            setButtonState('下载中...', true);
            
            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = apkUrl;
            downloadLink.download = '';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // 2秒后恢复按钮状态
            setTimeout(() => {
              setButtonState('立即下载', false);
            }, 2000);
          };
        }
      } else {
        // 非安卓设备
        setButtonState('仅限Android', true);
      }
    }
  });
}