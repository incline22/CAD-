/* ==========================================================================
   floorplan.js —— 机房平面布置图（SVG，按 1:1 工位逻辑生成）
   4+1 列 × 8 排 = 40 个学生工位，前端讲台与投影，后端机柜与绘图仪
   ========================================================================== */
(function (w) {
  'use strict';

  function drawFloorplan(mount) {
    if (!mount) return;

    var W = 480, H = 330;
    var room = { x: 18, y: 26, w: 444, h: 268 };
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">';

    // 背景与网格
    svg += '<defs>' +
      '<pattern id="fpGrid" width="12" height="12" patternUnits="userSpaceOnUse">' +
        '<path d="M12 0 L0 0 0 12" fill="none" stroke="rgba(94,209,255,.10)" stroke-width=".6"/>' +
      '</pattern>' +
      '<linearGradient id="fpDesk" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#1d4b6b"/><stop offset="1" stop-color="#12324a"/>' +
      '</linearGradient>' +
    '</defs>';
    svg += '<rect width="' + W + '" height="' + H + '" fill="#060d18"/>';
    svg += '<rect x="' + room.x + '" y="' + room.y + '" width="' + room.w + '" height="' + room.h + '" fill="url(#fpGrid)"/>';

    // 墙体
    svg += '<rect x="' + room.x + '" y="' + room.y + '" width="' + room.w + '" height="' + room.h + '" fill="none" stroke="#2c7296" stroke-width="2.4"/>';

    // 窗（上墙）
    for (var wx = 60; wx < 430; wx += 74) {
      svg += '<rect x="' + wx + '" y="' + (room.y - 3) + '" width="52" height="5" rx="1.5" fill="#22d3ee" opacity=".55"/>';
    }
    // 门（下墙）
    svg += '<rect x="206" y="' + (room.y + room.h - 2) + '" width="58" height="6" rx="2" fill="#fbbf24" opacity=".85"/>';
    svg += '<text x="235" y="' + (room.y + room.h + 18) + '" font-size="9" fill="#fbbf24" text-anchor="middle" font-family="sans-serif">入口门</text>';

    // 讲台（前端中央）
    svg += '<rect x="196" y="40" width="88" height="26" rx="4" fill="#1b4a68" stroke="#48a3c4" stroke-width="1.2"/>';
    svg += '<text x="240" y="57" font-size="9.5" fill="#9fe8ff" text-anchor="middle" font-family="sans-serif">讲台 · 教师机</text>';

    // 投影幕 / 白板（上墙）
    svg += '<rect x="318" y="31" width="96" height="7" rx="2" fill="#22d3ee" opacity=".75"/>';
    svg += '<text x="366" y="46" font-size="8" fill="#67e8f9" text-anchor="middle" font-family="sans-serif">投影幕 150″</text>';
    svg += '<rect x="60" y="31" width="96" height="7" rx="2" fill="#8b5cf6" opacity=".75"/>';
    svg += '<text x="108" y="46" font-size="8" fill="#c4b5fd" text-anchor="middle" font-family="sans-serif">交互式智能平板</text>';

    // 学生工位：5 列 × 8 排
    var cols = [34, 118, 202, 286, 370];
    var rows = [82, 104, 126, 148, 170, 192, 214, 236];
    var seat = 0;
    for (var r = 0; r < rows.length; r++) {
      for (var c2 = 0; c2 < cols.length; c2++) {
        var x = cols[c2], y = rows[r];
        seat++;
        svg += '<g class="fp-seat" data-seat="' + seat + '" style="cursor:pointer">' +
          '<rect x="' + x + '" y="' + y + '" width="52" height="16" rx="2.5" fill="url(#fpDesk)" stroke="#2c7296" stroke-width=".8"/>' +
          '<rect x="' + (x + 14) + '" y="' + (y + 3) + '" width="24" height="9" rx="1" fill="#0b2a44" stroke="#22d3ee" stroke-width=".6" opacity=".9"/>' +
          '<circle cx="' + (x + 26) + '" cy="' + (y + 21) + '" r="3.4" fill="none" stroke="#8ea6c6" stroke-width=".8" opacity=".7"/>' +
        '</g>';
      }
    }

    // 右墙：精密空调
    svg += '<rect x="' + (room.x + room.w - 26) + '" y="150" width="20" height="42" rx="3" fill="#1b4a68" stroke="#48a3c4" stroke-width="1"/>';
    svg += '<text x="' + (room.x + room.w - 16) + '" y="175" font-size="7.5" fill="#9fe8ff" text-anchor="middle" transform="rotate(-90 ' + (room.x + room.w - 16) + ' 175)" font-family="sans-serif">精密空调</text>';

    // 下区：机柜 / 绘图仪 / 灭火器
    svg += '<rect x="60" y="262" width="52" height="22" rx="3" fill="#123049" stroke="#22d3ee" stroke-width="1"/>';
    svg += '<text x="86" y="276" font-size="8" fill="#9fe8ff" text-anchor="middle" font-family="sans-serif">网络机柜</text>';

    svg += '<rect x="132" y="262" width="60" height="22" rx="3" fill="#123049" stroke="#22d3ee" stroke-width="1"/>';
    svg += '<text x="162" y="276" font-size="8" fill="#9fe8ff" text-anchor="middle" font-family="sans-serif">绘图仪</text>';

    svg += '<rect x="300" y="262" width="44" height="22" rx="3" fill="#123049" stroke="#f87171" stroke-width="1"/>';
    svg += '<text x="322" y="276" font-size="8" fill="#fca5a5" text-anchor="middle" font-family="sans-serif">灭火器</text>';

    svg += '<rect x="360" y="262" width="56" height="22" rx="3" fill="#123049" stroke="#fbbf24" stroke-width="1"/>';
    svg += '<text x="388" y="276" font-size="8" fill="#fcd34d" text-anchor="middle" font-family="sans-serif">配电箱</text>';

    // 过道标注
    svg += '<text x="' + (room.x + 4) + '" y="' + (room.y + room.h - 8) + '" font-size="8" fill="#5d7699" font-family="sans-serif">工作室 5 列×8 排 · 40 工位</text>';
    svg += '<text x="' + (room.x + room.w - 68) + '" y="' + (room.y + room.h - 6) + '" font-size="8" fill="#5d7699" font-family="sans-serif">A-305 · 118㎡</text>';

    // 比例尺
    svg += '<g transform="translate(24,' + (H - 8) + ')">' +
      '<line x1="0" y1="0" x2="60" y2="0" stroke="#5d7699" stroke-width="1.6"/>' +
      '<line x1="0" y1="-3" x2="0" y2="3" stroke="#5d7699" stroke-width="1.6"/>' +
      '<line x1="60" y1="-3" x2="60" y2="3" stroke="#5d7699" stroke-width="1.6"/>' +
      '<text x="64" y="3" font-size="8" fill="#5d7699" font-family="sans-serif">约 6m</text></g>';

    svg += '</svg>';
    mount.innerHTML = svg;

    // 悬停座位号 → 跳三维
    var g = mount.querySelectorAll('.fp-seat');
    Array.prototype.forEach.call(g, function (el) {
      el.addEventListener('mouseenter', function () { el.style.filter = 'brightness(1.45)'; });
      el.addEventListener('mouseleave', function () { el.style.filter = ''; });
      el.addEventListener('click', function () { location.href = 'lab3d.html?seat=' + el.dataset.seat; });
    });
  }

  w.drawFloorplan = drawFloorplan;
})(window);