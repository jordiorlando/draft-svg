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
    var node = document.createElementNS(NS, type);
    element.dom.svg = node;
    return node;
  }

  /*function set(node, name, val, namespace) {
    typeof namespace === 'string' ?
      node.setAttributeNS(namespace, name, val) :
      node.setAttribute(name, val);
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
        if (key == 'parent') {
          return false;
        } else if (obj[key] instanceof Draft.Element) {
          console.log('rendering:', obj[key].properties);

          // TODO: remove this check and modularize node creation
          if (obj[key].parent.dom.svg) {
            var listener = function(e) {
              console.log('event:', e.detail);

              let type = e.detail.type;
              let prop = e.detail.prop;
              let val = Draft.px(e.detail.val);

              if (type == 'rect') {
                if (prop == 'width') {
                  node.setAttribute('width', val);
                } else if (prop == 'height') {
                  node.setAttribute('height', val);
                }
                // node.setAttribute('x', );
              } else if (type == 'circle') {
                if (prop == 'r') {
                  node.setAttribute('r', val);
                }
              }
            };

            var type = obj[key].properties.type;
            var node = create(obj[key], type);
            node.setAttribute('fill-opacity', 0);
            node.setAttribute('stroke', '#000');
            node.addEventListener('update', listener);

            if (type == 'rect') {
              node.setAttribute('width', Draft.px(obj[key].width()));
              node.setAttribute('height', Draft.px(obj[key].height()));
              // node.setAttribute('x', );
            } else if (type == 'circle') {
              node.setAttribute('r', Draft.px(obj[key].radius()));
            }

            obj[key].parent.dom.svg.appendChild(node);
          }

          return obj[key];
        }

        return undefined;
      });

      return svg;
    }
  };

  // Draft.extend(Draft.Container, svg);
  Draft.Container.extend(svg);
})();
