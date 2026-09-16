/**
 * DEDICATED INTERVIEW VAULT CONTROLLER (interview.js)
 * High-performance, zero-dependency renderer with Bilingual English/Bengali Translation
 */

document.addEventListener('DOMContentLoaded', () => {
  const vaultTabs = document.getElementById('vaultTabs');
  const vaultQuestionsList = document.getElementById('vaultQuestionsList');
  const vaultSearchInput = document.getElementById('vaultSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const levelFilterPills = document.querySelectorAll('.level-pill');
  const toggleAllQuestionsBtn = document.getElementById('toggleAllQuestionsBtn');
  const toggleAllText = document.getElementById('toggleAllText');
  const activeCategoryTitle = document.getElementById('activeCategoryTitle');
  const activeCategorySub = document.getElementById('activeCategorySub');
  const vaultResultCount = document.getElementById('vaultResultCount');
  const vaultEmptyState = document.getElementById('vaultEmptyState');
  const resetSearchBtn = document.getElementById('resetSearchBtn');

  // Translation Elements
  const headerLangToggle = document.getElementById('headerLangToggle');
  const headerLangText = document.getElementById('headerLangText');
  const headerLangFlag = document.getElementById('headerLangFlag');
  const vaultHeaderCount = document.getElementById('vaultHeaderCount');
  const btnTranslateToggle = document.getElementById('btnTranslateToggle');
  const translateBtnText = document.getElementById('translateBtnText');

  // State Management
  let interviewData = window.INTERVIEW_DATA || null;
  let currentCategory = 'dart';
  let currentLevel = 'all';
  let searchQuery = '';
  let isAllExpanded = false;
  let currentLang = localStorage.getItem('vault_lang') || 'bn';

  // Comprehensive UI Dictionaries
  const UI_TEXT = {
    bn: {
      headerCount: '৭৬৪+ প্রশ্নোত্তর সংকলন',
      heroTitle: '৭৬৪+ Flutter & Dart ইন্টারভিউ প্রশ্নোত্তর',
      heroSub: '১ লাইনে মূল প্রশ্ন • এক নজরে সারসংক্ষেপ • সহজে মনে রাখার টেকনিক • ক্লিন কোড এক্সাম্পল সহ সম্পূর্ণ ইন্টারভিউ গাইড।',
      searchPlaceholder: 'প্রশ্ন বা কিওয়ার্ড সার্চ করুন (যেমন: isolate, stream, bloc, di, riverpod, gc)...',
      allLevels: 'সকল লেভেল',
      showingQuestions: (n, total) => `Showing ${n} of ${total} questions`,
      interviewAnswer: '🎯 ইন্টারভিউ উত্তর',
      logicalExplain: '🧠 লজিক্যাল ব্যাখ্যা ও কাজের মেকানিজম',
      proTip: '💡 ইন্টারভিউ প্রো-টিপ / ক্রস-কোয়েশ্চন নোট',
      emptyTitle: 'কোনো প্রশ্ন পাওয়া যায়নি',
      emptyDesc: 'অন্য কোনো কিওয়ার্ড বা টপিক দিয়ে সার্চ করে দেখুন।',
      resetBtn: 'রিসেট ফিল্টার',
      translateBtn: 'Translate to English',
      headerLang: 'English',
      headerFlag: '🇬🇧',
      copied: 'Copied!'
    },
    en: {
      headerCount: '764+ Interview Q&As',
      heroTitle: '764+ Flutter & Dart Interview Q&As',
      heroSub: '1-Line crisp answers • At-a-glance summaries • Memory retention techniques • Clean code examples.',
      searchPlaceholder: 'Search question or keyword (e.g. isolate, stream, bloc, di, riverpod, gc)...',
      allLevels: 'All Levels',
      showingQuestions: (n, total) => `Showing ${n} of ${total} questions`,
      interviewAnswer: '🎯 Interview Answer',
      logicalExplain: '🧠 Logical Explanation & Architecture',
      proTip: '💡 Interview Pro-Tip / Cross-Question Note',
      emptyTitle: 'No questions found',
      emptyDesc: 'Try searching with another keyword or reset filters.',
      resetBtn: 'Reset Filters',
      translateBtn: 'বাংলায় দেখুন',
      headerLang: 'বাংলা',
      headerFlag: '🇧🇩',
      copied: 'Copied!'
    }
  };

  const CATEGORY_NAMES_EN = {
    dart: 'Dart Programming',
    oop: 'Object-Oriented Programming (OOP)',
    flutter: 'Flutter Framework & Widgets',
    di: 'Dependency Injection (DI)',
    bloc: 'BLoC State Management',
    riverpod: 'Riverpod State Management',
    provider: 'Provider State Management',
    getx: 'GetX Reactive Architecture',
    memory: 'Memory Management & Optimization',
    firebase: 'Firebase & Cloud Services',
    version: 'Git & Flutter Developer Tools'
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Trigger Google Translate engine
  const applyGoogleTranslate = (lang) => {
    const target = lang === 'en' ? 'en' : 'bn';
    const domain = window.location.hostname;

    // Set cookie for Google Translate
    document.cookie = `googtrans=/bn/${target}; path=/;`;
    if (domain && domain !== 'localhost') {
      document.cookie = `googtrans=/bn/${target}; domain=.${domain}; path=/;`;
    }

    const select = document.querySelector('.goog-te-combo');
    if (select) {
      if (select.value !== target) {
        select.value = target;
        select.dispatchEvent(new Event('change'));
      }
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const el = document.querySelector('.goog-te-combo');
        if (el) {
          clearInterval(interval);
          el.value = target;
          el.dispatchEvent(new Event('change'));
        } else if (attempts > 25) {
          clearInterval(interval);
        }
      }, 150);
    }
  };

  // Update Page-level texts
  const updateStaticUIText = () => {
    const dict = UI_TEXT[currentLang] || UI_TEXT.bn;

    if (vaultHeaderCount) vaultHeaderCount.textContent = dict.headerCount;
    if (headerLangText) headerLangText.textContent = dict.headerLang;
    if (headerLangFlag) headerLangFlag.textContent = dict.headerFlag;
    if (translateBtnText) translateBtnText.textContent = dict.translateBtn;

    const heroTitle = document.querySelector('.vault-hero-intro .section-title');
    if (heroTitle) heroTitle.textContent = dict.heroTitle;

    const heroSub = document.querySelector('.vault-hero-intro .section-subtitle');
    if (heroSub) heroSub.textContent = dict.heroSub;

    if (vaultSearchInput) vaultSearchInput.placeholder = dict.searchPlaceholder;

    const allPill = document.querySelector('.level-pill[data-level="all"]');
    if (allPill) allPill.textContent = dict.allLevels;

    if (resetSearchBtn) resetSearchBtn.textContent = dict.resetBtn;

    // Style active toggles
    if (currentLang === 'en') {
      btnTranslateToggle?.classList.add('active');
      headerLangToggle?.classList.add('lang-en');
    } else {
      btnTranslateToggle?.classList.remove('active');
      headerLangToggle?.classList.remove('lang-en');
    }
  };

  const setLanguage = (lang) => {
    currentLang = lang;
    localStorage.setItem('vault_lang', lang);
    updateStaticUIText();
    render();
    applyGoogleTranslate(lang);
  };

  const initVault = () => {
    if (!vaultQuestionsList) return;

    updateStaticUIText();

    if (!interviewData) {
      fetch('assets/data/interview-data.json')
        .then(res => res.json())
        .then(data => {
          interviewData = data;
          render();
          if (currentLang === 'en') {
            applyGoogleTranslate('en');
          }
        })
        .catch(err => {
          console.error('Failed to load interview data:', err);
          vaultQuestionsList.innerHTML = `<div style="text-align:center; padding: 3rem; color: var(--color-text-secondary);">ডাটা লোড হতে সমস্যা হয়েছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন।</div>`;
        });
    } else {
      render();
      if (currentLang === 'en') {
        applyGoogleTranslate('en');
      }
    }
  };

  const render = () => {
    if (!interviewData || !interviewData[currentCategory]) {
      console.warn('Category data not found for:', currentCategory);
      return;
    }

    const catData = interviewData[currentCategory];
    const dict = UI_TEXT[currentLang] || UI_TEXT.bn;

    // Update Header Meta
    if (activeCategoryTitle) {
      activeCategoryTitle.textContent = currentLang === 'en' && CATEGORY_NAMES_EN[currentCategory]
        ? CATEGORY_NAMES_EN[currentCategory]
        : catData.title;
    }

    if (activeCategorySub) {
      activeCategorySub.textContent = currentLang === 'en'
        ? `${catData.count} Questions & Answers (30 Basic · 30 Intermediate · 30 Advanced)`
        : (catData.sub || `${catData.count}টি প্রশ্ন ও উত্তর`);
    }

    // Filter questions by level and search query
    const list = catData.questions || [];
    const filtered = list.filter(q => {
      if (currentLevel !== 'all' && q.level.toLowerCase() !== currentLevel.toLowerCase()) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const inQ = (q.question || '').toLowerCase().includes(query);
        const inPunch = (q.punchline || '').toLowerCase().includes(query);
        const inShort = (q.short_ans || '').toLowerCase().includes(query);
        const inMem = (q.memory_hook || '').toLowerCase().includes(query);
        const inNum = (q.num || '').includes(query);
        return inQ || inPunch || inShort || inMem || inNum;
      }
      return true;
    });

    // Update Counter
    if (vaultResultCount) {
      vaultResultCount.textContent = dict.showingQuestions(filtered.length, catData.count);
    }

    // Handle Empty State
    if (filtered.length === 0) {
      vaultQuestionsList.innerHTML = '';
      if (vaultEmptyState) {
        const emptyH3 = vaultEmptyState.querySelector('h3');
        const emptyP = vaultEmptyState.querySelector('p');
        if (emptyH3) emptyH3.textContent = dict.emptyTitle;
        if (emptyP) emptyP.textContent = dict.emptyDesc;
        vaultEmptyState.style.display = 'block';
      }
      return;
    } else {
      if (vaultEmptyState) vaultEmptyState.style.display = 'none';
    }

    // Build Cards
    const html = filtered.map((q, idx) => {
      const levelClass = (q.level || 'basic').toLowerCase();
      const levelLabel = levelClass === 'basic' ? 'Basic' : (levelClass === 'intermediate' ? 'Inter' : 'Adv');
      const expandedClass = isAllExpanded ? 'expanded' : '';

      let codeHtml = '';
      if (q.code && q.code.trim()) {
        codeHtml = `
          <div class="vault-q-code-wrapper">
            <div class="vault-code-head">
              <span class="vault-code-lang">${escapeHtml(q.code_lang || 'Dart')}</span>
              <button class="vault-code-copy-btn" data-code="${escapeHtml(q.code)}">Copy Code</button>
            </div>
            <pre><code>${escapeHtml(q.code)}</code></pre>
          </div>
        `;
      }

      return `
        <article class="vault-q-card ${expandedClass}" data-index="${idx}">
          <button class="vault-q-header" aria-expanded="${isAllExpanded ? 'true' : 'false'}">
            <div class="vault-q-title-group">
              <span class="vault-q-num">#${q.num || (idx + 1)}</span>
              <span class="vault-level-badge ${levelClass}">${levelLabel}</span>
              <span class="vault-q-text">${escapeHtml(q.question)}</span>
            </div>
            <span class="vault-q-caret">›</span>
          </button>

          <!-- Interview Direct Answer -->
          <div class="vault-q-punchline-preview">
            <div class="punchline-badge-row">
              <span class="punchline-badge">${dict.interviewAnswer}</span>
            </div>
            <p class="punchline-text">${escapeHtml(q.short_ans || q.punchline)}</p>
          </div>

          <!-- Collapsible Body -->
          <div class="vault-q-body">
            ${q.explain ? `
              <div class="vault-q-explain-box">
                <div class="vault-box-header">
                  <span class="vault-pill-tag logic">${dict.logicalExplain}</span>
                </div>
                <p class="vault-explain-content">${escapeHtml(q.explain)}</p>
              </div>
            ` : ''}

            ${codeHtml}

            ${q.pro_tip ? `
              <div class="vault-q-protip-box">
                <div class="vault-box-header">
                  <span class="vault-pill-tag tip">${dict.proTip}</span>
                </div>
                <p class="vault-protip-content">${escapeHtml(q.pro_tip)}</p>
              </div>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');

    vaultQuestionsList.innerHTML = html;

    // If English is active, ensure Google Translate updates newly rendered cards
    if (currentLang === 'en') {
      setTimeout(() => applyGoogleTranslate('en'), 80);
    }
  };

  // Toggle Language Handler
  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'bn' : 'en';
    setLanguage(nextLang);
  };

  if (headerLangToggle) {
    headerLangToggle.addEventListener('click', toggleLanguage);
  }

  if (btnTranslateToggle) {
    btnTranslateToggle.addEventListener('click', toggleLanguage);
  }

  // Event Delegation on List
  if (vaultQuestionsList) {
    vaultQuestionsList.addEventListener('click', (e) => {
      // Toggle card
      const toggleTarget = e.target.closest('.vault-q-header, .vault-q-punchline-preview');
      if (toggleTarget) {
        const card = toggleTarget.closest('.vault-q-card');
        
        if (card) {
          const isExp = card.classList.toggle('expanded');
          const headerBtn = card.querySelector('.vault-q-header');
          if (headerBtn) headerBtn.setAttribute('aria-expanded', isExp ? 'true' : 'false');
        }
        return;
      }

      // Copy code
      const copyBtn = e.target.closest('.vault-code-copy-btn');
      if (copyBtn) {
        const code = copyBtn.getAttribute('data-code') || '';
        navigator.clipboard.writeText(code).then(() => {
          const prev = copyBtn.textContent;
          copyBtn.textContent = UI_TEXT[currentLang]?.copied || 'Copied!';
          copyBtn.style.color = '#98C379';
          setTimeout(() => {
            copyBtn.textContent = prev;
            copyBtn.style.color = '';
          }, 2000);
        }).catch(err => console.error('Copy failed:', err));
      }
    });
  }

  // Tabs Click
  if (vaultTabs) {
    vaultTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.vault-tab-btn');
      if (!btn) return;

      document.querySelectorAll('.vault-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentCategory = btn.getAttribute('data-cat');
      currentLevel = 'all';
      levelFilterPills.forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-level') === 'all');
      });

      render();
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  }

  // Search Input
  let searchTimer = null;
  if (vaultSearchInput) {
    vaultSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchQuery = e.target.value.trim();

      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      }

      searchTimer = setTimeout(render, 150);
    });
  }

  // Clear Search
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (vaultSearchInput) vaultSearchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      render();
    });
  }

  // Reset Search
  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      if (vaultSearchInput) vaultSearchInput.value = '';
      searchQuery = '';
      currentLevel = 'all';
      levelFilterPills.forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-level') === 'all');
      });
      if (clearSearchBtn) clearSearchBtn.style.display = 'none';
      render();
    });
  }

  // Level Pills
  levelFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      levelFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentLevel = pill.getAttribute('data-level');
      render();
    });
  });

  // Toggle All Questions
  if (toggleAllQuestionsBtn) {
    toggleAllQuestionsBtn.addEventListener('click', () => {
      isAllExpanded = !isAllExpanded;
      if (toggleAllText) {
        toggleAllText.textContent = isAllExpanded ? 'Collapse All' : 'Expand All';
      }
      const cards = vaultQuestionsList.querySelectorAll('.vault-q-card');
      cards.forEach(card => {
        card.classList.toggle('expanded', isAllExpanded);
        const headerBtn = card.querySelector('.vault-q-header');
        if (headerBtn) headerBtn.setAttribute('aria-expanded', isAllExpanded ? 'true' : 'false');
      });
    });
  }

  // Boot vault
  initVault();
});
