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
  <div id="body" style="width: 100%; height: 100%"></div>
</body>
```

Write a new script and include it after your html content:

```javascript
// Create a new draft document and add a group to it
var doc = draft('my_document');
var group = doc.group();

// Add some shapes to the group
var rect = group.rect(200, 150).fill('#18f');
var circle = group.circle(50).fill('#f1c');

// Create a view for the group
var view = group.view(600, 400);

// Use the draft-svg plugin to render an image
var body = document.getElementById('body');
body.appendChild(view.svg());
```

## Acknowledgements

- [Wout Fierens](https://github.com/wout), [Ulrich-Matthias Schäfer](https://github.com/Fuzzyma), and all the other contributors to the SVG.js library.
