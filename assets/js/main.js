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

  // 参加者の声（空欄の項目は「準備中」表示）
  var vList = $('.js-voices');
  if (vList && C.voices) {
    var silhouette = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="24" r="12"/><path d="M10 58c2-13 11-20 22-20s20 7 22 20z"/></svg>';
    vList.innerHTML = C.voices.map(function (v, i) {
      var ready = !!(v.title || v.text);
      var no = ('0' + (i + 1)).slice(-2);
      return '<li class="voice-card reveal' + (ready ? '' : ' is-soon') + '" style="--d:' + (i * 0.12) + 's">' +
        '<div class="voice-card__head">' +
          '<span class="voice-card__no">VOICE ' + no + '</span>' +
          (ready ? '' : '<span class="voice-card__soon">Coming soon</span>') +
        '</div>' +
        (v.title ? '<p class="voice-card__title">' + esc(v.title).replace(/、/g, '、<wbr>') + '</p>'
                 : (ready ? '' : '<p class="voice-card__title">インタビュー準備中</p>')) +
        '<p class="voice-card__text">' + (v.text ? esc(v.text).replace(/\n/g, '<br>') : '参加者の方へのインタビューを、近日公開予定です。<br>お楽しみに！') + '</p>' +
        '<div class="voice-card__person">' +
          '<div class="voice-card__photo">' + (v.photo ? '<img src="' + esc(v.photo) + '" alt="" loading="lazy" width="120" height="120">' : silhouette) + '</div>' +
          '<div>' +
            (v.name ? '<p class="voice-card__name">' + esc(v.name) + '</p>' : (ready ? '' : '<p class="voice-card__name">お名前</p>')) +
            (v.profile ? '<p class="voice-card__profile">' + esc(v.profile).replace(/・/g, '・<wbr>') + '</p>' : (ready ? '' : '<p class="voice-card__profile">年代・職種</p>')) +
          '</div>' +
        '</div>' +
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
  // 外部フォームURLがあればそちらへ。なければページ内の申込フォームへ移動
  $$('.js-apply').forEach(function (a) {
    if (C.formUrl) {
      a.setAttribute('href', C.formUrl);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    } else {
      a.setAttribute('href', '#entry');
    }
  });

  /* ---------- 申込フォーム ---------- */
  var form = $('.js-entry-form');
  if (form) {
    // 参加希望日：これからの開催日を選択肢に
    var dateSel = $('.js-date-select', form);
    var opts = upcoming.map(function (d) {
      var label = (d.getMonth() + 1) + '月' + d.getDate() + '日（' + WEEK_JA[d.getDay()] + '）22:00〜';
      return '<option>' + label + '</option>';
    });
    if (!opts.length) opts.push('<option>次回の開催日（決まり次第連絡がほしい）</option>');
    dateSel.insertAdjacentHTML('beforeend', opts.join(''));
    if (upcoming.length === 1) dateSel.selectedIndex = 1;

    var F = C.form || {};
    var errBox = $('.entry-form__error', form);
    var submitBtn = $('.entry-form__submit', form);
    var submitLabel = $('.js-submit-label', form);

    var checks = {
      'f-name': function (v) { return v ? '' : 'お名前を入力してください'; },
      'f-tel': function (v) {
        if (!v) return '電話番号を入力してください';
        var digits = v.replace(/[^\d０-９]/g, '');
        return digits.length >= 10 && digits.length <= 11 ? '' : '電話番号は10〜11桁の数字で入力してください';
      },
      'f-email': function (v, el) {
        if (!v) return 'メールアドレスを入力してください';
        return el.validity.typeMismatch ? 'メールアドレスの形式が正しくありません' : '';
      },
      'f-date': function (v) { return v ? '' : '参加希望日を選択してください'; }
    };
    function check(id) {
      var el = document.getElementById(id);
      var msg = checks[id](el.value.trim(), el);
      var box = document.getElementById(id + '-err');
      box.textContent = msg;
      el.closest('.field').classList.toggle('is-error', !!msg);
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) el.setAttribute('aria-describedby', id + '-err'); else el.removeAttribute('aria-describedby');
      return !msg;
    }
    Object.keys(checks).forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener('blur', function () { if (el.value) check(id); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-error')) check(id); });
      el.addEventListener('change', function () { if (el.tagName === 'SELECT') check(id); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errBox.hidden = true;
      var firstBad = null;
      Object.keys(checks).forEach(function (id) { if (!check(id) && !firstBad) firstBad = id; });
      if (firstBad) { document.getElementById(firstBad).focus(); return; }
      if (!F.to) { errBox.textContent = '送信先が設定されていません（config.js の form.to）'; errBox.hidden = false; return; }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
      if (data._honey) return; // スパム
      if (data['Instagram ID']) data['Instagram ID'] = '@' + data['Instagram ID'].replace(/^@/, '');
      Object.keys(data).forEach(function (k) { if (!data[k] && k !== '_honey') data[k] = '（未入力）'; });
      data._subject = (F.subject || '【Insup Night】参加申込') + '：' + data['お名前'] + ' 様（' + data['参加希望日'] + '）';
      data._replyto = data['メールアドレス'];
      data._template = 'table';
      data._captcha = 'false';
      if (F.cc && F.cc.length) data._cc = F.cc.join(',');

      submitBtn.disabled = true;
      submitLabel.textContent = '送信中…';
      fetch('https://formsubmit.co/ajax/' + encodeURIComponent(F.to), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          if (String(res.success) !== 'true') throw new Error(res.message || 'failed');
          form.hidden = true;
          var done = $('#entry-done');
          done.hidden = false;
          done.focus();
          done.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        })
        .catch(function () {
          errBox.textContent = '送信できませんでした。通信環境をご確認のうえ、もう一度お試しください。';
          errBox.hidden = false;
        })
        .then(function () {
          submitBtn.disabled = false;
          submitLabel.textContent = 'この内容で申し込む';
        });
    });
  }

  /* ---------- MENU（目次） ---------- */
  var menu = $('#site-menu');
  var menuBtn = $('.js-menu-open');
  var menuTimer;
  function openMenu() {
    clearTimeout(menuTimer);
    menu.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    var c = $('.menu__close', menu); if (c) c.focus();
  }
  function closeMenu(keepLock) {
    if (menu.hidden) return;
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (!keepLock) document.body.classList.remove('is-locked');
    menuTimer = setTimeout(function () { menu.hidden = true; }, 450);
  }
  if (menu && menuBtn) {
    menuBtn.addEventListener('click', openMenu);
    $$('.js-menu-close', menu).forEach(function (b) { b.addEventListener('click', function () { closeMenu(); menuBtn.focus(); }); });
    $$('.js-menu-link', menu).forEach(function (a) {
      // 開催日ボタンはモーダルが開くので、スクロールロックを残す
      a.addEventListener('click', function () { closeMenu(a.classList.contains('js-open-dates')); }, true);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { closeMenu(); menuBtn.focus(); }
    });
  }

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

  /* ---------- 10名限定：1→10 カウントアップ ---------- */
  $$('.js-ppl-count').forEach(function (el) {
    var to = +el.getAttribute('data-to') || 10;
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var cio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      cio.disconnect();
      var v = 0;
      setTimeout(function () {
        var t = setInterval(function () { v++; el.textContent = v; if (v >= to) clearInterval(t); }, 130);
      }, 350);
    }, { threshold: 0.3 });
    cio.observe(el);
  });

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
    // 最後の申込エリア・申込フォームが見えている間は追従ボタンを隠す
    var seen = {};
    var endIo = new IntersectionObserver(function (en) {
      en.forEach(function (x) { seen[x.target.id] = x.isIntersecting; });
      atFinal = !!(seen.apply || seen.entry);
      updateSticky();
    }, { threshold: 0.05 });
    endIo.observe(finalSec);
    if ($('#entry')) endIo.observe($('#entry'));
  }
  window.addEventListener('scroll', function () {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });
})();
