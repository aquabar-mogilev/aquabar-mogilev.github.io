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
