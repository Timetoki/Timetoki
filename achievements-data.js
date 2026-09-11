/* 成就定义：id 唯一，name/desc 走 steam 那种自嘲怪话，icon 从 icons/ 里挑的。
   雏形先接 8 个，以后加成就：往这个数组里插一条，再去触发点调用
   Achievements.unlock / bump / visit 就行，不用碰引擎代码。 */
window.ACHIEVEMENTS = [
  { id:'shrine-denied', name:'被神社拒入',
    desc:'抽完今日签之后，还不死心地翻回签筒页 5 次。神明已经下班了。',
    icon:'icons/px/Locked.png' },
  { id:'tarot-addict', name:'还没算出喜欢的结果吗？',
    desc:'同一个牌阵连续点「再寻求一次」5 次。命运不是老虎机。',
    icon:'icons/px/moon.png' },
  { id:'book-worn-out', name:'图书馆常客',
    desc:'累计翻阅答案之书 20 次。',
    icon:'icons/px/Book.png' },
  { id:'vending-broke', name:'贩售机至尊黑卡客户',
    desc:'往贩售机投币 10 次。',
    icon:'icons/px/Coin.png' },
  { id:'archive-digger', name:'不可回收',
    desc:'请勿拾取认知污染有害垃圾。',
    icon:'icons/px/Trashbin.png' },
  { id:'hotline-completionist', name:'我得听听怎么回事',
    desc:'点开过全部 4 通来电归档。都听完了，你自己还好吗？',
    icon:'icons/px/Telephone.png' },
  { id:'dj-timetoki', name:'DJ TIMETOKI',
    desc:'手动切歌 10 次。别切了，好好听完一首完整的。',
    icon:'icons/px/CD.png' },
  { id:'block-breaker', name:'方块人格',
    desc:'点开过 Minecraft。逃避现实，但好歹换了个像素风的现实。',
    icon:'icons/largeicons/MC.png' }
];
