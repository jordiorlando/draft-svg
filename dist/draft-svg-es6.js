/*
* draft-svg - A plugin for draft.js that renders models using SVG
* version v0.1.1
* http://draft.D1SC0te.ch
*
* copyright Jordi Pakey-Rodriguez <jordi.orlando@hexa.io>
* license MIT
*
* BUILT: Tue Feb 02 2016 03:41:51 GMT-0600 (CST)
*/
(function() {
  draft.View.mixin({
    svg(width, height) {
      this._svgMaxWidth = width || this._svgMaxWidth || this.width();
      this._svgMaxHeight = height || this._svgMaxHeight || this.height();

      if (this._svg === undefined) {
        const NS = 'http://www.w3.org/2000/svg';
        // const XMLNS = 'http://www.w3.org/2000/xmlns/';
        // const XLINK = 'http://www.w3.org/1999/xlink';
        const VERSION = '1.1';

        var calcX = function(element) {
          return draft.px(element.prop('x')) - element.width() / 2;
        };

        var calcY = function(element) {
          return -draft.px(element.prop('y')) - element.height() / 2;
        };

        var domPrefix = `${this.doc.domID}:${this.domID}:svg`;
        var domID = function(element) {
          return `${domPrefix}:${element.domID}`;
        };

        var find = function(element) {
          return document.getElementByID(domID(element));
        };

        var render = function(element) {
          console.info('rendering svg:', element.domID);

          var node = document.createElementNS(NS, element.type);

          // TODO: separate listener for each property?
          var listener;

          var styleListener = function(prop, val) {
            prop = prop.replace('.color', '').replace('.', '-');

            var color = /^(fill|stroke)(-opacity)?$/;
            var stroke = /^stroke-(width)?$/;

            if (color.test(prop) || stroke.test(prop)) {
              node.setAttribute(prop, val);
            }
          };

          var setStyle = function(...args) {
            element.on('change', styleListener);

            for (let style of args) {
              for (let prop of ['color', 'opacity', 'width']) {
                prop = `${style}.${prop}`;
                let val = element.prop(prop) || draft.defaults[prop];

                styleListener.apply({target: element}, [prop, val]);
              }
            }
          };

          switch (element.type) {
            case 'group':
              node = document.createElementNS(NS, 'g');

              for (let child of element.children) {
                let childNode = render(child);
                if (childNode) {
                  node.appendChild(childNode);
                }
              }

              element.on('add', function(child) {
                let childNode = render(child);
                if (childNode) {
                  node.appendChild(childNode);
                }
              });

              element.on('remove', function(child) {
                node.removeChild(find(child));
              });
              // Falls through
            case 'rect':
              setStyle('fill', 'stroke');

              listener = function(prop, val) {
                val = draft.px(val);

                switch (prop) {
                  case 'width':
                    node.setAttribute('width', val);
                    // Falls through
                  case 'x':
                    node.setAttribute('x', calcX(this.target));
                    break;
                  case 'height':
                    node.setAttribute('height', val);
                    // Falls through
                  case 'y':
                    node.setAttribute('y', calcY(this.target));
                    break;
                }
              };

              break;
            case 'circle':
              setStyle('fill', 'stroke');

              listener = function(prop, val) {
                val = draft.px(val);

                /* if (prop === 'cy') {
                  val *= -1;
                }

                node.setAttribute(prop, val); */

                switch (prop) {
                  case 'r':
                    node.setAttribute('r', val);
                    break;
                  case 'x':
                    node.setAttribute('cx', val);
                    break;
                  case 'y':
                    node.setAttribute('cy', -val);
                    break;
                }
              };

              break;
          }

          // TODO: support all elements
          if (typeof listener === 'function') {
            node.id = domID(element);

            for (let prop in element.prop()) {
              listener.apply({target: element}, [prop, element.prop(prop)]);
            }

            element.on('change', listener);

            return node;
          }
        };

        var svg = this._svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('xmlns', NS);
        svg.setAttribute('version', VERSION);
        // svg.setAttributeNS(XMLNS, 'xmlns:xlink', XLINK);

        svg.id = domID(this);

        var listener = function(prop) {
          if (prop === 'width' || prop === 'height') {
            // 1 SVG user unit = 1px
            svg.setAttribute('viewBox', [
              calcX(this.target), calcY(this.target),
              this.target.width(), this.target.height()
            ].join(' '));

            let zoom = Math.min(
              draft.px(this.target._svgMaxWidth) / this.target.width(),
              draft.px(this.target._svgMaxHeight) / this.target.height()
            );

            let svgWidth = this.target.width() * zoom;
            let svgHeight = this.target.height() * zoom;

            this.target._svg.setAttribute('width', svgWidth);
            this.target._svg.setAttribute('height', svgHeight);

            // console.info('aspect ratio:', this.target.aspectRatio);
          }
        };

        listener.apply({target: this}, ['width']);
        listener.apply({target: this}, ['height']);

        this.on('change', listener);

        svg.appendChild(render(this.parent));
      }

      return this._svg;
    }
  });
})();
