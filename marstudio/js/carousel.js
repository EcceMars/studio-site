let currentIndex = 0;
let autoRotateInterval;
let inactivityTimer;
const AUTO_ROTATE_DELAY = 5000; // 5 seconds
const INACTIVITY_RESUME_DELAY = 10000; // 10 seconds after last interaction

const cards = document.querySelectorAll('.card');
const track = document.getElementById('carouselTrack');
const totalCards = cards.length;

// Function to update which card is active
function updateCarousel() {
    // Remove active class from all cards
    cards.forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to current card
    cards[currentIndex].classList.add('active');
    
    // Update dots
    updateDots();
    
    // Optional: Scroll track to show active card
    if (track) {
        const activeCard = cards[currentIndex];
        const container = document.querySelector('.carousel-container');
        if (container && activeCard) {
            const cardWidth = activeCard.offsetWidth + 30;
            const trackPosition = currentIndex * cardWidth - (container.offsetWidth / 2) + (activeCard.offsetWidth / 2);
            track.style.transform = `translateX(-${Math.max(0, trackPosition)}px)`;
        }
    }
}

// Next card (with wraparound)
function nextCard() {
    currentIndex = (currentIndex + 1) % totalCards;
    updateCarousel();
    resetAutoRotate(); // Reset timer on manual navigation
}

// Previous card (with wraparound)
function prevCard() {
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    updateCarousel();
    resetAutoRotate(); // Reset timer on manual navigation
}

// Focus on a specific card by index
function focusOnCard(index) {
    if (index === currentIndex) return; // Already focused
    
    currentIndex = index;
    updateCarousel();
    resetAutoRotate(); // Stop auto-rotate temporarily
}

// Create dot indicators
function createDots() {
    const dotsContainer = document.getElementById('dots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    
    cards.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => {
            focusOnCard(index);
        });
        dotsContainer.appendChild(dot);
    });
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        if (index === currentIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Start auto-rotation
function startAutoRotate() {
    if (autoRotateInterval) clearInterval(autoRotateInterval);
    autoRotateInterval = setInterval(() => {
        nextCard();
    }, AUTO_ROTATE_DELAY);
}

// Stop auto-rotation
function stopAutoRotate() {
    if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
        autoRotateInterval = null;
    }
}

// Reset auto-rotate (stop and restart)
function resetAutoRotate() {
    stopAutoRotate();
    startAutoRotate();
    
    // Reset inactivity timer
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        // Auto-rotate is already running, this just ensures it continues
        console.log('Resuming auto-rotation');
    }, INACTIVITY_RESUME_DELAY);
}

// Setup card click behavior (without opening tabs)
function setupCardInteractions() {
    cards.forEach((card, index) => {
        // Get the "View project" link inside this card
        const projectLink = card.querySelector('a');
        
        // Handle clicks on the entire card except the link
        card.addEventListener('click', (e) => {
            // If the click target IS the link, do nothing (let link handle it)
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return; // Let the link do its job
            }
            
            // Otherwise, focus on this card
            e.preventDefault();
            focusOnCard(index);
        });
        
        // Ensure the link opens in new tab normally (no extra JS needed)
        if (projectLink && !projectLink.hasAttribute('target')) {
            projectLink.setAttribute('target', '_blank');
        }
    });
}

// Optional: Pause auto-rotate on hover
function setupHoverPause() {
    const container = document.querySelector('.carousel-container');
    if (!container) return;
    
    container.addEventListener('mouseenter', () => {
        stopAutoRotate();
    });
    
    container.addEventListener('mouseleave', () => {
        startAutoRotate();
    });
}

// Initialize everything
function initCarousel() {
    if (cards.length === 0) {
        console.error('No cards found!');
        return;
    }
    
    createDots();
    setupCardInteractions();
    setupHoverPause();
    updateCarousel();
    startAutoRotate();
}

// Start the carousel when page loads
document.addEventListener('DOMContentLoaded', initCarousel);