/* ==========================================================================
   anim.js —— 设备动画演示（纯 CSS/SVG，无需视频与外部资源）
   每个演示都对应设备真实工作过程，可离线播放
   ========================================================================== */
(function (w) {
  'use strict';

  var CSS = [
    '.demo{border:1px solid var(--line);border-radius:14px;background:radial-gradient(circle at 50% 0%,rgba(34,211,238,.10),transparent 62%),rgba(6,14,25,.75);padding:14px 14px 10px;margin-bottom:16px}',
    '.demo svg{width:100%;height:auto;display:block}',
    '.demo .cap{font-size:11.5px;color:var(--dim);text-align:center;margin-top:8px;line-height:1.8}',
    '.demo .cap b{color:var(--cyan);font-weight:600}',
    '@keyframes dmBeam{0%,100%{opacity:.25}50%{opacity:.7}}',
    '@keyframes dmFade{0%,20%{opacity:0}30%,90%{opacity:1}100%{opacity:0}}',
    '@keyframes dmDash{to{stroke-dashoffset:-40}}',
    '@keyframes dmDraw{from{stroke-dashoffset:var(--len,220)}to{stroke-dashoffset:0}}',
    '@keyframes dmPaper{0%{transform:translateY(0)}100%{transform:translateY(26px)}}',
    '@keyframes dmScroll{0%{transform:translateX(-26px)}100%{transform:translateX(26px)}}',
    '@keyframes dmBlink{0%,100%{opacity:1}50%{opacity:.15}}',
    '@keyframes dmFlow{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-48}}',
    '@keyframes dmScan{0%{transform:translateY(0)}100%{transform:translateY(34px)}}',
    '@keyframes dmRot{to{transform:rotate(360deg)}}',
    '.dm-beam{animation:dmBeam 2.4s ease-in-out infinite}',
    '.dm-dash{stroke-dasharray:8 8;animation:dmDash 1.1s linear infinite}',
    '.dm-draw{stroke-dasharray:var(--len,220);animation:dmDraw 3.2s ease-in-out infinite}',
    '.dm-fade{animation:dmFade 3.2s ease-in-out infinite}',
    '.dm-paper{animation:dmPaper 2.6s ease-in-out infinite alternate}',
    '.dm-blink{animation:dmBlink 1.1s ease-in-out infinite}',
    '.dm-flow{stroke-dasharray:10 14;animation:dmFlow 1s linear infinite}',
    '.dm-scan{animation:dmScan 1.8s ease-in-out infinite alternate}',
    '.dm-rot{transform-origin:center;animation:dmRot 3s linear infinite}'
  ].join('\n');

  function style() {
    if (document.getElementById('demo-style')) return;
    var st = document.createElement('style');
    st.id = 'demo-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function wrap(svg, cap) {
    style();
    return '<div class="demo">' + svg + '<div class="cap">' + cap + '</div></div>';
  }

  var V = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120"';
  var C = { line: '#2c7296', cy: '#22d3ee', tx: '#8ea6c6', am: '#fbbf24', gr: '#34d399', rd: '#f87171', dk: '#16324e' };

  var D = {};

  /* 投影机：光束 + 幕布成像 */
  D.projector = function () {
    return wrap(
      '<svg ' + V + '>' +
      '<rect x="18" y="34" width="52" height="26" rx="5" fill="' + C.dk + '" stroke="' + C.line + '"/>' +
      '<circle cx="66" cy="47" r="5" fill="#0b2a44" stroke="' + C.cy + '"/>' +
      '<polygon class="dm-beam" points="70,44 236,10 236,92 70,52" fill="' + C.cy + '" opacity=".22"/>' +
      '<rect x="232" y="14" width="58" height="76" rx="4" fill="#0e3350" stroke="' + C.cy + '" stroke-width="1.2"/>' +
      '<g class="dm-fade">' +
        '<path d="M240 28 h40 M240 40 h30 M240 52 h36 M240 64 h24 M240 76 h34" stroke="' + C.cy + '" stroke-width="2" opacity=".75"/>' +
      '</g>' +
      '<text x="44" y="80" font-size="9" fill="' + C.tx + '" text-anchor="middle" font-family="sans-serif">激光光源</text>' +
      '<text x="261" y="104" font-size="9" fill="' + C.tx + '" text-anchor="middle" font-family="sans-serif">投影幕</text>' +
      '</svg>',
      '激光光源经 3LCD 光阀调制后投射到幕布：<b>开机即亮、无需预热</b>，连续 4 节课亮度衰减轻微。'
    );
  };

  /* 交换机：数据流 */
  D.rack = function () {
    return wrap(
      '<svg ' + V + '>' +
      '<rect x="20" y="20" width="60" height="70" rx="5" fill="#123049" stroke="' + C.line + '"/>' +
      '<rect x="26" y="28" width="48" height="10" rx="2" fill="#0b2a44" stroke="' + C.cy + '" stroke-width=".8"/>' +
      '<rect x="26" y="44" width="48" height="10" rx="2" fill="#0b2a44" stroke="' + C.cy + '" stroke-width=".8"/>' +
      '<circle class="dm-blink" cx="68" cy="33" r="2" fill="' + C.gr + '"/>' +
      '<circle class="dm-blink" cx="68" cy="49" r="2" fill="' + C.am + '"/>' +
      '<text x="50" y="104" font-size="9" fill="' + C.tx + '" text-anchor="middle" font-family="sans-serif">交换机</text>' +
      '<path class="dm-flow" d="M80 40 H180" stroke="' + C.cy + '" stroke-width="2" fill="none"/>' +
      '<path class="dm-flow" d="M180 60 H80" stroke="' + C.gr + '" stroke-width="2" fill="none"/>' +
      '<path class="dm-flow" d="M180 80 H96" stroke="' + C.am + '" stroke-width="2" fill="none"/>' +
      '<rect x="186" y="26" width="86" height="70" rx="5" fill="#0e3350" stroke="' + C.line + '"/>' +
      '<text x="229" y="56" font-size="9.5" fill="' + C.cy + '" text-anchor="middle" font-family="sans-serif">教学终端 40 台</text>' +
      '<text x="229" y="72" font-size="9" fill="' + C.tx + '" text-anchor="middle" font-family="sans-serif">VLAN 隔离 · 千兆接入</text>' +
      '</svg>',
      '端口按 VLAN 隔离广播域，<b>万兆上联</b>汇聚交换机：40 台终端同时提交作业也不拥塞。'
    );
  };

  /* 绘图仪：出图 */
  D.plotter = function () {
    return wrap(
      '<svg ' + V + '>' +
      '<rect x="60" y="26" width="180" height="34" rx="6" fill="#dfe5ea" stroke="' + C.line + '"/>' +
      '<rect x="60" y="26" width="180" height="10" rx="4" fill="#394654"/>' +
      '<circle class="dm-blink" cx="70" cy="46" r="2.4" fill="' + C.gr + '"/>' +
      '<g class="dm-paper">' +
        '<rect x="76" y="58" width="148" height="34" fill="#fbfdff" opacity=".95"/>' +
        '<g class="dm-draw" style="--len:260">' +
          '<path d="M86 70 h60 M86 78 h96 M86 86 h40" stroke="#1b4a68" stroke-width="1.6" fill="none"/>' +
        '</g>' +
      '</g>' +
      '<text x="150" y="112" font-size="9" fill="' + C.tx + '" text-anchor="middle" font-family="sans-serif">A0 卷筒连续出图 · 线稿约 26 秒/张</text>' +
      '</svg>',
      '按 CTB 打印样式把<b>图层颜色映射为线宽</b>，出图前务必先「打印预览」核对图幅与比例。'
    );
  };

  /* UPS：市电中断切换 */
  D.ups = function () {
    return wrap(
      '<svg ' + V + '>' +
      '<rect x="34" y="24" width="70" height="72" rx="6" fill="#1b4a68" stroke="' + C.cy + '" stroke-width="1.2"/>' +
      '<path d="M69 40 L56 66 L68 66 L62 82 L82 54 L69 54 Z" fill="' + C.am + '"/>' +
      '<text x="69" y="108" font-size="9" fill="' + C.tx + '" text-anchor="middle" font-family="sans-serif">在线式 UPS 6kVA</text>' +
      '<path d="M104 44 H186" stroke="' + C.gr + '" stroke-width="2.4" fill="none"/>' +
      '<text x="145" y="36" font-size="9" fill="' + C.gr + '" text-anchor="middle" font-family="sans-serif">市电正常（0ms 双变换）</text>' +
      '<path class="dm-fade" d="M104 74 H186" stroke="' + C.rd + '" stroke-width="2.4" fill="none"/>' +
      '<text class="dm-fade" x="145" y="92" font-size="9" fill="' + C.rd + '" text-anchor="middle" font-family="sans-serif">市电中断 → 电池接管</text>' +
      '<rect x="192" y="34" width="78" height="52" rx="5" fill="#0e3350" stroke="' + C.line + '"/>' +
      '<text x="231" y="56" font-size="9" fill="' + C.cy + '" text-anchor="middle" font-family="sans-serif">交换机</text>' +
      '<text x="231" y="72" font-size="9" fill="' + C.cy + '" text-anchor="middle" font-family="sans-serif">教师机 · 服务器</text>' +
      '</svg>',
      '市电异常时电池直接接管直流母线，<b>切换时间 0ms</b>，为关键设备留出安全关机时间。'
    );
  };

  /* 空调：气流 */
  D.ac = function () {
    return wrap(
      '<svg ' + V + '>' +
      '<rect x="18" y="16" width="42" height="88" rx="5" fill="#f1f4f7" stroke="' + C.line + '"/>' +
      '<rect x="24" y="22" width="30" height="70" rx="3" fill="#dfe6ee"/>' +
      '<circle class="dm-blink" cx="30" cy="90" r="2.4" fill="' + C.cy + '"/>' +
      '<g class="dm-beam">' +
        '<path d="M66 34 q40 8 80 0" stroke="' + C.cy + '" stroke-width="2" fill="none"/>' +
        '<path d="M66 54 q46 10 92 0" stroke="' + C.cy + '" stroke-width="2" fill="none" opacity=".8"/>' +
        '<path d="M66 74 q52 12 104 0" stroke="' + C.cy + '" stroke-width="2" fill="none" opacity=".6"/>' +
      '</g>' +
      '<text x="150" y="30" font-size="9.5" fill="' + C.cy + '" text-anchor="middle" font-family="sans-serif">18—26℃ 恒温</text>' +
      '<text x="150" y="44" font-size="9" fill="' + C.tx + '" text-anchor="middle" font-family="sans-serif">±1℃ / ±5%RH</text>' +
      '<text x="150" y="100" font-size="9" fill="' + C.tx + '" text-anchor="middle" font-family="sans-serif">大风量小焓差送风，避免结露</text>' +
      '</svg>',
      '带走 40 台工作站的显热负荷；<b>设定温度不得低于 22℃</b>，否则地面与设备易结露。'
    );
  };

  /* 工作站：CAD 绘图过程 */
  D.pc = function () {
    return wrap(
      '<svg ' + V + '>' +
      '<rect x="30" y="14" width="240" height="86" rx="6" fill="#0e3350" stroke="' + C.cy + '" stroke-width="1.2"/>' +
      '<rect x="40" y="22" width="220" height="70" fill="#071a2b"/>' +
      '<g stroke="' + C.line + '" stroke-width=".5" opacity=".5">' +
        '<path d="M60 22 V92 M90 22 V92 M120 22 V92 M150 22 V92 M180 22 V92 M210 22 V92 M240 22 V92"/>' +
        '<path d="M40 40 H260 M40 58 H260 M40 76 H260"/>' +
      '</g>' +
      '<path class="dm-draw" style="--len:300" d="M70 78 L70 46 L130 46 L130 60 L190 60 L190 34 L240 34" stroke="' + C.cy + '" stroke-width="2" fill="none"/>' +
      '<circle class="dm-fade" cx="190" cy="34" r="7" fill="none" stroke="' + C.am + '" stroke-width="1.8"/>' +
      '<path class="dm-blink" d="M60 86 h14" stroke="' + C.gr + '" stroke-width="2"/>' +
      '<text x="150" y="114" font-size="9" fill="' + C.tx + '" text-anchor="middle" font-family="sans-serif">捕捉栅格与对象捕捉，把鼠标移动量化为精确坐标</text>' +
      '</svg>',
      '图形靠<b>坐标定位</b>而非目测：捕捉到端点、圆心、交点的点才有精确的几何意义。'
    );
  };

  /* 显示器 / 幕布：刷新与判读 */
  D.screen = function () {
    return wrap(
      '<svg ' + V + '>' +
      '<rect x="56" y="14" width="188" height="88" rx="6" fill="#0e3350" stroke="' + C.cy + '" stroke-width="1.2"/>' +
      '<clipPath id="dmClip"><rect x="64" y="22" width="172" height="72"/></clipPath>' +
      '<g clip-path="url(#dmClip)">' +
        '<rect x="64" y="22" width="172" height="72" fill="#071a2b"/>' +
        '<g class="dm-scan"><rect x="64" y="18" width="172" height="3" fill="' + C.cy + '" opacity=".45"/></g>' +
        '<path d="M78 60 h40 v-14 h44 v22 h52" stroke="' + C.cy + '" stroke-width="2" fill="none"/>' +
      '</g>' +
      '<text x="150" y="114" font-size="9" fill="' + C.tx + '" text-anchor="middle" font-family="sans-serif">2K 分辨率 · 99% sRGB · 色彩判读一致</text>' +
      '</svg>',
      '工程图判读依赖<b>线宽与颜色</b>的稳定还原：色域一致，打印出来的线宽才与屏幕上一致。'
    );
  };

  D.printer = D.screen;
  D.floor = function () {
    return wrap(
      '<svg ' + V + '>' +
      '<rect x="30" y="70" width="240" height="16" rx="3" fill="#2c7296" opacity=".55"/>' +
      '<g stroke="' + C.cy + '" stroke-width="1.2" opacity=".8">' +
        '<path d="M70 70 V86 M110 70 V86 M150 70 V86 M190 70 V86 M230 70 V86"/>' +
      '</g>' +
      '<g class="dm-fade">' +
        '<path d="M150 76 V34" stroke="' + C.am + '" stroke-width="2" stroke-dasharray="4 5"/>' +
      '</g>' +
      '<circle cx="150" cy="30" r="5" fill="' + C.am + '" opacity=".9"/>' +
      '<text x="150" y="20" font-size="9" fill="' + C.am + '" text-anchor="middle" font-family="sans-serif">人体静电 1000V+</text>' +
      '<text x="150" y="110" font-size="9" fill="' + C.tx + '" text-anchor="middle" font-family="sans-serif">经导电贴面与接地网泄放入地（&lt;100V）</text>' +
      '</svg>',
      '系统电阻 10⁶—10⁹Ω 的地板把人体静电泄放入地，<b>上机前请触摸静电释放器</b>。'
    );
  };

  w.DEMO = D;
  w.getDemo = function (key, dev) {
    var fn = D[key] || D.pc;
    return fn(dev);
  };
})(window);