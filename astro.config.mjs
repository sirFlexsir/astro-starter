import { defineConfig, fontProviders } from 'astro/config';

import icon from 'astro-icon';

export default defineConfig({
  fonts: [
    {
      provider: fontProviders.google(), // или fontProviders.fontsource()
      name: 'Roboto',
      cssVariable: '--font-roboto',
      weights: [100, 400, 500, 700, 900], // нужные начертания
      styles: ['normal'],
      subsets: ['cyrillic', 'latin'], // если нужна поддержка кириллицы
      formats: ['woff2'],
    },
  ],

  devToolbar: {
    enabled: false,
  },

  // Подгрузка страниц заранее: браузер тянет страницу при наведении/фокусе на ссылку,
  // переходы становятся почти мгновенными. Работает только для ссылок внутри сайта.
  // Отключить у отдельной ссылки: <a href="/page" data-astro-prefetch="false">
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover', // ещё варианты: 'tap' | 'viewport' | 'load'
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "/src/styles/helpers/_index.scss" as *;`,
        },
      },
    },
  },

  integrations: [icon()],
});
