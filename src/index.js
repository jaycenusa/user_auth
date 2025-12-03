import './styles.css';

console.log('Frontend bundle loaded');

// Example: attach a small DOM change to confirm bundle is loaded
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('app');
  if (el) el.textContent = 'Hello from webpack bundle';
});
