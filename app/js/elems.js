class UIElement {
  constructor(tag, ui, parent, data) {
    this.ui = ui;
    this.tag = tag;
    this.parent = parent;
    this.data = null;
    if(data) {
      this.update(data);
    }
  }

  update(data) {
    this.data = data;
  }

  get_parent() {
    return this.parent;
  }

  get_element() {
    return this.get_parent().querySelector(`${this.tag}[data-id='${this.data.id}']`);
  }

  display() {
    let el = this.get_element();
    if (el === null) {
      el = document.createElement(this.tag);
      this.get_parent().append(el);
    }

    el.outerHTML = this.render();
  }

  destroy() {
    if(this.data === null) {
      return;
    }

    const el = this.get_element();
    this.get_parent().removeChild(el);
  }

  lifecycle(data, destroy = false) {
    if (destroy) {
      this.destroy();
    }
    this.update(data);
    this.display();
  }

  render() {
    return `<${this.tag}><p>No render defined for UIElement.</p></${this.tag}>`;
  }
}

class DatasetElem extends UIElement {
  static TagName = 'option';
  constructor(ui, parent, data) {
    super(DatasetElem.TagName, ui, parent, data);
  }

  get_element() {
    return this.get_parent().querySelector(`${this.tag}[data-id='dataset-${this.data}']`);
  }

  render() {
    return `<${this.tag} data-id="dataset-${this.data}">${this.data}</${this.tag}>`;
  }
}

class SensitivityElem extends UIElement {
  static TagName = 'option';
  constructor(ui, parent, data) {
    super(SensitivityElem.TagName, ui, parent, data);
  }

  get_element() {
    return this.get_parent().querySelector(`${this.tag}[data-id='sensitivity-${this.data}']`);
  }

  render() {
    return `<${this.tag} data-id="sensitivity-${this.data}">${this.data}</${this.tag}`;
  }
}

class FlagElem extends UIElement {
  static TagName = 'option';
  constructor(ui, parent, data) {
    super(FlagElem.TagName, ui, parent, data);
  }

  get_element() {
    return this.get_parent().querySelector(`${this.tag}[data-id='flag-${this.data}']`);
  }

  render() {
    return `<${this.tag} data-id="flag-${this.data}">${this.data}</${this.tag}>`;
  }
}

class BingoSquareElem extends UIElement {
  static TagName = 'bingo-square';
  constructor(ui, parent, data) {
    super(BingoSquareElem.TagName, ui, parent, data);
    this.force_col_break = false;
  }

  set_force_col_break() {
    this.force_col_break = true;
  }

  get_element() {
    return this.get_parent().querySelector(`${this.tag}[data-id='bingo-square-num-${this.data.index}']`);
  }

  get_marked_class() {
    return this.data.is_marked() ? 'marked-square' : '';
  }

  get_sensitivity_class() {
    return `sensitivity-${this.data.sensitivity.description}`;
  }

  get_force_col_break() {
    if (this.force_col_break) {
      this.force_col_break = false;
      return '<div class="w-100 force-col-break"></div>';
    } else {
      return '';
    }
  }

  render() {
    return `
    <${this.tag} class="is-bingo-square col px-0 h-100 d-flex border align-items-center justify-content-center ${this.get_marked_class()} ${this.get_sensitivity_class()}" data-id="bingo-square-num-${this.data.index}">
      <div class="text-responsive text-center text-break">${this.data.text}</div>
    </${this.tag}>${this.get_force_col_break()}`;
  }
}

class BootstrapThemeToggle {
  constructor(buttonId = 'theme_toggle') {
    this.button = document.getElementById(buttonId);
    this.root = document.documentElement; // <html>

    if (!this.button) return;

    this.button.addEventListener('click', () => this.toggleTheme());
    this.setInitialTheme();
  }

  toggleTheme() {
    const current = this.root.getAttribute('data-bs-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    this.root.setAttribute('data-bs-theme', newTheme);
    this.updateIcon(newTheme);
  }

    updateIcon(theme) {
    if (theme === 'dark') {
      this.icon.classList.remove('fa-moon');
      this.icon.classList.add('fa-sun');
    } else {
      this.icon.classList.remove('fa-sun');
      this.icon.classList.add('fa-moon');
    }
  }
}

export {
  BingoSquareElem,
  DatasetElem,
  FlagElem,
  SensitivityElem,
  BootstrapThemeToggle
};
