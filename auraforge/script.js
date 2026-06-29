/* =============================================
   AURAFORGE STUDIOS — SCRIPT.JS
   ============================================= */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* =============================================
     1. CUSTOM CURSOR GLOW (DESKTOP)
  ============================================= */
  const cursorGlow = document.getElementById('cursorGlow');
  
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      // Offset by half of card width/height (250px) to center on cursor
      const x = e.clientX - 250;
      const y = e.clientY - 250;
      cursorGlow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }


  /* =============================================
     2. NAVIGATION — Sticky header + Mobile Hamburger
  ============================================= */
  const header        = document.getElementById('header');
  const hamburger     = document.getElementById('hamburger');
  const navLinks      = document.getElementById('navLinks');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const allNavLinks   = navLinks.querySelectorAll('.nav__link');

  // Sticky header class trigger on scroll
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial trigger

  // Open mobile menu drawer
  const openMenu = () => {
    hamburger.classList.add('open');
    navLinks.classList.add('mobile-open');
    mobileOverlay.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  // Close mobile menu drawer
  const closeMenu = () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('mobile-open');
    mobileOverlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('mobile-open');
    isOpen ? closeMenu() : openMenu();
  });

  mobileOverlay.addEventListener('click', closeMenu);

  // Close menu drawer when menu link items are clicked
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('mobile-open')) closeMenu();
    });
  });

  // Close menu on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
      closeMenu();
      hamburger.focus();
    }
  });


  /* =============================================
     3. ACTIVE NAV LINK HIGHLIGHT ON SCROLL
  ============================================= */
  const sections = document.querySelectorAll('section[id], footer[id]');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        allNavLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0
  });

  sections.forEach(sec => navObserver.observe(sec));


  /* =============================================
     4. BLUEPRINT CATALOG FILTER
  ============================================= */
  const filterBtns     = document.querySelectorAll('.catalog__filter');
  const blueprintCards = document.querySelectorAll('.blueprint-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filterValue = btn.getAttribute('data-filter');

      // Update active tab buttons
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter blueprint cards
      blueprintCards.forEach((card, idx) => {
        const cardCategory = card.getAttribute('data-category');
        const matches = (filterValue === 'all' || cardCategory === filterValue);

        if (matches) {
          card.classList.remove('hidden');
          // Re-trigger animate transition
          card.style.animation = 'none';
          card.offsetHeight; // reflow trigger
          card.style.animation = `fadeInUp 0.4s ${idx * 0.05}s ease both`;
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Inject fadeInUp keyframes dynamically
  if (!document.getElementById('catalogAnimKF')) {
    const style = document.createElement('style');
    style.id = 'catalogAnimKF';
    style.textContent = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }


  /* =============================================
     5. INTERACTIVE PRICING CALCULATOR
  ============================================= */
  const baseTemplateRadios = document.querySelectorAll('input[name="baseTemplate"]');
  const addonChecks        = document.querySelectorAll('.addon-check');
  const billingBtns        = document.querySelectorAll('.bill-btn');
  const oneTimeCostEl      = document.getElementById('oneTimeCost');
  const monthlyCostEl      = document.getElementById('monthlyCost');
  const planDetailsTextarea = document.getElementById('planDetails');
  const blueprintSelect    = document.getElementById('selectedBlueprint');

  let currentBilling = 'monthly'; // 'monthly' or 'annual'

  // Update calculator calculations
  const calculateTotal = () => {
    // 1. Get base template price
    let basePrice = 0;
    let selectedTemplateName = '';
    baseTemplateRadios.forEach(radio => {
      if (radio.checked) {
        basePrice = parseInt(radio.value, 10);
        selectedTemplateName = radio.getAttribute('data-name');
      }
    });

    // 2. Get addons sum
    let addonsTotal = 0;
    let selectedAddonsList = [];
    addonChecks.forEach(check => {
      if (check.checked) {
        addonsTotal += parseInt(check.value, 10);
        selectedAddonsList.push(check.getAttribute('data-name'));
      }
    });

    // 3. One-time setup cost
    const oneTimeTotal = basePrice + addonsTotal;

    // 4. Support plan monthly billing calculation
    let monthlyRate = 49;
    billingBtns.forEach(btn => {
      if (btn.classList.contains('active')) {
        monthlyRate = parseInt(btn.getAttribute('data-price'), 10);
        currentBilling = btn.getAttribute('data-billing');
      }
    });

    // Update UI numbers
    oneTimeCostEl.textContent = `$${oneTimeTotal.toLocaleString()}`;
    monthlyCostEl.textContent = `$${monthlyRate}/mo`;

    // Populate Quote description Summary inside form details textarea
    if (planDetailsTextarea) {
      const addonsText = selectedAddonsList.length > 0 ? ` + ${selectedAddonsList.join(', ')}` : '';
      const billingCycleText = currentBilling === 'annual' ? 'Annual plan (billed annually)' : 'Monthly plan';
      planDetailsTextarea.value = `Selected Package:\n- Template: ${selectedTemplateName}\n- Addons: ${selectedAddonsList.length > 0 ? selectedAddonsList.join(', ') : 'None'}\n- Support Plan: ${billingCycleText} ($${monthlyRate}/mo)\n- Total Setup: $${oneTimeTotal}`;
    }
  };

  // Attach radio and checkbox change listeners
  baseTemplateRadios.forEach(radio => radio.addEventListener('change', () => {
    calculateTotal();
    
    // Auto-update the dropdown value in contact form based on radio selection
    if (blueprintSelect) {
      const name = radio.getAttribute('data-name').toLowerCase();
      if (name.includes('savourplate')) blueprintSelect.value = 'savourplate';
      else if (name.includes('keyhaven')) blueprintSelect.value = 'keyhaven';
      else if (name.includes('pearlsmile')) blueprintSelect.value = 'pearlsmile';
      else if (name.includes('ironforge')) blueprintSelect.value = 'ironforge';
    }
  }));

  addonChecks.forEach(check => check.addEventListener('change', calculateTotal));

  // Billing buttons logic
  billingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      billingBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      calculateTotal();
    });
  });

  // Run calculation once on page load to pre-populate details
  calculateTotal();


  /* =============================================
     6. FAQ ACCORDION
  ============================================= */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-item__header');
    const body   = item.querySelector('.faq-item__body');

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other FAQs
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
          otherItem.querySelector('.faq-item__body').style.maxHeight = null;
        }
      });

      // Toggle current FAQ
      if (isOpen) {
        item.classList.remove('open');
        body.style.maxHeight = null;
      } else {
        item.classList.add('open');
        body.style.maxHeight = `${body.scrollHeight}px`;
      }
    });

    // Handle enter key accessibility
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        header.click();
      }
    });
  });


  /* =============================================
     7. FORM VALIDATION & TRANSMISSION
  ============================================= */
  const launchForm        = document.getElementById('launchForm');
  const launchFormSuccess = document.getElementById('launchFormSuccess');
  const submitBtn         = document.getElementById('submitLaunchBtn');

  if (launchForm) {
    const fields = {
      clientName:   { el: document.getElementById('clientName'),   err: document.getElementById('clientNameErr') },
      clientEmail:  { el: document.getElementById('clientEmail'),  err: document.getElementById('clientEmailErr') },
      blueprint:    { el: document.getElementById('selectedBlueprint'), err: document.getElementById('blueprintErr') },
      clientMsg:    { el: document.getElementById('clientMsg'),    err: document.getElementById('messageErr') }
    };

    const validators = {
      clientName:  (val) => val.trim().length >= 2 ? '' : 'Please enter your full name.',
      clientEmail: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? '' : 'Please enter a valid email address.',
      blueprint:   (val) => val !== '' ? '' : 'Please select a blueprint template.',
      clientMsg:   (val) => val.trim().length >= 10 ? '' : 'Please provide a project briefing details (at least 10 characters).'
    };

    const validateField = (key) => {
      const { el, err } = fields[key];
      const message = validators[key](el.value);
      err.textContent = message;
      el.classList.toggle('error', !!message);
      return !message;
    };

    // Attach blur validation listeners
    Object.keys(fields).forEach(key => {
      const { el } = fields[key];
      el.addEventListener('blur', () => validateField(key));
      el.addEventListener('input', () => {
        if (el.classList.contains('error')) validateField(key);
      });
    });

    launchForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Run all field validations
      const allValid = Object.keys(fields).every(key => validateField(key));

      if (!allValid) {
        // Focus first error field
        const firstErrorKey = Object.keys(fields).find(key => fields[key].el.classList.contains('error'));
        if (firstErrorKey) fields[firstErrorKey].el.focus();
        return;
      }

      // Disable button, show progress indicator
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'Transmitting…';
      submitBtn.style.opacity = '0.7';

      // Transmit form data to Formspree email service
      fetch('https://formspree.io/f/mwvdqvrl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: fields.clientName.el.value,
          email: fields.clientEmail.el.value,
          company: document.getElementById('companyName').value,
          blueprint: fields.blueprint.el.value,
          packageSummary: planDetailsTextarea.value,
          message: fields.clientMsg.el.value
        })
      })
      .then(res => {
        if (res.ok) {
          launchForm.hidden = true;
          launchFormSuccess.hidden = false;
          launchFormSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          res.json().then(data => {
            alert(data.errors ? data.errors.map(err => err.message).join(', ') : 'Oops! There was an issue processing your submission.');
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').textContent = 'Transmit Request';
            submitBtn.style.opacity = '1';
          });
        }
      })
      .catch(() => {
        alert('Oops! There was a network issue submitting your request. Please try again.');
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Transmit Request';
        submitBtn.style.opacity = '1';
      });
    });
  }


  /* =============================================
     8. SCROLL REVEAL OBSERVER
  ============================================= */
  const revealEls = document.querySelectorAll('.feature-card, .blueprint-card, .trustpoint, .faq-item');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    revealEls.forEach((el, index) => {
      el.classList.add('reveal');
      // Stagger transitions in grid cards
      if (el.classList.contains('feature-card') || el.classList.contains('blueprint-card')) {
        el.style.transitionDelay = `${(index % 2) * 0.08}s`;
      }
      revealObserver.observe(el);
    });

    // Also animate section titles
    document.querySelectorAll('.section-header, .calculator__info, .contact__info').forEach(el => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  } else {
    // Fallback: make everything visible directly
    revealEls.forEach(el => el.classList.add('visible'));
  }


  /* =============================================
     9. AUTO-UPDATE FOOTER YEAR
  ============================================= */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

}); // end DOMContentLoaded
