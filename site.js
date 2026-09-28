/* Калькулятор брони AquaBar: час стоит 50–80 BYN (по карточке сауны), считаем вилку на выбранные часы. */
(function () {
  'use strict';
  var MIN = 50, MAX = 80, MIN_H = 1, MAX_H = 12;

  function range(hours) { return { lo: hours * MIN, hi: hours * MAX }; }
  if (typeof module !== 'undefined' && module.exports) { module.exports = { range: range }; return; }

  var date = document.getElementById('c-date');
  var time = document.getElementById('c-time');
  var hoursF = document.getElementById('c-hours');
  var hoursOut = document.getElementById('c-hours-out');
  var sum = document.getElementById('c-sum');
  var sumF = document.getElementById('c-sum-f');
  if (!date || !time) return;

  // Сауна работает круглосуточно — в списке все 24 часа.
  for (var h = 0; h < 24; h++) {
    var o = document.createElement('option');
    o.textContent = (h < 10 ? '0' : '') + h + ':00';
    if (h === 18) o.selected = true;
    time.appendChild(o);
  }
  var today = new Date();
  var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  date.min = iso;
  date.value = iso;

  function word(n) { return n % 10 === 1 && n % 100 !== 11 ? 'час' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'часа' : 'часов'); }

  var dateF = document.getElementById('c-date-f');
  var DAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  function human(v) {
    var p = v.split('-');
    if (p.length !== 3) return v;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + ', ' + DAYS[d.getDay()];
  }

  function update() {
    dateF.value = human(date.value);
    var n = +hoursF.value;
    var r = range(n);
    hoursOut.textContent = n + ' ' + word(n);
    sum.textContent = r.lo + '–' + r.hi;
    sumF.value = r.lo + '–' + r.hi + ' BYN за ' + n + ' ' + word(n);
  }

  document.querySelectorAll('[data-step]').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = Math.min(MAX_H, Math.max(MIN_H, +hoursF.value + +b.getAttribute('data-step')));
      hoursF.value = n;
      update();
    });
  });
  date.addEventListener('change', update);
  update();
})();

// Рябь на «24/7»: движение мыши над первым экраном колышет воду в цифрах. В покое фильтр снят — ноль нагрузки.
(function () {
  'use strict';
  var big = document.querySelector('.hero__big');
  if (!big || !window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.innerHTML = '<filter id="ripple" x="-10%" y="-10%" width="120%" height="120%">' +
    '<feTurbulence type="fractalNoise" baseFrequency=".01 .04" numOctaves="2" seed="4"/>' +
    '<feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>';
  document.body.appendChild(svg);
  var turb = svg.querySelector('feTurbulence'), disp = svg.querySelector('feDisplacementMap');
  var power = 0, last = null, raf = 0, t = 0;

  function frame() {
    power *= 0.94; t += 0.03;
    turb.setAttribute('baseFrequency', (0.01 + 0.003 * Math.sin(t)).toFixed(4) + ' ' + (0.04 + 0.01 * Math.cos(t * 0.7)).toFixed(4));
    disp.setAttribute('scale', power.toFixed(1));
    if (power > 0.3) raf = requestAnimationFrame(frame);
    else { raf = 0; big.style.filter = ''; }
  }
  var hero = big.closest('.hero') || big;
  hero.addEventListener('pointermove', function (e) {
    if (last) power = Math.min(40, power + Math.hypot(e.clientX - last[0], e.clientY - last[1]) * 0.15);
    last = [e.clientX, e.clientY];
    if (!raf && power > 0.3) { big.style.filter = 'url(#ripple)'; raf = requestAnimationFrame(frame); }
  });
  hero.addEventListener('pointerleave', function () { last = null; });
})();
