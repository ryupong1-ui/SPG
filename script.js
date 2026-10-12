document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');

  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนู');
      menu.textContent = open ? '✕' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menu.textContent = '☰';
      menu.setAttribute('aria-expanded', 'false');
    }));
  }

  // Scroll reveal in multiple directions
  const revealItems = document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-zoom');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach(item => observer.observe(item));
  }

  // Scroll progress, navbar and back-to-top
  const progress = document.getElementById('scroll-progress');
  const backTop = document.getElementById('back-top');
  const navbar = document.querySelector('.navbar');
  function updateScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
    if (backTop) backTop.classList.toggle('show', window.scrollY > 450);
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 25);
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();
  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  // Spotlight follows pointer
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
    });
  });

  // Tilt effect only on devices with a fine pointer
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-5px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  // Cursor glow on desktop
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    window.addEventListener('pointermove', event => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
      glow.style.opacity = '1';
    }, { passive: true });
    document.addEventListener('pointerleave', () => { glow.style.opacity = '0'; });
  }

  // Optional count-up animation: add data-count="100" to any element
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      el.textContent = target.toLocaleString('th-TH');
      return;
    }
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const duration = 1400;
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 4))).toLocaleString('th-TH');
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    counterObserver.observe(el);
  });

  // Smooth in-page anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  // Contact form opens the visitor's email client. Set the real shop email below.
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const name = form.querySelector('[name="name"]').value.trim();
      const phone = form.querySelector('[name="phone"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const message = form.querySelector('[name="message"]').value.trim();

      // TODO: Replace with the shop's real email address before launch.
      const shopEmail = '';
      if (!shopEmail) {
        alert('แบบฟอร์มนี้ยังไม่ได้เชื่อมต่ออีเมลร้าน กรุณาเพิ่มอีเมลจริงในไฟล์ script.js ก่อนเปิดใช้งาน');
        return;
      }
      const subject = encodeURIComponent('สอบถามบริการ SpeedGas');
      const body = encodeURIComponent(`ชื่อ: ${name}\nโทรศัพท์: ${phone}\nอีเมล: ${email}\nรายละเอียด: ${message}`);
      window.location.href = `mailto:${shopEmail}?subject=${subject}&body=${body}`;
    });
  }
});

/* =========================================
   SPEEDGAS - SUNDAY CLOSED POPUP
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const isSunday = new Date().getDay() === 0;

  // แสดงเฉพาะวันอาทิตย์
  if (!isSunday) return;

  // ป้องกันการสร้าง Popup ซ้ำ
  if (document.getElementById("speedgas-closed-modal")) return;

  // สร้าง CSS สำหรับ Popup
  const style = document.createElement("style");

  style.textContent = `
    #speedgas-closed-modal {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      background: rgba(5, 20, 12, 0.72);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      animation: speedGasFadeIn .3s ease;
    }

    #speedgas-closed-modal .sg-popup {
      width: 100%;
      max-width: 430px;
      padding: 32px 26px 26px;
      border: 1px solid rgba(255,255,255,.8);
      border-radius: 28px;
      background: linear-gradient(145deg, #ffffff, #eff8f0);
      color: #173b25;
      text-align: center;
      box-shadow: 0 25px 80px rgba(0,0,0,.3);
      animation: speedGasPopIn .4s cubic-bezier(.2,.8,.2,1);
    }

    #speedgas-closed-modal .sg-icon {
      width: 78px;
      height: 78px;
      margin: 0 auto 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 24px;
      background: #e0f2e4;
      font-size: 38px;
    }

    #speedgas-closed-modal h2 {
      margin: 0 0 12px;
      font-size: 29px;
      font-weight: 800;
    }

    #speedgas-closed-modal .sg-description {
      margin: 0 0 22px;
      color: #53675a;
      line-height: 1.8;
      font-size: 15px;
    }

    #speedgas-closed-modal .sg-hours {
      padding: 15px;
      margin-bottom: 22px;
      border-radius: 16px;
      background: #e7f4e9;
      line-height: 1.9;
      font-size: 14px;
    }

    #speedgas-closed-modal .sg-button {
      width: 100%;
      padding: 15px 20px;
      border: none;
      border-radius: 14px;
      background: #16803d;
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: transform .2s ease, background .2s ease;
    }

    #speedgas-closed-modal .sg-button:hover {
      background: #106b32;
      transform: translateY(-2px);
    }

    @keyframes speedGasFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes speedGasPopIn {
      from {
        opacity: 0;
        transform: translateY(18px) scale(.94);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #speedgas-closed-modal,
      #speedgas-closed-modal .sg-popup {
        animation: none;
      }
    }
  `;

  document.head.appendChild(style);

  // สร้าง Popup
  const modal = document.createElement("div");

  modal.id = "speedgas-closed-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "sg-closed-title");

  modal.innerHTML = `
    <div class="sg-popup">
      <div class="sg-icon" aria-hidden="true">🔒</div>

      <h2 id="sg-closed-title">วันนี้ร้านปิด</h2>

      <p class="sg-description">
        ขออภัยในความไม่สะดวก<br>
        วันนี้วันอาทิตย์ ร้านสปีดแก๊สปิดให้บริการ
      </p>

      <div class="sg-hours">
        <strong>เวลาทำการปกติ</strong><br>
        วันจันทร์ – เสาร์<br>
        เวลา 07:00 – 19:00 น.<br>
        <strong>ปิดรับออเดอร์ 18:30 น.</strong>
      </div>

      <button class="sg-button" type="button">
        รับทราบ
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  // ปิดเมื่อกดปุ่มรับทราบ
  const closePopup = () => {
    modal.remove();
  };

  modal.querySelector(".sg-button")
    .addEventListener("click", closePopup);

  // ปิดเมื่อคลิกพื้นที่ด้านนอก Popup
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closePopup();
    }
  });

  // ปิดเมื่อกด Escape
  document.addEventListener("keydown", function handleEscape(event) {
    if (event.key === "Escape") {
      closePopup();
      document.removeEventListener("keydown", handleEscape);
    }
  });
});