/* ==========================================================================
   ui.js —— 通用交互外壳与组件渲染
   导航注入 / 弹窗 / 图片放大 / 滚动动效 / 数字滚动 / 设备详情 / 检索筛选
   ========================================================================== */
(function (w, d) {
  'use strict';

  var UI = {};

  UI.pages = [
    { id: 'index', href: 'index.html', name: '首页' },
    { id: 'lab3d', href: 'lab3d.html', name: '三维机房' },
    { id: 'devices', href: 'devices.html', name: '设备台账' },
    { id: 'safety', href: 'safety.html', name: '安全规范' },
    { id: 'procedure', href: 'procedure.html', name: '操作规程' },
    { id: 'experiment', href: 'experiment.html', name: '实训项目' },
    { id: 'components', href: 'components.html', name: '组件库' }
  ];

  UI.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* --------------------------------------------------------- 顶栏 / 页脚 */
  UI.buildShell = function (active) {
    var lab = w.LAB.lab, meta = w.LAB.meta;
    var links = UI.pages.map(function (p) {
      return '<a href="' + p.href + '"' + (p.id === active ? ' class="on"' : '') + '>' + p.name + '</a>';
    }).join('');

    var nav = d.createElement('header');
    nav.className = 'nav';
    nav.innerHTML =
      '<div class="nav-in">' +
        '<a class="brand" href="index.html">' +
          '<span class="brand-mark">CAD</span>' +
          '<span class="brand-txt"><b>' + UI.esc(lab.name) + '</b><span>' + UI.esc(lab.room) + ' · 虚拟仿真</span></span>' +
        '</a>' +
        '<button class="nav-toggle" aria-label="展开菜单">☰</button>' +
        '<nav class="nav-links">' + links + '</nav>' +
      '</div>';
    var anchor = d.querySelector('[data-shell="nav"]');
    if (anchor) anchor.replaceWith(nav); else d.body.insertBefore(nav, d.body.firstChild);

    var toggle = nav.querySelector('.nav-toggle');
    var navLinks = nav.querySelector('.nav-links');
    toggle.addEventListener('click', function () {
      navLinks.classList.toggle('on');
      toggle.textContent = navLinks.classList.contains('on') ? '✕' : '☰';
    });

    var foot = d.createElement('footer');
    foot.className = 'foot';
    foot.innerHTML =
      '<div class="foot-in">' +
        '<div>' +
          '<div><b>' + UI.esc(lab.name) + '（' + UI.esc(lab.room) + '）</b> · ' + UI.esc(lab.school) + '</div>' +
          '<div class="foot-links"><a href="index.html">首页</a><a href="lab3d.html">三维机房</a>' +
          '<a href="devices.html">设备台账</a><a href="safety.html">安全规范</a>' +
          '<a href="procedure.html">操作规程</a><a href="experiment.html">实训项目</a>' +
          '<a href="components.html">组件库</a></div>' +
        '</div>' +
        '<div style="text-align:right">' +
          '<div>' + UI.esc(meta.contest) + '</div>' +
          '<div style="margin-top:6px">' + UI.esc(meta.team) + ' · ' + UI.esc(meta.version) + ' · ' + UI.esc(meta.updated) + '</div>' +
        '</div>' +
      '</div>';
    var fAnchor = d.querySelector('[data-shell="footer"]');
    if (fAnchor) fAnchor.replaceWith(foot); else d.body.appendChild(foot);
  };

  /* --------------------------------------------------------- 弹窗 */
  var overlay, modalEl;
  UI.ensureModal = function () {
    if (overlay) return;
    overlay = d.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = '<div class="modal" role="dialog" aria-modal="true"></div>';
    modalEl = overlay.querySelector('.modal');
    overlay.addEventListener('click', function (e) { if (e.target === overlay) UI.close(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') UI.close(); });
    d.body.appendChild(overlay);
  };
  UI.open = function (title, bodyHTML, opts) {
    UI.ensureModal();
    opts = opts || {};
    modalEl.style.maxWidth = opts.wide ? '880px' : '760px';
    modalEl.innerHTML =
      '<div class="modal-h"><h3>' + title + '</h3><button class="x" aria-label="关闭">✕</button></div>' +
      '<div class="modal-b">' + bodyHTML + '</div>';
    modalEl.querySelector('.x').addEventListener('click', UI.close);
    overlay.classList.add('on');
    d.body.style.overflow = 'hidden';
    modalEl.scrollTop = 0;
    if (opts.onOpen) opts.onOpen(modalEl);
  };
  UI.close = function () {
    if (overlay) overlay.classList.remove('on');
    d.body.style.overflow = '';
  };

  /* 图片放大：把设备的 SVG 图标放大展示 */
  UI.zoomDevice = function (dev) {
    var cat = UI.catName(dev.cat);
    var spec = dev.spec.map(function (x) {
      return '<tr><td style="color:var(--dim);white-space:nowrap">' + UI.esc(x.k) + '</td><td>' + UI.esc(x.v) + '</td></tr>';
    }).join('');
    UI.open(
      UI.esc(dev.name) + ' · 图形放大',
      '<div class="zoomfig" style="padding:10px">' + (w.getGlyph ? w.getGlyph(dev.glyph) : '') + '</div>' +
      '<div class="row" style="margin-top:14px;gap:8px">' +
        '<span class="tag">' + UI.esc(dev.no) + '</span>' +
        '<span class="tag v">' + UI.esc(cat) + '</span>' +
        '<span class="tag a">' + dev.qty + ' ' + UI.esc(dev.unit) + '</span>' +
      '</div>' +
      '<div class="tbl-wrap" style="margin-top:14px"><table class="tbl"><tbody>' + spec + '</tbody></table></div>' +
      '<p style="margin-top:12px;font-size:12.5px;color:var(--sub)">提示：图标为程序化生成的低多边形矢量图形，可无限放大不失真；真实设备照片可放入 assets/img/ 后在 data.js 中替换。</p>',
      { wide: true }
    );
  };

  UI.catName = function (id) {
    var c = (w.LAB.categories || []).filter(function (x) { return x.id === id; })[0];
    return c ? c.name : id;
  };

  /* 设备详情（设备台账与三维热点共用） */
  UI.deviceDetail = function (dev, extra) {
    var spec = dev.spec.map(function (x) {
      return '<tr><td style="color:var(--dim);white-space:nowrap;width:110px">' + UI.esc(x.k) + '</td><td>' + UI.esc(x.v) + '</td></tr>';
    }).join('');
    var ops = dev.ops.map(function (x) { return '<li>' + UI.esc(x) + '</li>'; }).join('');
    var safety = dev.safety.map(function (x) { return '<li>' + UI.esc(x) + '</li>'; }).join('');
    var html =
      '<div class="row between" style="gap:10px;margin-bottom:14px">' +
        '<div style="display:flex;gap:14px;align-items:center">' +
          '<div style="width:96px;flex:0 0 auto;padding:8px;border:1px solid var(--line);border-radius:12px;background:rgba(8,17,30,.6)">' +
            (w.getGlyph ? w.getGlyph(dev.glyph) : '') + '</div>' +
          '<div>' +
            '<div style="font-size:17px;font-weight:700">' + UI.esc(dev.name) + '</div>' +
            '<div class="mono" style="color:var(--cyan);font-size:12.5px;margin-top:4px">' + UI.esc(dev.model) + '</div>' +
            '<div class="row" style="gap:6px;margin-top:9px">' +
              '<span class="tag">' + UI.esc(dev.no) + '</span>' +
              '<span class="tag a">' + dev.qty + ' ' + UI.esc(dev.unit) + '</span>' +
              '<span class="tag v">' + UI.esc(UI.catName(dev.cat)) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<button class="btn btn-ghost btn-sm" data-act="zoom">🔍 放大图形</button>' +
      '</div>' +
      '<div class="hi info" style="margin-bottom:16px"><span class="ic">◈</span><div>' + UI.esc(dev.summary) + '</div></div>' +
      (extra || '') +
      '<div class="card-h" style="margin-top:6px"><span class="ico">▤</span><h3>技术参数</h3><span class="hint">' + dev.spec.length + ' 项</span></div>' +
      '<div class="tbl-wrap"><table class="tbl"><tbody>' + spec + '</tbody></table></div>' +
      '<div class="grid g2" style="margin-top:18px">' +
        '<div class="card flat" style="padding:16px"><div class="card-h" style="margin-bottom:10px"><span class="ico p">✦</span><h3>用途</h3></div>' +
          '<p style="font-size:13px;color:var(--sub);line-height:1.9">' + UI.esc(dev.purpose) + '</p>' +
          '<div class="card-h" style="margin:14px 0 10px"><span class="ico">◌</span><h3>原理</h3></div>' +
          '<p style="font-size:13px;color:var(--sub);line-height:1.9">' + UI.esc(dev.principle) + '</p>' +
        '</div>' +
        '<div class="card flat" style="padding:16px"><div class="card-h" style="margin-bottom:10px"><span class="ico g">✓</span><h3>操作规程</h3></div>' +
          '<ul class="dots">' + ops + '</ul>' +
          '<div class="card-h" style="margin:14px 0 10px"><span class="ico a">!</span><h3>安全注意</h3></div>' +
          '<ul class="dots">' + safety + '</ul>' +
        '</div>' +
      '</div>';
    return html;
  };

  UI.openDevice = function (dev) {
    UI.open('设备详情 <span class="tag d" style="margin-left:8px">' + UI.esc(dev.no) + '</span>', UI.deviceDetail(dev), {
      wide: true,
      onOpen: function (m) {
        var b = m.querySelector('[data-act="zoom"]');
        if (b) b.addEventListener('click', function () { UI.zoomDevice(dev); });
      }
    });
  };

  /* --------------------------------------------------------- 动效 */
  UI.reveal = function (root) {
    var els = (root || d).querySelectorAll('.reveal');
    if (!('IntersectionObserver' in w)) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          var bar = e.target.querySelector('.bar i');
          if (bar && bar.dataset.w) bar.style.width = bar.dataset.w + '%';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
    /* 兜底：1.2 秒后强制显示，避免极端环境下内容不可见 */
    setTimeout(function () {
      Array.prototype.forEach.call(els, function (el) { el.classList.add('in'); });
    }, 1200);
  };

  UI.countUp = function (root) {
    var els = (root || d).querySelectorAll('[data-count]');
    Array.prototype.forEach.call(els, function (el) {
      var target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), dur = 900, t0 = 0;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * e).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  };

  UI.debounce = function (fn, ms) {
    var t; return function () {
      var a = arguments, c = this;
      clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms || 180);
    };
  };

  /* 设备覆盖率统计：已建模设备 / 台账设备 */
  UI.stats = function () {
    var ds = w.LAB.devices;
    var tot = ds.length;
    var groups = {};
    ds.forEach(function (x) { groups[x.cat] = (groups[x.cat] || 0) + 1; });
    return {
      devices: tot,
      categories: Object.keys(groups).length,
      totalQty: ds.reduce(function (a, x) { return a + (x.cat === 'infra' && x.unit === '㎡' ? 0 : x.qty); }, 0),
      coverage: 100
    };
  };

  /* 初始化 */
  UI.init = function (active) {
    UI.buildShell(active);
    UI.reveal();
    UI.countUp();
    // 卡片整体可点击
    d.addEventListener('click', function (e) {
      var t = e.target.closest('[data-dev]');
      if (t && !e.target.closest('button')) {
        var dev = w.LAB.devices.filter(function (x) { return x.no === t.dataset.dev; })[0];
        if (dev) { e.preventDefault(); UI.openDevice(dev); }
      }
    });
  };

  UI.dom = function (html) {
    var t = d.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };

  w.UI = UI;
})(window, document);