/* RECOV LAB 문의 양식 — 서버 없이 양식 전송 서비스(Web3Forms)로 보낸다.
   열쇠(access_key)는 메일 주소의 별칭이라 공개돼도 되는 값이다. 보내기가 안 되면 메일 주소를 안내한다. */
(function () {
  'use strict';
  var ENDPOINT = 'https://api.web3forms.com/submit';
  var MAIL = 'boneul_official@naver.com';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function val(form, name) {
    var f = form.elements[name];
    return f && typeof f.value === 'string' ? f.value.trim() : '';
  }
  function clearErrors(form) {
    form.querySelectorAll('.bad').forEach(function (r) { r.classList.remove('bad'); });
    form.querySelectorAll('.f-err').forEach(function (r) { r.remove(); });
  }
  function markError(field, msg) {
    var row = field.closest('.f-row, .f-agree');
    if (!row) return;
    row.classList.add('bad');
    var e = el('span', 'f-err', msg);
    e.id = 'err-' + Math.random().toString(36).slice(2, 8);
    field.setAttribute('aria-describedby', e.id);
    field.setAttribute('aria-invalid', 'true');
    row.appendChild(e);
  }
  function validate(form) {
    clearErrors(form);
    form.querySelectorAll('[aria-invalid]').forEach(function (f) { f.removeAttribute('aria-invalid'); f.removeAttribute('aria-describedby'); });
    var first = null;
    var what = form.elements['what'], email = form.elements['email'], agree = form.elements['agree'];
    if (!what.value.trim()) { markError(what, '만들고 싶은 것을 적어 주세요.'); first = first || what; }
    if (!email.value.trim()) { markError(email, '답변 받을 메일 주소를 적어 주세요.'); first = first || email; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) { markError(email, '메일 주소를 다시 확인해 주세요.'); first = first || email; }
    if (!agree.checked) { markError(agree, '동의에 표시해 주세요.'); first = first || agree; }
    if (first) first.focus();
    return !first;
  }
  function buildMessage(form) {
    var kinds = Array.prototype.filter.call(form.querySelectorAll('input[name="kind"]'), function (c) { return c.checked; })
      .map(function (c) { return c.value; });
    var lines = [
      '원하는 작업: ' + (kinds.join(', ') || '(고르지 않음)'),
      '',
      '만들고 싶은 것:',
      val(form, 'what'),
      '',
      '크기 · 수량: ' + (val(form, 'size') || '-'),
      '언제까지: ' + (val(form, 'due') || '-'),
      '참고 링크: ' + (val(form, 'ref') || '-'),
      '',
      '이름(회사): ' + (val(form, 'name') || '-'),
      '답변 받을 메일: ' + val(form, 'email'),
      '',
      '보낸 페이지: ' + location.href.split('#')[0]
    ];
    return lines.join('\n');
  }
  function done(form) {
    var box = el('div', 'ask-done');
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.appendChild(el('b', '', '보내 주셔서 감사합니다.'));
    box.appendChild(el('p', '', '내용을 확인하고 적어 주신 메일로 답변드리겠습니다. 사진이나 스케치는 그 메일에 답장으로 보내 주시면 됩니다.'));
    form.replaceWith(box);
    box.focus();
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: 'ask-sent', title: '문의 양식 보냄', event: true }); } catch (e) {}
  }
  function fail(form, btn, status) {
    btn.disabled = false; btn.textContent = btn.dataset.label;
    status.className = 'f-status err';
    status.textContent = '';
    status.appendChild(document.createTextNode('보내지 못했습니다. 잠시 뒤 다시 눌러 보시거나 '));
    var a = el('a', '', MAIL); a.href = 'mailto:' + MAIL;
    status.appendChild(a);
    status.appendChild(document.createTextNode(' 으로 보내 주세요.'));
  }

  document.querySelectorAll('form[data-ask]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    var btn = form.querySelector('button[type="submit"]');
    var status = form.querySelector('.f-status');
    btn.dataset.label = btn.textContent;

    var more = form.querySelector('.f-more'), note = form.querySelector('.f-note');
    if (more && note) {
      more.addEventListener('click', function () {
        var open = note.hasAttribute('hidden');
        if (open) note.removeAttribute('hidden'); else note.setAttribute('hidden', '');
        more.setAttribute('aria-expanded', String(open));
      });
    }
    form.addEventListener('input', function (ev) {
      var row = ev.target.closest('.bad');
      if (row) { row.classList.remove('bad'); var e = row.querySelector('.f-err'); if (e) e.remove(); }
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!validate(form)) return;
      if (form.elements['botcheck'] && form.elements['botcheck'].checked) { done(form); return; }   // 자동 프로그램이 채우는 숨은 칸
      var key = form.elements['access_key'].value;
      status.className = 'f-status'; status.textContent = '';
      if (!key || key.indexOf('__') === 0) {                 // 열쇠를 아직 넣지 않은 판
        status.className = 'f-status err';
        status.textContent = '양식이 아직 연결되지 않았습니다. ' + MAIL + ' 으로 보내 주세요.';
        return;
      }
      btn.disabled = true; btn.textContent = '보내는 중…';
      var what = val(form, 'what');
      var payload = {
        access_key: key,
        subject: '[설계 의뢰] ' + what.replace(/\s+/g, ' ').slice(0, 40),
        from_name: 'RECOV LAB 홈페이지',
        name: val(form, 'name') || '(이름 없음)',
        email: val(form, 'email'),
        replyto: val(form, 'email'),
        message: buildMessage(form)
      };
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().catch(function () { return { success: r.ok }; }); })
        .then(function (j) { if (j && j.success) done(form); else fail(form, btn, status); })
        .catch(function () { fail(form, btn, status); });
    });
  });
})();
