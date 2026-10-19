# Стартовый шаблон Astro

Пустой каркас под вёрстку на Astro: SCSS с каскадными слоями, шрифты через конфиг, prettier, адаптивные картинки с art direction. Никаких стилей и готовых страниц здесь нет намеренно — только то, что переиспользуется в любом проекте, чтобы начинать с чистого листа.

## Требования

- **Node.js >= 22.12.0** (шаблон проверен на 26.7.0)
- **npm** (в проекте `package-lock.json`)

## Быстрый старт

```bash
npm install
npm run dev        # http://localhost:4321
```

## Команды

| Команда                      | Что делает                                                                  |
| ---------------------------- | --------------------------------------------------------------------------- |
| `npm install`                | поставить зависимости                                                       |
| `npm run dev`                | дев-сервер на http://localhost:4321                                         |
| `npm run dev -- --host`      | то же, но доступно с телефона по локальной сети (Astro покажет ссылку с IP) |
| `npm run build`              | сборка в `dist/`                                                            |
| `npm run preview`            | локальный просмотр собранного `dist/`                                       |
| `npm run format`             | prettier: отформатировать всё                                               |
| `npm run format:check`       | prettier: только проверить (для CI)                                         |
| `npm run astro -- <команда>` | прямой доступ к CLI Astro                                                   |
| `npx astro info`             | версии node, astro, пакетов — одним экраном                                 |

Из CLI Astro полезно: `npm run astro -- dev --background` (дев-сервер в фоне), дальше `dev logs --follow`, `dev status`, `dev stop`.

Перед сдачей работы: `npm run build` (собирается) и `npm run format:check` (формат в порядке).

## Стек

- **Astro 7** — статическая сборка, без SSR и адаптеров
- **SCSS** (`sass-embedded`) + каскадные слои; без Tailwind и других CSS-фреймворков
- **Чистый JS**: пишем `.js` и `.astro`. TypeScript не используется — `tsconfig.json` нужен только для подсказок в редакторе
- **Prettier** с плагином для `.astro` — единственный форматтер
- **astro-icon** подключён в конфиге, но наборов иконок нет (см. «Что сделать при старте проекта»)

## Структура

```
public/                 статика как есть: favicon.svg, og-image.webp
src/
  assets/               картинки, которые обрабатывает Astro (импортируются в код)
  components/           Header, Footer, ArtDirectedImage
  layouts/Layout.astro  <html>, head, meta, og, подключение шрифта и global.scss
  pages/                страницы = файлы: index.astro, 404.astro
  styles/
    global.scss         точка входа: подключает слои, reset и base
    _layers.scss        объявление порядка слоёв
    _reset.scss         сброс (Josh Comeau)
    _custom-reset.scss  доп. сброс под нужды вёрстки
    _base.scss          базовые стили (пока пусто — это место для них)
    helpers/
      _index.scss       барель хелперов: @forward остальных файлов папки
      _media.scss       брейкпоинты и переменные $mobile, $min-mobile, $container
      _mixins.scss      миксины (media-хелперы, hover, visually-hidden, absolute-cover)
      _functions.scss   функции (пока пусто)
```

## Как это устроено

**Хелперы.** В `astro.config.mjs` настроен `vite.css.preprocessorOptions.scss.additionalData`, который подставляет `@use "/src/styles/helpers/_index.scss" as *` в каждый SCSS-блок, который компилирует Vite (то есть в `global.scss` и в `<style lang="scss">` компонентов). Поэтому в компоненте пишем сразу:

```scss
.card {
  @include mobile-down {
    padding: 12px;
  }

  @include hover {
    color: red;
  }
}
```

Хелперы разложены по файлам в `src/styles/helpers/`, наружу их отдаёт `_index.scss` через `@forward`. Новый модуль: создать `_имя.scss` рядом, добавить `@forward 'имя';` в `_index.scss`, а зависимости самого модуля подключить `@use` внутри него (порядок `@forward` в барели соседние файлы друг другу не видит). В partials, которые грузятся через `@use` из `global.scss` (например `_base.scss`), автоподстановки нет — там пишем `@use './helpers/index' as *;` явно.

