// 첫 화면 사진 넘기기: 줄을 누르면 바뀌고, 6초마다 저절로 넘어간다.
// 사진을 누르면 그 작업의 상세 페이지로 간다.
// 움직임 줄이기 설정이면 저절로 넘기지 않는다.
(function () {
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = hero.querySelectorAll('.slide');
    var dots = hero.querySelectorAll('.dots button');
    var count = hero.querySelector('.cap .count');
    var tag = hero.querySelector('.cap .tag');
    var name = hero.querySelector('.cap .name');
    var cur = 0, timer = null;
    var two = function (n) { return (n < 10 ? '0' : '') + n; };

    var show = function (i) {
      cur = (i + slides.length) % slides.length;
      for (var k = 0; k < slides.length; k++) {
        slides[k].classList.toggle('on', k === cur);
        slides[k].tabIndex = k === cur ? 0 : -1;
        if (dots[k]) dots[k].setAttribute('aria-current', k === cur ? 'true' : 'false');
      }
      if (count) count.textContent = two(cur + 1) + ' / ' + two(slides.length);
      if (tag) tag.textContent = slides[cur].getAttribute('data-tag');
      if (name) name.textContent = slides[cur].getAttribute('data-name');
    };
    var stop = function () { if (timer) clearInterval(timer); timer = null; };
    var start = function () {
      if (still || slides.length < 2) return;
      stop();
      timer = setInterval(function () { show(cur + 1); }, 6000);
    };

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
  }

  // 아래 구역은 화면에 들어올 때 한 번 떠오른다. 스크립트가 없거나 오래된 브라우저면 그냥 보인다.
  var items = document.querySelectorAll('.rv');
  if (!items.length || still || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-reveal');
  var io = new IntersectionObserver(function (entries) {
    for (var e = 0; e < entries.length; e++) {
      if (entries[e].isIntersecting) { entries[e].target.classList.add('in'); io.unobserve(entries[e].target); }
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  for (var r = 0; r < items.length; r++) io.observe(items[r]);
})();
