# draft-svg

**draft-svg** is a plugin for [draft.js](https://github.com/D1SC0tech/draft.js) that renders drafts using SVG.

draft-svg is licensed under the terms of the [MIT License](https://opensource.org/licenses/MIT).

## Getting Started

Include the plugin after draft.js in your html file:

```html
<head>
  ...
  <script src="draft.js/dist/draft.min.js"></script>

  <script src="draft-svg/dist/draft-svg.min.js"></script>
</head>
<body>
  <div id="view" style="width: 100%; height: 100%"></div>
</body>
```

Write a new script and include it after your html content:

```javascript
// Create a new Draft document and add a page to it
var doc = Draft.doc('my_document');
var page = doc.page('page_1').size(600, 400);

// Add some shapes to the page
var rect = page.rect(200, 150).fill('#18f');
var circle = page.circle(50).fill('#f1c');

// Use the draft-svg plugin to render an image
var view = document.getElementById('view');
view.appendChild(page.svg());
```

## Acknowledgements

- [Wout Fierens](https://github.com/wout), [Ulrich-Matthias Schäfer](https://github.com/Fuzzyma), and all the other contributors to the SVG.js library.