Есть: `mobile-down` / `mobile-up` (граница 560px), `hover` (только мышь, не тач), `visually-hidden`, `absolute-cover`. Переменные: `$mobile` (560px), `$min-mobile` (375px), `$container` (950px) — в `helpers/_media.scss`. Новые брейкпоинты не вводим и `@media (max-width: ...)` руками не пишем — только через миксины.

**Слои.** Порядок объявлен один раз в `_layers.scss`: `@layer reset, base;` — правила из `reset` слабее, чем из `base`. Всё, что написано в `<style>` компонента, идёт **вне слоёв** и перебивает и reset, и base, без выкручивания специфичности. Новый слой добавляем в строку объявления по возрастанию приоритета и заводим под него partial с `@use` в `global.scss`.

**Шрифт** подключается в `Layout.astro` компонентом `<Font cssVariable="--font-roboto" preload />`, начертания и подмножества задаются в `astro.config.mjs` (`fonts`, сейчас Roboto: 100/400/500/700/900, `cyrillic`+`latin`). Применяется через `font-family: var(--font-roboto)`. Другой шрифт — меняем `name` в массиве `fonts`.

**Картинки.** `getImage()` и `<Image>` работают только с **импортированными** картинками (`import img from '../assets/a.jpg'`), строковый путь из `public/` они не принимают. `ArtDirectedImage` — разные пропорции на мобиле и десктопе (`<picture>` + два `<source media>`, retina 2x), проп `isHero` включает `loading="eager"` и `fetchpriority="high"`; внутри файла шпаргалка на остальные случаи (`widths` для гибких, `densities` для фиксированных).

**Prefetch.** В конфиге `prefetchAll: true`, стратегия `hover` — браузер тянет страницу при наведении на внутреннюю ссылку. Отключается у отдельной ссылки: `<a href="/page" data-astro-prefetch="false">`.

**Формат.** Prettier: одинарные кавычки, 2 пробела, 100 символов, точки с запятой, плагин для `.astro`. В `.gitattributes` зафиксированы LF — иначе на Windows при `core.autocrlf=true` в файлы приезжает CRLF и `format:check` ругается на каждый файл.

## Заготовки

- `Layout.astro` — пропсы `title`, `description`, `image` (по умолчанию `'Заголовок'`, `'Описание сайта'`, `/og-image.webp`); внутри `og:*`, `canonical`, `<html lang="ru">`, favicon, шрифт. Новые страницы оборачиваем в него, head не дублируем
- `index.astro` — `Layout` + `Header` + `<main>` + `Footer`, под текст-заглушку
- `404.astro` — «страница не найдена», собирается в `404.html` (хостинги подхватывают автоматически)
- `Header` / `Footer` — пустые обёртки с заготовками `<style lang="scss">` и `<script>`
- `src/assets/*.jpg` — демо-картинки для `ArtDirectedImage` (`main`, `main-mobile`, `history`, `mob-history`, `p1`–`p3`). В проекте их удалить или заменить своими

## Что сделать при старте проекта

1. `"name"` в `package.json` и заголовок с описанием в этом README — сейчас он описывает шаблон, а не проект.
2. `site: 'https://домен'` в `astro.config.mjs` — от него считаются `canonical` и `og:image`. Пока он не задан, они указывают на localhost, в том числе в сборке.
3. Дефолтные `title` / `description` в `Layout.astro` (`'Заголовок'` и `'Описание сайта'`).
4. Свой `favicon.svg` и `og-image.webp` в `public/`.
5. Иконки: поставить нужный набор, иначе сборка падает с `Unable to locate the "mdi" icon set!` — например `npm i -D @iconify-json/ph` (варианты: `@iconify-json/mdi`, `@iconify-json/tabler`).
6. При другой типографике — правки в `fonts` (`astro.config.mjs`) и базовые стили в `_base.scss` (`:root`, размеры, цвета).
7. Заполнить в `AGENTS.md` блоки, помеченные `ЗАПОЛНИТЬ`.
8. Убрать демо-картинки и тексты-заглушки («Хэдар», «Футер», «Мэин»).
