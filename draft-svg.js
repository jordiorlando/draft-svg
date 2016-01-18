(function() {
  const NS = 'http://www.w3.org/2000/svg';
  // const XMLNS = 'http://www.w3.org/2000/xmlns/';
  // const XLINK = 'http://www.w3.org/1999/xlink';
  const VERSION = '1.1';

  var mixin = {
    // TODO: add elements to SVG dom as they are created in js
    renderSVG(width, height) {
      var create = function(element, type) {
        var svg = document.createElementNS(NS, type);
        element.svg = svg;
        return svg;
      };

      var calcX = function(element) {
        return draft.px(element.prop('x')) - draft.px(element.width()) / 2;
      };

      var calcY = function(element) {
        return -draft.px(element.prop('y')) - draft.px(element.height()) / 2;
      };

      var svgRoot = create(this, 'svg');
      svgRoot.setAttribute('xmlns', NS);
      svgRoot.setAttribute('version', VERSION);
      // svgRoot.setAttributeNS(XMLNS, 'xmlns:xlink', XLINK);

      svgRoot.setAttribute('id', this.domID);
      svgRoot.setAttribute('width', width);
      if (height !== undefined) {
        svgRoot.setAttribute('height', height);
      }

      // 1 SVG user unit = 1px
      svgRoot.setAttribute('viewBox', [
        calcX(this), calcY(this),
        draft.px(this.width()), draft.px(this.height())
      ].join(' '));

      // TODO: move this to draft.js
      var recursive = function(obj, func) {
        for (let key in obj) {
          recursive(Array.isArray(obj[key]) ?
            obj[key] : func(obj, key), func);
        }
      };

      recursive(this, function(obj, key) {
        if (key === 'parent' ||
          obj[key] instanceof draft.Doc ||
          obj[key] instanceof draft.View) {
          return false;
        } else if (obj[key] instanceof draft.Element) {
          console.info('rendering svg:', obj[key].prop());

          var type = obj[key].type;
          var listener;

          // TODO: modularize svg creation
          var svg = create(obj[key], type);
          obj[key].parent.svg.appendChild(svg);
          svg.setAttribute('fill-opacity', 0);
          svg.setAttribute('stroke', '#000');

          // TODO: separate listener for each property?
          if (type === 'rect') {
            listener = function(prop, val) {
              val = draft.px(val);

              if (prop === 'width') {
                svg.setAttribute('width', draft.px(val));
              } else if (prop === 'height') {
                svg.setAttribute('height', draft.px(val));
              }

              if (prop === 'x' || prop === 'width') {
                svg.setAttribute('x', calcX(this.target));
              } else if (prop === 'y' || prop === 'height') {
                svg.setAttribute('y', calcY(this.target));
              }
              // svg.setAttribute('x', );
            };

            listener.apply({target: obj[key]}, ['width', obj[key].width()]);
            listener.apply({target: obj[key]}, ['height', obj[key].height()]);
            listener.apply({target: obj[key]}, ['x', obj[key].prop('x')]);
            listener.apply({target: obj[key]}, ['y', obj[key].prop('y')]);
            // svg.setAttribute('x', );
          } else if (type === 'circle') {
            listener = function(prop, val) {
              val = draft.px(val);

              if (prop === 'r') {
                svg.setAttribute('r', val);
              } else if (prop === 'x') {
                svg.setAttribute('cx', draft.px(val));
              } else if (prop === 'y') {
                svg.setAttribute('cy', -draft.px(val));
              }
            };

            listener('r', obj[key].radius());
          }

          obj[key].on('change', listener);

          return obj[key];
        }
      });

      return svgRoot;
    }
  };

  draft.Page.mixin(mixin);
  draft.View.mixin(mixin);
})();
