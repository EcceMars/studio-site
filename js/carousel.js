/* ═══════════════════════════════════════════════════════════
   carousel.js — project card carousel
 
   Simple wrapping carousel: no DOM cloning, no silent snaps.
   currentIndex runs directly over the real card array and
   wraps around at both ends with a normal animated transition.
═══════════════════════════════════════════════════════════ */
 
/* ── Configuration ───────────────────────────────────────── */
const AUTO_ROTATE_DELAY = 5000;   // ms between automatic card advances
const RESUME_DELAY      = 60_000; // ms to wait before resuming after user input
 
/* ── State ───────────────────────────────────────────────── */
let currentIndex       = 0;     // index into the real cards array
let isTransitioning    = false; // prevents overlapping animations
let autoRotateInterval = null;
let resumeTimeout      = null;  // pending resume timer handle
 
/* ── DOM references ──────────────────────────────────────── */
const track      = document.getElementById('carouselTrack');
const cards      = Array.from(document.querySelectorAll('.card'));
const totalCards = cards.length;
 
/* ═══════════════════════════════════════════════════════════
   LAYOUT — card width + gap, used to compute the translate
═══════════════════════════════════════════════════════════ */
function getCardStep() {
    const trackGap = parseInt(getComputedStyle(track).gap) || 30;
    return cards[currentIndex].offsetWidth + trackGap;
}
 
/* ═══════════════════════════════════════════════════════════
   RENDER — translate the track so currentIndex card is centred
═══════════════════════════════════════════════════════════ */
function updateTrackPosition(animate) {
    const container = document.querySelector('.carousel-container');
    const card      = cards[currentIndex];
    const step      = getCardStep();
 
    const offset = currentIndex * step
                 - (container.offsetWidth / 2)
                 + (card.offsetWidth / 2);
 
    track.style.transition = animate ? 'transform 0.5s ease' : 'none';
    track.style.transform  = `translateX(-${Math.max(0, offset)}px)`;
}
 
/* ═══════════════════════════════════════════════════════════
   ACTIVE STATE — highlight the current card and matching dot
═══════════════════════════════════════════════════════════ */
function updateActiveCard() {
    cards.forEach(card => card.classList.remove('active'));
    cards[currentIndex].classList.add('active');
    updateDots(currentIndex);
}
 
/* ── Clear isTransitioning once the CSS animation settles ── */
function onTransitionEnd() {
    isTransitioning = false;
}
 
/* ═══════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════ */
function nextCard() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex    = (currentIndex + 1) % totalCards; // wrap to 0 after last
    updateTrackPosition(true);
    updateActiveCard();
}
 
function prevCard() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex    = (currentIndex - 1 + totalCards) % totalCards; // wrap to last before 0
    updateTrackPosition(true);
    updateActiveCard();
}
 
/* Jump directly to a card by index (used by dots and click) */
function focusOnCard(index) {
    if (isTransitioning || index === currentIndex) return;
    isTransitioning = true;
    currentIndex    = index;
    updateTrackPosition(true);
    updateActiveCard();
    pauseAutoRotate();
}
 
/* ═══════════════════════════════════════════════════════════
   DOT INDICATORS
═══════════════════════════════════════════════════════════ */
function createDots() {
    const dotsContainer = document.getElementById('dots');
    if (!dotsContainer) return;
 
    dotsContainer.innerHTML = '';
 
    cards.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => focusOnCard(index));
        dotsContainer.appendChild(dot);
    });
}
 
function updateDots(activeIndex) {
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
    });
}
 
/* ═══════════════════════════════════════════════════════════
   AUTO-ROTATION
   Runs continuously until the user interacts.
   After any interaction it pauses for RESUME_DELAY ms,
   then restarts automatically.
═══════════════════════════════════════════════════════════ */
function startAutoRotate() {
    stopAutoRotate();
    autoRotateInterval = setInterval(() => {
        nextCard();
    }, AUTO_ROTATE_DELAY);
}
 
function stopAutoRotate() {
    if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
        autoRotateInterval = null;
    }
}
 
/* Called on every deliberate user interaction (nav buttons, dots, card click).
   Cancels the current rotation and any pending resume, then schedules
   a fresh resume after RESUME_DELAY. */
function pauseAutoRotate() {
    stopAutoRotate();
 
    if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
    }
 
    resumeTimeout = setTimeout(() => {
        resumeTimeout = null;
        startAutoRotate();
    }, RESUME_DELAY);
}
 
/* ═══════════════════════════════════════════════════════════
   INTERACTIONS
═══════════════════════════════════════════════════════════ */
function setupCardInteractions() {
    track.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (!card) return;
 
        // Let project links through — don't intercept them
        if (e.target.tagName === 'A' || e.target.closest('a')) return;
 
        const index = cards.indexOf(card);
        if (index === -1 || index === currentIndex) return;
 
        focusOnCard(index);
    });
}
 
/* Wrap the prev/next buttons so they also trigger pauseAutoRotate */
function setupNavButtons() {
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');
 
    if (prevBtn) prevBtn.addEventListener('click', () => { prevCard(); pauseAutoRotate(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nextCard(); pauseAutoRotate(); });
}
 
function setupHoverPause() {
    const container = document.querySelector('.carousel-container');
    if (!container) return;
 
    container.addEventListener('mouseenter', stopAutoRotate);
    container.addEventListener('mouseleave', startAutoRotate);
}
 
/* ═══════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════ */
function initCarousel() {
    if (totalCards === 0) {
        console.error('carousel.js: No .card elements found in the DOM.');
        return;
    }
 
    createDots();
    setupCardInteractions();
    setupNavButtons();
    setupHoverPause();
 
    track.addEventListener('transitionend', onTransitionEnd);
 
    updateTrackPosition(false);
    updateActiveCard();
    startAutoRotate();
}
 
document.addEventListener('DOMContentLoaded', initCarousel);