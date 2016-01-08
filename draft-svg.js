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

  /*function set(svg, name, val, namespace) {
    typeof namespace == 'string' ?
      svg.setAttributeNS(namespace, name, val) :
      svg.setAttribute(name, val);
  }*/

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

      /*console.log(this.properties);
      console.log('');*/

      recursive(this, function(obj, key) {
        if (key == 'parent' || obj[key] instanceof Draft.Doc) {
          return false;
        } else if (obj[key] instanceof Draft.Element) {
          console.log('rendering:', obj[key].properties);

          // TODO: remove this check and modularize svg creation
          if (obj[key].parent.dom.svg) {
            var listener = function(e) {
              // console.log('event:', e.detail);

              var type = e.detail.type;
              var prop = e.detail.prop;
              var val = Draft.px(e.detail.val);
              var svg = e.target.element.dom.svg;

              if (type == 'rect') {
                if (prop == 'width') {
                  svg.setAttribute('width', val);
                } else if (prop == 'height') {
                  svg.setAttribute('height', val);
                }
                // svg.setAttribute('x', );
              } else if (type == 'circle') {
                if (prop == 'r') {
                  svg.setAttribute('r', val);
                }
              }
            };

            obj[key].dom.node.addEventListener('update', listener, false);

            var type = obj[key].properties.type;
            var svg = create(obj[key], type);
            svg.setAttribute('fill-opacity', 0);
            svg.setAttribute('stroke', '#000');

            if (type == 'rect') {
              svg.setAttribute('width', Draft.px(obj[key].width()));
              svg.setAttribute('height', Draft.px(obj[key].height()));
              // svg.setAttribute('x', );
            } else if (type == 'circle') {
              svg.setAttribute('r', Draft.px(obj[key].radius()));
            }

            obj[key].parent.dom.svg.appendChild(svg);
          }

          return obj[key];
        }

        return undefined;
      });

      return svg;
    }
  };

  // Draft.extend(Draft.Container, svg);
  Draft.Page.mixin(svg);
})();
