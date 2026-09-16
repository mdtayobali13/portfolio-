/**
 * DEDICATED INTERVIEW VAULT CONTROLLER (interview.js)
 * High-performance, zero-dependency renderer for 764+ questions
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

  // Load Data
  let interviewData = window.INTERVIEW_DATA || null;

  let currentCategory = 'dart';
  let currentLevel = 'all';
  let searchQuery = '';
  let isAllExpanded = false;

  const escapeHtml = (str) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const initVault = () => {
    if (!vaultQuestionsList) return;

    if (!interviewData) {
      fetch('assets/data/interview-data.json')
        .then(res => res.json())
        .then(data => {
          interviewData = data;
          render();
        })
        .catch(err => {
          console.error('Failed to load interview data:', err);
          vaultQuestionsList.innerHTML = `<div style="text-align:center; padding: 3rem; color: var(--color-text-secondary);">ডাটা লোড হতে সমস্যা হয়েছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন।</div>`;
        });
    } else {
      render();
    }
  };

  const render = () => {
    if (!interviewData || !interviewData[currentCategory]) {
      console.warn('Category data not found for:', currentCategory);
      return;
    }

    const catData = interviewData[currentCategory];

    // Update Header Meta
    if (activeCategoryTitle) activeCategoryTitle.textContent = catData.title;
    if (activeCategorySub) activeCategorySub.textContent = catData.sub || `${catData.count}টি প্রশ্ন ও উত্তর`;

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
      vaultResultCount.textContent = `Showing ${filtered.length} of ${catData.count} questions`;
    }

    // Handle Empty State
    if (filtered.length === 0) {
      vaultQuestionsList.innerHTML = '';
      if (vaultEmptyState) vaultEmptyState.style.display = 'block';
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

          <!-- Interview Direct Answer (Crisp, authoritative response) -->
          <div class="vault-q-punchline-preview">
            <div class="punchline-badge-row">
              <span class="punchline-badge">🎯 ইন্টারভিউ উত্তর</span>
            </div>
            <p class="punchline-text">${escapeHtml(q.short_ans || q.punchline)}</p>
          </div>

          <!-- Collapsible Body: Deep Logical Explanation, Code & Senior Pro-Tips -->
          <div class="vault-q-body">
            ${q.explain ? `
              <div class="vault-q-explain-box">
                <div class="vault-box-header">
                  <span class="vault-pill-tag logic">🧠 লজিক্যাল ব্যাখ্যা ও কাজের মেকানিজম</span>
                </div>
                <p class="vault-explain-content">${escapeHtml(q.explain)}</p>
              </div>
            ` : ''}

            ${codeHtml}

            ${q.pro_tip ? `
              <div class="vault-q-protip-box">
                <div class="vault-box-header">
                  <span class="vault-pill-tag tip">💡 ইন্টারভিউ প্রো-টিপ / ক্রস-কোয়েশ্চন নোট</span>
                </div>
                <p class="vault-protip-content">${escapeHtml(q.pro_tip)}</p>
              </div>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');

    vaultQuestionsList.innerHTML = html;
  };

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
          copyBtn.textContent = 'Copied!';
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
