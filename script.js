// 九月✨FM - 自适应设备布局脚本

// 全局变量
let currentMusicIndex = 0;
let musicList = [];
let tasks = [];

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

// 页面加载完成后开始检测
window.addEventListener('load', function() {
  // 优先执行关键UI渲染
  detectDevice();
  detectOrientation();
  updateTime();
  updateDayTag();
  
  // 延迟执行非关键加载任务
  setTimeout(() => {
    loadTasks();
    loadMusicList();
  }, 500);
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
  document.getElementById('timeTag').textContent = `${h}:${m}:${s}`;
}
updateTime();
setInterval(updateTime, 1000);

// 实时计算开播天数（2025-09-21 开播）
function updateDayTag() {
  const start = new Date('2025-09-21T00:00:00');
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
  document.getElementById('dayTag').textContent = `开播第${diff}天`;
}
updateDayTag();
setInterval(updateDayTag, 60 * 1000);

// ---------------- 任务系统 ----------------
async function loadTasks() {
  try {
    // 添加超时控制和缓存策略
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('tasks.json?t=' + Date.now(), {
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    const newTasks = await response.json();
    
    // 转换日期字符串为Date对象
    newTasks.forEach(task => {
      task.start = new Date(task.start);
      task.end = new Date(task.end);
    });
    
    tasks = newTasks;
    console.log('任务数据已更新:', new Date().toLocaleTimeString());
  } catch (error) {
    console.error('加载任务数据失败:', error);
    // 保持现有任务数据，不替换为默认值
  }
}

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
setInterval(loadTasks, 60000);

// ---------------- 音乐系统 ----------------
async function loadMusicList() {
  try {
    // 添加超时控制和缓存策略
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('music.json', {
      signal: controller.signal,
      cache: 'force-cache'
    });
    
    clearTimeout(timeoutId);
    musicList = await response.json();
    
    // 预加载下一首音乐（如果有）
    if (musicList.length > 1) {
      const nextMusic = musicList[1];
      const preloadAudio = new Audio(nextMusic.file);
      preloadAudio.preload = 'metadata';
    }
    
    initMusicPlayer();
  } catch (error) {
    console.error('加载音乐列表失败:', error);
    // 使用默认音乐数据
    musicList = [
      {
        id: 1,
        title: "冰的痕迹-张筱迪",
        file: "bjmusic.mp3"
      }
    ];
    initMusicPlayer();
  }
}

function initMusicPlayer() {
  const bgMusic = document.getElementById('bgMusic');
  const musicControl = document.getElementById('musicControl');
  const musicInfo = document.getElementById('musicInfo');
  const musicTitle = musicInfo.querySelector('.music-title');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeValue = document.querySelector('.volume-value');
  const musicListToggle = document.getElementById('musicListToggle');
  const musicList = document.getElementById('musicList');
  const closeList = document.getElementById('closeList');
  const musicItems = document.getElementById('musicItems');
  
  // 初始化音量
  const initialVolume = 0.025;
  bgMusic.volume = initialVolume;
  volumeSlider.value = initialVolume * 100;
  volumeValue.textContent = Math.round(initialVolume * 100) + '%';
  
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
      }).catch(error => {
        console.log('播放失败:', error);
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
    
    // 更新音乐源
    bgMusic.src = music.file;
    musicTitle.textContent = music.title;
    
    // 更新音乐列表中的活动项
    updateActiveMusicItem();
    
    // 尝试播放
    tryAutoPlay();
  }
  
  // 尝试自动播放
  function tryAutoPlay() {
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // 自动播放成功
        musicControl.classList.add('playing');
        showMusicInfo();
      }).catch(error => {
        // 自动播放失败，等待用户交互
        console.log('自动播放被阻止，等待用户交互');
        musicControl.classList.remove('playing');
      });
    }
  }
  
  // 添加缓冲检测
  bgMusic.addEventListener('progress', function() {
    if (bgMusic.buffered.length > 0) {
      const bufferedEnd = bgMusic.buffered.end(bgMusic.buffered.length - 1);
      const duration = bgMusic.duration;
      // 当缓冲足够时再播放
      if (duration > 0 && bufferedEnd / duration > 0.5 && bgMusic.paused) {
        tryAutoPlay();
      }
    }
  });
  
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
    musicList.classList.add('show');
  }
  
  // 隐藏音乐列表
  function hideMusicList() {
    musicList.classList.remove('show');
  }
  
  // 音乐列表切换按钮
  musicListToggle.addEventListener('click', showMusicList);
  closeList.addEventListener('click', hideMusicList);
}