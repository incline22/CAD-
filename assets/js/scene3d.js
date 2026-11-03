/* ==========================================================================
   scene3d.js —— 低多边形三维机房（Three.js r152，UMD 本地加载）
   教室坐标：x 宽 13.6m，z 深 9.2m，y 高 3.2m；讲台/投影位于 -z 前端
   功能：轨道环视、第一人称漫游、自动巡检、设备热点、视角预设
   ========================================================================== */
(function (w) {
  'use strict';
  if (!w.THREE) { console.error('Three.js 未加载'); return; }

  var T = w.THREE;

  var ROOM = { w: 13.6, d: 9.2, h: 3.2 };
  var COL = {
    wall: 0xf3f6fa, wallSide: 0xe6ecf3, floor: 0xdde6ef, tile: 0xcfdae6,
    desk: 0xe6dbc8, deskEdge: 0xcfc7b8, metal: 0x9aa7b4, dark: 0x24313d,
    screen: 0x1b2733, chair: 0x3f5b78, accent: 0x22d3ee, amber: 0xf2b73c,
    green: 0x37c88f, red: 0xe0625f, wood: 0xb98b5d, white: 0xf7fafc
  };

  /* ------------------------------------------------------ 简易轨道控制 */
  function Orbit(cam, dom) {
    var self = this;
    this.cam = cam; this.dom = dom;
    this.target = new T.Vector3(0, 0.9, 0);
    this.sph = new T.Spherical(16, Math.PI / 3.4, Math.PI / 6);
    this.enabled = true;
    this.minR = 2.5; this.maxR = 26;
    this.minPhi = 0.18; this.maxPhi = Math.PI / 2 - 0.04;
    this.damp = 0.12;
    this._drag = null;
    this._vel = { theta: 0, phi: 0 };
    this._pan = new T.Vector3();

    dom.addEventListener('pointerdown', function (e) {
      if (!self.enabled) return;
      dom.setPointerCapture(e.pointerId);
      self._drag = { x: e.clientX, y: e.clientY, btn: e.button };
    });
    dom.addEventListener('pointermove', function (e) {
      if (!self.enabled || !self._drag) return;
      var dx = e.clientX - self._drag.x, dy = e.clientY - self._drag.y;
      self._drag.x = e.clientX; self._drag.y = e.clientY;
      if (self._drag.btn === 0) {
        self._vel.theta -= dx * 0.0045;
        self._vel.phi -= dy * 0.0035;
      } else {
        var right = new T.Vector3().setFromMatrixColumn(cam.matrix, 0);
        var up = new T.Vector3().setFromMatrixColumn(cam.matrix, 1);
        var s = self.sph.radius * 0.0016;
        self._pan.addScaledVector(right, -dx * s).addScaledVector(up, dy * s);
      }
    });
    function up() { self._drag = null; }
    dom.addEventListener('pointerup', up);
    dom.addEventListener('pointercancel', up);
    dom.addEventListener('pointerleave', up);
    dom.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    dom.addEventListener('wheel', function (e) {
      if (!self.enabled) return;
      e.preventDefault();
      self.sph.radius *= (e.deltaY > 0 ? 1.09 : 0.915);
      self.sph.radius = Math.max(self.minR, Math.min(self.maxR, self.sph.radius));
    }, { passive: false });
  }
  Orbit.prototype.set = function (pos, target) {
    this.target.copy(target);
    var off = pos.clone().sub(target);
    this.sph.setFromVector3(off);
    this.sph.radius = Math.max(this.minR, Math.min(this.maxR, this.sph.radius));
    this.apply();
  };
  Orbit.prototype.apply = function () {
    var p = new T.Vector3().setFromSpherical(this.sph).add(this.target);
    this.cam.position.copy(p);
    this.cam.lookAt(this.target);
  };
  Orbit.prototype.update = function () {
    this.sph.theta += this._vel.theta;
    this.sph.phi += this._vel.phi;
    this._vel.theta *= 0.86; this._vel.phi *= 0.86;
    this.sph.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this.sph.phi));
    this.target.add(this._pan);
    this._pan.multiplyScalar(0.82);
    this.apply();
  };

  /* ------------------------------------------------------ 材质与几何工具 */
  function mat(color, opt) {
    opt = opt || {};
    var m = new T.MeshStandardMaterial({
      color: color,
      roughness: opt.rough != null ? opt.rough : 0.86,
      metalness: opt.metal != null ? opt.metal : 0.05,
      flatShading: opt.flat !== false,
      emissive: opt.emissive != null ? opt.emissive : 0x000000,
      emissiveIntensity: opt.ei != null ? opt.ei : 1,
      transparent: !!opt.opacity,
      opacity: opt.opacity != null ? opt.opacity : 1,
      side: opt.side || T.FrontSide
    });
    return m;
  }
  function box(wd, ht, dp, color, opt) {
    var m = new T.Mesh(new T.BoxGeometry(wd, ht, dp), mat(color, opt));
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function cyl(rt, rb, ht, seg, color, opt) {
    var m = new T.Mesh(new T.CylinderGeometry(rt, rb, ht, seg || 8), mat(color, opt));
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  /* 地面格子纹理（程序化，避免外部图片） */
  function floorTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 256;
    var g = c.getContext('2d');
    g.fillStyle = '#c7d5e3'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#a9bccd'; g.lineWidth = 3;
    g.strokeRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.moveTo(0, 128); g.lineTo(256, 128); g.stroke();
    var tex = new T.CanvasTexture(c);
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(20, 14);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }

  /* 文字标牌纹理 */
  function labelSprite(text, accent) {
    var pad = 26, fs = 46;
    var c = document.createElement('canvas');
    var g = c.getContext('2d');
    g.font = '700 ' + fs + 'px "PingFang SC","Microsoft YaHei",sans-serif';
    var tw = g.measureText(text).width;
    c.width = Math.ceil(tw + pad * 2);
    c.height = 96;
    g = c.getContext('2d');
    g.fillStyle = 'rgba(6,20,34,.88)';
    var r = 22;
    g.beginPath();
    g.moveTo(r, 0); g.lineTo(c.width - r, 0); g.quadraticCurveTo(c.width, 0, c.width, r);
    g.lineTo(c.width, c.height - r); g.quadraticCurveTo(c.width, c.height, c.width - r, c.height);
    g.lineTo(r, c.height); g.quadraticCurveTo(0, c.height, 0, c.height - r);
    g.lineTo(0, r); g.quadraticCurveTo(0, 0, r, 0);
    g.fill();
    g.strokeStyle = accent || '#22d3ee'; g.lineWidth = 3; g.stroke();
    g.font = '700 ' + fs + 'px "PingFang SC","Microsoft YaHei",sans-serif';
    g.fillStyle = '#eaf6ff'; g.textBaseline = 'middle';
    g.fillText(text, pad, c.height / 2 + 2);
    var tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    var sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sp.scale.set(c.width / 96 * 0.26, 0.26, 1);
    sp.center.set(0.5, 0);
    return sp;
  }

  /* ------------------------------------------------------ 构建机房 */
  function buildRoom(scene) {
    var g = new T.Group();

    /* 地面 */
    var floor = new T.Mesh(new T.BoxGeometry(ROOM.w, 0.12, ROOM.d), new T.MeshStandardMaterial({
      map: floorTexture(), roughness: 0.9, metalness: 0.02
    }));
    floor.position.y = -0.06;
    floor.receiveShadow = true;
    g.add(floor);

    /* 顶棚 */
    var ceil = box(ROOM.w, 0.12, ROOM.d, 0xfbfdff);
    ceil.position.y = ROOM.h + 0.06;
    ceil.receiveShadow = true;
    g.add(ceil);

    /* 墙体（相机在外侧时自动隐藏，形成剖切视角） */
    var wMat = mat(COL.wall, { flat: false, rough: 0.95 });
    var backWall = new T.Mesh(new T.BoxGeometry(ROOM.w, ROOM.h, 0.1), wMat);
    backWall.position.set(0, ROOM.h / 2, -ROOM.d / 2);
    backWall.receiveShadow = true; g.add(backWall);

    var frontWall = new T.Mesh(new T.BoxGeometry(ROOM.w, ROOM.h, 0.1), wMat);
    frontWall.position.set(0, ROOM.h / 2, ROOM.d / 2);
    frontWall.receiveShadow = true; g.add(frontWall);

    var leftWall = new T.Mesh(new T.BoxGeometry(0.1, ROOM.h, ROOM.d), mat(COL.wallSide, { flat: false, rough: 0.95 }));
    leftWall.position.set(-ROOM.w / 2, ROOM.h / 2, 0);
    leftWall.receiveShadow = true; g.add(leftWall);

    var rightWall = leftWall.clone();
    rightWall.position.x = ROOM.w / 2;
    g.add(rightWall);

    g.userData.ceiling = ceil;
    g.userData.walls = [
      { m: backWall, ax: 'z', sign: -1, plane: ROOM.d / 2 },
      { m: frontWall, ax: 'z', sign: 1, plane: ROOM.d / 2 },
      { m: leftWall, ax: 'x', sign: -1, plane: ROOM.w / 2 },
      { m: rightWall, ax: 'x', sign: 1, plane: ROOM.w / 2 }
    ];
    g.userData.updateCull = function (cam) {
      var p = cam.position;
      g.userData.walls.forEach(function (wl) {
        var v = (wl.ax === 'z' ? p.z : p.x) * wl.sign;
        wl.m.visible = v < wl.plane - 0.25;
      });
      g.userData.ceiling.visible = p.y < ROOM.h - 0.04;
    };

    /* 踢脚线 */
    var skirt = mat(0x9fb0be, { rough: 0.7 });
    [[ROOM.w, -ROOM.d / 2 + 0.06, 0], [ROOM.w, ROOM.d / 2 - 0.06, 0]].forEach(function (p) {
      var s = new T.Mesh(new T.BoxGeometry(p[0], 0.1, 0.04), skirt);
      s.position.set(0, 0.05, p[1]); g.add(s);
    });

    /* 吸顶灯 */
    for (var lx = -4.5; lx <= 4.5; lx += 4.5) {
      for (var lz = -2.9; lz <= 2.9; lz += 2.9) {
        var lamp = new T.Mesh(new T.BoxGeometry(1.5, 0.06, 0.5), new T.MeshStandardMaterial({
          color: 0xffffff, emissive: 0xf4f9ff, emissiveIntensity: 1.1, roughness: 1
        }));
        lamp.position.set(lx, ROOM.h - 0.06, lz);
        g.add(lamp);
      }
    }

    /* 前墙：投影幕 */
    var screen = new T.Group();
    var scrFrame = box(3.4, 1.9, 0.08, 0x2b3946, { rough: 0.7 });
    var scrFace = new T.Mesh(new T.PlaneGeometry(3.16, 1.66), new T.MeshStandardMaterial({
      color: 0xf8fbff, emissive: 0xeaf6ff, emissiveIntensity: 0.42, roughness: 0.95
    }));
    scrFace.position.z = 0.05;
    screen.add(scrFrame, scrFace);
    var scrCase = box(3.5, 0.12, 0.14, COL.dark);
    scrCase.position.set(0, 0.98, 0.02);
    screen.add(scrCase);
    screen.position.set(0, 1.78, -ROOM.d / 2 + 0.18);
    g.add(screen);
    g.userData.screen = screen;

    /* 前墙：交互式智能平板（左） */
    var board = new T.Group();
    var bFrame = box(2.2, 1.32, 0.09, 0x1f2b36);
    var bFace = new T.Mesh(new T.PlaneGeometry(2.0, 1.14), new T.MeshStandardMaterial({
      color: 0x14212e, emissive: 0x1b6d86, emissiveIntensity: 0.35, roughness: 0.5
    }));
    bFace.position.z = 0.055;
    board.add(bFrame, bFace);
    board.position.set(-4.4, 1.62, -ROOM.d / 2 + 0.16);
    g.add(board);

    /* 讲台（教师坐在讲台后方面向全班，屏幕朝向教师一侧） */
    var podium = new T.Group();
    var pBody = box(1.7, 0.78, 0.7, COL.wood, { rough: 0.8 });
    pBody.position.y = 0.39;
    var pTop = box(1.8, 0.06, 0.78, 0xe7e0d4);
    pTop.position.y = 0.81;
    /* 台前挡板朝向学生（+z），讲台内侧朝教师（-z） */
    var pFront = box(1.72, 0.5, 0.04, 0x8f6b47);
    pFront.position.set(0, 0.45, 0.36);
    var pKick = box(1.72, 0.12, 0.04, 0x6f5136);
    pKick.position.set(0, 0.06, 0.36);
    podium.add(pBody, pTop, pFront, pKick);

    /* 教师显示器：屏幕法线朝 -z（面向坐在讲台后的教师） */
    var tMon = box(0.56, 0.36, 0.04, COL.dark);
    tMon.position.set(0, 1.06, 0.06);
    var tMonFace = new T.Mesh(new T.PlaneGeometry(0.5, 0.3), new T.MeshStandardMaterial({
      color: 0x0f2333, emissive: 0x2a6f92, emissiveIntensity: 0.5, side: T.DoubleSide
    }));
    tMonFace.position.set(0, 1.06, 0.033);
    tMonFace.rotation.y = Math.PI;
    var tStand = box(0.06, 0.16, 0.06, COL.metal);
    tStand.position.set(0, 0.92, 0.06);
    podium.add(tMon, tMonFace, tStand);

    /* 键盘与鼠标放在教师手边（-z 侧） */
    var kb = box(0.42, 0.03, 0.16, 0x333f4a);
    kb.position.set(-0.02, 0.87, -0.16);
    var mouse = box(0.06, 0.03, 0.1, 0x2b3641);
    mouse.position.set(0.32, 0.865, -0.16);
    podium.add(kb, mouse);

    /* 教师机主机（台下 -z 侧） */
    var tPc = box(0.2, 0.44, 0.46, 0x2c3742);
    tPc.position.set(0.62, 0.25, -0.02);
    podium.add(tPc);

    /* 教师椅：位于讲台后方（-z），面向学生 */
    var tChair = new T.Group();
    var cSeat = box(0.52, 0.08, 0.48, COL.chair, { rough: 0.8 });
    cSeat.position.y = 0.48;
    var cBack = box(0.5, 0.52, 0.08, COL.chair, { rough: 0.8 });
    cBack.position.set(0, 0.76, -0.22);
    var cPole = cyl(0.04, 0.04, 0.44, 8, COL.metal);
    cPole.position.y = 0.24;
    var cBase = cyl(0.26, 0.28, 0.05, 12, 0x303a44);
    cBase.position.y = 0.03;
    tChair.add(cSeat, cBack, cPole, cBase);
    tChair.position.set(0, 0, -0.52);
    podium.add(tChair);

    podium.position.set(0, 0, -ROOM.d / 2 + 0.85);
    g.add(podium);
    g.userData.podium = podium;

    /* 吊装投影机 */
    var proj = new T.Group();
    var pjBody = box(0.44, 0.16, 0.34, 0x2b3742);
    var pjLens = cyl(0.055, 0.065, 0.08, 12, 0x11181f);
    pjLens.rotation.x = Math.PI / 2;
    pjLens.position.set(0.14, 0, 0.19);
    var pjMount = box(0.06, 0.45, 0.06, COL.metal);
    pjMount.position.y = 0.3;
    proj.add(pjBody, pjLens, pjMount);
    proj.position.set(0, ROOM.h - 0.62, -2.1);
    g.add(proj);

    /* 后墙：网络机柜 */
    var rack = new T.Group();
    var rBody = box(0.66, 1.9, 0.72, 0x233241, { metal: 0.35, rough: 0.55 });
    var rGlass = new T.Mesh(new T.PlaneGeometry(0.56, 1.6), new T.MeshStandardMaterial({
      color: 0x1a3c52, emissive: 0x0e88a8, emissiveIntensity: 0.4, transparent: true, opacity: 0.72, roughness: 0.3
    }));
    rGlass.position.z = 0.37;
    rack.add(rBody, rGlass);
    /* 交换机灯珠 */
    var leds = [];
    for (var i = 0; i < 8; i++) {
      var led = new T.Mesh(new T.BoxGeometry(0.05, 0.03, 0.02), new T.MeshStandardMaterial({
        color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.6
      }));
      led.position.set(-0.2 + i * 0.055, 0.55 - Math.floor(i / 4) * 0.09, 0.371);
      rack.add(led); leds.push(led);
    }
    rack.position.set(-ROOM.w / 2 + 0.85, 0.95, ROOM.d / 2 - 0.6);
    g.add(rack);
    g.userData.leds = leds;

    /* 绘图仪 */
    var plotter = new T.Group();
    var plBody = box(1.55, 0.42, 0.62, 0xdfe5ea, { rough: 0.6 });
    plBody.position.y = 0.62;
    var plTop = box(1.55, 0.07, 0.62, 0x394654);
    plTop.position.y = 0.86;
    var plLeg = box(1.4, 0.42, 0.5, 0xb9c2cb);
    plLeg.position.y = 0.21;
    var plPaper = new T.Mesh(new T.PlaneGeometry(1.2, 0.5), new T.MeshStandardMaterial({ color: 0xfbfdff, roughness: 1, side: T.DoubleSide }));
    plPaper.rotation.x = -Math.PI / 2.1;
    plPaper.position.set(0, 0.9, 0.16);
    plotter.add(plBody, plTop, plLeg, plPaper);
    plotter.position.set(1.6, 0, ROOM.d / 2 - 0.62);
    g.add(plotter);

    /* 打印机 */
    var printer = box(0.55, 0.4, 0.45, 0xe4e9ee);
    printer.position.set(2.85, 0.62, ROOM.d / 2 - 0.62);
    var prTop = box(0.5, 0.06, 0.4, 0x2f3a45);
    prTop.position.set(2.85, 0.84, ROOM.d / 2 - 0.62);
    var prStand = box(0.7, 0.42, 0.5, 0xb9c2cb);
    prStand.position.set(2.85, 0.21, ROOM.d / 2 - 0.62);
    g.add(printer, prTop, prStand);

    /* 空调（左墙，默认视角可见） */
    var ac = new T.Group();
    var acBody = box(0.34, 1.86, 0.82, 0xf1f4f7);
    var acGrill = box(0.04, 1.5, 0.6, 0xc7d0d9);
    acGrill.position.x = 0.16;
    var acPanel = new T.Mesh(new T.PlaneGeometry(0.16, 0.1), new T.MeshStandardMaterial({
      color: 0x0b2a44, emissive: 0x22d3ee, emissiveIntensity: 0.9
    }));
    acPanel.position.set(0.17, 0.6, 0.2);
    acPanel.rotation.y = -Math.PI / 2;
    ac.add(acBody, acGrill, acPanel);
    ac.position.set(-ROOM.w / 2 + 0.24, 0.95, 1.6);
    g.add(ac);
    g.userData.acPanel = acPanel;

    /* UPS */
    var ups = box(0.34, 0.9, 0.5, 0x2b3641, { rough: 0.5 });
    ups.position.set(-ROOM.w / 2 + 1.9, 0.45, ROOM.d / 2 - 0.5);
    g.add(ups);

    /* 配电箱（后墙右段） */
    var panel = box(0.45, 0.62, 0.12, 0xdfe5ea);
    panel.position.set(5.6, 1.55, -ROOM.d / 2 + 0.08);
    var panelDoor = box(0.38, 0.55, 0.03, 0xc6ced7);
    panelDoor.position.set(5.6, 1.55, -ROOM.d / 2 + 0.15);
    g.add(panel, panelDoor);

    /* 灭火器 */
    var ext = new T.Group();
    var extBody = cyl(0.075, 0.085, 0.44, 10, 0xc0392b);
    extBody.position.y = 0.22;
    var extTop = cyl(0.03, 0.045, 0.1, 8, 0x2b3641);
    extTop.position.y = 0.48;
    ext.add(extBody, extTop);
    ext.position.set(-2.6, 0, ROOM.d / 2 - 0.22);
    g.add(ext);

    /* 安全出口指示（门上方，后墙） */
    var exitSign = new T.Mesh(new T.BoxGeometry(0.5, 0.2, 0.06), new T.MeshStandardMaterial({
      color: 0x0f6b46, emissive: 0x2fd48d, emissiveIntensity: 1.2
    }));
    exitSign.position.set(3.4, 2.62, -ROOM.d / 2 + 0.09);
    g.add(exitSign);

    /* 门（后墙右段） */
    var door = box(1.05, 2.2, 0.06, 0xd8cbb8);
    door.position.set(3.4, 1.1, -ROOM.d / 2 + 0.02);
    var doorFrame = box(1.14, 2.28, 0.03, 0xa9b4be);
    doorFrame.position.set(3.4, 1.14, -ROOM.d / 2 + 0.06);
    g.add(door, doorFrame);

    /* 地插（每排两侧） */
    for (var dz = -3.3; dz <= 3.7; dz += 1.0) {
      var dp = box(0.24, 0.02, 0.14, 0xb9c4cf);
      dp.position.set(-6.2, 0.012, dz);
      g.add(dp);
    }

    return g;
  }

  /* ------------------------------------------------------ 学生工位（实例化复用） */
  function buildStations(scene) {
    var g = new T.Group();
    var deskTopGeo = new T.BoxGeometry(1.4, 0.05, 0.72);
    var deskTopMat = mat(COL.desk, { rough: 0.75 });
    var deskTop = new T.InstancedMesh(deskTopGeo, deskTopMat, 40);
    deskTop.castShadow = true; deskTop.receiveShadow = true;

    var legGeo = new T.BoxGeometry(0.05, 0.72, 0.05);
    var legMat = mat(COL.metal, { metal: 0.5, rough: 0.5 });
    var legs = new T.InstancedMesh(legGeo, legMat, 160);
    legs.castShadow = true;

    var monGeo = new T.BoxGeometry(0.58, 0.36, 0.03);
    var monMat = mat(COL.dark, { rough: 0.5 });
    var mons = new T.InstancedMesh(monGeo, monMat, 40);
    mons.castShadow = true;

    var standGeo = new T.BoxGeometry(0.05, 0.18, 0.05);
    var standMat = mat(COL.metal, { metal: 0.4, rough: 0.5 });
    var stands = new T.InstancedMesh(standGeo, standMat, 40);

    var scrGeo = new T.PlaneGeometry(0.53, 0.31);
    var scrMat = new T.MeshStandardMaterial({ color: 0x0d2436, emissive: 0x1d6f92, emissiveIntensity: 0.55, roughness: 0.4 });
    var screens = new T.InstancedMesh(scrGeo, scrMat, 40);

    var pcGeo = new T.BoxGeometry(0.2, 0.44, 0.46);
    var pcMat = mat(0x2c3742, { rough: 0.6 });
    var pcs = new T.InstancedMesh(pcGeo, pcMat, 40);
    pcs.castShadow = true;

    var chairSeatGeo = new T.BoxGeometry(0.46, 0.06, 0.44);
    var chairMat = mat(COL.chair, { rough: 0.8 });
    var seats = new T.InstancedMesh(chairSeatGeo, chairMat, 40);
    seats.castShadow = true;
    var chairBackGeo = new T.BoxGeometry(0.44, 0.44, 0.06);
    var backs = new T.InstancedMesh(chairBackGeo, chairMat, 40);
    backs.castShadow = true;

    var dummy = new T.Object3D();
    var idx = 0, legIdx = 0;
    var cols = [-5.4, -2.7, 0, 2.7, 5.4];
    var rows = [];
    for (var r0 = 0; r0 < 8; r0++) rows.push(-2.65 + r0 * 0.94);

    var seatMap = [];
    for (var r = 0; r < rows.length; r++) {
      for (var c = 0; c < cols.length; c++) {
        var x = cols[c], z = rows[r];
        /* 桌面 */
        dummy.position.set(x, 0.74, z); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
        deskTop.setMatrixAt(idx, dummy.matrix);
        /* 桌腿 */
        [-0.62, 0.62].forEach(function (lx) {
          [-0.32, 0.32].forEach(function (lz) {
            dummy.position.set(x + lx, 0.36, z + lz); dummy.updateMatrix();
            legs.setMatrixAt(legIdx++, dummy.matrix);
          });
        });
        /* 显示器（面向 -z，稍微仰角） */
        dummy.position.set(x, 1.04, z - 0.22);
        dummy.rotation.set(-0.08, 0, 0);
        dummy.updateMatrix();
        mons.setMatrixAt(idx, dummy.matrix);
        dummy.position.set(x, 1.04, z - 0.2);
        dummy.rotation.set(-0.08, 0, 0);
        dummy.updateMatrix();
        screens.setMatrixAt(idx, dummy.matrix);
        /* 显示器支架 */
        dummy.position.set(x, 0.83, z - 0.24);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        stands.setMatrixAt(idx, dummy.matrix);
        /* 主机 */
        dummy.position.set(x + 0.52, 0.25, z - 0.02);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        pcs.setMatrixAt(idx, dummy.matrix);
        /* 椅子 */
        dummy.position.set(x, 0.5, z + 0.62);
        dummy.updateMatrix();
        seats.setMatrixAt(idx, dummy.matrix);
        dummy.position.set(x, 0.74, z + 0.84);
        dummy.rotation.set(0.12, 0, 0);
        dummy.updateMatrix();
        backs.setMatrixAt(idx, dummy.matrix);
        dummy.rotation.set(0, 0, 0);

        seatMap.push({ seat: idx + 1, x: x, z: z });
        idx++;
      }
    }
    deskTop.instanceMatrix.needsUpdate = true;
    legs.instanceMatrix.needsUpdate = true;
    mons.instanceMatrix.needsUpdate = true;
    screens.instanceMatrix.needsUpdate = true;
    stands.instanceMatrix.needsUpdate = true;
    pcs.instanceMatrix.needsUpdate = true;
    seats.instanceMatrix.needsUpdate = true;
    backs.instanceMatrix.needsUpdate = true;

    g.add(deskTop, legs, mons, screens, stands, pcs, seats, backs);
    scene.userData.seatMap = seatMap;
    return g;
  }

  /* ------------------------------------------------------ 主流程 */
  function init(container, opts) {
    opts = opts || {};
    var scene = new T.Scene();
    scene.background = new T.Color(0x0a1420);
    scene.fog = new T.Fog(0x0a1420, 26, 46);

    var camera = new T.PerspectiveCamera(46, 1, 0.05, 200);

    var renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(w.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.cursor = 'grab';

    /* 灯光 */
    scene.add(new T.HemisphereLight(0xdcecff, 0x6b7b8a, 0.55));
    var amb = new T.AmbientLight(0xffffff, 0.18); scene.add(amb);
    var sun = new T.DirectionalLight(0xfff6e8, 1.05);
    sun.position.set(6, 12, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -12; sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 40;
    sun.shadow.bias = -0.0012;
    scene.add(sun);
    var fill = new T.DirectionalLight(0xbfe8ff, 0.35);
    fill.position.set(-8, 6, -6);
    scene.add(fill);

    var room = buildRoom(scene);
    scene.add(room);
    scene.add(buildStations(scene));

    /* 相机与控制 */
    var orbit = new Orbit(camera, renderer.domElement);
    orbit.set(new T.Vector3(9.6, 6.6, 11.4), new T.Vector3(0, 1.0, 0.2));
    camera.position.set(9.6, 6.6, 11.4);

    var state = {
      mode: 'orbit',          // orbit | walk | tour
      clock: new T.Clock(),
      keys: {},
      walkYaw: Math.PI,
      walkPitch: -0.05,
      walkPos: new T.Vector3(0, 1.62, 3.2),
      autoRotate: false,
      hotspots: [],
      labels: [],
      showLabels: true,
      selected: null,
      tourT: 0,
      onSelect: opts.onSelect || function () {}
    };
    state.seatMapQuery = function (n) {
      var list = scene.userData.seatMap || [];
      for (var i = 0; i < list.length; i++) { if (list[i].seat === n) return list[i]; }
      return null;
    };

    /* 自动旋转（展示模式） */
    orbit.update();

    /* -------------------------------------------------- 热点 */
    var hotspotDefs = [
      { id: 'desks', label: '学生工位', pos: [0, 0.04, 0.6], size: [12.8, 0.04, 8.6], dev: 'SB-01', primary: true },
      { id: 'podium', label: '教师工作站', pos: [0, 1.0, -3.6], size: [1.9, 1.6, 1.1], dev: 'SB-02', primary: true },
      { id: 'projector', label: '激光投影机', pos: [0, 2.55, -2.1], size: [0.6, 0.5, 0.5], dev: 'SB-04' },
      { id: 'screen', label: '投影幕布', pos: [0, 1.9, -4.4], size: [3.6, 2.0, 0.3], dev: 'SB-05', primary: true },
      { id: 'whiteboard', label: '智能平板', pos: [-4.4, 1.62, -4.4], size: [2.4, 1.5, 0.3], dev: 'SB-06' },
      { id: 'rack', label: '网络机柜', pos: [-5.95, 1.0, 4.0], size: [0.9, 2.1, 0.9], dev: 'SB-08', primary: true },
      { id: 'switch', label: '交换机', pos: [-5.95, 1.35, 4.0], size: [0.7, 0.3, 0.8], dev: 'SB-07' },
      { id: 'plotter', label: '工程绘图仪', pos: [1.6, 0.8, 4.0], size: [1.7, 1.1, 0.9], dev: 'SB-10', primary: true },
      { id: 'printer', label: '激光打印机', pos: [2.85, 0.7, 4.0], size: [0.8, 0.9, 0.7], dev: 'SB-12' },
      { id: 'ac', label: '精密空调', pos: [-6.4, 1.0, 1.6], size: [0.5, 2.0, 0.95], dev: 'SB-13', primary: true },
      { id: 'ups', label: 'UPS 电源', pos: [-4.9, 0.5, 4.0], size: [0.5, 1.0, 0.6], dev: 'SB-14' },
      { id: 'panel', label: '配电箱', pos: [5.6, 1.55, -4.5], size: [0.55, 0.75, 0.4], dev: 'SB-16' },
      { id: 'extinguisher', label: '灭火器', pos: [-2.6, 0.3, 4.1], size: [0.3, 0.6, 0.3], dev: 'SB-19' },
      { id: 'exit', label: '安全出口', pos: [3.4, 2.62, -4.5], size: [0.6, 0.3, 0.2], dev: 'SB-20' },
      { id: 'floor', label: '防静电地板', pos: [-3.6, 0.02, 2.4], size: [1.6, 0.04, 1.6], dev: 'SB-15' }
    ];
    var hsMat = new T.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0, depthWrite: false });
    hotspotDefs.forEach(function (h) {
      var m = new T.Mesh(new T.BoxGeometry(h.size[0], h.size[1], h.size[2]), hsMat.clone());
      m.position.set(h.pos[0], h.pos[1], h.pos[2]);
      m.userData.hot = h;
      scene.add(m);
      state.hotspots.push(m);

      var lb = labelSprite(h.label, '#22d3ee');
      lb.position.set(h.pos[0], h.pos[1] + h.size[1] / 2 + 0.22, h.pos[2]);
      lb.visible = !!h.primary;
      lb.userData.anchor = new T.Vector3(h.pos[0], h.pos[1], h.pos[2]);
      lb.userData.primary = !!h.primary;
      scene.add(lb);
      state.labels.push(lb);
    });

    /* -------------------------------------------------- 巡检路径 */
    var tourPts = [
      new T.Vector3(-1.2, 2.4, 8.2),
      new T.Vector3(-6.4, 1.9, 3.0),
      new T.Vector3(-5.6, 1.7, -3.2),
      new T.Vector3(0.4, 2.2, -1.6),
      new T.Vector3(6.0, 2.0, -2.6),
      new T.Vector3(6.2, 2.2, 3.4),
      new T.Vector3(1.4, 2.6, 8.0)
    ];
    var tourCurve = new T.CatmullRomCurve3(tourPts, true, 'catmullrom', 0.4);
    var tourLook = [
      new T.Vector3(0, 1.0, -1.0), new T.Vector3(-3.0, 1.2, 3.6), new T.Vector3(-2.0, 1.2, -3.4),
      new T.Vector3(0.5, 1.2, -3.8), new T.Vector3(3.4, 1.2, 3.2), new T.Vector3(1.0, 1.0, 0.0), new T.Vector3(0, 1.0, -1.0)
    ];
    var tourLookCurve = new T.CatmullRomCurve3(tourLook, true, 'catmullrom', 0.4);
    var TOUR_TIME = 46;

    /* -------------------------------------------------- 视角预设 */
    var presets = {
      overview: { pos: new T.Vector3(9.6, 6.6, 11.4), target: new T.Vector3(0, 1.0, 0.2), mode: 'orbit' },
      podium: { pos: new T.Vector3(4.6, 2.95, -0.6), target: new T.Vector3(-0.4, 0.85, -3.7), mode: 'orbit' },
      teacher: { pos: new T.Vector3(0, 1.72, -4.02), target: new T.Vector3(0, 1.15, 3.6), mode: 'walk' },
      student: { pos: new T.Vector3(0, 1.55, 5.4), target: new T.Vector3(0, 1.35, -4.4), mode: 'walk' },
      devices: { pos: new T.Vector3(-4.0, 1.8, 1.4), target: new T.Vector3(-6.2, 1.1, 3.9), mode: 'orbit' },
      output: { pos: new T.Vector3(1.4, 1.7, 1.0), target: new T.Vector3(1.8, 0.9, 4.1), mode: 'orbit' }
    };

    function flyTo(preset, cb) {
      state.mode = 'orbit';
      orbit.enabled = true;
      var from = camera.position.clone();
      var fromT = orbit.target.clone();
      var to = preset.pos.clone();
      var toT = preset.target.clone();
      var t0 = performance.now(), dur = 900;
      function step() {
        var p = Math.min(1, (performance.now() - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        camera.position.lerpVectors(from, to, e);
        orbit.target.lerpVectors(fromT, toT, e);
        camera.lookAt(orbit.target);
        if (p < 1) requestAnimationFrame(step);
        else {
          orbit.sph.setFromVector3(camera.position.clone().sub(orbit.target));
          if (cb) cb();
        }
      }
      requestAnimationFrame(step);
    }

    /* -------------------------------------------------- 漫游控制 */
    function setWalkFromCamera() {
      state.walkPos.copy(camera.position);
      state.walkPos.y = 1.62;
      var dir = new T.Vector3();
      camera.getWorldDirection(dir);
      state.walkYaw = Math.atan2(-dir.x, -dir.z);
      state.walkPitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
    }
    function setMode(mode) {
      if (mode === state.mode) return;
      if (mode === 'walk') setWalkFromCamera();
      state.mode = mode;
      orbit.enabled = (mode === 'orbit');
      renderer.domElement.style.cursor = mode === 'walk' ? 'crosshair' : 'grab';
      if (opts.onMode) opts.onMode(mode);
    }

    /* 漫游指针：按住拖动看向（不用 PointerLock，触屏也友好） */
    var looking = false, lastX = 0, lastY = 0;
    renderer.domElement.addEventListener('pointerdown', function (e) {
      if (state.mode !== 'walk') return;
      looking = true; lastX = e.clientX; lastY = e.clientY;
    });
    w.addEventListener('pointerup', function () { looking = false; });
    w.addEventListener('pointermove', function (e) {
      if (!looking || state.mode !== 'walk') return;
      state.walkYaw -= (e.clientX - lastX) * 0.005;
      state.walkPitch -= (e.clientY - lastY) * 0.004;
      state.walkPitch = Math.max(-1.2, Math.min(1.0, state.walkPitch));
      lastX = e.clientX; lastY = e.clientY;
    });
    w.addEventListener('keydown', function (e) {
      var k = e.key.toLowerCase();
      state.keys[k] = true;
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(k) >= 0 && state.mode === 'walk') e.preventDefault();
    });
    w.addEventListener('keyup', function (e) { state.keys[e.key.toLowerCase()] = false; });

    function updateWalk(dt) {
      var sp = (state.keys['shift'] ? 4.4 : 2.6) * dt;
      var fwd = new T.Vector3(-Math.sin(state.walkYaw), 0, -Math.cos(state.walkYaw));
      var right = new T.Vector3(Math.cos(state.walkYaw), 0, -Math.sin(state.walkYaw));
      if (state.keys['w'] || state.keys['arrowup']) state.walkPos.addScaledVector(fwd, sp);
      if (state.keys['s'] || state.keys['arrowdown']) state.walkPos.addScaledVector(fwd, -sp);
      if (state.keys['a'] || state.keys['arrowleft']) state.walkPos.addScaledVector(right, -sp);
      if (state.keys['d'] || state.keys['arrowright']) state.walkPos.addScaledVector(right, sp);
      var lim = { x: ROOM.w / 2 - 0.5, z: ROOM.d / 2 - 0.5 };
      state.walkPos.x = Math.max(-lim.x, Math.min(lim.x, state.walkPos.x));
      state.walkPos.z = Math.max(-lim.z, Math.min(lim.z, state.walkPos.z));
      state.walkPos.y = 1.62;

      camera.position.copy(state.walkPos);
      var dir = new T.Vector3(
        -Math.sin(state.walkYaw) * Math.cos(state.walkPitch),
        Math.sin(state.walkPitch),
        -Math.cos(state.walkYaw) * Math.cos(state.walkPitch)
      );
      camera.lookAt(camera.position.clone().add(dir));
      orbit.target.copy(camera.position.clone().add(dir.multiplyScalar(3)));
      orbit.sph.setFromVector3(camera.position.clone().sub(orbit.target));
    }

    /* -------------------------------------------------- 选中与悬停 */
    var ray = new T.Raycaster();
    var pointer = new T.Vector2();
    var hovered = null;

    function pick(ev) {
      var r = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(pointer, camera);
      var hits = ray.intersectObjects(state.hotspots, false);
      return hits.length ? hits[0].object : null;
    }

    var downPos = null;
    renderer.domElement.addEventListener('pointerdown', function (e) { downPos = { x: e.clientX, y: e.clientY }; });
    renderer.domElement.addEventListener('pointerup', function (e) {
      if (state.mode === 'tour') return;
      if (downPos && Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 6) return;
      var hit = pick(e);
      if (!hit) { clearSelect(); return; }
      var h = hit.userData.hot;
      var dev = w.LAB.devices.filter(function (x) { return x.no === h.dev; })[0];
      if (!dev) return;
      clearSelect();
      hit.material.opacity = 0.16;
      hit.material.color.set(0xfbbf24);
      hit.material.needsUpdate = true;
      state.selected = hit;
      state.onSelect(dev, h);
    });
    renderer.domElement.addEventListener('pointermove', function (e) {
      if (state.mode === 'tour') return;
      var hit = pick(e);
      if (hovered && hovered !== hit) {
        if (hovered !== state.selected) shownNormal(hovered);
        hovered = null;
      }
      if (hit && hit !== state.selected) {
        hovered = hit;
        hit.material.opacity = 0.1;
        hit.material.color.set(0x67e8f9);
        renderer.domElement.style.cursor = 'pointer';
      } else if (!hit) {
        renderer.domElement.style.cursor = state.mode === 'walk' ? 'crosshair' : 'grab';
      }
    });
    function shownNormal(m) {
      m.material.opacity = 0;
      m.material.color.set(0x22d3ee);
    }
    function clearSelect() {
      if (state.selected) shownNormal(state.selected);
      state.selected = null;
    }

    /* -------------------------------------------------- 尺寸自适应 */
    function resize() {
      var wd = container.clientWidth || 800, ht = container.clientHeight || 500;
      renderer.setSize(wd, ht, false);
      camera.aspect = wd / ht;
      camera.updateProjectionMatrix();
    }
    w.addEventListener('resize', resize);
    resize();

    /* -------------------------------------------------- 渲染循环 */
    var t0 = performance.now();
    function loop() {
      var dt = Math.min(0.05, state.clock.getDelta());
      var t = (performance.now() - t0) / 1000;

      if (state.mode === 'walk') {
        updateWalk(dt);
      } else if (state.mode === 'tour') {
        state.tourT = (state.tourT + dt / TOUR_TIME) % 1;
        var p = tourCurve.getPointAt(state.tourT);
        var l = tourLookCurve.getPointAt(state.tourT);
        camera.position.copy(p);
        camera.lookAt(l);
      } else {
        orbit.update();
      }

      /* 标签随距离显隐 */
      state.labels.forEach(function (l) {
        l.visible = state.showLabels && (l.userData.primary || camera.position.distanceTo(l.userData.anchor) < 8.5);
      });
      /* 灯珠闪烁 */
      if (room.userData.updateCull) room.userData.updateCull(camera);
      if (room.userData.leds) {
        room.userData.leds.forEach(function (led, i) {
          led.material.emissiveIntensity = 0.9 + Math.abs(Math.sin(t * 3 + i)) * 1.6;
        });
      }
      if (room.userData.acPanel) {
        room.userData.acPanel.material.emissiveIntensity = 0.55 + Math.abs(Math.sin(t * 1.6)) * 0.6;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    loop();

    /* -------------------------------------------------- 对外 API */
    return {
      scene: scene, camera: camera, renderer: renderer, orbit: orbit, state: state,
      presets: presets, flyTo: flyTo, setMode: setMode,
      toggleLabels: function (v) {
        state.showLabels = v == null ? !state.showLabels : v;
        state.labels.forEach(function (l) {
          l.visible = state.showLabels && (l.userData.primary || camera.position.distanceTo(l.userData.anchor) < 8.5);
        });
        return state.showLabels;
      },
      startTour: function () {
        state.mode = 'tour';
        orbit.enabled = false;
        state.tourT = 0;
        clearSelect();
        if (opts.onMode) opts.onMode('tour');
      },
      stopTour: function () {
        state.mode = 'orbit';
        orbit.enabled = true;
        orbit.set(camera.position.clone(), new T.Vector3(0, 1, 0));
        if (opts.onMode) opts.onMode('orbit');
      },
      focusSeat: function (n) {
        var s = (state.seatMapQuery ? state.seatMapQuery(n) : null);
        if (s) flyTo({ pos: new T.Vector3(s.x + 1.2, 1.6, s.z + 1.6), target: new T.Vector3(s.x, 1.0, s.z) });
      },
      getCamera: function () { return camera; }
    };
  }

  w.Scene3D = { init: init, ROOM: ROOM };
})(window);