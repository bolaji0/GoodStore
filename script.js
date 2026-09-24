// category filter
  const pills = document.querySelectorAll('.cat-pill');
  const cards = document.querySelectorAll('.p-card');
  pills.forEach(p => {
    p.addEventListener('click', () => {
      pills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      const cat = p.dataset.cat;
      cards.forEach(c => {
        c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
      });
    });
  });

  // notify me toast
  const toast = document.getElementById('toast');
  let toastTimer;
  document.querySelectorAll('.notify-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
    });
  });