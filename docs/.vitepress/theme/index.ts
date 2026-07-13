import DefaultTheme from 'vitepress/theme';
import '@scalar/api-reference/style.css';
import ApiReference from './ApiReference.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ApiReference', ApiReference);
  }
};
