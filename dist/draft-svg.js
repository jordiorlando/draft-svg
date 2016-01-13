/*
* draft-svg - A plugin for draft.js that renders drafts using SVG
* version v0.0.0
* https://github.com/D1SC0tech/draft-svg
*
* copyright Jordi Pakey-Rodriguez <jordi.orlando@gmail.com>
* license MIT
*
* BUILT: Tue Jan 12 2016 18:52:31 GMT-0600 (CST)
*/
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

  var svg = {
    // TODO: add elements to SVG dom as they are created in js
    renderSVG: function(width, height) {
      var create = function(element, type) {
        var svg = document.createElementNS(NS, type);
        element.dom.svg = svg;
        return svg;
      };

      var calcX = function(element) {
        return Draft.px(element.prop('x')) - Draft.px(element.width()) / 2;
      };

      var calcY = function(element) {
        return -Draft.px(element.prop('y')) - Draft.px(element.height()) / 2;
      };

      var svg = create(this, 'svg');
      svg.setAttribute('xmlns', NS);
      svg.setAttribute('version', VERSION);
      // svg.setAttributeNS(XMLNS, 'xmlns:xlink', XLINK);

      svg.setAttribute('id', this.getID());
      svg.setAttribute('width', width);
      // svg.setAttribute('max-height', height);

      // 1 SVG user unit = 1px
      svg.setAttribute('viewBox', [
        calcX(this), calcY(this),
        Draft.px(this.width()), Draft.px(this.height())
      ].join(' '));

      recursive(this, function(obj, key) {
        if (key == 'parent' || obj[key] instanceof Draft.Doc || obj[key] instanceof Draft.View) {
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
                svg.setAttribute('width', Draft.px(val));
              } else if (prop == 'height') {
                svg.setAttribute('height', Draft.px(val));
              }

              if (prop == 'x' || prop == 'width') {
                svg.setAttribute('x', calcX(this.target));
              } else if (prop == 'y' || prop == 'height') {
                svg.setAttribute('y', calcY(this.target));
              }
              // svg.setAttribute('x', );
            };

            listener.apply({target: obj[key]}, ['width', obj[key].width()]);
            listener.apply({target: obj[key]}, ['height', obj[key].height()]);
            listener.apply({target: obj[key]}, ['x', obj[key].prop('x')]);
            listener.apply({target: obj[key]}, ['y', obj[key].prop('y')]);
            // svg.setAttribute('x', );
          } else if (type == 'circle') {
            listener = function(prop, val) {
              val = Draft.px(val);

              if (prop == 'r') {
                svg.setAttribute('r', val);
              } else if (prop == 'x') {
                svg.setAttribute('cx', Draft.px(val));
              } else if (prop == 'y') {
                svg.setAttribute('cy', -Draft.px(val));
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
  Draft.View.mixin(svg);
})();
