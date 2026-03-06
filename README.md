# Hublat Website (static)

## Structure
- `/en` English site
- `/es` Spanish site
- `/assets` shared images/css/js
- `/shared/partials` header/footer per language
- `/shared/data` optional json

## How includes work
Each page contains:
```html
<div data-include="header" data-lang="en"></div>
...
<div data-include="footer" data-lang="en"></div>
<script src="../assets/js/includes.js"></script>
```
The script fetches:
- `../shared/partials/header.en.html`
- `../shared/partials/footer.en.html`

## Tailwind
Pages currently use Tailwind CDN for fast iteration.
If you want a compiled CSS pipeline later, we can add it to your build environment (Node + Tailwind CLI).
