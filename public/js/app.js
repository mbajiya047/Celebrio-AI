/**
 * @fileoverview Celebrio AI - Primary Frontend Application Controller
 * Handles state synchronization, responsive view rendering, ARIA tab management, and DOM bindings.
 * @module app
 */

/** @type {Array<import('../../types').EventPlan>} */
let allEvents = [];
/** @type {import('../../types').EventPlan|null} */
let activeEvent = null;
/** @type {Array<{role: string, text: string}>} */
let chatHistory = [];

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  loadEventsFromStorage();
  initEventListeners();
  initModals();
  renderApp();
});

/**
 * Loads persisted events from browser localStorage or initializes with default showcase events.
 */
function loadEventsFromStorage() {
  const saved = localStorage.getItem('celebrio_events');
  if (saved) {
    try {
      allEvents = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved events:', e);
      allEvents = [...SAMPLE_EVENTS];
    }
  } else {
    allEvents = [...SAMPLE_EVENTS];
    saveEventsToStorage();
  }

  const savedActiveId = localStorage.getItem('celebrio_active_event_id');
  activeEvent = allEvents.find(e => e.id === savedActiveId) || allEvents[0];
}

function saveEventsToStorage() {
  localStorage.setItem('celebrio_events', JSON.stringify(allEvents));
  if (activeEvent) {
    localStorage.setItem('celebrio_active_event_id', activeEvent.id);
  }
}

// Master Render
function renderApp() {
  if (!activeEvent) return;

  renderEventSelector();
  renderHeroAndMetrics();
  renderOverviewTab();
  renderBudgetTab();
  renderTimelineTab();
  renderVendorTab();
  renderCreativeTab();
}

