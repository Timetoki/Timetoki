/* 桌面弹窗：点入口不跳转，抽取目标页面正文塞进 XP 灰窗，音乐/聊天不断。
   样例先接「贩售机」，验证观感后把更多入口加进 MODAL 即可。 */
(function(){
  var MODAL = ['vending_machine.html'];   // 先接这一个做样例

  var mask=document.createElement('div'); mask.className='xp-mask'; document.body.appendChild(mask);
  var modal=document.createElement('div'); modal.className='xpwin xp-modal';
  modal.innerHTML=
    '<div class="xp-t"><img class="ico" id="xpmico" src="icons/Games.png" alt="">' +
    '<span id="xpmtitle">窗口</span><span class="btns">' +
    '<button id="xpmmin" title="最小化">_</button>' +
    '<button id="xpmmax" title="最大化">▢</button>' +
    '<button id="xpmcls" title="关闭">×</button>' +
    '</span></div><div class="xp-b" id="xpmbody">加载中…</div>';
  document.body.appendChild(modal);

  function close(){ modal.classList.remove('open','game'); mask.classList.remove('open'); }
  mask.addEventListener('click',close);
  document.getElementById('xpmcls').addEventListener('click',close);
  document.getElementById('xpmmin').addEventListener('click',function(e){ e.stopPropagation(); close(); });
  document.getElementById('xpmmax').addEventListener('click',function(e){ e.stopPropagation(); /* 最大化：点了无效 */ });

  (function(){
    var t=modal.querySelector('.xp-t'),dx=0,dy=0,drag=false;
    t.addEventListener('mousedown',function(e){
      if(e.target.tagName==='BUTTON')return; drag=true;
      var r=modal.getBoundingClientRect();
      modal.style.width=r.width+'px';
      modal.style.left=r.left+'px'; modal.style.top=r.top+'px'; modal.style.transform='none';
      dx=e.clientX-r.left; dy=e.clientY-r.top; e.preventDefault();
    });
    document.addEventListener('mousemove',function(e){ if(!drag)return;
      modal.style.left=Math.max(4,Math.min(window.innerWidth-80,e.clientX-dx))+'px';
      modal.style.top =Math.max(4,Math.min(window.innerHeight-40,e.clientY-dy))+'px'; });
    document.addEventListener('mouseup',function(){drag=false;});
  })();

  function openModal(url,title,icon){
    document.getElementById('xpmtitle').textContent=title||'窗口';
    if(icon) document.getElementById('xpmico').src=icon;
    var body=document.getElementById('xpmbody'); body.innerHTML='加载中…';
    modal.classList.add('open'); mask.classList.add('open');
    modal.style.left=''; modal.style.top=''; modal.style.transform=''; modal.style.width='';
    fetch(url).then(function(r){return r.text();}).then(function(html){
      var doc=new DOMParser().parseFromString(html,'text/html');
      var w=doc.querySelector('.wrap');
      if(!w){ body.innerHTML='打不开这个窗口。'; return; }
      w.querySelectorAll('.doodle-layer,.dock,.player,.chatbtn,.chatwin,script,nav.menu').forEach(function(n){n.remove();});
      body.innerHTML=w.innerHTML;
    }).catch(function(){ body.innerHTML='打不开这个窗口（本地直接双击打开时受浏览器限制，部署到网站后正常）。'; });
  }

  document.addEventListener('click',function(e){
    var a=e.target.closest('a'); if(!a) return;

    /* 占卜栏：弹出选择界面（三个入口，先占位） */
    if(a.id==='nav-divination'){
      e.preventDefault();
      document.getElementById('xpmtitle').textContent='占卜';
      document.getElementById('xpmico').src='icons/MSN.png';
      var dbody=document.getElementById('xpmbody');
      dbody.innerHTML=
        '<div class="game-pick">'+
          '<div class="game-card div-card" data-div="answers"><div class="cover c1">📖</div><div class="gname">答案之书</div></div>'+
          '<div class="game-card div-card" data-div="tarot"><div class="cover c2">🔮</div><div class="gname">塔罗牌</div></div>'+
          '<div class="game-card div-card" data-div="fortune"><div class="cover c3">🎋</div><div class="gname">今日运势抽签</div></div>'+
        '</div>';
      modal.classList.remove('game');
      modal.classList.add('open'); mask.classList.add('open');
      modal.style.left=''; modal.style.top=''; modal.style.transform=''; modal.style.width='';
      dbody.querySelectorAll('.div-card').forEach(function(card){
        card.addEventListener('click',function(){
          var name=card.querySelector('.gname').textContent;
          dbody.innerHTML='<button class="game-back">← 返回</button>'+
            '<div style="text-align:center;padding:40px 16px">'+
            '<div style="font-size:40px;margin-bottom:12px">🚧</div>'+
            '<div style="font-weight:700;font-size:16px">'+name+'</div>'+
            '<p class="muted" style="margin-top:8px">施工中，敬请期待 ♡</p></div>';
          dbody.querySelector('.game-back').addEventListener('click',function(){ a.click(); });
        });
      });
      return;
    }

    /* 游戏栏：弹出游戏选择界面（不跳转，iframe 载入，音乐不断） */
    if(a.id==='nav-games'){
      e.preventDefault();
      document.getElementById('xpmtitle').textContent='游戏';
      document.getElementById('xpmico').src='icons/Games.png';
      var body=document.getElementById('xpmbody');
      body.innerHTML=
        '<div class="game-pick">'+
          '<div class="game-card" data-game="games/minecraft/index.html">'+
            '<div class="cover"><img src="icons/MC.png" alt=""></div>'+
            '<div class="gname">Minecraft</div>'+
          '</div>'+
        '</div>';
      modal.classList.remove('game');
      modal.classList.add('open'); mask.classList.add('open');
      modal.style.left=''; modal.style.top=''; modal.style.transform=''; modal.style.width='';
      body.querySelectorAll('.game-card').forEach(function(card){
        card.addEventListener('click',function(){
          var src=card.getAttribute('data-game');
          body.innerHTML='<button class="game-back">← 返回选择</button>'+
                         '<iframe class="game-frame" src="'+src+'" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>';
          modal.classList.add('game');
          modal.style.left=''; modal.style.top=''; modal.style.transform=''; modal.style.width='';
          body.querySelector('.game-back').addEventListener('click',function(){ a.click(); });
        });
      });
      return;
    }

    var href=a.getAttribute('href')||'';
    if(/^https?:/i.test(href)) return;
    var base=href.split('/').pop();
    if(MODAL.indexOf(base)>=0){
      e.preventDefault();
      var ico=a.querySelector('img');
      openModal(href, a.textContent.trim()||base, ico?ico.getAttribute('src'):null);
    }
  });
})();
