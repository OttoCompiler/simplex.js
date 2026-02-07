<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>

  <script type="module">
    import { createApp, html } from './flux-working.js';

    function Counter(state) {
      return html`
        <div>
          <h1>Count: ${state.count}</h1>
          <button onclick="increment()">Click me!</button>
        </div>
      `;
    }

    const app = createApp(Counter);

    window.increment = () => {
      const state = app.getState();
      state.count++;
      app.render();
    };

    app.mount('#app', { count: 0 });
  </script>
</body>
</html>