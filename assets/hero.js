// 첫 화면 사진 넘기기: 점을 누르면 바뀌고, 6초마다 저절로 넘어간다.
// 움직임 줄이기 설정이면 저절로 넘기지 않는다.
(function () {
  var hero = document.querySelector('[data-hero]');
  if (!hero) return;
  var slides = hero.querySelectorAll('.slide');
  var dots = hero.querySelectorAll('.dots button');
  var tag = hero.querySelector('.cap .tag');
  var name = hero.querySelector('.cap .name');
  var cur = 0, timer = null;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(i) {
    cur = (i + slides.length) % slides.length;
    for (var k = 0; k < slides.length; k++) {
      slides[k].classList.toggle('on', k === cur);
      dots[k].setAttribute('aria-current', k === cur ? 'true' : 'false');
    }
    tag.textContent = slides[cur].getAttribute('data-tag');
    name.textContent = slides[cur].getAttribute('data-name');
  }
  function start() {
    if (still || slides.length < 2) return;
    stop();
    timer = setInterval(function () { show(cur + 1); }, 6000);
  }
  function stop() { if (timer) clearInterval(timer); timer = null; }

  for (var d = 0; d < dots.length; d++) {
    (function (i) {
      dots[i].addEventListener('click', function () { show(i); start(); });
    })(d);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });
  show(0);
  start();
})();