// Render Event Selector Dropdown in Header
function renderEventSelector() {
  const select = document.getElementById('event-select');
  select.innerHTML = '';

  allEvents.forEach(evt => {
    const opt = document.createElement('option');
    opt.value = evt.id;
    opt.textContent = `${getEventTypeIcon(evt.summary.eventType)} ${evt.summary.title}`;
    if (evt.id === activeEvent.id) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

function getEventTypeIcon(type) {
  switch (type?.toLowerCase()) {
    case 'wedding': return '💍';
    case 'birthday': return '🎂';
    case 'community': return '🌳';
    case 'corporate': return '💼';
    case 'anniversary': return '🥂';
    default: return '🎉';
  }
}

// Render Hero Banner & 4 Key Metrics
function renderHeroAndMetrics() {
  const summary = activeEvent.summary || {};
  const budget = activeEvent.budget || {};
  const milestones = activeEvent.timelineMilestones || [];
  const vendors = activeEvent.vendors || [];

  // Hero Fields
  document.getElementById('hero-type').textContent = `${getEventTypeIcon(summary.eventType)} ${summary.eventType || 'Celebration'}`;
  document.getElementById('hero-title').textContent = summary.title || 'Untitled Event';
  document.getElementById('hero-tagline').textContent = summary.tagline || summary.aesthetic || '';
  document.getElementById('hero-date').textContent = formatDate(summary.eventDate);
  document.getElementById('hero-location').textContent = summary.location || 'Venue TBD';
  document.getElementById('hero-guests').textContent = `${summary.guestCount || 0} Guests`;
  document.getElementById('hero-budget').textContent = `${summary.currency || '$'}${formatNumber(summary.budgetTotal || budget.total || 0)} Total Budget`;

  // Countdown Calculation
  const daysLeft = calculateDaysRemaining(summary.eventDate);
  const countdownText = daysLeft >= 0 ? `${daysLeft} Days` : 'Celebrated 🎉';
  document.getElementById('hero-countdown').textContent = countdownText;
  document.getElementById('metric-countdown').textContent = countdownText;
  document.getElementById('metric-date-sub').textContent = formatDate(summary.eventDate);

  // Budget Metric
  const totalAllocated = budget.total || summary.budgetTotal || 0;
  const totalSpent = (budget.categories || []).reduce((sum, c) => sum + (c.spent || c.allocated || 0), 0);
  const spentPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  document.getElementById('metric-budget-spent').textContent = `${summary.currency || '$'}${formatNumber(totalSpent)}`;
  document.getElementById('metric-budget-percent').textContent = `${spentPct}% of ${summary.currency || '$'}${formatNumber(totalAllocated)} budget allocated`;

  // Milestones Metric
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.done).length;
  const milestonePct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  document.getElementById('metric-milestones-progress').textContent = `${milestonePct}%`;
  document.getElementById('metric-milestones-count').textContent = `${completedMilestones} of ${totalMilestones} tasks completed`;

  // Vendors Metric
  const confirmedVendors = vendors.filter(v => v.status === 'Contracted' || v.status === 'Paid').length;
  document.getElementById('metric-vendors-count').textContent = `${confirmedVendors} / ${vendors.length}`;
}

// TAB 1: Overview & Moodboard
function renderOverviewTab() {
  const theme = activeEvent.theme || {};
  const summary = activeEvent.summary || {};

  document.getElementById('overview-theme-concept-badge').textContent = theme.conceptName || 'Theme';
  document.getElementById('overview-theme-desc').textContent = theme.description || summary.aesthetic || 'No description provided.';
  document.getElementById('overview-vision-statement').textContent = `"${summary.keyVision || theme.description || 'Creating an unforgettable celebration.'}"`;

  // Color Palette
  const paletteContainer = document.getElementById('overview-palette-container');
  paletteContainer.innerHTML = '';
  (theme.colorPalette || []).forEach(color => {
    const box = document.createElement('div');
    box.className = 'swatch-box';
    box.setAttribute('role', 'button');
    box.setAttribute('tabindex', '0');
    box.setAttribute('aria-label', `Color ${color.name}, hex code ${color.hex}. Press Enter or click to copy.`);
    box.title = `Click to copy ${color.hex}: ${color.usage || ''}`;
    box.innerHTML = `
      <div class="swatch-color" style="background-color: ${color.hex};"></div>
      <div class="swatch-info">
        <div class="swatch-name">${color.name}</div>
        <div class="swatch-hex">${color.hex}</div>
      </div>
    `;

    const copyColor = () => {
      navigator.clipboard.writeText(color.hex);
      showToast(`Copied ${color.hex} (${color.name}) to clipboard!`);
    };

    box.addEventListener('click', copyColor);
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        copyColor();
      }
    });

    paletteContainer.appendChild(box);
  });

  // Signature Drink
  const drink = theme.signatureDrink || {};
  document.getElementById('overview-drink-name').textContent = drink.name || 'Signature Cocktail';
  document.getElementById('overview-drink-recipe').textContent = drink.recipe || 'Custom mix created for your guests.';
  document.getElementById('overview-drink-mocktail').textContent = drink.mocktailAlternative 
    ? `🌱 Mocktail Alternative: ${drink.mocktailAlternative}`
    : 'Mocktail alternative available upon request.';

  // Decor Highlights
  const decorList = document.getElementById('overview-decor-list');
  decorList.innerHTML = '';
  (theme.decorHighlights || []).forEach(highlight => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.alignItems = 'flex-start';
    li.style.gap = '0.5rem';
    li.innerHTML = `<span style="color: var(--primary);">✦</span> <span>${highlight}</span>`;
    decorList.appendChild(li);
  });

  // Music Vibe
  document.getElementById('overview-music-vibe').textContent = theme.musicVibe || 'Curated ambient & celebration soundtrack.';
}

