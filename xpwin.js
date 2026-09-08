/* 桌面弹窗：点入口不跳转，抽取目标页面正文塞进 XP 灰窗，音乐/聊天不断。
   样例先接「贩售机」，验证观感后把更多入口加进 MODAL 即可。 */
(function(){
  var MODAL = ['vending_machine.html','logs.html','operator_notes.html','specimen_room.html',
    'museum.html','about.html','errorlog.html','portfolio.html','news.html','corrupted_archive.html',
    'call-0417.html','call-0603.html','call-0912.html','call-2258.html'];

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

  function close(){ modal.classList.remove('open','game','answerbook'); mask.classList.remove('open');
    if(window.__player) window.__player.resume(); }
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
      bindVending(body);
    }).catch(function(){ body.innerHTML='打不开这个窗口（本地直接双击打开时受浏览器限制，部署到网站后正常）。'; });
  }

  /* 弹窗里重新绑定贩售机掉落（弹窗剥离了原页脚本，需在此重挂） */
  function bindVending(scope){
    var vm=scope.querySelector('#vm'); if(!vm && !scope.querySelector('.vitem')) return;
    var floating=0, pile=[];
    function dropCoin(){
      if(floating>=7) return; floating++;
      var img=document.createElement('img');
      img.src='picture/c.gif'; img.className='xp-fall-coin';
      img.style.left=(10+Math.random()*80)+'vw';
      document.body.appendChild(img);
      img.addEventListener('animationend',function(){ img.remove(); floating--; });
    }
    function dropItem(icon, fromX){
      var img=document.createElement('img');
      img.src='picture/Pixel_Mart/'+icon; img.className='xp-fall-item';
      var x=(fromX!=null?fromX:Math.random()*window.innerWidth);
      img.style.left=Math.max(4,Math.min(window.innerWidth-46,x))+'px';
      document.body.appendChild(img);
      img.addEventListener('animationend',function(){
        img.classList.remove('xp-fall-item'); img.classList.add('xp-piled');
        img.style.left=Math.max(4,Math.min(window.innerWidth-46,x))+'px';
        img.style.bottom=(Math.random()*10)+'px';
        pile.push(img); while(pile.length>50){ pile.shift().remove(); }
      });
    }
    if(vm){ vm.style.cursor='pointer';
      vm.addEventListener('animationend',function(){ vm.classList.remove('shake'); });
      vm.addEventListener('click',function(){ vm.classList.remove('shake'); void vm.offsetWidth; vm.classList.add('shake'); dropCoin(); });
    }
    scope.querySelectorAll('.vitem:not(.out)').forEach(function(btn){
      btn.addEventListener('click',function(e){ dropItem(btn.getAttribute('data-icon'), e.clientX); });
    });
  }

  /* 答案之书：book1/book2 来回切当假 gif + 晕开白光呼吸文字 + 点击抽签 */
  function openAnswerBook(dbody, navA){
    modal.classList.add('answerbook');
    dbody.innerHTML=
      '<button class="game-back">← 返回</button>'+
      '<div class="ab-stage">'+
        '<img class="ab-book" src="picture/book.gif" alt="" onerror="this.style.display=\'none\'">'+
        '<div class="ab-glow"><span class="ab-hint">点击寻找答案</span></div>'+
      '</div>';
    dbody.querySelector('.game-back').addEventListener('click',function(){ navA.click(); });
    var glow=dbody.querySelector('.ab-glow'), hint=dbody.querySelector('.ab-hint');
    var book=dbody.querySelector('.ab-book');
    var BOOK=window.ANSWER_BOOK||['……'];
    var last=-1, timer=null, GIFMS=1000;
    glow.style.cursor='pointer';
    glow.addEventListener('click',function(){
      if(timer) clearTimeout(timer);
      book.src='picture/book.gif?t='+Date.now();            // 重播一次
      timer=setTimeout(function(){ book.src='picture/book.png'; }, GIFMS); // 播完停末帧
      var i; do{ i=Math.floor(Math.random()*BOOK.length); }while(i===last&&BOOK.length>1); last=i;
      hint.classList.remove('pop'); void hint.offsetWidth; hint.classList.add('pop');
      hint.textContent=BOOK[i];
    });
  }

  /* 今日运势抽签：摇签筒→白纸条→一天一次（本地日期锁） */
  function openFortune(dbody, navA){
    var ICONS=['ball_pen.png','eraser.png','light_bulb.png','coffee_bag.png','receipt.png',
      'batteries.png','marshmallows.png','candy_bar.png','strawberry.png','banana.png',
      'cookies.png','bubble_gum.png','rubber_duck.png','light_bulb_box.png','egg_white.png'];
    var POOL=window.FORTUNE||[];
    function today(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
    function pickIcon(){ return 'picture/Pixel_Mart/'+ICONS[Math.floor(Math.random()*ICONS.length)]; }
    function stars(s){ return '★★★★★☆☆☆☆☆'.slice(5-s,10-s); }

    dbody.innerHTML=
      '<button class="game-back">← 返回</button>'+
      '<div class="fo-stage">'+
        '<div class="fo-tube" id="fotube" title="点我摇一摇">'+
          '<div class="fo-lip"></div><div class="fo-sticks"><i></i><i></i><i></i><i></i><i></i></div>'+
          '<div class="fo-tip">点击摇签</div>'+
        '</div>'+
        '<div class="fo-slip" id="foslip"></div>'+
      '</div>';
    dbody.querySelector('.game-back').addEventListener('click',function(){ navA.click(); });
    var tube=dbody.querySelector('#fotube'), slip=dbody.querySelector('#foslip');

    function render(f, ic){
      slip.innerHTML=
        '<div class="fo-paper">'+
          '<img class="fo-ic" src="'+ic+'" alt="">'+
          '<div class="fo-name">今日签 · 「'+f.n+'」</div>'+
          '<div class="fo-stars">'+stars(f.s)+'</div>'+
          '<p class="fo-line">'+f.a+'<br>'+f.b+'</p>'+
          '<div class="fo-meta">关键词：'+f.k+'　·　幸运时刻：'+f.t+'　·　幸运物：'+f.o+'</div>'+
        '</div>';
      slip.classList.add('show');
    }

    // 已抽过？直接显示当天那张
    var saved=null;
    try{ saved=JSON.parse(localStorage.getItem('fortune_today')||'null'); }catch(e){}
    if(saved && saved.date===today() && saved.i>=0 && POOL[saved.i]){
      tube.querySelector('.fo-tip').textContent='今天已抽';
      render(POOL[saved.i], saved.ic);
      return;
    }

    tube.addEventListener('click',function(){
      // 再次校验，防连点
      try{ saved=JSON.parse(localStorage.getItem('fortune_today')||'null'); }catch(e){}
      if(saved && saved.date===today()){ return; }
      if(!POOL.length) return;
      tube.classList.remove('shake'); void tube.offsetWidth; tube.classList.add('shake');
      var i=Math.floor(Math.random()*POOL.length), ic=pickIcon();
      setTimeout(function(){
        render(POOL[i], ic);
        tube.querySelector('.fo-tip').textContent='今天已抽';
        try{ localStorage.setItem('fortune_today', JSON.stringify({date:today(), i:i, ic:ic})); }catch(e){}
      }, 650);
    });
  }

  document.addEventListener('click',function(e){
    var a=e.target.closest('a'); if(!a) return;

    /* 占卜栏：弹出选择界面（三个入口，先占位） */
    if(a.id==='nav-divination'){
      e.preventDefault();
      if(window.__player) window.__player.pauseFor();
      document.getElementById('xpmtitle').textContent='占卜';
      document.getElementById('xpmico').src='icons/MSN.png';
      var dbody=document.getElementById('xpmbody');
      dbody.innerHTML=
        '<div class="game-pick">'+
          '<div class="game-card div-card" data-div="answers"><div class="cover c1"><img src="icons/ball.png" alt=""></div><div class="gname">答案之书</div></div>'+
          '<div class="game-card div-card" data-div="tarot"><div class="cover c2"><img src="icons/moon.png" alt=""></div><div class="gname">塔罗牌</div></div>'+
          '<div class="game-card div-card" data-div="fortune"><div class="cover c3"><img src="icons/sweet.png" alt=""></div><div class="gname">今日运势抽签</div></div>'+
        '</div>';
      modal.classList.remove('game');
      modal.classList.add('open'); mask.classList.add('open');
      modal.style.left=''; modal.style.top=''; modal.style.transform=''; modal.style.width='';
      dbody.querySelectorAll('.div-card').forEach(function(card){
        card.addEventListener('click',function(){
          var kind=card.getAttribute('data-div');
          var name=card.querySelector('.gname').textContent;
          if(kind==='answers'){ openAnswerBook(dbody, a); return; }
          if(kind==='fortune'){ openFortune(dbody, a); return; }
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
      if(window.__player) window.__player.pauseFor();
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

  /* 直达子页面→跳主页后，读取 ?open= 自动弹窗 */
  var TITLES={ 'logs.html':'来电归档','operator_notes.html':'接线员手记','specimen_room.html':'标本室',
    'museum.html':'博物馆','about.html':'关于本站','vending_machine.html':'5-羟色胺自动贩售机',
    'errorlog.html':'错误日志','portfolio.html':'作品集','news.html':'媒体 · 新闻','corrupted_archive.html':'损坏档案',
    'call-0417.html':'call-0417','call-0603.html':'call-0603','call-0912.html':'call-0912','call-2258.html':'call-2258' };
  (function(){
    var m=/[?&]open=([^&]+)/.exec(location.search); if(!m) return;
    var f=decodeURIComponent(m[1]);
    if(MODAL.indexOf(f)>=0){ setTimeout(function(){ openModal(f, TITLES[f]||f, 'icons/file.png'); }, 300); }
  })();
})();
