/* 左侧桌面 dock + 右侧千禧唱片播放器 —— 注入到每个页面 */
(function(){
  if (document.querySelector('.dock')) return; // 防重复

  /* ---------- 左侧快捷方式（已排除顶部导航里已有的项）---------- */
  var DOCK = [
    {label:"错误日志", href:"errorlog.html",        icon:"icons/blog2.png"},
    {label:"作品集",   href:"portfolio.html",        icon:"icons/Portfolio.png"},
    {label:"贩售机",   href:"vending_machine.html",  icon:"icons/Games.png"},
    {label:"新闻",     href:"news.html",             icon:"icons/Media.png"},
    {label:"GitHub",   href:"https://github.com/Timetoki", icon:"icons/github.png", ext:true},
    {label:"回收站",   href:"corrupted_archive.html", icon:"icons/Recycle.png"}
  ];

  /* ---------- 播放列表：mp3 放进仓库根的 music/ 文件夹 ---------- */
  var PLAYLIST = [
    {title:"All by My Design", src:"music/All by My Design.mp3"},
    {title:"Idol",             src:"music/Idol.mp3"},
    {title:"彼女は旅に出る",    src:"music/彼女は旅に出る.mp3"},
    {title:"春日影",           src:"music/春日影.mp3"},
    {title:"铁花飞",           src:"music/铁花飞.mp3"}
  ];

  /* ---------- 建 dock ---------- */
  var dock = document.createElement('nav');
  dock.className = 'dock';
  dock.setAttribute('aria-label','桌面快捷方式');
  DOCK.forEach(function(d){
    var a = document.createElement('a');
    a.href = d.href;
    if (d.ext){ a.target = '_blank'; a.rel = 'noopener'; }
    a.innerHTML = '<img src="'+d.icon+'" alt="">'+d.label;
    dock.appendChild(a);
  });
  document.body.appendChild(dock);

  /* ---------- 建播放器 ---------- */
  var box = document.createElement('div');
  box.className = 'player';
  box.innerHTML =
    '<div class="vinyl" id="pv"><div class="lbl"></div><div class="shine"></div></div>' +
    '<div class="scr" id="pscr">— 未放入唱片 —</div>' +
    '<div class="prow"><span id="ptcur">0:00</span>' +
      '<input id="pseek" class="pbar" type="range" min="0" max="1000" value="0" step="1" aria-label="进度">' +
      '<span id="ptdur">0:00</span></div>' +
    '<div class="pctrls">' +
      '<button id="pprev" title="上一首">◀</button>' +
      '<button id="pplay" title="播放/暂停">▶</button>' +
      '<button id="pnext" title="下一首">▶</button>' +
    '</div>' +
    '<div class="vrow"><span class="vico">🔊</span>' +
      '<input id="pvol" class="pbar" type="range" min="0" max="100" value="80" step="1" aria-label="音量"></div>';
  document.body.appendChild(box);

  var audio = new Audio();
  audio.preload = 'metadata';
  audio.volume = 0.8;
  var i = 0;

  var vinyl = document.getElementById('pv');
  var scr   = document.getElementById('pscr');
  var play  = document.getElementById('pplay');
  var seek  = document.getElementById('pseek');
  var vol   = document.getElementById('pvol');
  var tcur  = document.getElementById('ptcur');
  var tdur  = document.getElementById('ptdur');
  var seeking = false;

  function fmt(s){ s=Math.floor(s||0); var m=Math.floor(s/60); var r=s%60; return m+':'+(r<10?'0':'')+r; }
  function load(idx){
    i = (idx + PLAYLIST.length) % PLAYLIST.length;
    audio.src = encodeURI(PLAYLIST[i].src);
    scr.textContent = PLAYLIST[i].title;
    tcur.textContent='0:00'; tdur.textContent='0:00'; seek.value=0;
  }
  function spin(on){ vinyl.classList.toggle('spin', on); }
  function setPlayIcon(){ play.textContent = audio.paused ? '▶' : '❚❚'; }

  load(0);

  play.addEventListener('click', function(){
    if (audio.paused){
      var p = audio.play();
      if (p && p.catch) p.catch(function(){ scr.textContent = '找不到 ' + PLAYLIST[i].title; });
    } else { audio.pause(); }
  });
  document.getElementById('pprev').addEventListener('click', function(){
    var w=!audio.paused; load(i-1); if(w) audio.play();
  });
  document.getElementById('pnext').addEventListener('click', function(){
    var w=!audio.paused; load(i+1); if(w) audio.play();
  });

  audio.addEventListener('play',  function(){ spin(true);  setPlayIcon(); });
  audio.addEventListener('pause', function(){ spin(false); setPlayIcon(); });
  audio.addEventListener('ended', function(){ load(i+1); audio.play(); });
  audio.addEventListener('error', function(){ spin(false); setPlayIcon(); scr.textContent = '缺唱片：' + PLAYLIST[i].title; });

  audio.addEventListener('loadedmetadata', function(){ tdur.textContent = fmt(audio.duration); });
  audio.addEventListener('timeupdate', function(){
    if (seeking || !audio.duration) return;
    seek.value = Math.round(audio.currentTime / audio.duration * 1000);
    tcur.textContent = fmt(audio.currentTime);
  });
  seek.addEventListener('input',  function(){ seeking = true; if(audio.duration) tcur.textContent = fmt(seek.value/1000*audio.duration); });
  seek.addEventListener('change', function(){ if(audio.duration) audio.currentTime = seek.value/1000*audio.duration; seeking = false; });
  vol.addEventListener('input',   function(){ audio.volume = vol.value/100; });
})();