// TAB 2: Budget & Expenses
function renderBudgetTab() {
  const budget = activeEvent.budget || {};
  const categories = budget.categories || [];
  const currency = activeEvent.summary?.currency || '$';
  const totalBudget = budget.total || activeEvent.summary?.budgetTotal || 0;

  // Visual Multi-segment Progress Bar
  const progressBar = document.getElementById('budget-progress-bar');
  progressBar.innerHTML = '';

  const paletteColors = [
    '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', 
    '#8b5cf6', '#f97316', '#14b8a6', '#e11d48', '#84cc16'
  ];

  categories.forEach((cat, idx) => {
    const pct = totalBudget > 0 ? ((cat.allocated / totalBudget) * 100).toFixed(1) : 0;
    const seg = document.createElement('div');
    seg.className = 'budget-bar-segment';
    seg.style.width = `${pct}%`;
    seg.style.backgroundColor = paletteColors[idx % paletteColors.length];
    seg.title = `${cat.name}: ${currency}${formatNumber(cat.allocated)} (${pct}%)`;
    progressBar.appendChild(seg);
  });

  // Budget Table
  const tbody = document.getElementById('budget-table-body');
  tbody.innerHTML = '';

  categories.forEach((cat, idx) => {
    const tr = document.createElement('tr');
    const spent = cat.spent !== undefined ? cat.spent : cat.allocated;
    const sharePct = totalBudget > 0 ? Math.round((cat.allocated / totalBudget) * 100) : 0;

    tr.innerHTML = `
      <td>
        <div class="budget-category-name">${cat.name}</div>
        <div class="budget-category-notes">${cat.notes || ''}</div>
      </td>
      <td><strong>${currency}${formatNumber(cat.allocated)}</strong></td>
      <td>
        <input type="number" class="form-input" style="width: 110px; padding: 0.35rem 0.6rem; font-size: 0.85rem;" 
               value="${spent}" data-cat-idx="${idx}" onchange="updateCategorySpent(${idx}, this.value)">
      </td>
      <td><span class="badge" style="background: var(--bg-card-subtle); color: var(--text-main);">${sharePct}%</span></td>
      <td>
        <div>${cat.notes || 'Allocated fund'}</div>
        ${cat.savingTip ? `<span class="budget-tip-pill">💡 ${cat.savingTip}</span>` : ''}
      </td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="removeBudgetCategory(${idx})" title="Remove Category">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateCategorySpent(idx, value) {
  if (activeEvent?.budget?.categories?.[idx]) {
    activeEvent.budget.categories[idx].spent = parseFloat(value) || 0;
    saveEventsToStorage();
    renderHeroAndMetrics();
    showToast('Updated actual spent amount.');
  }
}

function removeBudgetCategory(idx) {
  if (confirm('Are you sure you want to remove this budget category?')) {
    activeEvent.budget.categories.splice(idx, 1);
    saveEventsToStorage();
    renderBudgetTab();
    renderHeroAndMetrics();
    showToast('Removed budget category.');
  }
}

// TAB 3: Timeline & Run of Show
function renderTimelineTab() {
  const milestones = activeEvent.timelineMilestones || [];
  const runOfShow = activeEvent.runOfShow || [];

  // Milestones Container
  const milestonesContainer = document.getElementById('milestones-container');
  milestonesContainer.innerHTML = '';

  milestones.forEach((m, idx) => {
    const item = document.createElement('div');
    item.className = `milestone-item ${m.done ? 'done' : ''}`;
    item.innerHTML = `
      <input type="checkbox" class="milestone-check" ${m.done ? 'checked' : ''} data-m-idx="${idx}" onchange="toggleMilestoneDone(${idx}, this.checked)">
      <div class="milestone-body">
        <div class="milestone-header">
          <span class="milestone-timeframe">${m.timeframe || m.phase}</span>
          <span class="badge ${m.priority === 'High' || m.priority === 'Critical' ? 'badge-inquired' : 'badge-researching'}">${m.priority || 'Normal'}</span>
        </div>
        <div class="milestone-task">${m.task}</div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="deleteMilestone(${idx})" title="Delete milestone">✕</button>
    `;
    milestonesContainer.appendChild(item);
  });

  // Run of Show List
  const runContainer = document.getElementById('run-of-show-container');
  runContainer.innerHTML = '';

  runOfShow.forEach((r, idx) => {
    const item = document.createElement('div');
    item.className = 'run-item';
    item.innerHTML = `
      <div class="run-time">${r.time}</div>
      <div>
        <div class="run-activity">${r.activity}</div>
        <div class="run-notes">${r.notes || ''} ${r.location ? `• 📍 ${r.location}` : ''}</div>
      </div>
      <div class="run-lead">
        <span>👤 ${r.lead || 'Coordinator'}</span>
      </div>
    `;
    runContainer.appendChild(item);
  });
}

function toggleMilestoneDone(idx, isDone) {
  if (activeEvent?.timelineMilestones?.[idx]) {
    activeEvent.timelineMilestones[idx].done = isDone;
    saveEventsToStorage();
    renderTimelineTab();
    renderHeroAndMetrics();
    showToast(isDone ? 'Marked task as done! 🎉' : 'Task marked pending.');
  }
}

function deleteMilestone(idx) {
  activeEvent.timelineMilestones.splice(idx, 1);
  saveEventsToStorage();
  renderTimelineTab();
  renderHeroAndMetrics();
  showToast('Milestone removed.');
}

// TAB 4: Vendor Hub
function renderVendorTab() {
  const vendors = activeEvent.vendors || [];
  const container = document.getElementById('vendors-container');
  const currency = activeEvent.summary?.currency || '$';
  container.innerHTML = '';

  vendors.forEach((v, idx) => {
    const card = document.createElement('div');
    card.className = 'vendor-card';

    let badgeClass = 'badge-researching';
    if (v.status === 'Contracted' || v.status === 'Paid') badgeClass = 'badge-contracted';
    else if (v.status === 'Inquired' || v.status === 'Contacted') badgeClass = 'badge-inquired';

    card.innerHTML = `
      <div class="vendor-header">
        <div>
          <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--primary);">${v.category}</span>
          <h4 class="vendor-name">${v.name || v.role}</h4>
          <span class="vendor-role">${v.role}</span>
        </div>
        <span class="badge ${badgeClass}">${v.status || 'Researching'}</span>
      </div>

      <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem;">
        <div>💰 Est. Cost: <strong>${currency}${formatNumber(v.estimatedCost || 0)}</strong></div>
        ${v.contact ? `<div>✉️ Contact: <a href="mailto:${v.contact}" style="color: var(--primary); text-decoration: none;">${v.contact}</a></div>` : ''}
      </div>

      ${v.keyQuestions ? `
        <div style="background: var(--bg-card-subtle); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--text-main);">
          <strong>Key Questions / Deliverables:</strong>
          <div>${v.keyQuestions}</div>
        </div>
      ` : ''}

      <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-top: auto; padding-top: 0.5rem; border-top: 1px solid var(--border);">
        <select class="form-select" style="font-size: 0.78rem; padding: 0.3rem 0.5rem; width: auto;" onchange="updateVendorStatus(${idx}, this.value)">
          <option value="Researching" ${v.status === 'Researching' ? 'selected' : ''}>Researching</option>
          <option value="Inquired" ${v.status === 'Inquired' || v.status === 'Contacted' ? 'selected' : ''}>Inquired / Contacted</option>
          <option value="Contracted" ${v.status === 'Contracted' ? 'selected' : ''}>Contracted</option>
          <option value="Paid" ${v.status === 'Paid' ? 'selected' : ''}>Paid in Full</option>
        </select>

        <button class="btn btn-outline btn-sm" onclick="openVendorRFPModal(${idx})">
          <span>✉️</span> Draft AI RFP
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function updateVendorStatus(idx, status) {
  if (activeEvent?.vendors?.[idx]) {
    activeEvent.vendors[idx].status = status;
    saveEventsToStorage();
    renderVendorTab();
    renderHeroAndMetrics();
    showToast(`Updated status to ${status}!`);
  }
}

// TAB 5: Creative Studio (Speeches, Invitations, Activities)
function renderCreativeTab() {
  const ideas = activeEvent.personalizedIdeas || {};
  const invite = ideas.invitationCopy || {};
  const activities = ideas.signatureActivities || [];

  // Invitation
  document.getElementById('invite-headline').textContent = invite.headline || 'YOU ARE CORDIALLY INVITED';
  document.getElementById('invite-opening').textContent = invite.opening || 'Join us for a celebration of joy and community.';
  document.getElementById('invite-details').textContent = invite.details || `${formatDate(activeEvent.summary?.eventDate)} • ${activeEvent.summary?.location || 'Venue'}`;
  document.getElementById('invite-rsvp').textContent = invite.rsvpNote || 'Kindly RSVP by 4 weeks prior to the celebration.';
  document.getElementById('invite-dress-code').textContent = invite.dressCodeAdvice ? `Dress Code: ${invite.dressCodeAdvice}` : '';

  // Signature Activities
  const activitiesContainer = document.getElementById('activities-container');
  activitiesContainer.innerHTML = '';

  activities.forEach(act => {
    const card = document.createElement('div');
    card.style.background = 'var(--bg-card-subtle)';
    card.style.border = '1px solid var(--border)';
    card.style.borderRadius = 'var(--radius-md)';
    card.style.padding = '1rem';
    card.innerHTML = `
      <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem; margin-bottom: 0.35rem;">
        🎯 ${act.title}
      </div>
      <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.4rem;">
        ${act.description}
      </div>
      ${act.supplies ? `<div style="font-size: 0.78rem; color: var(--primary); font-weight: 500;">📦 Supplies: ${act.supplies}</div>` : ''}
    `;
    activitiesContainer.appendChild(card);
  });
}

// TAB NAVIGATION & LISTENERS
function initEventListeners() {
  // Tabs with Full ARIA & Keyboard Navigation
  const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
  tabButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
        b.setAttribute('tabindex', '-1');
      });
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      btn.setAttribute('tabindex', '0');

      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
        targetContent.focus();
      }
    });

    // Arrow Key Navigation across tabs (WCAG standard)
    btn.addEventListener('keydown', (e) => {
      let nextIndex = null;
      if (e.key === 'ArrowRight') {
        nextIndex = (index + 1) % tabButtons.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = tabButtons.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        tabButtons[nextIndex].focus();
        tabButtons[nextIndex].click();
      }
    });
  });

  // Event Selector change
  document.getElementById('event-select').addEventListener('change', (e) => {
    const found = allEvents.find(ev => ev.id === e.target.value);
    if (found) {
      activeEvent = found;
      saveEventsToStorage();
      renderApp();
      showToast(`Switched active plan to "${activeEvent.summary.title}"`);
    }
  });

  // Export PDF / Print
  document.getElementById('btn-export-pdf').addEventListener('click', () => {
    window.print();
  });

  // Edit Active Event Details
  const editBtn = document.getElementById('btn-edit-active-event');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      if (!activeEvent) return;
      const newTitle = prompt('Edit Event Title:', activeEvent.summary.title);
      if (newTitle === null) return;
      const newDate = prompt('Edit Event Date (YYYY-MM-DD):', activeEvent.summary.eventDate);
      if (newDate === null) return;
      const newLocation = prompt('Edit Location:', activeEvent.summary.location || '');
      if (newLocation === null) return;
      const newGuests = parseInt(prompt('Edit Guest Count:', activeEvent.summary.guestCount || 50), 10);
      const newBudget = parseFloat(prompt('Edit Total Budget:', activeEvent.summary.budgetTotal || activeEvent.budget.total || 10000));

      if (newTitle.trim()) activeEvent.summary.title = newTitle.trim();
      if (newDate.trim()) activeEvent.summary.eventDate = newDate.trim();
      if (newLocation.trim()) activeEvent.summary.location = newLocation.trim();
      if (!isNaN(newGuests) && newGuests > 0) activeEvent.summary.guestCount = newGuests;
      if (!isNaN(newBudget) && newBudget > 0) {
        activeEvent.summary.budgetTotal = newBudget;
        if (activeEvent.budget) activeEvent.budget.total = newBudget;
      }

      saveEventsToStorage();
      renderApp();
      showToast('Event details updated successfully!');
    });
  }

  // Copy Invitation
  document.getElementById('btn-copy-invite').addEventListener('click', () => {
    const invite = activeEvent?.personalizedIdeas?.invitationCopy || {};
    const text = `${invite.headline || ''}\n\n${invite.opening || ''}\n\n${invite.details || ''}\n\n${invite.rsvpNote || ''}\n${invite.dressCodeAdvice ? `Dress code: ${invite.dressCodeAdvice}` : ''}`;
    navigator.clipboard.writeText(text);
    showToast('Invitation copy copied to clipboard!');
  });

  // AI Speech Generator Form
  document.getElementById('form-speech-generator').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-generate-speech');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> Writing Speech with Gemini...';

    const params = {
      speechType: document.getElementById('speech-type').value,
      tone: document.getElementById('speech-tone').value,
      speakerName: document.getElementById('speech-speaker').value,
      honoreeName: document.getElementById('speech-honoree').value,
      keyMemories: document.getElementById('speech-memories').value
    };

    try {
      const speech = await AIService.generateSpeech(params);
      document.getElementById('speech-text').textContent = speech;
      document.getElementById('speech-result-box').style.display = 'block';
      showToast('Speech drafted successfully!');
    } catch (err) {
      alert('Speech generation failed: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });

  // Copy Speech
  document.getElementById('btn-copy-speech').addEventListener('click', () => {
    const speechText = document.getElementById('speech-text').textContent;
    navigator.clipboard.writeText(speechText);
    showToast('Speech copied to clipboard!');
  });

  // AI Budget Optimizer Button
  document.getElementById('btn-ai-optimize-budget').addEventListener('click', async () => {
    const btn = document.getElementById('btn-ai-optimize-budget');
    btn.disabled = true;
    btn.textContent = 'Analyzing budget...';

    const prompt = `Review my current event budget breakdown for "${activeEvent.summary.title}" (${activeEvent.summary.currency}${activeEvent.summary.budgetTotal} for ${activeEvent.summary.guestCount} guests). Current categories: ${JSON.stringify(activeEvent.budget.categories.map(c => ({ name: c.name, allocated: c.allocated })))}. Provide 3 concrete, high-impact suggestions to reduce costs or reallocate funds strategically without hurting the guest experience. Keep it concise with bullet points.`;

    try {
      // Switch to Copilot tab and trigger prompt
      document.querySelector('[data-tab="tab-copilot"]').click();
      await handleCopilotMessage(prompt);
      showToast('Budget analysis generated in Celebrio Co-Pilot!');
    } catch (err) {
      showToast('Budget analysis error: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = '🤖 AI Budget Optimizer';
    }
  });

  // Celebrio Co-Pilot Form
  document.getElementById('copilot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('copilot-input');
    const msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    await handleCopilotMessage(msg);
  });

  // Quick Chips in Copilot
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', async () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        document.querySelector('[data-tab="tab-copilot"]').click();
        await handleCopilotMessage(prompt);
      }
    });
  });

  // Add Milestone Button
  document.getElementById('btn-add-milestone').addEventListener('click', () => {
    const task = prompt('Enter new planning milestone task:');
    if (task && task.trim()) {
      activeEvent.timelineMilestones.push({
        id: 'm_' + Date.now(),
        timeframe: 'Custom Milestone',
        phase: 'Custom',
        task: task.trim(),
        priority: 'Medium',
        done: false
      });
      saveEventsToStorage();
      renderTimelineTab();
      renderHeroAndMetrics();
      showToast('Added new milestone!');
    }
  });

  // Add Run of Show item
  document.getElementById('btn-add-run-item').addEventListener('click', () => {
    const time = prompt('Enter time cue (e.g. "04:30 PM"):', '04:30 PM');
    if (!time) return;
    const activity = prompt('Enter activity description:');
    if (!activity) return;
    const lead = prompt('Enter lead / coordinator:', 'Host');

    activeEvent.runOfShow.push({
      time,
      activity,
      lead: lead || 'Host',
      location: 'Venue',
      notes: ''
    });
    // Sort run of show by time string roughly
    saveEventsToStorage();
    renderTimelineTab();
    showToast('Added Run of Show cue!');
  });

  // Add Category Button
  document.getElementById('btn-add-expense-category').addEventListener('click', () => {
    const name = prompt('Enter new budget category name:');
    if (!name) return;
    const allocated = parseFloat(prompt('Target allocated amount:', '1000')) || 0;

    activeEvent.budget.categories.push({
      id: 'cat_' + Date.now(),
      name,
      allocated,
      spent: 0,
      notes: 'Custom allocation',
      savingTip: 'Monitor quotes from at least 3 vendors'
    });
    saveEventsToStorage();
    renderBudgetTab();
    renderHeroAndMetrics();
    showToast('Added category!');
  });

  // Add Vendor Button
  document.getElementById('btn-add-vendor').addEventListener('click', () => {
    const name = prompt('Vendor Name / Business:');
    if (!name) return;
    const category = prompt('Category (e.g. Photography, Catering, Florals):', 'Service');
    const estimatedCost = parseFloat(prompt('Estimated Cost:', '1000')) || 0;

    activeEvent.vendors.push({
      id: 'v_' + Date.now(),
      name,
      category,
      role: category,
      estimatedCost,
      status: 'Researching',
      contact: '',
      keyQuestions: 'Inquire for package pricing and contract terms.'
    });
    saveEventsToStorage();
    renderVendorTab();
    renderHeroAndMetrics();
    showToast('Added vendor!');
  });
}

function formatMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h4 style="margin: 0.5rem 0 0.25rem 0; font-size: 0.95rem; font-weight: 700; color: var(--text-main);">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 style="margin: 0.6rem 0 0.3rem 0; font-size: 1.05rem; font-weight: 800; color: var(--text-main);">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 style="margin: 0.75rem 0 0.35rem 0; font-size: 1.15rem; font-weight: 800; color: var(--text-main);">$1</h2>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Bullet items
  html = html.replace(/^\s*[\*\-]\s+(.*$)/gim, '<li style="margin-left: 1.25rem; margin-bottom: 0.25rem;">$1</li>');

  // Numbered list items
  html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li style="margin-left: 1.25rem; margin-bottom: 0.25rem;"><strong>$1.</strong> $2</li>');

  // Newlines
  html = html.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
  return html;
}

// Co-Pilot Chat message handler
async function handleCopilotMessage(userMessage) {
  const messagesContainer = document.getElementById('copilot-messages');

  // Append user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble chat-bubble-user';
  userBubble.textContent = userMessage;
  messagesContainer.appendChild(userBubble);

  // Append typing indicator
  const aiBubble = document.createElement('div');
  aiBubble.className = 'chat-bubble chat-bubble-ai';
  aiBubble.innerHTML = '<em>Thinking with Gemini...</em>';
  messagesContainer.appendChild(aiBubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    const reply = await AIService.chatWithCopilot(userMessage, activeEvent, chatHistory);
    aiBubble.innerHTML = formatMarkdown(reply);

    chatHistory.push({ role: 'user', text: userMessage });
    chatHistory.push({ role: 'model', text: reply });
  } catch (err) {
    aiBubble.innerHTML = `<span style="color: var(--danger);">⚠️ ${err.message}</span>`;
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// MODALS INITIALIZATION (Accessible Dialogs with Focus Management)
function initModals() {
  function openAccessibleModal(modal) {
    if (!modal) return;
    modal.showModal();
    const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea, button:not([data-close-modal])');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 50);
    }
  }

  // Wizard Modal
  const modalWizard = document.getElementById('modal-wizard');
  document.getElementById('btn-new-event').addEventListener('click', () => {
    openAccessibleModal(modalWizard);
  });

  // Settings Modal
  const modalSettings = document.getElementById('modal-settings');
  document.getElementById('btn-open-settings').addEventListener('click', () => {
    document.getElementById('settings-api-key').value = AIService.getCustomApiKey();
    document.getElementById('settings-model').value = AIService.getSelectedModel();
    openAccessibleModal(modalSettings);
  });

  // Close modals on backdrop click or close button
  document.querySelectorAll('dialog.custom-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        modal.close();
      }
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      const modal = document.getElementById(modalId);
      if (modal) modal.close();
    });
  });

  // Settings Form Submit
  document.getElementById('form-settings').addEventListener('submit', (e) => {
    e.preventDefault();
    const key = document.getElementById('settings-api-key').value;
    const model = document.getElementById('settings-model').value;
    AIService.setCustomApiKey(key);
    AIService.setSelectedModel(model);
    modalSettings.close();
    showToast('Settings saved successfully!');
  });

  // Reset sample data
  document.getElementById('btn-reset-sample-data').addEventListener('click', () => {
    if (confirm('Reset all events back to default showcase templates? Any unsaved plans will be cleared.')) {
      allEvents = [...SAMPLE_EVENTS];
      activeEvent = allEvents[0];
      saveEventsToStorage();
      renderApp();
      modalSettings.close();
      showToast('Restored default showcase templates!');
    }
  });

  // Wizard Form Submit (GenAI Event Plan Generation)
  document.getElementById('form-wizard').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('wiz-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳</span> Synthesizing Plan with Gemini...';

    const formData = {
      eventType: document.getElementById('wiz-event-type').value,
      eventTitle: document.getElementById('wiz-event-title').value,
      eventDate: document.getElementById('wiz-event-date').value,
      location: document.getElementById('wiz-location').value,
      guestCount: parseInt(document.getElementById('wiz-guest-count').value, 10),
      currency: document.getElementById('wiz-currency').value,
      budgetTotal: parseFloat(document.getElementById('wiz-budget').value),
      themeVibe: document.getElementById('wiz-vibe').value,
      specialNotes: document.getElementById('wiz-notes').value
    };

    try {
      const plan = await AIService.generateEventPlan(formData);
      plan.id = 'event_' + Date.now();
      // Ensure summary has date & location
      plan.summary.eventDate = formData.eventDate;
      plan.summary.location = formData.location;
      
      allEvents.unshift(plan);
      activeEvent = plan;
      saveEventsToStorage();

      renderApp();
      modalWizard.close();
      document.querySelector('[data-tab="tab-overview"]').click();
      showToast(`✨ Generated full plan for "${plan.summary.title}"!`);
    } catch (err) {
      alert('Event generation failed: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  // Vendor RFP AI Generation
  document.getElementById('btn-generate-rfp-ai').addEventListener('click', async () => {
    const btn = document.getElementById('btn-generate-rfp-ai');
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> Drafting inquiry with Gemini...';

    const vendorId = document.getElementById('rfp-vendor-id').value;
    const vendor = activeEvent.vendors[vendorId];

    const params = {
      vendorCategory: document.getElementById('rfp-category').value,
      vendorName: document.getElementById('rfp-vendor-name').value,
      eventDetails: `${activeEvent.summary.title} on ${formatDate(activeEvent.summary.eventDate)} for ${activeEvent.summary.guestCount} guests at ${activeEvent.summary.location}`,
      budgetRange: `${activeEvent.summary.currency}${vendor ? vendor.estimatedCost : 'Negotiable'}`,
      specificQuestions: document.getElementById('rfp-specifics').value
    };

    try {
      const inquiry = await AIService.generateVendorRFP(params);
      document.getElementById('rfp-result-text').value = inquiry;
      document.getElementById('rfp-result-wrap').style.display = 'block';
      showToast('AI Inquiry letter generated!');
    } catch (err) {
      alert('RFP generation failed: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>✨</span> Draft Inquiry Letter with Gemini';
    }
  });

  // Copy RFP
  document.getElementById('btn-copy-rfp').addEventListener('click', () => {
    const text = document.getElementById('rfp-result-text').value;
    navigator.clipboard.writeText(text);
    showToast('Inquiry letter copied to clipboard!');
  });
}

function openVendorRFPModal(idx) {
  const vendor = activeEvent?.vendors?.[idx];
  if (!vendor) return;

  document.getElementById('rfp-vendor-id').value = idx;
  document.getElementById('rfp-category').value = vendor.category || 'Vendor';
  document.getElementById('rfp-vendor-name').value = vendor.name || vendor.role || 'Prospective Vendor';
  document.getElementById('rfp-specifics').value = vendor.keyQuestions || '';
  document.getElementById('rfp-result-wrap').style.display = 'none';

  const modalRfp = document.getElementById('modal-rfp');
  modalRfp.showModal();
  setTimeout(() => document.getElementById('rfp-specifics').focus(), 50);
}

// UTILITY HELPERS
function formatDate(dateStr) {
  if (!dateStr) return 'Date TBD';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calculateDaysRemaining(dateStr) {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  const now = new Date();
  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatNumber(num) {
  if (!num) return '0';
  return Math.round(num).toLocaleString('en-US');
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
