/* 桌面弹窗：点入口不跳转，抽取目标页面正文塞进 XP 灰窗，音乐/聊天不断。
   样例先接「贩售机」，验证观感后把更多入口加进 MODAL 即可。 */
(function(){
  var MODAL = ['vending_machine.html','logs.html','operator_notes.html','specimen_room.html',
    'museum.html','about.html','errorlog.html','portfolio.html','news.html','corrupted_archive.html',
    'call-0417.html','call-0603.html','call-0912.html','call-2258.html','hotline.html'];

  var mask=document.createElement('div'); mask.className='xp-mask'; document.body.appendChild(mask);
  var modal=document.createElement('div'); modal.className='xpwin xp-modal';
  modal.innerHTML=
    '<div class="xp-t"><img class="ico" id="xpmico" src="icons/largeicons/Games.png" alt="">' +
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
    if(window.Achievements){
      var base=url.split('/').pop();
      if(base==='corrupted_archive.html'||base==='errorlog.html'){
        window.Achievements.visit(base, ['corrupted_archive.html','errorlog.html'], 'archive-digger');
      }
      if(/^call-/.test(base)){
        window.Achievements.visit(base, ['call-0417.html','call-0603.html','call-0912.html','call-2258.html'], 'hotline-completionist');
      }
    }
    fetch(url).then(function(r){return r.text();}).then(function(html){
      var doc=new DOMParser().parseFromString(html,'text/html');
      var w=doc.querySelector('.wrap');
      if(!w){ body.innerHTML='打不开这个窗口。'; return; }
      w.querySelectorAll('.doodle-layer,.dock,.player,.chatbtn,.chatwin,script,nav.menu').forEach(function(n){n.remove();});
      body.innerHTML=w.innerHTML;
      bindVending(body);
      bindHotline(body);
      if(window.Achievements) window.Achievements.render();
    }).catch(function(){ body.innerHTML='打不开这个窗口（本地直接双击打开时受浏览器限制，部署到网站后正常）。'; });
  }

  /* 弹窗里重新绑定贩售机掉落（弹窗剥离了原页脚本，需在此重挂） */
  function bindVending(scope){
    var vm=scope.querySelector('#vm'); if(!vm && !scope.querySelector('.vitem')) return;
    var floating=0, pile=[];
    function dropCoin(){
      if(floating>=7) return; floating++;
      if(window.Achievements) window.Achievements.bump('vendingCoins', 10, 'vending-broke');
      var img=document.createElement('img');
      img.src='pictures/assets/c.gif'; img.className='xp-fall-coin';
      img.style.left=(10+Math.random()*80)+'vw';
      document.body.appendChild(img);
      img.addEventListener('animationend',function(){ img.remove(); floating--; });
    }
    function dropItem(icon, fromX){
      var img=document.createElement('img');
      img.src='icons/Pixel_Mart/'+icon; img.className='xp-fall-item';
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

  /* +86自杀援助中心：假接线小剧场（弹窗剥离了原页脚本，需在此重挂） */
  var HOTLINE_CALLS = [
    { id:'call-0417.html', time:'04:17', tag:'PARTIAL RECORD', lines:[
      {c:'stamp', t:'[04:17:02]'},
      {c:'caller', t:'来电者：喂……还有人吗。这么晚了。'},
      {c:'op', t:'接线员：有。我在。你慢慢说。'},
      {c:'caller', t:'来电者：我不知道要说什么。我只是不想一个人待着，又不想见任何人。'},
      {c:'op', t:'接线员：那你现在也不算一个人。这样就行。'},
      {c:'caller', t:'来电者：我今天把一整天折起来了，折得很小，想塞进抽屉。可它一直弹开。'},
      {c:'op', t:'接线员：我记下来了。今天，被你折成了很小的东西。'},
      {c:'caller', t:'来电者：我妈说我就是想太多。她说想开点就好了。'},
      {c:'op late', t:'接线员：……'},
      {c:'caller', t:'来电者：喂？你还在吗。'},
      {c:'op late', t:'接线员：（一片空白）'},
      {c:'caller', t:'来电者：刚才你说的话，我没听清。你能再说一遍吗。'},
      {c:'op late', t:'接线员：（内容已涂黑）'},
      {c:'caller', t:'来电者：算了。反正说了也不会有什么不一样。'},
      {c:'caller', t:'来电者：那种感觉你懂吗，像是站在一间没关灯的房间里，可是灯也照不到你。'},
      {c:'op late', t:'接线员：〔此处应有接线员回复 · 未能恢复〕'},
      {c:'caller', t:'来电者：……好吧。谢谢你听我说。'},
      {c:'caller', t:'来电者：虽然我也不知道你有没有在听。'},
      {c:'stamp', t:'[记录在此中断]'}
    ]},
    { id:'call-0603.html', time:'06:03', tag:'COMPLETE', lines:[
      {c:'stamp', t:'[06:03:00]'},
      {c:'caller', t:'来电者：天快亮了。我一晚上没睡，就想等到有人接。'},
      {c:'op', t:'接线员：接到了。你等到了。'},
      {c:'caller', t:'来电者：我不是想寻死。你别紧张。我只是，累。累得连难过都难过不动了。'},
      {c:'op', t:'接线员：那种累我知道。它比难过更安静。'},
      {c:'caller', t:'来电者：对。就是很安静。安静到我怀疑自己是不是还在。'},
      {c:'op', t:'接线员：你在。你的声音现在正被记录着，一个字都没漏。'},
      {c:'caller', t:'来电者：你们记录这些做什么？'},
      {c:'op', t:'接线员：留着。不修改，不评判，也不还给你。就是留着。'},
      {c:'caller', t:'来电者：留着有什么用。'},
      {c:'op', t:'接线员：没有用。命名一件东西，本来就不是为了有用。'},
      {c:'caller', t:'来电者：你这个人，怎么说话跟别的热线不一样。'},
      {c:'op', t:'接线员：因为我不打算让你好起来。我只打算，在你说的时候，别走开。'},
      {c:'caller', t:'来电者：……谢谢。这样反而轻松一点。那我先挂了，天亮了，我去睡一会儿。'},
      {c:'op', t:'接线员：去吧。你的今天已经登记完毕。'},
      {c:'stamp', t:'[06:41:55 · 通话结束]'}
    ]},
    { id:'call-0912.html', time:'09:12', tag:'AUDIO CORRUPTED', lines:[
      {c:'caller', t:'来电者：████████雨████没有通过审核██'},
      {c:'op', t:'接线员：〔无法还原〕'},
      {c:'caller', t:'来电者：████████████'},
      {c:'caller', t:'来电者：请问……你们的冰箱里，是不是██████'},
      {c:'op', t:'接线员：住着一个春天'},
      {c:'caller', t:'来电者：████████████████████'},
      {c:'stamp', t:'[09:44 · 波形转为直线]'}
    ]},
    { id:'call-2258.html', time:'22:58', tag:'PARTIAL RECORD', lines:[
      {c:'caller', t:'A：今天你也没睡吧。'},
      {c:'op', t:'B：你怎么知道。'},
      {c:'caller', t:'A：因为你接电话的声音，和我心里那个声音一模一样。'},
      {c:'op', t:'B：那到底是你打给我，还是我打给你。'},
      {c:'caller', t:'A：重要吗。反正线路两头都没人好过。'},
      {c:'op', t:'B：说说你的今天。'},
      {c:'caller', t:'A：我的今天？我以为你是来说你的。'},
      {c:'op late', t:'B：……'},
      {c:'caller', t:'A：你看，又轮到我听你的沉默了。'},
      {c:'op', t:'B：我们把彼此的悲伤记混了。现在归档里有两份，都不知道该退给谁。'},
      {c:'caller', t:'A：那就别退了。留着吧。'},
      {c:'op', t:'B：留着。反正也不还给你。'},
      {c:'stamp', t:'[记录在此中断 · 说话人无法复原]'}
    ]}
  ];

  function bindHotline(scope){
    var dial=scope.querySelector('#hlDial'); if(!dial || dial.dataset.bound) return;
    dial.dataset.bound='1';
    var screen=scope.querySelector('#hlScreen');
    var archive=scope.querySelector('#hlArchive');
    var skipBtn=scope.querySelector('#hlSkip');
    var dropForm=scope.querySelector('#hlDropForm');
    var dropInput=scope.querySelector('#hlDropInput');
    var dropMsg=scope.querySelector('#hlDropMsg');
    var busy=false, skip=false, audioCtx=null;

    function beep(freq, dur, vol){
      try{
        if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();
        var o=audioCtx.createOscillator(), g=audioCtx.createGain();
        o.type='square'; o.frequency.value=freq;
        g.gain.value=vol||0.03;
        o.connect(g); g.connect(audioCtx.destination);
        o.start(); o.stop(audioCtx.currentTime+dur);
      }catch(e){}
    }
    function visited(){
      try{ return JSON.parse(localStorage.getItem('achv_visited')||'{}'); }catch(e){ return {}; }
    }
    function renderArchive(){
      var v=visited();
      archive.innerHTML=HOTLINE_CALLS.map(function(c){
        var done=!!v[c.id];
        return '<span class="ha'+(done?' done':'')+'">'+c.time+(done?' ✓':'')+'</span>';
      }).join('');
    }
    function pickCall(){
      var v=visited();
      var fresh=HOTLINE_CALLS.filter(function(c){ return !v[c.id]; });
      var pool=fresh.length?fresh:HOTLINE_CALLS;
      return pool[Math.floor(Math.random()*pool.length)];
    }
    function typeLine(p, text, cb){
      var i=0;
      (function step(){
        if(skip){ p.textContent=text; cb(); return; }
        p.textContent=text.slice(0,i);
        if(i%3===0) beep(520+Math.random()*80, 0.02, 0.025);
        i++;
        if(i<=text.length){ setTimeout(step,26); }
        else{ cb(); }
      })();
    }
    function typeCall(call){
      screen.innerHTML='<div class="transcript" id="hlTranscript"></div>';
      var box=screen.querySelector('#hlTranscript');
      var idx=0;
      skip=false;
      skipBtn.hidden=false;
      dial.disabled=true;
      function next(){
        if(idx>=call.lines.length){
          skipBtn.hidden=true;
          dial.disabled=false;
          busy=false;
          try{
            var v=visited(); v[call.id]=1;
            localStorage.setItem('achv_visited', JSON.stringify(v));
          }catch(e){}
          if(window.Achievements) window.Achievements.visit(call.id,
            ['call-0417.html','call-0603.html','call-0912.html','call-2258.html'],
            'hotline-completionist');
          renderArchive();
          return;
        }
        var line=call.lines[idx++];
        var p=document.createElement('p');
        p.className=line.c;
        box.appendChild(p);
        typeLine(p, line.t, function(){ setTimeout(next, line.c==='stamp'?120:260); });
      }
      next();
    }

    dial.addEventListener('click',function(){
      if(busy) return;
      busy=true;
      var call=pickCall();
      screen.innerHTML='<p class="hl-idle">拨号中……</p>';
      beep(300,0.15,0.05);
      setTimeout(function(){ beep(300,0.15,0.05); },350);
      setTimeout(function(){
        screen.innerHTML='<p class="hl-idle">已接通 · '+call.time+' · '+call.tag+'</p>';
        setTimeout(function(){ typeCall(call); },500);
      },750);
    });
    skipBtn.addEventListener('click',function(){ skip=true; });

    if(dropForm){
      dropForm.addEventListener('submit',function(e){
        e.preventDefault();
        var v=(dropInput.value||'').trim();
        if(!v) return;
        try{
          var arr=JSON.parse(localStorage.getItem('user_pain_submissions')||'[]');
          arr.push(v);
          while(arr.length>50) arr.shift();
          localStorage.setItem('user_pain_submissions', JSON.stringify(arr));
        }catch(e){}
        dropInput.value='';
        if(dropMsg){
          dropMsg.textContent='已收下，正在冷藏。';
          setTimeout(function(){ dropMsg.textContent=''; },2600);
        }
      });
    }

    renderArchive();
  }

  /* 答案之书：book1/book2 来回切当假 gif + 晕开白光呼吸文字 + 点击抽签 */
  function openAnswerBook(dbody, navA){
    modal.classList.add('answerbook');
    dbody.innerHTML=
      '<button class="game-back">← 返回</button>'+
      '<div class="ab-stage">'+
        '<img class="ab-book" src="pictures/assets/book.gif" alt="" onerror="this.style.display=\'none\'">'+
        '<div class="ab-glow"><span class="ab-hint">点击寻找答案</span></div>'+
      '</div>';
    dbody.querySelector('.game-back').addEventListener('click',function(){ navA.click(); });
    var glow=dbody.querySelector('.ab-glow'), hint=dbody.querySelector('.ab-hint');
    var book=dbody.querySelector('.ab-book');
    var BOOK=window.ANSWER_BOOK||['……'];
    var last=-1, timer=null, GIFMS=1500;
    glow.style.cursor='pointer';
    glow.addEventListener('click',function(){
      if(timer) clearTimeout(timer);
      book.src='pictures/assets/book.gif?t='+Date.now();            // 重播一次
      timer=setTimeout(function(){ book.src='pictures/assets/book.png'; }, GIFMS); // 播完停末帧
      var i; do{ i=Math.floor(Math.random()*BOOK.length); }while(i===last&&BOOK.length>1); last=i;
      hint.classList.remove('pop'); void hint.offsetWidth; hint.classList.add('pop');
      hint.textContent=BOOK[i];
      if(window.Achievements) window.Achievements.bump('bookFlips', 20, 'book-worn-out');
    });
  }

  /* 今日运势抽签：摇签筒→白纸条→一天一次（本地日期锁） */
  function openFortune(dbody, navA){
    var ICONS=['ball_pen.png','eraser.png','light_bulb.png','coffee_bag.png','receipt.png',
      'batteries.png','marshmallows.png','candy_bar.png','strawberry.png','banana.png',
      'cookies.png','bubble_gum.png','rubber_duck.png','light_bulb_box.png','egg_white.png'];
    var POOL=window.FORTUNE||[];
    function today(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
    function pickIcon(){ return 'icons/Pixel_Mart/'+ICONS[Math.floor(Math.random()*ICONS.length)]; }
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
      if(window.Achievements) window.Achievements.bump('fortuneRevisit', 5, 'shrine-denied');
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

  /* 塔罗：选牌阵 → 三张牌背翻开 → 显示中文名与简析 → 再寻求一次 */
  function openTarot(dbody, navA){
    var DECK=(window.TAROT||[]);
    var SPREADS={
      ptf:{ name:"过去 · 现在 · 未来", desc:"适合探讨事情的变化", pos:["过去","现在","未来"] },
      root:{ name:"寻求事情本源", desc:"寻求事件的原因", pos:["表象","根源","关键"] }
    };
    function backHTML(){ return '<img src="pictures/Cards/card-back.png" alt="牌背">'; }

    function chooser(){
      dbody.innerHTML=
        '<button class="game-back">← 返回</button>'+
        '<p class="muted" style="text-align:center;margin:4px 0 14px">选择一个牌阵</p>'+
        '<div class="tarot-spreads">'+
          '<button class="spread-card" data-s="ptf"><div class="sp-name">过去 · 现在 · 未来阵</div><div class="sp-desc">适合探讨事情的变化</div></button>'+
          '<button class="spread-card" data-s="root"><div class="sp-name">寻求事情本源阵</div><div class="sp-desc">寻求事件的原因</div></button>'+
        '</div>';
      dbody.querySelector('.game-back').addEventListener('click',function(){ navA.click(); });
      dbody.querySelectorAll('.spread-card').forEach(function(b){
        b.addEventListener('click',function(){ table(SPREADS[b.getAttribute('data-s')]); });
      });
    }

    function table(sp){
      var picks=[], used={};
      function draw(){ var i; do{ i=Math.floor(Math.random()*DECK.length); }while(used[i]); used[i]=1; return DECK[i]; }
      dbody.innerHTML=
        '<button class="game-back">← 换牌阵</button>'+
        '<div class="tarot-title">'+sp.name+'　<span class="muted" style="font-size:12px">'+sp.desc+'</span></div>'+
        '<div class="tarot-row">'+
          sp.pos.map(function(p,idx){
            return '<div class="tcard" data-idx="'+idx+'">'+
              '<div class="tcard-inner">'+
                '<div class="tcard-face back">'+backHTML()+'</div>'+
                '<div class="tcard-face front"></div>'+
              '</div>'+
              '<div class="tpos">'+p+'</div>'+
              '<div class="tinfo"></div>'+
            '</div>';
          }).join('')+
        '</div>'+
        '<div class="tarot-again" style="display:none"><button class="again-btn">再寻求一次</button></div>';
      dbody.querySelector('.game-back').addEventListener('click',chooser);
      var revealed=0, total=sp.pos.length;
      var cards=dbody.querySelectorAll('.tcard');
      cards.forEach(function(c){
        c.addEventListener('click',function(){
          if(c.classList.contains('flipped')) return;
          var card=draw();
          c.querySelector('.front').innerHTML='<img src="pictures/Cards/'+encodeURIComponent(card.f)+'" alt="'+card.n+'" onerror="this.style.opacity=0">';
          c.classList.add('flipped');
          c.querySelector('.tinfo').innerHTML='<div class="tname">'+card.n+'</div><div class="tread">'+card.r+'</div>';
          revealed++;
          if(revealed>=total){ dbody.querySelector('.tarot-again').style.display='block'; }
        });
      });
      dbody.querySelector('.again-btn').addEventListener('click',function(){
        if(window.Achievements) window.Achievements.bump('tarotAgain', 5, 'tarot-addict');
        table(sp);
      });
    }

    chooser();
  }

  document.addEventListener('click',function(e){
    var a=e.target.closest('a'); if(!a) return;

    /* 占卜栏：弹出选择界面（三个入口，先占位） */
    if(a.id==='nav-divination'){
      e.preventDefault();
      document.getElementById('xpmtitle').textContent='占卜';
      document.getElementById('xpmico').src='icons/largeicons/MSN.png';
      var dbody=document.getElementById('xpmbody');
      dbody.innerHTML=
        '<div class="game-pick">'+
          '<div class="game-card div-card" data-div="answers"><div class="cover c1"><img src="icons/px/ball.png" alt=""></div><div class="gname">答案之书</div></div>'+
          '<div class="game-card div-card" data-div="tarot"><div class="cover c2"><img src="icons/px/moon.png" alt=""></div><div class="gname">塔罗牌</div></div>'+
          '<div class="game-card div-card" data-div="fortune"><div class="cover c3"><img src="icons/px/sweet.png" alt=""></div><div class="gname">今日运势抽签</div></div>'+
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
          if(kind==='tarot'){ openTarot(dbody, a); return; }
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
      document.getElementById('xpmico').src='icons/largeicons/Games.png';
      var body=document.getElementById('xpmbody');
      body.innerHTML=
        '<div class="game-pick">'+
          '<div class="game-card" data-game="games/minecraft/index.html">'+
            '<div class="cover"><img src="icons/largeicons/MC.png" alt=""></div>'+
            '<div class="gname">Minecraft</div>'+
          '</div>'+
        '</div>';
      modal.classList.remove('game');
      modal.classList.add('open'); mask.classList.add('open');
      modal.style.left=''; modal.style.top=''; modal.style.transform=''; modal.style.width='';
      body.querySelectorAll('.game-card').forEach(function(card){
        card.addEventListener('click',function(){
          var src=card.getAttribute('data-game');
          if(window.Achievements && /minecraft/i.test(src)) window.Achievements.unlock('block-breaker');
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
    'call-0417.html':'call-0417','call-0603.html':'call-0603','call-0912.html':'call-0912','call-2258.html':'call-2258',
    'hotline.html':'+86自杀援助中心' };
  (function(){
    var m=/[?&]open=([^&]+)/.exec(location.search); if(!m) return;
    var f=decodeURIComponent(m[1]);
    if(MODAL.indexOf(f)>=0){ setTimeout(function(){ openModal(f, TITLES[f]||f, 'icons/largeicons/file.png'); }, 300); }
  })();
})();
