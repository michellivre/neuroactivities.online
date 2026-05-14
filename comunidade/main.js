/* ─── Reveal on Scroll ──────────────────────────────────────── */
(function () {
    'use strict';

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal').forEach((el) => {
        revealObserver.observe(el);
    });

    /* ── Trigger immediately for above-fold items ──────────────── */
    setTimeout(() => {
        document.querySelectorAll('.reveal').forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 80);
})();

/* ─── WhatsApp button click tracking (optional analytics) ──── */
(function () {
    const btn = document.getElementById('btn-whatsapp');
    if (!btn) return;

    btn.addEventListener('click', () => {
        /* If you add Meta Pixel later: fbq('track', 'Lead'); */
        console.info('[Neuro Atividades] CTA WhatsApp clicado.');
    });
})();
