# AGENTS.md

Инструкции для ИИ-агентов, работающих в этом репозитории.

## Что это за проект

<!-- ЗАПОЛНИТЬ: что за сайт, для кого, ключевые особенности — 1–3 предложения. -->

- **Astro 7**, статическая сборка, Node >= 22.12.0, npm
- **SCSS** (`sass-embedded`) + каскадные слои, без Tailwind и других CSS-фреймворков
- **Чистый JS.** TypeScript в проекте не используется: пишем `.js` и `.astro`, `.ts` не создавать. `tsconfig.json` лежит только для подсказок в редакторе
- **Prettier** — единственный форматтер; окончания строк LF зафиксированы в `.gitattributes`

Не добавлять без явной просьбы: TypeScript, тесты, линтеры, Tailwind и другие UI-фреймворки, JS-фреймворки (React/Vue/Svelte), SEO-интеграции (sitemap, robots.txt), аналитику.

## Команды

```bash
npm run dev            # дев-сервер, порт 4321
npm run dev -- --host  # то же + доступ по локальной сети
npm run build          # сборка в dist/
npm run preview        # просмотр собранного dist/
npm run format         # prettier --write .
npm run format:check   # prettier --check . (должно быть чисто перед сдачей работы)
npm run astro -- <cmd> # прямой доступ к CLI Astro
```

После правок конфига, стилей или страниц: `npm run build` (убедиться, что собирается) и `npm run format:check` (убедиться, что формат в порядке).

## Структура

- `src/pages/` — страницы: `index.astro` (главная), `404.astro` (собирается в `404.html`)
- `src/layouts/Layout.astro` — `<html>`, head, пропсы `title`/`description`/`image`, og-теги, `canonical`, подключение шрифта и `global.scss`. Страницы оборачивать в него, не дублировать head
- `src/components/` — `Header`, `Footer`, `ArtDirectedImage`
- `src/assets/` — картинки для обработки Astro (импортируются в код)
- `public/` — статика как есть (`favicon.svg`, `og-image.webp`)
- `src/styles/` — `global.scss` (точка входа) + partials `_layers`, `_reset`, `_custom-reset`, `_base`, `_mixins`

<!-- ЗАПОЛНИТЬ: что появилось в проекте сверх каркаса — нестандартные папки, интеграции, данные из CMS и т.п. -->

## Правила стилей

**Миксины подставляются автоматически.** В `astro.config.mjs` настроен `vite.css.preprocessorOptions.scss.additionalData`, который добавляет `@use "src/styles/_mixins.scss" as *` в каждый SCSS-блок. Поэтому в `<style lang="scss">` компонента не нужно писать `@use` для миксинов — они уже доступны:

```scss
.card {
  @include mobile-down {
    padding: 12px;
  }
}
```

Есть `mobile-down` / `mobile-up`, `hover` (только устройства с мышью), `visually-hidden`, `absolute-cover`; переменные `$mobile`, `$min-mobile`, `$container`. Не вводить новые брейкпоинты и не писать `@media (max-width: ...)` руками — использовать миксины.

**Слои.** Порядок объявлен один раз в `_layers.scss` (`@layer reset, base;`): правила из `reset` слабее, чем из `base`. Стили в `<style>` компонента идут **вне слоёв** и перебивают и reset, и base — если нужно переопределить базовый стиль, пиши его прямо в компоненте, специфичность выкручивать не нужно. Новый слой: добавить имя в строку объявления по возрастанию приоритета, завести partial и подключить его через `@use` в `global.scss`.

**Шрифт** — Roboto через конфиг (`fonts` в `astro.config.mjs`), в `Layout.astro` подключается компонентом `<Font cssVariable="--font-roboto" preload />` и применяется через `font-family: var(--font-roboto)`.

<!-- ЗАПОЛНИТЬ при необходимости: типографика и цвета проекта — шрифты, размеры, переменные. -->

## Картинки

`getImage()`, `<Image>`, `<Picture>` принимают только **импортированные** картинки:

```astro
---
import img from '../assets/photo.jpg';
---
```

Строковый путь из `public/` они не принимают. `ArtDirectedImage.astro` — готовый компонент для разных пропорций на мобиле и десктопе (`<picture>` + `<source media>` + 2x), внутри файла шпаргалка по остальным случаям.

## Что учесть при работе

- Комментарии в коде — на русском, по делу, без пересказа очевидного.
- Не коммитить `dist/`, `.astro/`, `node_modules/` — они в `.gitignore`.
- <!-- ЗАПОЛНИТЬ при необходимости: договорённости по проекту — доступы, макеты, чего делать нельзя. -->
