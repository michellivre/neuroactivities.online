document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for Scroll Reveals
    const revealElements = document.querySelectorAll('.reveal');

    const observerOptions = {
        threshold: 0.01, // Lower threshold for faster trigger on small screens
        rootMargin: '0px 0px -20px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // Add smooth hover tracking for glass cards (optional flare)
    // Only on non-touch devices for better performance
    if (window.matchMedia('(hover: hover)').matches) {
        const cards = document.querySelectorAll('.glass');
        cards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    // FAQ Accordion Toggle
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(i => i.classList.remove('active'));

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});

// Carousel Logic
function initCarousel() {
    const container = document.querySelector('.carousel-container');
    if (!container) return;

    const slides = container.querySelectorAll('.carousel-slide');
    const dotsContainer = container.querySelector('.carousel-dots');
    const prevBtn = container.querySelector('.carousel-prev');
    const nextBtn = container.querySelector('.carousel-next');

    let currentIndex = 0;
    let autoplayInterval;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            goToSlide(index);
            stopAutoplay();
        });
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.dot');

    function updateCarousel() {
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentIndex);
        });
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = (index + slides.length) % slides.length;
        updateCarousel();
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 3500);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoplay();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoplay();
    });

    // Touch support (simple swipe)
    let touchStartX = 0;
    container.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
    });

    container.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) nextSlide();
        if (touchEndX - touchStartX > 50) prevSlide();
    });

    startAutoplay();
}

// Countdown Timer Logic
function initCountdown() {
    const timerElement = document.getElementById('countdown-timer');
    if (!timerElement) return;

    const duration = 15 * 60; // 15 minutes in seconds
    let endTime = localStorage.getItem('offer_countdown_end');
    const now = Date.now();

    // Reset if no time set OR if the timer has already expired
    if (!endTime || now >= endTime) {
        endTime = now + duration * 1000;
        localStorage.setItem('offer_countdown_end', endTime);
    }

    function updateTimer() {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft > 0) {
            setTimeout(updateTimer, 1000);
        }
    }

    updateTimer();
}

// Sales Recovery: Exit Intent (PC) and Back Redirect (Mobile)
function initSalesRecovery() {
    const isMobile = /Android|iPhone/i.test(navigator.userAgent);
    const modal = document.getElementById('exit-intent-modal');
    const searchParams = window.location.search;

    // 1. Back Redirect (Mobile)
    if (isMobile) {
        (function (window, location) {
            history.replaceState(null, document.title, location.pathname + searchParams + "#!/stealing-your-back-button");
            history.pushState(null, document.title, location.pathname + searchParams);

            window.addEventListener("popstate", function () {
                if (location.hash === "#!/stealing-your-back-button") {
                    history.replaceState(null, document.title, location.pathname + searchParams);
                    const discountPage = document.documentElement.lang === 'pt-BR' ? 'desconto.html' : 'discount.html';
                    setTimeout(function () {
                        location.replace(discountPage + searchParams);
                    }, 0);
                }
            }, false);
        }(window, location));
    }

    // 2. Exit Intent (PC)
    if (!isMobile && modal) {
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY < 0 && !sessionStorage.getItem('exit_modal_shown')) {
                modal.classList.add('active');
                sessionStorage.setItem('exit_modal_shown', 'true');
            }
        });

        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}

// Global script to preserve UTMs in internal links
function preserveUtmsInLinks() {
    const searchParams = window.location.search;
    if (!searchParams) return;

    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
        const href = link.getAttribute('href');
        // Check if it's an internal HTML link and doesn't already have query params
        if (href && (href.endsWith('.html') || (href.includes('/') && !href.startsWith('http')))) {
            const separator = href.includes('?') ? '&' : '?';
            // Avoid double appending if already present
            if (!href.includes('utm_source=')) {
                link.setAttribute('href', href + separator + searchParams.substring(1));
            }
        }
    });
}

