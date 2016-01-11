(function() {
  const NS = 'http://www.w3.org/2000/svg';
  const XMLNS = 'http://www.w3.org/2000/xmlns/';
  const XLINK = 'http://www.w3.org/1999/xlink';
  const VERSION = '1.1';

  // TODO: move this to draft.js
  function recursive(obj, func) {
    for (let key in obj) {
      recursive(obj[key] instanceof Array ?
        obj[key] : func(obj, key), func);
    }
  }

  // 1 SVG user unit = 1px
  function viewBox(element) {
    return [
      0, 0,
      Draft.px(element.width()), Draft.px(element.height())
    ].join(' ');
  }

  function create(element, type) {
    var svg = document.createElementNS(NS, type);
    element.dom.svg = svg;
    return svg;
  }

  var svg = {
    // TODO: add elements to SVG dom as they are created in js
    svg: function(width, height) {
      var svg = create(this, 'svg');
      svg.setAttribute('xmlns', NS);
      svg.setAttribute('version', VERSION);
      // svg.setAttributeNS(XMLNS, 'xmlns:xlink', XLINK);

      svg.setAttribute('id', Draft.domID(this));
      svg.setAttribute('width', width);
      // svg.setAttribute('height', height);

      svg.setAttribute('viewBox', viewBox(this));

      recursive(this, function(obj, key) {
        if (key == 'parent' || obj[key] instanceof Draft.Doc) {
          return false;
        } else if (obj[key] instanceof Draft.Element) {
          console.info('rendering:', obj[key].prop());

          var type = obj[key].prop('type');
          var listener;

          // TODO: modularize svg creation
          var svg = create(obj[key], type);
          obj[key].parent.dom.svg.appendChild(svg);
          svg.setAttribute('fill-opacity', 0);
          svg.setAttribute('stroke', '#000');

          // TODO: separate listener for each property?
          if (type == 'rect') {
            listener = function(prop, val) {
              val = Draft.px(val);

              if (prop == 'width') {
                svg.setAttribute('width', val);
              } else if (prop == 'height') {
                svg.setAttribute('height', val);
              }
              // svg.setAttribute('x', );
            };

            listener('width', obj[key].width());
            listener('height', obj[key].height());
            // svg.setAttribute('x', );
          } else if (type == 'circle') {
            listener = function(prop, val) {
              val = Draft.px(val);

              if (prop == 'r') {
                svg.setAttribute('r', val);
              }
            };

            listener('r', obj[key].radius());
          }

          obj[key].on('change', listener);

          return obj[key];
        } else {
          return undefined;
        }
      });

      return svg;
    }
  };

  Draft.Page.mixin(svg);
})();
