export function initAboutPage() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  const revealElements = document.querySelectorAll('.scroll-reveal');

  revealElements.forEach(element => {
    observer.observe(element);
  });

  if (revealElements.length > 0) {
    const viewportHeight = window.innerHeight;
    revealElements.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < viewportHeight - 100) {
        el.classList.add('visible');
      }
    });
  }

  setTimeout(() => {
    document.querySelectorAll('.scroll-reveal:not(.visible)').forEach(el => {
      el.classList.add('visible');
    });
  }, 3000);

  document.addEventListener('DOMContentLoaded', () => {
    const timelineItems = document.querySelectorAll('.timeline li[contenteditable]');

    timelineItems.forEach(item => {
      const key = item.getAttribute('data-key');
      const savedContent = localStorage.getItem(`timeline_${key}`);
      if (savedContent) {
        item.innerHTML = savedContent;
      }
    });

    timelineItems.forEach(item => {
      item.addEventListener('input', () => {
        const key = item.getAttribute('data-key');
        localStorage.setItem(`timeline_${key}`, item.innerHTML);
      });
    });
  });
}
