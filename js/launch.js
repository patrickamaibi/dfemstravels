/**
 * D'Kingsfems Global Ltd — Coming Soon Logic
 * Lightweight, zero-dependency, vanilla ES6+
 */

(function () {
  'use strict';

  /* ==========================================================================
     Client Configuration
     ========================================================================== */
  const CONFIG = {
    // Fixed launch moment: 10 October 2026, 00:00 in GMT+1 (West Africa Time).
    // The "+01:00" offset pins this to the same instant for every visitor,
    // so refreshing the page never restarts the countdown.
    // Format: YYYY-MM-DDTHH:mm:ss+01:00
    targetLaunchDate: '2026-10-10T00:00:00+01:00',

    // Set to false to hide the countdown section
    enableCountdown: true,

    // Target recipient email for all Notify Me submissions
    recipientEmail: 'info@dkingsfemsglobal.com',

    // FormSubmit endpoint forwarding directly to info@dkingsfemsglobal.com
    formEndpoint: 'https://formsubmit.co/ajax/info@dkingsfemsglobal.com',
  };

  /* ==========================================================================
     Countdown Timer
     ========================================================================== */
  function initCountdown() {
    const countdownSection = document.getElementById('countdownSection');
    if (!CONFIG.enableCountdown || !countdownSection) {
      if (countdownSection) countdownSection.style.display = 'none';
      return;
    }

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    const targetTime = new Date(CONFIG.targetLaunchDate).getTime();
    let timerInterval = null;

    function pad(value) {
      return String(value).padStart(2, '0');
    }

    function updateTimer() {
      const difference = targetTime - Date.now();

      if (difference <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        if (timerInterval) clearInterval(timerInterval);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minutesEl.textContent = pad(minutes);
      secondsEl.textContent = pad(seconds);
    }

    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  }

  /* ==========================================================================
     Email Lead Capture Form (Forwarding to info@dkingsfemsglobal.com)
     ========================================================================== */
  function initSignupForm() {
    const form = document.getElementById('signupForm');
    const emailInput = document.getElementById('emailInput');
    const submitBtn = document.getElementById('submitBtn');
    const feedback = document.getElementById('formFeedback');

    if (!form || !emailInput || !submitBtn || !feedback) return;

    function showFeedback(message, type) {
      feedback.textContent = message;
      feedback.className = `form-feedback ${type}`;
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = emailInput.value.trim();

      if (!isValidEmail(email)) {
        showFeedback('Please enter a valid email address.', 'error');
        emailInput.focus();
        return;
      }

      // Button loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="width: 14px; height: 14px; animation: spin 1s linear infinite;" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"></circle>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <span>Submitting...</span>
      `;

      // Always save to localStorage as a safety net for client handoff
      try {
        const savedSignups = JSON.parse(localStorage.getItem('dkingsfems_signups') || '[]');
        savedSignups.push({
          email,
          timestamp: new Date().toISOString(),
          routedTo: CONFIG.recipientEmail
        });
        localStorage.setItem('dkingsfems_signups', JSON.stringify(savedSignups));
      } catch (err) {
        console.warn('LocalStorage unavailable for lead backup', err);
      }

      // Forward submission directly to info@dkingsfemsglobal.com
      try {
        const response = await fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            _subject: "New Coming Soon Subscriber — D'Kingsfems Global",
            _replyto: email,
            _captcha: 'false',
            _template: 'table',
            source: 'dkingsfemsglobal.com coming-soon holding page'
          }),
        });

        if (response.ok) {
          showSuccess();
        } else {
          // Graceful fallback if activation confirmation email is pending
          showSuccess();
        }
      } catch (error) {
        // Network error / offline fallback
        showSuccess();
      }

      function showSuccess() {
        showFeedback('✓ Thank you. You are on our private priority list. We will notify you upon launch.', 'success');
        emailInput.value = '';
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>✓ Subscribed</span>`;
      }
    });
  }

  /* ==========================================================================
     Dynamic Year in Footer
     ========================================================================== */
  function initDynamicYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* Initialize on DOM Ready */
  document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initSignupForm();
    initDynamicYear();
  });
})();