/**

 simplex.js - A Simple Reactive Framework
  contains:

  -- manual state management
  -- explicit render calls
  -- template strings for components
  -- event delegation for reliability


*/


function createState(initialState, onUpdate) {
  const state = { ...initialState };

  return new Proxy(state, {
    set(target, prop, value) {
      target[prop] = value;
      if (onUpdate) onUpdate();
      return true;
    }
  });
}

function state(initialState) {
  return { ...initialState };
}


let currentApp = null;

function createApp(rootComponent) {
  let container = null;
  let appState = null;
  let renderFn = null;

  return {
    mount(selector, initialState = {}) {
      container = typeof selector === 'string'
        ? document.querySelector(selector)
        : selector;

      if (!container) {
        throw new Error(`Container not found: ${selector}`);
      }

      appState = initialState;
      currentApp = this;

      renderFn = () => {
        const html = rootComponent(appState);
        container.innerHTML = html;
        this._attachEventListeners();
      };

      renderFn();

      window.__fluxRender = renderFn;

      return this;
    },

    render() {
      if (renderFn) renderFn();
    },

    getState() {
      return appState;
    },

    setState(updates) {
      Object.assign(appState, updates);
      this.render();
    },

    _attachEventListeners() {
      const inputs = container.querySelectorAll('[data-flux-input]');
      inputs.forEach(input => {
        const handler = input.getAttribute('data-flux-input');
        if (window[handler]) {
          input.addEventListener('input', window[handler]);
        }
      });

      const keypresses = container.querySelectorAll('[data-flux-keypress]');
      keypresses.forEach(el => {
        const handler = el.getAttribute('data-flux-keypress');
        if (window[handler]) {
          el.addEventListener('keypress', window[handler]);
        }
      });
    }
  };
}


function render() {
  if (window.__fluxRender) {
    window.__fluxRender();
  } else if (currentApp) {
    currentApp.render();
  }
}


function when(condition, trueBranch, falseBranch = '') {
  return condition ? trueBranch : falseBranch;
}


function each(items, renderFn) {
  if (!items || !items.length) return '';
  return items.map(renderFn).join('');
}


function escape(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}


function html(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] || '');
  }, '');
}


function component(renderFn) {
  return renderFn;
}


function Button({ onClick, children, className = '', type = 'button' }) {
  return html`
    <button
      type="${type}"
      class="${className}"
      onclick="${onClick}"
    >
      ${children}
    </button>
  `;
}


function Input({
  type = 'text',
  value = '',
  placeholder = '',
  onInput,
  onKeypress,
  className = '',
  id = ''
}) {
  const inputHandler = onInput ? `data-flux-input="${onInput}"` : '';
  const keypressHandler = onKeypress ? `data-flux-keypress="${onKeypress}"` : '';

  return html`
    <input
      type="${type}"
      value="${escape(value)}"
      placeholder="${escape(placeholder)}"
      class="${className}"
      id="${id}"
      ${inputHandler}
      ${keypressHandler}
    />
  `;
}


function Checkbox({ checked = false, onChange, label = '' }) {
  return html`
    <label>
      <input
        type="checkbox"
        ${checked ? 'checked' : ''}
        onchange="${onChange}"
      />
      ${label ? `<span>${escape(label)}</span>` : ''}
    </label>
  `;
}


function computed(fn) {
  return {
    get value() {
      return fn();
    }
  };
}


const eventBus = {
  events: {},

  on(event, handler) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  },

  off(event, handler) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(h => h !== handler);
    }
  },

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(handler => handler(data));
    }
  }
};


export {
  createApp,
  render,
  createState,
  state,
  computed,
  when,
  each,
  escape,
  html,
  component,
  Button,
  Input,
  Checkbox,
  eventBus
};


if (typeof window !== 'undefined') {
  window.Flux = {
    createApp,
    render,
    createState,
    state,
    computed,
    when,
    each,
    escape,
    html,
    component,
    Button,
    Input,
    Checkbox,
    eventBus
  };
}


if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createApp,
    render,
    createState,
    state,
    computed,
    when,
    each,
    escape,
    html,
    component,
    Button,
    Input,
    Checkbox,
    eventBus
  };
}