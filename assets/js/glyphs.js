/* ==========================================================================
   glyphs.js —— 低多边形设备图标库（纯 SVG，无外部资源，放大不失真）
   每个图标 viewBox 0 0 120 100，统一三阶明暗 + 青色科技描边
   ========================================================================== */
(function (w) {
  'use strict';

  var P = {
    dk: '#123049',   // 暗面
    md: '#1b4a68',   // 中间面
    lt: '#2c7296',   // 亮面
    hi: '#48a3c4',   // 高光
    cy: '#22d3ee',
    am: '#fbbf24',
    gr: '#34d399',
    rd: '#f87171',
    wh: '#dbeafe'
  };

  function s(inner) {
    return '<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" role="img">' + inner + '</svg>';
  }
  /* 阴影椭圆 */
  var shadow = '<ellipse cx="60" cy="88" rx="40" ry="6" fill="#04121c" opacity=".55"/>';

  var G = {};

  /* 学生工作站：主机 + 显示器 + 键盘 */
  G.workstation = s(shadow +
    // 主机（等轴测立方体）
    '<path d="M20 46 L20 82 L38 90 L38 54 Z" fill="' + P.md + '"/>' +
    '<path d="M38 54 L38 90 L52 82 L52 46 Z" fill="' + P.dk + '"/>' +
    '<path d="M20 46 L38 54 L52 46 L34 38 Z" fill="' + P.lt + '"/>' +
    '<circle cx="28" cy="66" r="3" fill="' + P.cy + '"/><circle cx="28" cy="74" r="2" fill="' + P.hi + '" opacity=".8"/>' +
    // 显示器
    '<path d="M56 34 L56 70 L76 76 L76 40 Z" fill="' + P.md + '"/>' +
    '<path d="M76 40 L76 76 L112 68 L112 32 Z" fill="' + P.dk + '"/>' +
    '<path d="M56 34 L76 40 L112 32 L92 26 Z" fill="' + P.lt + '"/>' +
    '<path d="M60 38 L74 42 L74 66 L60 62 Z" fill="#0b2a44"/>' +
    '<path d="M78 42 L108 36 L108 60 L78 66 Z" fill="#0e3350"/>' +
    '<path d="M80 44 L106 39 M80 50 L106 45 M80 56 L98 52" stroke="' + P.cy + '" stroke-width="1.4" opacity=".65"/>' +
    // 底座与键盘
    '<path d="M74 76 L74 82 L98 78 L98 72 Z" fill="' + P.hi + '"/>' +
    '<path d="M60 84 L60 88 L96 92 L96 88 Z" fill="' + P.lt + '" opacity=".85"/>'
  );

  /* 教师机：双屏 */
  G.teacherpc = s(shadow +
    '<path d="M16 40 L16 74 L30 79 L30 45 Z" fill="' + P.md + '"/>' +
    '<path d="M30 45 L30 79 L40 74 L40 40 Z" fill="' + P.dk + '"/>' +
    '<path d="M16 40 L30 45 L40 40 L26 35 Z" fill="' + P.lt + '"/>' +
    '<path d="M46 30 L46 62 L66 68 L66 36 Z" fill="' + P.md + '"/>' +
    '<path d="M66 36 L66 68 L92 62 L92 30 Z" fill="' + P.dk + '"/>' +
    '<path d="M46 30 L66 36 L92 30 L72 24 Z" fill="' + P.lt + '"/>' +
    '<path d="M50 34 L64 38 L64 58 L50 54 Z" fill="#0e3350"/>' +
    '<path d="M68 38 L88 33 L88 53 L68 58 Z" fill="#0e3350"/>' +
    '<path d="M70 40 L86 36 M70 45 L86 41" stroke="' + P.cy + '" stroke-width="1.3" opacity=".7"/>' +
    '<path d="M98 52 L98 86 L112 90 L112 56 Z" fill="' + P.md + '"/>' +
    '<path d="M112 56 L112 90 L118 87 L118 53 Z" fill="' + P.dk + '"/>' +
    '<circle cx="105" cy="66" r="2.5" fill="' + P.am + '"/>'
  );

  /* 显示器 */
  G.monitor = s(shadow +
    '<path d="M28 26 L28 70 L62 78 L62 34 Z" fill="' + P.md + '"/>' +
    '<path d="M62 34 L62 78 L94 70 L94 26 Z" fill="' + P.dk + '"/>' +
    '<path d="M28 26 L62 34 L94 26 L60 18 Z" fill="' + P.lt + '"/>' +
    '<path d="M33 31 L59 37 L59 71 L33 65 Z" fill="#0b2a44"/>' +
    '<path d="M65 37 L89 31 L89 65 L65 71 Z" fill="#0e3350"/>' +
    '<path d="M67 39 L87 34 M67 45 L87 40 M67 51 L80 47" stroke="' + P.cy + '" stroke-width="1.5" opacity=".6"/>' +
    '<path d="M52 78 L52 84 L70 88 L70 82 Z" fill="' + P.hi + '"/>' +
    '<path d="M42 88 L42 90 L80 96 L80 94 Z" fill="' + P.md + '"/>'
  );

  /* 投影机（吊装） */
  G.projector = s(
    '<path d="M56 4 L56 12 L64 12 L64 4 Z" fill="' + P.dk + '"/>' +
    '<path d="M30 30 L30 52 L52 60 L52 38 Z" fill="' + P.md + '"/>' +
    '<path d="M52 38 L52 60 L88 52 L88 30 Z" fill="' + P.dk + '"/>' +
    '<path d="M30 30 L52 38 L88 30 L66 22 Z" fill="' + P.lt + '"/>' +
    '<circle cx="80" cy="48" r="6" fill="#0b2a44" stroke="' + P.hi + '" stroke-width="1.4"/>' +
    '<circle cx="80" cy="48" r="2.4" fill="' + P.cy + '"/>' +
    '<path d="M34 40 L46 44 M34 46 L46 50" stroke="' + P.hi + '" stroke-width="1.2" opacity=".7"/>' +
    // 光束
    '<path d="M86 52 L118 74 L118 96 L60 96 Z" fill="' + P.cy + '" opacity=".13"/>' +
    '<path d="M86 52 L112 70 L112 92 L64 92 Z" fill="' + P.cy + '" opacity=".08"/>'
  );

  /* 幕布 */
  G.screen = s(shadow +
    '<path d="M18 12 L18 18 L102 18 L102 12 Z" fill="' + P.lt + '"/>' +
    '<path d="M18 18 L18 62 L102 62 L102 18 Z" fill="' + P.md + '"/>' +
    '<path d="M22 22 L22 58 L98 58 L98 22 Z" fill="#0f3a58"/>' +
    '<path d="M28 30 L64 30 M28 38 L80 38 M28 46 L56 46" stroke="' + P.cy + '" stroke-width="2" opacity=".55"/>' +
    '<path d="M18 62 L18 68 L102 68 L102 62 Z" fill="' + P.dk + '"/>' +
    '<circle cx="60" cy="72" r="3" fill="' + P.hi + '"/>'
  );

  /* 交互式平板/白板 */
  G.board = s(shadow +
    '<path d="M14 16 L14 72 L20 74 L20 18 Z" fill="' + P.dk + '"/>' +
    '<path d="M14 16 L20 18 L108 18 L102 16 Z" fill="' + P.lt + '"/>' +
    '<path d="M20 18 L20 74 L104 74 L104 18 Z" fill="' + P.md + '"/>' +
    '<path d="M25 23 L25 69 L99 69 L99 23 Z" fill="#0d3350"/>' +
    '<path d="M32 34 L70 34 M32 44 L88 44 M32 54 L58 54" stroke="' + P.cy + '" stroke-width="2" opacity=".6"/>' +
    '<path d="M58 74 L58 82 L66 84 L66 76 Z" fill="' + P.dk + '"/>' +
    '<path d="M40 84 L40 86 L84 86 L84 84 Z" fill="' + P.md + '"/>' +
    '<circle cx="94" cy="30" r="2.4" fill="' + P.gr + '"/>'
  );

  /* 交换机 */
  G.switch = s(
    '<path d="M18 42 L18 56 L58 68 L58 54 Z" fill="' + P.md + '"/>' +
    '<path d="M58 54 L58 68 L102 56 L102 42 Z" fill="' + P.dk + '"/>' +
    '<path d="M18 42 L58 54 L102 42 L62 30 Z" fill="' + P.lt + '"/>' +
    '<path d="M24 46 L54 55 L54 60 L24 51 Z" fill="#0b2a44"/>' +
    '<path d="M62 55 L98 45 L98 50 L62 60 Z" fill="#0b2a44"/>' +
    '<circle cx="30" cy="56" r="1.6" fill="' + P.gr + '"/><circle cx="38" cy="58" r="1.6" fill="' + P.gr + '"/>' +
    '<circle cx="46" cy="60" r="1.6" fill="' + P.am + '"/><circle cx="70" cy="52" r="1.6" fill="' + P.cy + '"/>' +
    '<path d="M84 40 L84 24 M84 24 L92 28" stroke="' + P.hi + '" stroke-width="2" fill="none"/>' +
    '<path d="M84 24 L76 28" stroke="' + P.hi + '" stroke-width="2" fill="none"/>'
  );

  /* 机柜 */
  G.rack = s(shadow +
    '<path d="M34 10 L34 82 L46 88 L46 16 Z" fill="' + P.lt + '"/>' +
    '<path d="M46 16 L46 88 L80 82 L80 10 Z" fill="' + P.md + '"/>' +
    '<path d="M80 10 L80 82 L92 78 L92 6 Z" fill="' + P.dk + '"/>' +
    '<path d="M50 18 L50 24 L76 22 L76 16 Z" fill="#0b2a44"/>' +
    '<path d="M50 28 L50 34 L76 32 L76 26 Z" fill="#0b2a44"/>' +
    '<path d="M50 38 L50 44 L76 42 L76 36 Z" fill="#0b2a44"/>' +
    '<path d="M50 48 L50 54 L76 52 L76 46 Z" fill="#0b2a44"/>' +
    '<circle cx="70" cy="20" r="1.5" fill="' + P.gr + '"/><circle cx="70" cy="30" r="1.5" fill="' + P.cy + '"/>' +
    '<circle cx="70" cy="40" r="1.5" fill="' + P.am + '"/>' +
    '<path d="M54 58 L54 74 L72 71 L72 55 Z" fill="#0e3350"/>'
  );

  /* 桥架/布线 */
  G.cabling = s(
    '<path d="M8 56 L8 70 L112 70 L112 56 Z" fill="' + P.dk + '"/>' +
    '<path d="M8 56 L30 44 L112 44 L90 56 Z" fill="' + P.lt + '"/>' +
    '<path d="M30 44 L30 58 L8 70 L8 56 Z" fill="' + P.md + '"/>' +
    '<path d="M8 56 L112 56 L112 70 L8 70 Z" fill="none" stroke="' + P.hi + '" stroke-width="1"/>' +
    '<path d="M14 60 L14 68 M30 60 L30 68 M46 60 L46 68 M62 60 L62 68 M78 60 L78 68 M94 60 L94 68" stroke="' + P.hi + '" stroke-width="1.2" opacity=".55"/>' +
    '<path d="M10 48 L106 48" stroke="' + P.cy + '" stroke-width="2" stroke-dasharray="6 6" opacity=".8"/>' +
    '<circle cx="96" cy="52" r="2.4" fill="' + P.gr + '"/>'
  );

  /* 绘图仪 */
  G.plotter = s(shadow +
    '<path d="M10 40 L10 66 L16 70 L16 44 Z" fill="' + P.dk + '"/>' +
    '<path d="M16 44 L16 70 L96 70 L96 44 Z" fill="' + P.md + '"/>' +
    '<path d="M10 40 L16 44 L96 44 L90 40 Z" fill="' + P.lt + '"/>' +
    '<path d="M16 44 L16 48 L96 48 L96 44 Z" fill="#0b2a44"/>' +
    '<path d="M22 52 L22 62 L90 62 L90 52 Z" fill="#0e3350"/>' +
    '<path d="M26 56 L86 56" stroke="' + P.cy + '" stroke-width="1.6" stroke-dasharray="4 4" opacity=".8"/>' +
    // 出图
    '<path d="M30 70 L30 86 L86 86 L86 70 Z" fill="' + P.wh + '" opacity=".9"/>' +
    '<path d="M36 76 L74 76 M36 81 L64 81" stroke="' + P.lt + '" stroke-width="1.2"/>' +
    '<circle cx="88" cy="52" r="2" fill="' + P.gr + '"/>'
  );

  /* 扫描仪 */
  G.scanner = s(shadow +
    '<path d="M18 54 L18 70 L102 70 L102 54 Z" fill="' + P.md + '"/>' +
    '<path d="M18 54 L30 44 L114 44 L102 54 Z" fill="' + P.lt + '"/>' +
    '<path d="M18 54 L102 54 L102 70 L18 70 Z" fill="none" stroke="' + P.hi + '" stroke-width="1"/>' +
    '<path d="M26 62 L94 62" stroke="' + P.cy + '" stroke-width="2" opacity=".8"/>' +
    '<path d="M34 48 L70 48 L60 40 L28 40 Z" fill="' + P.wh + '" opacity=".85"/>' +
    '<path d="M40 44 L58 44" stroke="' + P.md + '" stroke-width="1.2"/>' +
    '<circle cx="96" cy="64" r="2" fill="' + P.gr + '"/>'
  );

  /* 打印机 */
  G.printer = s(shadow +
    '<path d="M22 44 L22 74 L34 80 L34 50 Z" fill="' + P.dk + '"/>' +
    '<path d="M34 50 L34 80 L98 80 L98 50 Z" fill="' + P.md + '"/>' +
    '<path d="M22 44 L34 50 L98 50 L86 44 Z" fill="' + P.lt + '"/>' +
    '<path d="M34 32 L34 50 L98 50 L98 32 Z" fill="#123a55"/>' +
    '<path d="M40 36 L40 46 L92 46 L92 36 Z" fill="' + P.wh + '" opacity=".9"/>' +
    '<path d="M44 60 L92 60" stroke="' + P.cy + '" stroke-width="2" opacity=".7"/>' +
    '<path d="M40 80 L40 88 L88 88 L88 80 Z" fill="' + P.wh + '" opacity=".85"/>' +
    '<circle cx="90" cy="56" r="2" fill="' + P.am + '"/>'
  );

  /* 精密空调 */
  G.ac = s(shadow +
    '<path d="M24 18 L24 78 L40 84 L40 24 Z" fill="' + P.lt + '"/>' +
    '<path d="M40 24 L40 84 L84 84 L84 24 Z" fill="' + P.md + '"/>' +
    '<path d="M84 24 L84 84 L94 78 L94 18 Z" fill="' + P.dk + '"/>' +
    '<path d="M40 18 L84 18 L94 18 L94 24 L40 24 Z" fill="' + P.hi + '"/>' +
    '<path d="M46 32 L46 76 L78 76 L78 32 Z" fill="#0b2a44"/>' +
    '<path d="M50 40 L74 40 M50 48 L74 48 M50 56 L74 56 M50 64 L66 64" stroke="' + P.cy + '" stroke-width="2" opacity=".55"/>' +
    '<circle cx="49" cy="24" r="2" fill="' + P.gr + '"/>' +
    // 冷风
    '<path d="M100 34 q10 6 0 12 q-10 6 0 12" stroke="' + P.cy + '" stroke-width="2" fill="none" opacity=".7"/>' +
    '<path d="M110 30 q8 10 0 20" stroke="' + P.cy + '" stroke-width="1.6" fill="none" opacity=".45"/>'
  );

  /* UPS */
  G.ups = s(shadow +
    '<path d="M32 26 L32 80 L46 86 L46 32 Z" fill="' + P.lt + '"/>' +
    '<path d="M46 32 L46 86 L74 86 L74 32 Z" fill="' + P.md + '"/>' +
    '<path d="M74 32 L74 86 L88 80 L88 26 Z" fill="' + P.dk + '"/>' +
    '<path d="M46 26 L74 26 L88 26 L74 32 L46 32 Z" fill="' + P.hi + '"/>' +
    '<path d="M52 42 L68 42 L68 66 L52 66 Z" fill="#0b2a44"/>' +
    '<path d="M60 46 L55 57 L59 57 L57 63 L65 51 L61 51 Z" fill="' + P.am + '"/>' +
    '<circle cx="54" cy="74" r="2" fill="' + P.gr + '"/><circle cx="62" cy="76" r="2" fill="' + P.cy + '"/>'
  );

  /* 防静电地板 */
  G.floor = s(
    '<path d="M60 22 L112 46 L60 70 L8 46 Z" fill="' + P.md + '"/>' +
    '<path d="M8 46 L60 70 L60 80 L8 56 Z" fill="' + P.dk + '"/>' +
    '<path d="M60 70 L112 46 L112 56 L60 80 Z" fill="#0d2b42"/>' +
    '<path d="M38 34 L86 56 M60 22 L60 70 M8 46 L112 46" stroke="' + P.hi + '" stroke-width="1.1" opacity=".5"/>' +
    '<path d="M30 50 L54 61 M46 58 L70 47" stroke="' + P.cy + '" stroke-width="1.4" opacity=".65"/>' +
    '<circle cx="60" cy="40" r="2.2" fill="' + P.cy + '"/>' +
    '<path d="M60 46 L120 96" stroke="none"/>'
  );

  /* 配电箱 */
  G.panel = s(shadow +
    '<path d="M34 20 L34 74 L44 78 L44 24 Z" fill="' + P.lt + '"/>' +
    '<path d="M44 24 L44 78 L86 78 L86 24 Z" fill="' + P.md + '"/>' +
    '<path d="M86 24 L86 78 L94 74 L94 20 Z" fill="' + P.dk + '"/>' +
    '<path d="M44 20 L86 20 L94 20 L94 24 L44 24 Z" fill="' + P.hi + '"/>' +
    '<path d="M50 30 L50 72 L80 72 L80 30 Z" fill="#0b2a44"/>' +
    '<path d="M55 36 L62 36 M66 36 L73 36 M55 46 L62 46 M66 46 L73 46" stroke="' + P.am + '" stroke-width="3"/>' +
    '<circle cx="78" cy="62" r="3" fill="' + P.rd + '"/>' +
    '<path d="M55 60 L72 60" stroke="' + P.hi + '" stroke-width="1.6"/>'
  );

  /* 中控讲台 */
  G.desk = s(shadow +
    '<path d="M20 46 L20 82 L34 88 L34 52 Z" fill="' + P.lt + '"/>' +
    '<path d="M34 52 L34 88 L96 88 L96 52 Z" fill="' + P.md + '"/>' +
    '<path d="M20 46 L34 52 L96 52 L82 46 Z" fill="' + P.hi + '"/>' +
    '<path d="M26 40 L26 48 L88 48 L88 40 Z" fill="' + P.dk + '"/>' +
    '<path d="M40 60 L40 84 L58 84 L58 60 Z" fill="#0b2a44"/>' +
    '<path d="M64 60 L64 84 L90 84 L90 60 Z" fill="#0e3350"/>' +
    '<path d="M68 66 L86 66 M68 72 L80 72" stroke="' + P.cy + '" stroke-width="1.4" opacity=".7"/>' +
    '<circle cx="44" cy="56" r="2" fill="' + P.gr + '"/>' +
    '<path d="M58 40 L58 30 L66 30 L66 40" fill="' + P.lt + '" stroke="' + P.hi + '" stroke-width="1"/>'
  );

  /* 吸顶音箱 */
  G.speaker = s(
    '<circle cx="60" cy="46" r="30" fill="' + P.dk + '"/>' +
    '<circle cx="60" cy="46" r="24" fill="' + P.md + '"/>' +
    '<circle cx="60" cy="46" r="16" fill="#0b2a44"/>' +
    '<circle cx="60" cy="46" r="7" fill="' + P.lt + '"/>' +
    '<circle cx="60" cy="46" r="3" fill="' + P.hi + '"/>' +
    '<path d="M60 10 L60 4 M60 82 L60 88 M24 46 L18 46 M96 46 L102 46" stroke="' + P.cy + '" stroke-width="2" opacity=".6"/>' +
    '<path d="M20 78 q40 22 80 0" stroke="' + P.cy + '" stroke-width="1.6" fill="none" opacity=".45"/>' +
    '<path d="M26 86 q34 16 68 0" stroke="' + P.cy + '" stroke-width="1.2" fill="none" opacity=".3"/>'
  );

  /* 灭火器 */
  G.extinguisher = s(shadow +
    '<path d="M46 32 L46 78 q0 8 8 8 l12 0 q8 0 8-8 l0-46 Z" fill="' + P.md + '"/>' +
    '<path d="M46 32 L46 78 q0 8 8 8 l4 0 l0-54 Z" fill="' + P.dk + '"/>' +
    '<path d="M54 20 L54 32 L70 32 L70 20 Z" fill="' + P.lt + '"/>' +
    '<path d="M62 20 L62 8 L74 8 L74 12 L66 12 L66 20 Z" fill="' + P.hi + '"/>' +
    '<path d="M48 44 L70 44 L70 52 L48 52 Z" fill="' + P.wh + '" opacity=".9"/>' +
    '<text x="59" y="50" font-size="6" fill="#0b2a44" text-anchor="middle" font-family="sans-serif">CO₂</text>' +
    '<path d="M44 26 L80 26" stroke="' + P.hi + '" stroke-width="2.4"/>' +
    '<circle cx="74" cy="14" r="2" fill="' + P.rd + '"/>'
  );

  /* 安全出口 / 应急照明 */
  G.exit = s(
    '<path d="M20 34 L20 74 L60 74 L60 34 Z" fill="' + P.gr + '"/>' +
    '<path d="M20 34 L20 74 L60 74 L60 34 Z" fill="none" stroke="' + P.wh + '" stroke-width="1.4" opacity=".5"/>' +
    '<path d="M26 42 L54 42 L54 66 L26 66 Z" fill="#05301f" opacity=".35"/>' +
    '<path d="M34 52 L48 52 M43 45 L50 52 L43 59" stroke="' + P.wh + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M66 30 L66 60 L78 64 L78 34 Z" fill="' + P.lt + '"/>' +
    '<path d="M78 34 L78 64 L90 60 L90 30 Z" fill="' + P.dk + '"/>' +
    '<path d="M66 30 L78 34 L90 30 L78 26 Z" fill="' + P.hi + '"/>' +
    '<circle cx="84" cy="50" r="4" fill="' + P.wh + '" opacity=".9"/>' +
    '<path d="M92 74 L118 88 L118 96 L92 82 Z" fill="' + P.wh + '" opacity=".12"/>'
  );

  /* 通用兜底：设备箱 */
  G.box = s(shadow +
    '<path d="M30 40 L30 74 L60 86 L60 52 Z" fill="' + P.md + '"/>' +
    '<path d="M60 52 L60 86 L90 74 L90 40 Z" fill="' + P.dk + '"/>' +
    '<path d="M30 40 L60 52 L90 40 L60 28 Z" fill="' + P.lt + '"/>' +
    '<path d="M48 44 L72 44 M48 52 L64 52" stroke="' + P.cy + '" stroke-width="1.4" opacity=".6"/>'
  );

  w.GLYPH = G;
  w.getGlyph = function (id) { return G[id] || G.box; };
})(window);