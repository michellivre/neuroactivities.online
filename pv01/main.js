document.addEventListener('DOMContentLoaded', () => {
    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;
            faqItem.classList.toggle('active');
            
            const arrow = button.querySelector('.arrow');
            if (arrow) {
                arrow.style.transform = faqItem.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
                arrow.style.transition = 'transform 0.3s ease';
            }
        });
    });

    // Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});
