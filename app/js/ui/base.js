import { Cache } from '../data/cache.js';

class AppBaseUI {
  constructor() {
    this.dataset_name = '';
    this.datasets = [];

    this.alerts_selector = document.querySelector('div.toast-container');

    this.set_theme();
  }

  config_url() {
    return './datasets/config.json';
  }

  async load_config() {
    const resp = await fetch(this.config_url());

    if (!resp.ok) {
      throw new Error('Failed to load UI config');
    }

    const config = await resp.json();

    this.datasets = config.datasets;
    this.available_flags = config.available_flags;

    return config;
  }

  toast_tpl(type, message) {
    if (!['danger', 'warning', 'success', 'primary', 'secondary', 'info'].includes(type)) {
      throw new Error('Invalid alert type specified for alert template.');
    }

    let icon = '';
    if (type === 'danger' || type === 'warning') {
      icon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-exclamation-circle" viewBox="0 0 20 20">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
        </svg>
      `;
    } else {
      icon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 20 20">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
        </svg>
      `;
    }

    return `
      <div class="toast align-items-center my-1" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-indicator text-${type} rounded ms-3 align-self-center">${icon}</div>
          <div class="toast-body">
            ${message}
          </div>
          <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;
  }

  ui_toast(type, message) {
    const el = document.createElement('div');
    this.alerts_selector.append(el);
    el.innerHTML = this.toast_tpl(type, message);

    const toast = new bootstrap.Toast(el.querySelector('div.toast'), { autohide: true, delay: 7000, animation: true });
    toast.show();

    setTimeout(() => {
      this.alerts_selector.removeChild(el);
    }, 10 * 1000);
  }

  toggle_loading_spinner(visible = false) {
    if(visible === true) {
      document.querySelector('#pending-load-spinner').classList.remove('collapse');
    } else {
      document.querySelector('#pending-load-spinner').classList.add('collapse');
    }
  }

  toggle_show_content(visible = false) {
    if(visible === true) {
      document.querySelector('#wrapper').classList.remove('pending-load');
    } else {
      document.querySelector('#wrapper').classList.add('pending-load');
    }
  }

  update_theme_icon(theme) {
    const lightIcon = document.querySelector('#theme-toggle > svg.theme-icon-light');
    const darkIcon = document.querySelector('#theme-toggle > svg.theme-icon-dark');
    if(theme === 'dark') {
      darkIcon.classList.remove('collapse');
      lightIcon.classList.add('collapse');
    } else {
      lightIcon.classList.remove('collapse');
      darkIcon.classList.add('collapse');
    }
  }

  set_theme(newTheme) {
    if(newTheme !== 'dark' && newTheme !== 'light') {
      // Check cache first, then system preference
      const savedTheme = Cache.getTheme();
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        newTheme = savedTheme;
      } else {
        newTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
    }

    document.documentElement.setAttribute('data-bs-theme', newTheme);
    this.update_theme_icon(newTheme);

    // Save theme preference to cache
    Cache.setTheme(newTheme);
  }

  toggle_theme() {
    const current = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    this.set_theme(newTheme);
  }

  bind_event_handlers() {
    document.querySelector('button#theme-toggle').addEventListener('click', (ev) => {
      this.toggle_theme();
      ev.preventDefault();
    });
  }
}

export { AppBaseUI };
