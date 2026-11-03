/* ==========================================================================
   cad.js —— 内置迷你 CAD 绘图板（Canvas 2D）
   · 命令：LINE / RECTANG / CIRCLE / DIM / ERASE
   · 精确输入：栅格捕捉 + 对象捕捉（端点、圆心、交点近似）+ 正交
   · 目标图形参数化生成，可显示参考图并自动评分
   ========================================================================== */
(function (w) {
  'use strict';

  var DEFAULTS = {
    grid: 10,          // 主栅格 mm
    snapGrid: 1,       // 栅格捕捉步长 mm
    snapPx: 11,        // 对象捕捉像素容差
    mmPerPxMin: 0.05
  };

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function CADPad(container, opts) {
    opts = opts || {};
    var self = this;
    this.opts = Object.assign({}, DEFAULTS, opts);
    this.ents = [];
    this.undoStack = [];
    this.tool = 'line';
    this.ortho = true;
    this.snapOn = true;
    this.ghostOn = true;
    this.t = { W: 120, H: 80, d: 10, D: 30, dx: 20, dy: 20 };
    this.pending = null;
    this.preview = null;
    this.snapPoint = null;
    this.mouse = { x: 0, y: -0 };

    /* DOM */
    var canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.touchAction = 'none';
    canvas.style.cursor = 'crosshair';
    container.style.position = 'relative';
    container.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    var readout = document.createElement('div');
    readout.style.cssText = 'position:absolute;right:10px;bottom:8px;font:11px/1.6 Consolas,monospace;' +
      'color:#67e8f9;background:rgba(6,15,26,.82);border:1px solid rgba(94,209,255,.2);border-radius:8px;' +
      'padding:3px 9px;pointer-events:none';
    readout.textContent = 'X 0.0  Y 0.0';
    container.appendChild(readout);
    this.readout = readout;

    this.view = { scale: 3.2, ox: 0, oy: 0 };

    /* 尺寸 */
    function resize() {
      var wd = container.clientWidth, ht = container.clientHeight;
      var dpr = Math.min(w.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(wd * dpr));
      canvas.height = Math.max(1, Math.round(ht * dpr));
      self.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      self.w = wd; self.h = ht;
      self.view.scale = Math.min(wd / 230, ht / 150);
      self.draw();
    }
    this.resize = resize;
    w.addEventListener('resize', resize);

    /* 坐标换算 */
    this.toWorld = function (px, py) {
      return {
        x: (px - self.w / 2 - self.view.ox) / self.view.scale,
        y: -(py - self.h / 2 - self.view.oy) / self.view.scale
      };
    };
    this.toScreen = function (p) {
      return {
        x: self.w / 2 + self.view.ox + p.x * self.view.scale,
        y: self.h / 2 + self.view.oy - p.y * self.view.scale
      };
    };

    /* ------------------------------------------------ 捕捉 */
    function allSnapPoints() {
      var pts = [];
      self.ents.forEach(function (e) {
        if (e.type === 'line') { pts.push(e.a, e.b); }
        if (e.type === 'rect') {
          pts.push({ x: e.a.x, y: e.a.y }, { x: e.b.x, y: e.a.y }, { x: e.b.x, y: e.b.y }, { x: e.a.x, y: e.b.y }, { x: (e.a.x + e.b.x) / 2, y: (e.a.y + e.b.y) / 2 });
        }
        if (e.type === 'circle') {
          pts.push(e.c);
          pts.push({ x: e.c.x + e.r, y: e.c.y }, { x: e.c.x - e.r, y: e.c.y }, { x: e.c.x, y: e.c.y + e.r }, { x: e.c.x, y: e.c.y - e.r });
        }
      });
      return pts;
    }
    this.snap = function (world, ev) {
      var best = null, bestD = 1e9;
      if (self.snapOn) {
        var px = self.toScreen(world);
        allSnapPoints().forEach(function (p) {
          var s = self.toScreen(p);
          var d = Math.hypot(s.x - px.x, s.y - px.y);
          if (d < self.opts.snapPx && d < bestD) { bestD = d; best = p; }
        });
      }
      var snapped = best ? { x: best.x, y: best.y, osnap: true } : {
        x: Math.round(world.x / self.opts.snapGrid) * self.opts.snapGrid,
        y: Math.round(world.y / self.opts.snapGrid) * self.opts.snapGrid,
        osnap: false
      };
      if (self.ortho && self.pending && self.tool === 'line') {
        /* 正交仅作用于直线命令（矩形/圆按两点自由定位） */
        var p0 = self.pending;
        if (Math.abs(snapped.x - p0.x) > Math.abs(snapped.y - p0.y)) snapped.y = p0.y;
        else snapped.x = p0.x;
      }
      return snapped;
    };

    /* ------------------------------------------------ 绘制 */
    this.draw = function () {
      var ctx = self.ctx, v = self.view;
      ctx.clearRect(0, 0, self.w, self.h);

      /* 背景 */
      var g = ctx.createRadialGradient(self.w / 2, self.h * 0.4, 20, self.w / 2, self.h * 0.5, Math.max(self.w, self.h) * 0.8);
      g.addColorStop(0, '#0b2135');
      g.addColorStop(1, '#050e18');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, self.w, self.h);

      /* 栅格 */
      var left = self.toWorld(0, 0), right = self.toWorld(self.w, self.h);
      var x0 = Math.floor(left.x / self.opts.grid) * self.opts.grid;
      var y1 = Math.ceil(left.y / self.opts.grid) * self.opts.grid;
      ctx.lineWidth = 1;
      for (var x = x0; x <= right.x; x += self.opts.grid) {
        var big = Math.round(x / self.opts.grid) % 5 === 0;
        ctx.strokeStyle = big ? 'rgba(94,209,255,.16)' : 'rgba(94,209,255,.07)';
        var s = self.toScreen({ x: x, y: 0 });
        ctx.beginPath(); ctx.moveTo(s.x, 0); ctx.lineTo(s.x, self.h); ctx.stroke();
      }
      for (var y = y1; y >= right.y; y -= self.opts.grid) {
        var big2 = Math.round(y / self.opts.grid) % 5 === 0;
        ctx.strokeStyle = big2 ? 'rgba(94,209,255,.16)' : 'rgba(94,209,255,.07)';
        var s2 = self.toScreen({ x: 0, y: y });
        ctx.beginPath(); ctx.moveTo(0, s2.y); ctx.lineTo(self.w, s2.y); ctx.stroke();
      }

      /* 坐标轴 */
      var o = self.toScreen({ x: 0, y: 0 });
      ctx.strokeStyle = 'rgba(251,191,36,.55)';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(0, o.y); ctx.lineTo(self.w, o.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(o.x, 0); ctx.lineTo(o.x, self.h); ctx.stroke();
      ctx.fillStyle = 'rgba(251,191,36,.75)';
      ctx.font = '10px Consolas,monospace';
      ctx.fillText('0,0', o.x + 5, o.y - 5);

      /* 参考图（ghost） */
      if (self.ghostOn) self.drawGhost(ctx);

      /* 图形 */
      self.ents.forEach(function (e) { self.drawEnt(ctx, e, '#e9f3ff', 1.9); });

      /* 预览 */
      if (self.preview) self.drawPreview(ctx);

      /* 捕捉标记 */
      if (self.snapPoint) {
        var sp = self.toScreen(self.snapPoint);
        ctx.strokeStyle = self.snapPoint.osnap ? '#34d399' : '#67e8f9';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(sp.x - 5, sp.y - 5, 10, 10);
      }
    };

    this.drawEnt = function (ctx, e, color, lw) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.beginPath();
      if (e.type === 'line') {
        var a = self.toScreen(e.a), b = self.toScreen(e.b);
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      } else if (e.type === 'rect') {
        var p1 = self.toScreen(e.a), p2 = self.toScreen(e.b);
        ctx.rect(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y), Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y));
      } else if (e.type === 'circle') {
        var c = self.toScreen(e.c);
        ctx.arc(c.x, c.y, e.r * self.view.scale, 0, Math.PI * 2);
      } else if (e.type === 'dim') {
        /* 标注：两条尺寸界线 + 尺寸线 + 文字 */
        var pa = self.toScreen(e.a), pb = self.toScreen(e.b);
        ctx.strokeStyle = '#fbbf24';
        var vert = Math.abs(e.b.x - e.a.x) < Math.abs(e.b.y - e.a.y);
        if (vert) {
          var off = 26;
          ctx.moveTo(pa.x, pa.y); ctx.lineTo(pa.x - off, pa.y);
          ctx.moveTo(pb.x, pb.y); ctx.lineTo(pb.x - off, pb.y);
          ctx.moveTo(pa.x - off, pa.y); ctx.lineTo(pb.x - off, pb.y);
          ctx.stroke();
          ctx.fillStyle = '#fbbf24';
          ctx.font = '10px Consolas,monospace';
          ctx.save();
          ctx.translate(pa.x - off - 5, (pa.y + pb.y) / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.textAlign = 'center';
          ctx.fillText(Math.abs(e.b.y - e.a.y).toFixed(1), 0, 0);
          ctx.restore();
        } else {
          var off2 = 26;
          ctx.moveTo(pa.x, pa.y); ctx.lineTo(pa.x, pa.y + off2);
          ctx.moveTo(pb.x, pb.y); ctx.lineTo(pb.x, pb.y + off2);
          ctx.moveTo(pa.x, pa.y + off2); ctx.lineTo(pb.x, pb.y + off2);
          ctx.stroke();
          ctx.fillStyle = '#fbbf24';
          ctx.font = '10px Consolas,monospace';
          ctx.textAlign = 'center';
          ctx.fillText(Math.abs(e.b.x - e.a.x).toFixed(1), (pa.x + pb.x) / 2, pa.y + off2 - 5);
          ctx.textAlign = 'left';
        }
        return;
      }
      ctx.stroke();
    };

    this.drawGhost = function (ctx) {
      var t = self.t;
      var W = t.W, H = t.H;
      ctx.save();
      ctx.strokeStyle = 'rgba(139,92,246,.55)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 5]);
      var p1 = self.toScreen({ x: -W / 2, y: H / 2 }), p2 = self.toScreen({ x: W / 2, y: -H / 2 });
      ctx.strokeRect(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y), Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y));
      [[-(W / 2 - t.dx), H / 2 - t.dy], [W / 2 - t.dx, H / 2 - t.dy], [-(W / 2 - t.dx), -(H / 2 - t.dy)], [W / 2 - t.dx, -(H / 2 - t.dy)]].forEach(function (c) {
        var s = self.toScreen({ x: c[0], y: c[1] });
        ctx.beginPath(); ctx.arc(s.x, s.y, t.d / 2 * self.view.scale, 0, Math.PI * 2); ctx.stroke();
      });
      ctx.beginPath(); ctx.arc(self.toScreen({ x: 0, y: 0 }).x, self.toScreen({ x: 0, y: 0 }).y, t.D / 2 * self.view.scale, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    };

    this.drawPreview = function (ctx) {
      var p = self.preview;
      ctx.save();
      ctx.strokeStyle = 'rgba(34,211,238,.9)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      if (p.type === 'line') {
        var a = self.toScreen(p.a), b = self.toScreen(p.b);
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      } else if (p.type === 'rect') {
        var p1 = self.toScreen(p.a), p2 = self.toScreen(p.b);
        ctx.rect(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y), Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y));
      } else if (p.type === 'circle') {
        var c = self.toScreen(p.c);
        ctx.arc(c.x, c.y, p.r * self.view.scale, 0, Math.PI * 2);
      } else if (p.type === 'dim') {
        var pa = self.toScreen(p.a), pb = self.toScreen(p.b);
        var off = 26;
        ctx.moveTo(pa.x, pa.y); ctx.lineTo(pa.x, pa.y + off);
        ctx.moveTo(pb.x, pb.y); ctx.lineTo(pb.x, pb.y + off);
        ctx.moveTo(pa.x, pa.y + off); ctx.lineTo(pb.x, pb.y + off);
      }
      ctx.stroke();
      ctx.restore();
    };

    /* ------------------------------------------------ 交互 */
    function pointerPos(ev) {
      var r = canvas.getBoundingClientRect();
      return { x: ev.clientX - r.left, y: ev.clientY - r.top };
    }

    canvas.addEventListener('pointerdown', function (ev) {
      if (ev.button === 1 || ev.button === 2) {
        /* 平移 */
        self._pan = { x: ev.clientX, y: ev.clientY, ox: self.view.ox, oy: self.view.oy };
        canvas.style.cursor = 'grabbing';
        return;
      }
      var pos = pointerPos(ev);
      var world = self.toWorld(pos.x, pos.y);
      var pt = self.snap(world, ev);

      if (self.tool === 'erase') {
        var hit = self.hitTest(pos);
        if (hit >= 0) { self.pushUndo(); self.ents.splice(hit, 1); self.draw(); if (opts.onChange) opts.onChange(); }
        return;
      }

      if (!self.pending) {
        self.pending = pt;
        self.draw();
        return;
      }

      /* 第二次点击：完成实体 */
      var a = self.pending;
      self.pushUndo();
      if (self.tool === 'line') {
        if (dist(a, pt) > 0.5) self.ents.push({ type: 'line', a: { x: a.x, y: a.y }, b: { x: pt.x, y: pt.y } });
        self.pending = { x: pt.x, y: pt.y };   // 连续画线
      } else if (self.tool === 'rect') {
        if (Math.abs(pt.x - a.x) > 0.5 && Math.abs(pt.y - a.y) > 0.5) {
          self.ents.push({ type: 'rect', a: { x: a.x, y: a.y }, b: { x: pt.x, y: pt.y } });
        }
        self.pending = null;
      } else if (self.tool === 'circle') {
        var r = dist(a, pt);
        if (r > 0.5) self.ents.push({ type: 'circle', c: { x: a.x, y: a.y }, r: r });
        self.pending = null;
      } else if (self.tool === 'dim') {
        self.ents.push({ type: 'dim', a: { x: a.x, y: a.y }, b: { x: pt.x, y: pt.y } });
        self.pending = null;
      }
      self.preview = null;
      self.draw();
      if (opts.onChange) opts.onChange();
    });

    canvas.addEventListener('pointermove', function (ev) {
      if (self._pan) {
        self.view.ox = self._pan.ox + (ev.clientX - self._pan.x);
        self.view.oy = self._pan.oy + (ev.clientY - self._pan.y);
        self.draw();
        return;
      }
      var pos = pointerPos(ev);
      var world = self.toWorld(pos.x, pos.y);
      var pt = self.snap(world, ev);
      self.snapPoint = pt;
      self.readout.textContent = 'X ' + pt.x.toFixed(1) + '  Y ' + pt.y.toFixed(1);

      if (self.pending) {
        var a = self.pending;
        if (self.tool === 'line') self.preview = { type: 'line', a: a, b: pt };
        else if (self.tool === 'rect') self.preview = { type: 'rect', a: a, b: pt };
        else if (self.tool === 'circle') self.preview = { type: 'circle', c: a, r: dist(a, pt) };
        else if (self.tool === 'dim') self.preview = { type: 'dim', a: a, b: pt };
      }
      self.draw();
    });

    w.addEventListener('pointerup', function () {
      if (self._pan) {
        self._pan = null;
        canvas.style.cursor = self.tool === 'pan' ? 'grab' : 'crosshair';
      }
    });

    canvas.addEventListener('wheel', function (ev) {
      ev.preventDefault();
      var r = canvas.getBoundingClientRect();
      var px = ev.clientX - r.left, py = ev.clientY - r.top;
      var before = self.toWorld(px, py);
      var k = ev.deltaY > 0 ? 0.92 : 1.08;
      self.view.scale = Math.max(0.6, Math.min(24, self.view.scale * k));
      var after = self.toWorld(px, py);
      self.view.ox += (after.x - before.x) * self.view.scale;
      self.view.oy -= (after.y - before.y) * self.view.scale;
      self.draw();
    }, { passive: false });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    this.hitTest = function (pos) {
      var world = self.toWorld(pos.x, pos.y);
      var tol = 8 / self.view.scale;
      for (var i = self.ents.length - 1; i >= 0; i--) {
        var e = self.ents[i];
        if (e.type === 'line') {
          var d = distPointSeg(world, e.a, e.b);
          if (d < tol) return i;
        } else if (e.type === 'rect') {
          var c1 = { x: e.a.x, y: e.a.y }, c2 = { x: e.b.x, y: e.a.y }, c3 = { x: e.b.x, y: e.b.y }, c4 = { x: e.a.x, y: e.b.y };
          if (distPointSeg(world, c1, c2) < tol || distPointSeg(world, c2, c3) < tol ||
              distPointSeg(world, c3, c4) < tol || distPointSeg(world, c4, c1) < tol) return i;
        } else if (e.type === 'circle') {
          if (Math.abs(dist(world, e.c) - e.r) < tol) return i;
        } else if (e.type === 'dim') {
          if (distPointSeg(world, e.a, e.b) < tol * 2) return i;
        }
      }
      return -1;
    };

    function distPointSeg(p, a, b) {
      var vx = b.x - a.x, vy = b.y - a.y;
      var l2 = vx * vx + vy * vy;
      if (l2 === 0) return dist(p, a);
      var t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / l2));
      return Math.hypot(p.x - (a.x + t * vx), p.y - (a.y + t * vy));
    }

    /* ------------------------------------------------ 命令行 / 快捷键 */
    this.setTool = function (tool) {
      self.tool = tool;
      self.pending = null;
      self.preview = null;
      canvas.style.cursor = tool === 'pan' ? 'grab' : (tool === 'erase' ? 'not-allowed' : 'crosshair');
      self.draw();
    };
    this.exec = function (cmd) {
      var c = String(cmd || '').toUpperCase().trim();
      if (c === 'L' || c === 'LINE') self.setTool('line');
      else if (c === 'REC' || c === 'RECT' || c === 'RECTANG') self.setTool('rect');
      else if (c === 'C' || c === 'CIRCLE') self.setTool('circle');
      else if (c === 'DIM' || c === 'DLI') self.setTool('dim');
      else if (c === 'E' || c === 'ERASE') self.setTool('erase');
      else if (c === 'U' || c === 'UNDO') self.undo();
      else if (c === 'P' || c === 'PAN') self.setTool('pan');
      else if (c === 'Z' || c === 'ZOOM') { self.view.scale = Math.min(self.w / 230, self.h / 150); self.view.ox = 0; self.view.oy = 0; self.draw(); }
      else if (c === 'ESC') { self.pending = null; self.preview = null; self.draw(); }
      return c;
    };
    this.pushUndo = function () {
      self.undoStack.push(JSON.stringify(self.ents));
      if (self.undoStack.length > 80) self.undoStack.shift();
    };
    this.undo = function () {
      if (!self.undoStack.length) return;
      self.ents = JSON.parse(self.undoStack.pop());
      self.pending = null; self.preview = null;
      self.draw();
      if (opts.onChange) opts.onChange();
    };
    this.clear = function () {
      self.pushUndo();
      self.ents = [];
      self.pending = null; self.preview = null;
      self.draw();
      if (opts.onChange) opts.onChange();
    };

    /* ------------------------------------------------ 评分 */
    this.score = function () {
      var t = self.t, W = t.W, H = t.H;
      var tol = 2.0;          // 位置容差 mm
      var tolR = 0.9;         // 半径容差 mm
      var out = { parts: [], total: 0 };

      /* 1) 外形轮廓（矩形或由 4 条线构成） */
      var rect = null;
      self.ents.forEach(function (e) {
        if (e.type === 'rect') {
          var w = Math.abs(e.b.x - e.a.x), h = Math.abs(e.b.y - e.a.y);
          if (Math.abs(w - W) < tol && Math.abs(h - H) < tol) {
            var cx = (e.a.x + e.b.x) / 2, cy = (e.a.y + e.b.y) / 2;
            if (Math.abs(cx) < tol && Math.abs(cy) < tol) rect = e;
          }
        }
      });
      if (!rect) {
        /* 由 4 条线拼成 */
        var lines = self.ents.filter(function (e) { return e.type === 'line'; });
        var horiz = lines.filter(function (l) { return Math.abs(l.a.y - l.b.y) < 0.6 && Math.abs(Math.abs(l.b.x - l.a.x) - W) < tol; });
        var vert = lines.filter(function (l) { return Math.abs(l.a.x - l.b.x) < 0.6 && Math.abs(Math.abs(l.b.y - l.a.y) - H) < tol; });
        if (horiz.length >= 1 && vert.length >= 2) rect = { type: 'lines' };
      }
      out.parts.push({ name: '底板外形尺寸', max: 25, got: rect ? 25 : 0, note: rect ? '长宽与中心位置正确' : '未检测到 ' + W + '×' + H + ' 的矩形轮廓（或尺寸偏差 >2mm）' });

      /* 2) 四个安装孔 */
      var holes = [
        { x: -(W / 2 - t.dx), y: H / 2 - t.dy }, { x: W / 2 - t.dx, y: H / 2 - t.dy },
        { x: -(W / 2 - t.dx), y: -(H / 2 - t.dy) }, { x: W / 2 - t.dx, y: -(H / 2 - t.dy) }
      ];
      var circles = self.ents.filter(function (e) { return e.type === 'circle'; });
      var used = [];
      var ok = 0;
      holes.forEach(function (h) {
        var found = false;
        circles.forEach(function (c, i) {
          if (used.indexOf(i) >= 0) return;
          if (Math.abs(c.r - t.d / 2) < tolR && dist(c.c, h) < tol) { found = true; used.push(i); }
        });
        if (found) ok++;
      });
      out.parts.push({ name: '安装孔（4×Ø' + t.d + '）', max: 30, got: Math.round(30 * ok / 4), note: ok + '/4 个孔位置与孔径正确' });

      /* 3) 中心孔 */
      var ch = circles.filter(function (c) { return Math.abs(c.r - t.D / 2) < tolR && dist(c.c, { x: 0, y: 0 }) < tol; });
      out.parts.push({ name: '中心孔 Ø' + t.D, max: 20, got: ch.length ? 20 : 0, note: ch.length ? '直径与同心度正确' : '未检测到 Ø' + t.D + ' 的同心中心孔' });

      /* 4) 中心线 */
      var cl = self.ents.filter(function (e) {
        if (e.type !== 'line') return false;
        var horiz = Math.abs(e.a.y - e.b.y) < 0.6 && Math.abs(e.a.y) < 1.2 && Math.abs(e.b.x - e.a.x) > W * 0.8;
        var vert = Math.abs(e.a.x - e.b.x) < 0.6 && Math.abs(e.a.x) < 1.2 && Math.abs(e.b.y - e.a.y) > H * 0.8;
        return horiz || vert;
      });
      out.parts.push({ name: '中心线（点划线）', max: 10, got: cl.length >= 2 ? 10 : (cl.length === 1 ? 5 : 0), note: '检测到 ' + cl.length + ' 条中心线（需要水平 + 垂直各 1 条）' });

      /* 5) 尺寸标注 */
      var dims = self.ents.filter(function (e) { return e.type === 'dim'; });
      var goodDim = dims.filter(function (d) {
        var v = Math.abs(d.b.x - d.a.x) > Math.abs(d.b.y - d.a.y) ? Math.abs(d.b.x - d.a.x) : Math.abs(d.b.y - d.a.y);
        return Math.abs(v - W) < 2 || Math.abs(v - H) < 2 || Math.abs(v - t.d) < 1.2 || Math.abs(v - t.D) < 1.2 ||
               Math.abs(v - (W - 2 * t.dx)) < 2 || Math.abs(v - (H - 2 * t.dy)) < 2;
      });
      var dimScore = Math.min(15, goodDim.length * 5);
      out.parts.push({ name: '尺寸标注', max: 15, got: dimScore, note: '有效标注 ' + goodDim.length + ' 处（每处 5 分，上限 15）' });

      out.total = out.parts.reduce(function (a, p) { return a + p.got; }, 0);
      out.grade = out.total >= 90 ? '优秀' : out.total >= 75 ? '良好' : out.total >= 60 ? '合格' : '需重做';
      return out;
    };

    this.getEntities = function () { return self.ents.slice(); };
    this.setTarget = function (t) {
      self.t = Object.assign({}, self.t, t);
      self.draw();
    };
    this.setGhost = function (v) { self.ghostOn = v; self.draw(); };

    resize();
    return this;
  }

  w.CADPad = CADPad;
})(window);