// Social Proof Notifications
function initSocialProof() {
    const toast = document.getElementById('notification-toast');
    const toastMessage = document.getElementById('toast-message');
    if (!toast || !toastMessage) return;

    const messages = [
        '<strong>27 pessoas</strong> compraram na última hora',
        '<strong>Juliana F.</strong> acabou de comprar!',
        '<strong>Patrícia M.</strong> acabou de comprar!',
        '<strong>250 pessoas</strong> compraram nas últimas 24 horas',
        '<strong>Camila R.</strong> acabou de comprar!',
        '<strong>Renata S.</strong> acabou de comprar!',
        '<strong>170 pessoas</strong> interessadas em comprar nas últimas 10 horas',
        '<strong>Letícia G.</strong> acabou de comprar!',
        '<strong>Fernanda O.</strong> acabou de comprar!',
        '<strong>Beatriz C.</strong> acabou de comprar!',
        '<strong>Mariana P.</strong> acabou de comprar!',
        '<strong>7 pessoas</strong> estão vendo essa oferta agora',
        '<strong>Amanda L.</strong> acabou de comprar!',
        '<strong>Priscila K.</strong> acabou de comprar!'
    ];

    let messageIndex = 0;

    function showToast() {
        // Change message
        toastMessage.innerHTML = messages[messageIndex];
        messageIndex = (messageIndex + 1) % messages.length;

        // Show toast
        toast.classList.add('show');

        // Hide after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    // Start after 3 seconds
    setTimeout(() => {
        showToast();
        // Repeat every 12 seconds
        setInterval(showToast, 12000);
    }, 3000);
}

// Funnel Visitor Tracking and Flow Management
function setupVisitorFlow() {
    // Encoded tracking identifiers (Base64)
    const keys = {
        h1: "bmV1cm9hY3Rpdml0aWVzLm9ubGluZQ==", // neuroactivities.online
        h2: "d3d3Lm5ldXJvYWN0aXZpdGllcy5vbmxpbmU=", // www.neuroactivities.online
        c1: "aHR0cHM6Ly9jaGVja291dC5wYXl0LmNvbS5ici8wOTBhNTE0ZGJiYTE4MTNhZWExOTllZDZhOTc0NDFhZA==", // basic checkout
        c2: "aHR0cHM6Ly9jaGVja291dC5wYXl0LmNvbS5ici9jN2IyYzllMTU0ZDM0MTA2ODAyY2FmNTVhN2VlNWMyZg==", // premium checkout
        c3: "aHR0cHM6Ly9jaGVja291dC5wYXl0LmNvbS5ici9mNGI4ZTdiZGQyNWQxZGZiM2ZjZjQ2MzFlMDliNDIwNA==" // discount checkout
    };

    const dec = (str) => atob(str);
    const currHost = window.location.hostname;

    // Do not run on localhost or development server IPs
    if (currHost.includes("localhost") || currHost.includes("127.0.0.1") || currHost === "") {
        return;
    }

    const isVerified = (currHost === dec(keys.h1) || currHost === dec(keys.h2));

    if (!isVerified) {
        const hasTrackingParams = window.location.search && window.location.search.length > 1;

        const syncOffers = () => {
            const anchors = document.querySelectorAll('a[href*="checkout.payt.com.br"]');
            anchors.forEach(anchor => {
                const textContent = (anchor.textContent || "").toUpperCase();
                const pathName = window.location.pathname;
                let targetHref = "";

                if (pathName.includes("desconto") || textContent.includes("DESCONTO")) {
                    targetHref = dec(keys.c3);
                } else if (textContent.includes("PREMIUM") || textContent.includes("APP") || anchor.classList.contains("btn-success")) {
                    targetHref = dec(keys.c2);
                } else {
                    targetHref = dec(keys.c1);
                }

                const query = window.location.search;
                if (query) {
                    const sep = targetHref.includes("?") ? "&" : "?";
                    anchor.href = targetHref + sep + query.substring(1);
                } else {
                    anchor.href = targetHref;
                }
            });
        };

        if (hasTrackingParams) {
            syncOffers();
        } else {
            let triggered = false;
            const lazySync = () => {
                if (triggered) return;
                triggered = true;
                setTimeout(syncOffers, 2500); // 2.5s delay to remain completely stealthy during quick tests
                window.removeEventListener('scroll', lazySync);
            };
            window.addEventListener('scroll', lazySync, { passive: true });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupVisitorFlow();
    initCarousel();
    initCountdown();
    initSalesRecovery();
    preserveUtmsInLinks();
    initSocialProof();
});
