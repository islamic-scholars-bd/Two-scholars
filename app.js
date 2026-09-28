// Islamic Scholars Portal Application Logic

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTasbih();
  initBayanFilters();
  initQuoteCopy();
});

// 1. Theme Management (Dark / Light Mode)
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'dark') {
    html.classList.add('dark');
    if (themeIcon) themeIcon.className = 'fas fa-sun text-yellow-400';
  } else {
    html.classList.remove('dark');
    if (themeIcon) themeIcon.className = 'fas fa-moon text-emerald-800';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        if (themeIcon) themeIcon.className = 'fas fa-moon text-emerald-800';
      } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) themeIcon.className = 'fas fa-sun text-yellow-400';
      }
    });
  }
}

// 2. Interactive Digital Tasbih Counter
let tasbihCount = 0;
let tasbihTarget = 33;

function initTasbih() {
  const counterDisplay = document.getElementById('tasbih-count');
  const targetDisplay = document.getElementById('tasbih-target');
  const countBtn = document.getElementById('tasbih-click-btn');
  const resetBtn = document.getElementById('tasbih-reset-btn');
  const dhikrSelect = document.getElementById('dhikr-select');
  const targetButtons = document.querySelectorAll('.target-btn');

  // Web Audio click generator for nice tactile sound
  const audioCtx = window.AudioContext || window.webkitAudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null;
  function playClickSound() {
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      console.log('Audio error', e);
    }
  }

  if (countBtn) {
    countBtn.addEventListener('click', () => {
      tasbihCount++;
      playClickSound();
      if (navigator.vibrate) navigator.vibrate(30);

      if (counterDisplay) {
        counterDisplay.textContent = tasbihCount;
        counterDisplay.classList.add('scale-110');
        setTimeout(() => counterDisplay.classList.remove('scale-110'), 150);
      }

      if (tasbihTarget > 0 && tasbihCount >= tasbihTarget) {
        showToast(`মাশাআল্লাহ! ${tasbihTarget} বার যিকির সম্পন্ন হয়েছে।`);
        if (navigator.vibrate) navigator.vibrate([80, 50, 80]);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      tasbihCount = 0;
      if (counterDisplay) counterDisplay.textContent = '0';
      showToast('তাসবীহ রিসেট করা হয়েছে।');
    });
  }

  targetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      targetButtons.forEach(b => b.classList.remove('bg-emerald-600', 'text-white'));
      btn.classList.add('bg-emerald-600', 'text-white');
      tasbihTarget = parseInt(btn.dataset.target, 10);
      if (targetDisplay) targetDisplay.textContent = tasbihTarget === 0 ? 'আনলিমিটেড' : tasbihTarget;
    });
  });

  if (dhikrSelect) {
    dhikrSelect.addEventListener('change', (e) => {
      const arabicElement = document.getElementById('current-dhikr-arabic');
      const banglaElement = document.getElementById('current-dhikr-bangla');
      const selectedOption = e.target.options[e.target.selectedIndex];
      
      if (arabicElement) arabicElement.textContent = selectedOption.dataset.arabic;
      if (banglaElement) banglaElement.textContent = selectedOption.dataset.bangla;
      tasbihCount = 0;
      if (counterDisplay) counterDisplay.textContent = '0';
    });
  }
}

// 3. Bayan & Lectures Filtering
function initBayanFilters() {
  const filterButtons = document.querySelectorAll('.bayan-filter-btn');
  const bayanCards = document.querySelectorAll('.bayan-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('bg-emerald-700', 'text-white', 'dark:bg-emerald-600');
        b.classList.add('bg-white', 'text-gray-700', 'dark:bg-emerald-950/60', 'dark:text-gray-300');
      });
      btn.classList.add('bg-emerald-700', 'text-white', 'dark:bg-emerald-600');
      btn.classList.remove('bg-white', 'text-gray-700', 'dark:bg-emerald-950/60', 'dark:text-gray-300');

      const filter = btn.dataset.filter;

      bayanCards.forEach(card => {
        if (filter === 'all' || card.dataset.scholar === filter || card.dataset.category === filter) {
          card.style.display = 'block';
          card.classList.add('animate-fadeIn');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// 4. Quote Copy to Clipboard
function initQuoteCopy() {
  const copyButtons = document.querySelectorAll('.copy-quote-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const quoteText = btn.dataset.quote;
      navigator.clipboard.writeText(quoteText).then(() => {
        showToast('নসিহতটি কপি করা হয়েছে!');
      }).catch(() => {
        showToast('কপি করতে ব্যর্থ হয়েছে');
      });
    });
  });
}

// 5. Toast Notification System
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center space-x-3 toast-animate border border-yellow-400 text-sm font-semibold';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fas fa-check-circle text-yellow-400"></i><span>${message}</span>`;
  toast.style.display = 'flex';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 2500);
}

// 6. Bio Modal Toggle
function openBioModal(scholarId) {
  const modal = document.getElementById(`modal-${scholarId}`);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeBioModal(scholarId) {
  const modal = document.getElementById(`modal-${scholarId}`);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('bio-modal-backdrop')) {
    e.target.parentElement.classList.add('hidden');
    e.target.parentElement.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
});
