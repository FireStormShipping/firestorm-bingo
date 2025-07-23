export default class ThemeToggle {
  constructor(buttonId = 'theme_toggler') {
    this.button = document.getElementById(buttonId);
    this.root = document.documentElement;

    if (!this.button) return;

    this.button.addEventListener('click', () => this.toggleTheme());
  }

  toggleTheme() {
    const current = this.root.getAttribute('data-bs-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    this.root.setAttribute('data-bs-theme', newTheme);
    this.updateIcon(newTheme);
  }

    updateIcon(theme) {
      const darkIcon = document.getElementById('toggle_dark');
      const lightIcon = document.getElementById('toggle_light');
      
    if (theme === 'dark') {
      lightIcon.classList.remove('d-none');
      darkIcon.classList.add('d-none');
    } else {
      darkIcon.classList.remove('d-none');
      lightIcon.classList.add('d-none');
    }
  }
}
