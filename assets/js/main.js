(function () {
  'use strict';

  var C = window.INSUP_NIGHT || {};
  var WEEK_JA = ['日', '月', '火', '水', '木', '金', '土'];
  var WEEK_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- 日付 ---------- */
  function parseDate(str) {
    var m = String(str).match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  var today = new Date(); today.setHours(0, 0, 0, 0);

  var dates = (C.dates || []).map(parseDate).filter(Boolean).sort(function (a, b) { return a - b; });
  var upcoming = dates.filter(function (d) { return d >= today; });
  var next = upcoming[0] || null;

  // 見出しの「◯年◯月」：設定された日付の月（なければ今月）
  var base = dates[0] || today;
  $$('.js-month-label').forEach(function (el) {
    el.textContent = base.getFullYear() + '年' + (base.getMonth() + 1) + '月';
  });

  // 次回開催
  $$('.js-next-date').forEach(function (el) {
    if (!next) { el.textContent = '近日公開'; return; }
    if (el.closest('.hero__next')) {
      el.innerHTML = '<b>' + (next.getMonth() + 1) + '.' + next.getDate() + '</b><small>' + WEEK_EN[next.getDay()] + '</small>';
    } else {
      el.textContent = (next.getMonth() + 1) + '月' + next.getDate() + '日（' + WEEK_JA[next.getDay()] + '）';
    }
  });

  // 開催日リスト
  $$('.js-date-list').forEach(function (ul) {
    if (!dates.length) {
      ul.innerHTML = '<li class="date-item date-item--empty">開催日は近日公開予定です</li>';
      return;
    }
    ul.innerHTML = dates.map(function (d) {
      var done = d < today;
      return '<li class="date-item' + (done ? ' is-done' : '') + '">' +
        '<span class="date-item__day"><b>' + (d.getMonth() + 1) + '/' + d.getDate() + '</b>（' + WEEK_JA[d.getDay()] + '）</span>' +
        '<span class="date-item__time">22:00〜24:00</span>' +
        '<span class="date-item__status">' + (done ? '開催終了' : '受付中') + '</span>' +
        '</li>';
    }).join('');
  });

  $$('.js-regular').forEach(function (el) { el.textContent = C.regularSchedule || ''; });

  // キャンセル規定（空欄なら非表示）
  var cancel = $('.js-cancel');
  if (cancel && C.cancelPolicy) {
    cancel.textContent = '※' + C.cancelPolicy.replace(/^※/, '');
    cancel.hidden = false;
  }

  // メンバー
  var mList = $('.js-members');
  if (mList && C.members) {
    mList.innerHTML = C.members.map(function (m, i) {
      return '<li class="member reveal" style="--d:' + (i * 0.1) + 's">' +
        '<div class="member__photo"><img src="' + esc(m.photo) + '" alt="' + esc(m.name) + '" loading="lazy" width="400" height="400"></div>' +
        '<p class="member__role">' + esc(m.role) + '</p>' +
        '<p class="member__name">' + esc(m.name) + '</p>' +
        '<p class="member__comment">' + esc(m.comment) + '</p>' +
        '</li>';
    }).join('');
  }

  /* ---------- toast ---------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-show'); }, 2800);
  }

  /* ---------- 申込ボタン ---------- */
  $$('.js-apply').forEach(function (a) {
    if (C.formUrl) {
      a.setAttribute('href', C.formUrl);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    } else {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        toast('申込フォームは現在準備中です');
      });
    }
  });

  /* ---------- モーダル ---------- */
  var modal = $('#dates-modal');
  var lastFocus = null;
  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    document.body.classList.add('is-locked');
    var btn = $('.modal__close', modal); if (btn) btn.focus();
  }
  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(function () { modal.hidden = true; }, 250);
    if (lastFocus) lastFocus.focus();
  }
  $$('.js-open-dates').forEach(function (b) { b.addEventListener('click', openModal); });
  $$('.js-close-modal').forEach(function (b) { b.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  /* ---------- 画像を保存 ---------- */
  var saveBtn = $('.js-save-image');
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      var url = C.storyImage || 'assets/img/insup-night-flyer.jpg';
      var name = C.storyImageFileName || 'insup-night.jpg';
      saveBtn.disabled = true;
      fetch(url).then(function (r) {
        if (!r.ok) throw new Error('fetch failed');
        return r.blob();
      }).then(function (blob) {
        var file = new File([blob], name, { type: blob.type || 'image/jpeg' });
        var isTouch = window.matchMedia('(pointer: coarse)').matches;
        // スマホ：共有シートから「画像を保存」
        if (isTouch && navigator.canShare && navigator.canShare({ files: [file] })) {
          return navigator.share({ files: [file] }).catch(function (err) {
            if (err && err.name === 'AbortError') return;
            downloadBlob(blob, name);
          });
        }
        downloadBlob(blob, name);
        toast('画像を保存しました');
      }).catch(function () {
        // 取得できない環境では画像を新しいタブで開く（長押しで保存）
        window.open(url, '_blank');
        toast('画像を長押しして保存してください');
      }).then(function () { saveBtn.disabled = false; });
    });
  }
  function downloadBlob(blob, name) {
    var a = document.createElement('a');
    var href = URL.createObjectURL(blob);
    a.href = href; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(href); }, 4000);
  }

  /* ---------- スクロール演出 ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1000円 カウントアップ ---------- */
  $$('.js-count').forEach(function (el) {
    var to = +el.getAttribute('data-to') || 0;
    if (reduce || !window.requestAnimationFrame) { el.textContent = to; return; }
    var dur = 1100, delay = 150, t0 = null;
    el.textContent = '0';
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, Math.max(0, (t - t0 - delay) / dur));
      var e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 「こんな気持ち」背景の Q/A マーク：スクロール連動 ---------- */
  var qaBg = $('.js-qa-bg');
  if (qaBg) {
    var qaSec = qaBg.parentNode;
    var qaMarks = $$('.qa', qaBg);
    if ('IntersectionObserver' in window && !reduce) {
      var qaIo = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { qaBg.classList.add('is-in'); qaIo.disconnect(); }
      }, { threshold: 0.1 });
      qaIo.observe(qaSec);
    } else {
      qaBg.classList.add('is-in');
    }
    if (!reduce) {
      var qaTicking = false;
      var moveQa = function () {
        qaTicking = false;
        var r = qaSec.getBoundingClientRect();
        var vh = window.innerHeight;
        if (r.bottom < -200 || r.top > vh + 200) return;
        // セクションが画面を通過する進み具合（-0.5 〜 0.5）
        var p = (vh - r.top) / (vh + r.height) - 0.5;
        var dist = Math.min(520, vh * 0.7);
        qaMarks.forEach(function (m) {
          var sp = +m.getAttribute('data-speed') || 0;
          var rot = +m.getAttribute('data-rot') || 0;
          m.style.transform = 'translate3d(0,' + (p * sp * dist).toFixed(1) + 'px,0) rotate(' + (p * rot * 2).toFixed(1) + 'deg)';
        });
      };
      var onQaScroll = function () {
        if (!qaTicking) { qaTicking = true; requestAnimationFrame(moveQa); }
      };
      window.addEventListener('scroll', onQaScroll, { passive: true });
      window.addEventListener('resize', onQaScroll);
      moveQa();
    }
  }

  /* ---------- ヘッダー & 追従CTA ---------- */
  var header = $('#header');
  var sticky = $('#sticky-cta');
  var heroCta = $('#hero-cta');
  var finalSec = $('#apply');
  var pastHero = false, atFinal = false;

  function updateSticky() {
    var show = pastHero && !atFinal;
    sticky.classList.toggle('is-show', show);
    sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
    $$('a, button', sticky).forEach(function (el) { el.tabIndex = show ? 0 : -1; });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      pastHero = !en[0].isIntersecting && en[0].boundingClientRect.top < 0;
      updateSticky();
    }).observe(heroCta);
    new IntersectionObserver(function (en) {
      atFinal = en[0].isIntersecting;
      updateSticky();
    }, { threshold: 0.15 }).observe(finalSec);
  }
  window.addEventListener('scroll', function () {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });
})();
