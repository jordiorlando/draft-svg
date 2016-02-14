(function() {
  // TODO: use draft.WeakMap
  let _svg = new WeakMap();
  let _maxWidth = new WeakMap();
  let _maxHeight = new WeakMap();

  draft.View.mixin({
    svg(width = _maxWidth.get(this), height = _maxHeight.get(this)) {
      var getWidth = function(element) {
        return draft.types.length(element.prop('width')).valueOf();
      };
      var getHeight = function(element) {
        return draft.types.length(element.prop('height')).valueOf();
      };

      var calcX = function(element) {
        return draft.types.length(element.prop('x') || 0) -
          getWidth(element) / 2;
      };
      var calcY = function(element) {
        return -draft.types.length(element.prop('y') || 0) -
          getHeight(element) / 2;
      };

      var domPrefix = `${this.doc.domID}:${this.domID}:svg`;
      var domID = function(element) {
        return `${domPrefix}:${element.domID}`;
      };


      _maxWidth.set(this, width || getWidth(this));
      _maxHeight.set(this, height || getHeight(this));

      if (!_svg.has(this)) {
        const NS = 'http://www.w3.org/2000/svg';
        // const XMLNS = 'http://www.w3.org/2000/xmlns/';
        // const XLINK = 'http://www.w3.org/1999/xlink';
        const VERSION = '1.1';

        var render = function(element) {
          // console.info('rendering svg:', element.domID);

          // TODO: separate listener for each property?
          var node, listener;

          var create = function(type) {
            return document.createElementNS(NS, type);
          };

          switch (element.type) {
            case 'group':
              node = create('g');

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
                node.removeChild(document.getElementByID(domID(child)));
              });
              // Falls through
            case 'rectangle':
              node = node || create('rect');

              listener = function(prop, val) {
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
              node = create('circle');

              listener = function(prop, val) {
                switch (prop) {
                  case 'rx':
                  // Falls through
                  case 'ry':
                  // Falls through
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
          if (node) {
            node.id = domID(element);

            let hasStyle = [];
            for (let style of ['fill', 'stroke']) {
              if (style in element) {
                hasStyle.push(style);
              }
            }

            if (hasStyle.length) {
              let styleListener = function(prop, val) {
                prop = prop.replace('.color', '').replace('.', '-');

                var color = /^(fill|stroke)(-opacity)?$/;
                var stroke = /^stroke-(width)?$/;

                if (color.test(prop) || stroke.test(prop)) {
                  node.setAttribute(prop, val);
                }
              };

              for (let style of hasStyle) {
                for (let prop of ['color', 'opacity', 'width']) {
                  prop = `${style}.${prop}`;
                  let val = element.prop(prop) || draft.defaults[prop];

                  styleListener(prop, val);
                }
              }

              element.on('change', styleListener);
            }

            for (let prop in element.prop()) {
              listener.apply({target: element}, [prop, element.prop(prop)]);
            }

            element.on('change', listener);

            return node;
          }
        };

        var svg = document.createElementNS(NS, 'svg');
        _svg.set(this, svg);
        svg.setAttribute('xmlns', NS);
        svg.setAttribute('version', VERSION);
        // svg.setAttributeNS(XMLNS, 'xmlns:xlink', XLINK);

        svg.id = domID(this);

        var listener = function(prop) {
          if (prop === 'width' || prop === 'height') {
            let targetWidth = getWidth(this.target);
            let targetHeight = getHeight(this.target);

            // 1 SVG user unit = 1px
            svg.setAttribute('viewBox', [
              calcX(this.target), calcY(this.target),
              targetWidth, targetHeight
            ].join(' '));

            let zoom = Math.min(
              draft.types.length(_maxWidth.get(this.target)) / targetWidth,
              draft.types.length(_maxHeight.get(this.target)) / targetHeight
            );

            let svgWidth = targetWidth * zoom;
            let svgHeight = targetHeight * zoom;

            _svg.get(this.target).setAttribute('width', svgWidth);
            _svg.get(this.target).setAttribute('height', svgHeight);

            // console.info('aspect ratio:', this.target.aspectRatio);
          }
        };

        listener.apply({target: this}, ['width']);
        listener.apply({target: this}, ['height']);

        this.on('change', listener);

        svg.appendChild(render(this.parent));
      }

      return _svg.get(this);
    }
  });
})();
