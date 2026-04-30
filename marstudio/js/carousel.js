/* ═══════════════════════════════════════════════════════════
   carousel.js — infinite looping project card carousel

   Track layout after cloning:
   [ clone of last card | card 0 | card 1 | ... | card n | clone of first card ]

   The carousel starts on card 0 (index 1 in the track,
   because the clone of the last card sits at index 0).

   When the user reaches the clone at either end, the track
   silently snaps to the real equivalent card once the CSS
   transition finishes — creating the illusion of looping.
═══════════════════════════════════════════════════════════ */

/* ── Configuration ───────────────────────────────────────── */
const AUTO_ROTATE_DELAY = 5000; // ms between automatic card advances

/* ── State ───────────────────────────────────────────────── */
let currentIndex       = 1;     // starts at 1 because index 0 is the clone of last card
let isTransitioning    = false; // prevents input during a snap
let autoRotateInterval = null;

/* ── DOM references ──────────────────────────────────────── */
const track         = document.getElementById('carouselTrack');
const originalCards = Array.from(document.querySelectorAll('.card'));
const totalOriginal = originalCards.length;

/* ═══════════════════════════════════════════════════════════
   SETUP — clone first and last cards, inject into track
═══════════════════════════════════════════════════════════ */
function setupInfiniteTrack() {
    // cloneNode(true) copies the element and all its children
    const firstClone = originalCards[0].cloneNode(true);
    const lastClone  = originalCards[totalOriginal - 1].cloneNode(true);

    // Mark clones so we can identify them if needed
    firstClone.dataset.clone = 'true';
    lastClone.dataset.clone  = 'true';

    // lastClone goes before card 0, firstClone goes after card n
    track.insertBefore(lastClone, originalCards[0]);
    track.appendChild(firstClone);
}

/* ═══════════════════════════════════════════════════════════
   LAYOUT — measure card width + gap for transform calculation
═══════════════════════════════════════════════════════════ */
function getCardStep() {
    const allCards = track.querySelectorAll('.card');
    const card     = allCards[currentIndex];
    const trackGap = parseInt(getComputedStyle(track).gap) || 30;

    return card.offsetWidth + trackGap;
}

/* ═══════════════════════════════════════════════════════════
   RENDER — move the track to show the current card centred
═══════════════════════════════════════════════════════════ */
function updateTrackPosition(animate) {
    const container = document.querySelector('.carousel-container');
    const allCards  = track.querySelectorAll('.card');
    const card      = allCards[currentIndex];
    const step      = getCardStep();

    // Calculate how far to shift the track so this card is centred
    const offset = currentIndex * step
                 - (container.offsetWidth / 2)
                 + (card.offsetWidth / 2);

    // Disable transition for instant snaps (infinite loop reset)
    track.style.transition = animate ? 'transform 0.5s ease' : 'none';
    track.style.transform  = `translateX(-${Math.max(0, offset)}px)`;
}

/* ═══════════════════════════════════════════════════════════
   ACTIVE STATE — highlight only the current card
═══════════════════════════════════════════════════════════ */
function updateActiveCard() {
    const allCards = track.querySelectorAll('.card');

    allCards.forEach(card => card.classList.remove('active'));
    allCards[currentIndex].classList.add('active');

    // Dots reflect position in the original cards array.
    // currentIndex - 1 accounts for the leading clone.
    updateDots((currentIndex - 1 + totalOriginal) % totalOriginal);
}

/* ═══════════════════════════════════════════════════════════
   INFINITE LOOP — silent snap after reaching a clone.
   Called when the CSS transition ends.
═══════════════════════════════════════════════════════════ */
function onTransitionEnd() {
    const totalCards = track.querySelectorAll('.card').length; // includes clones

    // Landed on clone of first card (far right) — snap to real first card
    if (currentIndex >= totalCards - 1) {
        currentIndex = 1;
        updateTrackPosition(false);
        updateActiveCard();
    }

    // Landed on clone of last card (far left) — snap to real last card
    if (currentIndex <= 0) {
        currentIndex = totalCards - 2;
        updateTrackPosition(false);
        updateActiveCard();
    }

    isTransitioning = false;
}

/* ═══════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════ */
function nextCard() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    updateTrackPosition(true);
    updateActiveCard();
    resetAutoRotate();
}

function prevCard() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex--;
    updateTrackPosition(true);
    updateActiveCard();
    resetAutoRotate();
}

/* Jump to a real card by its original index (used by dots).
   +1 accounts for the leading clone offset. */
function focusOnCard(originalIndex) {
    if (isTransitioning) return;
    const target = originalIndex + 1;
    if (target === currentIndex) return;

    isTransitioning = true;
    currentIndex    = target;
    updateTrackPosition(true);
    updateActiveCard();
    resetAutoRotate();
}

/* ═══════════════════════════════════════════════════════════
   DOT INDICATORS
═══════════════════════════════════════════════════════════ */
function createDots() {
    const dotsContainer = document.getElementById('dots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';

    originalCards.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => focusOnCard(index));
        dotsContainer.appendChild(dot);
    });
}

function updateDots(originalIndex) {
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === originalIndex);
    });
}

/* ═══════════════════════════════════════════════════════════
   AUTO-ROTATION
═══════════════════════════════════════════════════════════ */
function startAutoRotate() {
    stopAutoRotate();
    autoRotateInterval = setInterval(nextCard, AUTO_ROTATE_DELAY);
}

function stopAutoRotate() {
    if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
        autoRotateInterval = null;
    }
}

function resetAutoRotate() {
    stopAutoRotate();
    startAutoRotate();
}

/* ═══════════════════════════════════════════════════════════
   INTERACTIONS
═══════════════════════════════════════════════════════════ */
function setupCardInteractions() {
    // Event delegation on the track covers clones automatically
    track.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (!card) return;

        // Let project links open normally
        if (e.target.tagName === 'A' || e.target.closest('a')) return;

        // Find this card's position in the track (includes clones)
        const allCards   = Array.from(track.querySelectorAll('.card'));
        const trackIndex = allCards.indexOf(card);
        if (trackIndex === currentIndex) return;

        isTransitioning = true;
        currentIndex    = trackIndex;
        updateTrackPosition(true);
        updateActiveCard();
        resetAutoRotate();
    });

    // Ensure all links (including those in clones) open in a new tab
    track.querySelectorAll('a').forEach(link => {
        if (!link.hasAttribute('target')) link.setAttribute('target', '_blank');
    });
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
    if (originalCards.length === 0) {
        console.error('carousel.js: No .card elements found in the DOM.');
        return;
    }

    setupInfiniteTrack();
    createDots();
    setupCardInteractions();
    setupHoverPause();

    // transitionend fires when the CSS slide animation finishes —
    // this is when we perform the silent snap for infinite looping
    track.addEventListener('transitionend', onTransitionEnd);

    updateTrackPosition(false);
    updateActiveCard();
    startAutoRotate();
}

document.addEventListener('DOMContentLoaded', initCarousel);