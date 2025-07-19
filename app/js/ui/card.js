import { AppBaseUI } from './base.js';

import { Card } from '../data/card.js';
import { Sensitivity } from '../data/enums.js';

import {
  BingoSquareElem,
  DatasetElem,
  FlagElem,
  SensitivityElem
} from '../elems.js';

class CardUI extends AppBaseUI {
  constructor() {
    super();

    this.card = null;

    this.import_hoist = document.querySelector('#import-card-code');
    this.export_hoist = document.querySelector('#export-card-code');

    this.bingo_hoist = document.querySelector('#bingo-frame');
    this.dataset_opt_hoist = document.querySelector('#dataset-selection');
    this.sensitivity_opt_hoist = document.querySelector('#sensitivity-limit-selection');
    this.flag_opt_hoist = document.querySelector('#flag-selection');

    this.dataset_opt_elem = new DatasetElem(this, this.dataset_opt_hoist);
    this.sensitivity_opt_elem = new SensitivityElem(this, this.sensitivity_opt_hoist);
    this.flag_opt_elem = new FlagElem(this, this.flag_opt_hoist);
    this.bingo_square_elem = new BingoSquareElem(this, this.bingo_hoist);

    this.load_config()
      .then(this.load_form.bind(this))
      .then(this.bind_event_handlers.bind(this))
      .catch(err => {
        this.ui_toast('danger', err);
        throw err;
      });
  }

  flush() {
    let els = this.dataset_opt_hoist.querySelectorAll('option');
    els.forEach(el => this.dataset_opt_hoist.removeChild(el));
  }

  async load_form() {
    this.datasets.forEach(dataset => {
      this.dataset_opt_elem.update(dataset);
      this.dataset_opt_elem.display();
    });
    Object.keys(Sensitivity.vals).forEach(sensitivity => {
      this.sensitivity_opt_elem.update(sensitivity.toLowerCase());
      this.sensitivity_opt_elem.display();
    });
    this.available_flags.forEach(flag => {
      this.flag_opt_elem.update(flag);
      this.flag_opt_elem.display();
    });

    this.toggle_prompt_form(true);
    this.toggle_prompt_result(false);

    this.toggle_loading_spinner(false);
    this.toggle_show_content(true);
  }

  async import() {
    this.card = new Card();

    try {
      this.card.deserialize(this.import_hoist.value);
    } catch(err) {
      console.error(err);
      this.ui_toast('danger', 'Import failed');
    }

    this.import_hoist.value = '';

    this.render();
  }

  async build() {
    this.card = new Card();

    const chosen_dataset = this.dataset_opt_hoist.value;
    const sensitivity_limit = Sensitivity.convert(this.sensitivity_opt_hoist.value);
    const available_flags = new Set(this.available_flags);
    const chosen_flags = new Set(Array.from(this.flag_opt_hoist.selectedOptions).map(option => option.label));
    const banned_flags = Array.from(available_flags.difference(chosen_flags));

    this.card.set_dataset_name(chosen_dataset);
    this.card.set_sensitivity_limit(sensitivity_limit);
    this.card.set_banned_flags(banned_flags);

    await this.card.load_dataset();

    this.card.build();

    this.render();
  }

  render() {
    let i = 1;
    this.card.spaces.forEach((entry) => {
      this.bingo_square_elem.update(entry);
      if ((i++ % 5) === 0) {
        this.bingo_square_elem.set_force_col_break();
      }
      this.bingo_square_elem.display();
    });

    this.clearExport();

    if (!navigator.clipboard) {
      document.querySelector('button#copy-export').classList.add('collapse');
    }

    this.toggle_prompt_result(true);
    this.toggle_prompt_form(false);

    this.toggle_loading_spinner(false);
    this.toggle_show_content(true);
  }

  reload() {
    this.toggle_loading_spinner(true);
    this.toggle_show_content(false);
    // this.flush();
    return this.load();
  }

  toggle_prompt_form(visible = true) {
    if(visible === true) {
      document.querySelector('#prompt-form').classList.remove('collapse');
    } else {
      document.querySelector('#prompt-form').classList.add('collapse');
    }
  }

  toggle_prompt_result(visible = false) {
    if(visible === true) {
      document.querySelector('#prompt-result').classList.remove('collapse');
    } else {
      document.querySelector('#prompt-result').classList.add('collapse');
    }
  }

  prepareExport() {
    this.export_hoist.value = this.card.serialize();
  }

  clearExport() {
    this.export_hoist.value = '';
  }

  async copyExportToClipboard() {
    if(!this.export_hoist.value) {
      this.prepareExport();
    }

    try {
      await navigator.clipboard.writeText(this.export_hoist.value);
    } catch (err) {
      console.error(err);
      this.ui_toast('danger', 'Failed to copy to clipboard');
      return;
    }

    this.ui_toast('success', 'Copied to clipboard');
  }

  bind_event_handlers() {
    document.querySelector('button#submit').addEventListener('click', (ev) => {
      this.toggle_show_content(false);
      this.toggle_loading_spinner(true);
      this.build()
        .catch((err) => {
          this.ui_toast('danger', err);
          throw err;
        });

      ev.preventDefault();
    });

    document.querySelector('button#import').addEventListener('click', (ev) => {
      ev.preventDefault();

      if (!this.import_hoist.value.length) {
        this.ui_toast('warning', "Need an exported card code to import");
        return;
      }

      this.toggle_show_content(false);
      this.toggle_loading_spinner(true);
      this.import()
        .catch((err) => {
          this.ui_toast('danger', err);
          throw err;
        });
    });

    document.querySelector('button#rebuild').addEventListener('click', (ev) => {
      this.toggle_prompt_form(true);
      this.toggle_prompt_result(false);

      ev.preventDefault();
    });

    document.querySelector('button#export').addEventListener('click', (ev) => {
      this.prepareExport();

      ev.preventDefault();
    });

    document.querySelector('button#copy-export').addEventListener('click', (ev) => {
      this.copyExportToClipboard();

      ev.preventDefault();
    });

    this.bingo_hoist.addEventListener('click', (ev) => {
      let target = null;
      if (ev.target.classList.contains('is-bingo-square')) {
        target = ev.target;
      } else if (ev.target.parentNode.classList.contains('is-bingo-square')) {
        target = ev.target.parentNode;
      } else {
        return;
      }

      const id = target.getAttribute('data-id').split('-').slice(-1);
      const marked = this.card.spaces[id].mark();

      if (marked) {
        target.classList.add('marked-square');
      } else {
        target.classList.remove('marked-square');
      }

      this.clearExport();

      ev.preventDefault();
    })
  }
}

export { CardUI };
