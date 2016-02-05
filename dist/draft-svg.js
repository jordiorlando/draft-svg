/*
* draft-svg - A plugin for draft.js that renders models using SVG
* version v0.2.0
* http://draft.D1SC0te.ch
*
* copyright Jordi Pakey-Rodriguez <jordi.orlando@hexa.io>
* license MIT
*
* BUILT: Fri Feb 05 2016 10:48:43 GMT-0600 (CST)
*/
'use strict';

(function () {
  draft.View.mixin({
    svg: function svg(width, height) {
      var _this = this;

      var getWidth = function getWidth(element) {
        return draft.types.length(element.prop('width')).valueOf();
      };
      var getHeight = function getHeight(element) {
        return draft.types.length(element.prop('height')).valueOf();
      };

      var calcX = function calcX(element) {
        return draft.types.length(element.prop('x') || 0) - getWidth(element) / 2;
      };
      var calcY = function calcY(element) {
        return -draft.types.length(element.prop('y') || 0) - getHeight(element) / 2;
      };

      var domPrefix = this.doc.domID + ':' + this.domID + ':svg';
      var domID = function domID(element) {
        return domPrefix + ':' + element.domID;
      };
      var find = function find(element) {
        return document.getElementByID(domID(element));
      };

      this._svgMaxWidth = width || this._svgMaxWidth || getWidth(this);
      this._svgMaxHeight = height || this._svgMaxHeight || getHeight(this);

      if (this._svg === undefined) {
        var _render;

        var svg;
        var listener;

        (function () {
          var NS = 'http://www.w3.org/2000/svg';
          // const XMLNS = 'http://www.w3.org/2000/xmlns/';
          // const XLINK = 'http://www.w3.org/1999/xlink';
          var VERSION = '1.1';

          _render = function render(element) {
            // console.info('rendering svg:', element.domID);

            var node = document.createElementNS(NS, element.type);

            // TODO: separate listener for each property?
            var listener;

            var styleListener = function styleListener(prop, val) {
              prop = prop.replace('.color', '').replace('.', '-');

              var color = /^(fill|stroke)(-opacity)?$/;
              var stroke = /^stroke-(width)?$/;

              if (color.test(prop) || stroke.test(prop)) {
                node.setAttribute(prop, val);
              }
            };

            var setStyle = function setStyle() {
              element.on('change', styleListener);

              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  var style = _step.value;
                  var _arr = ['color', 'opacity', 'width'];

                  for (var _i = 0; _i < _arr.length; _i++) {
                    var prop = _arr[_i];
                    prop = style + '.' + prop;
                    var val = element.prop(prop) || draft.defaults[prop];

                    styleListener(prop, val);
                  }
                }
              } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                  }
                } finally {
                  if (_didIteratorError) {
                    throw _iteratorError;
                  }
                }
              }
            };

            switch (element.type) {
              case 'group':
                node = document.createElementNS(NS, 'g');

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                  for (var _iterator2 = element.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var child = _step2.value;

                    var childNode = _render(child);
                    if (childNode) {
                      node.appendChild(childNode);
                    }
                  }
                } catch (err) {
                  _didIteratorError2 = true;
                  _iteratorError2 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                      _iterator2.return();
                    }
                  } finally {
                    if (_didIteratorError2) {
                      throw _iteratorError2;
                    }
                  }
                }

                element.on('add', function (child) {
                  var childNode = _render(child);
                  if (childNode) {
                    node.appendChild(childNode);
                  }
                });

                element.on('remove', function (child) {
                  node.removeChild(find(child));
                });
              // Falls through
              case 'rect':
                setStyle('fill', 'stroke');

                listener = function listener(prop, val) {
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

                listener = function listener(prop, val) {
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

              for (var prop in element.prop()) {
                listener.apply({ target: element }, [prop, element.prop(prop)]);
              }

              element.on('change', listener);

              return node;
            }
          };

          svg = _this._svg = document.createElementNS(NS, 'svg');

          svg.setAttribute('xmlns', NS);
          svg.setAttribute('version', VERSION);
          // svg.setAttributeNS(XMLNS, 'xmlns:xlink', XLINK);

          svg.id = domID(_this);

          listener = function listener(prop) {
            if (prop === 'width' || prop === 'height') {
              var targetWidth = getWidth(this.target);
              var targetHeight = getHeight(this.target);

              // 1 SVG user unit = 1px
              svg.setAttribute('viewBox', [calcX(this.target), calcY(this.target), targetWidth, targetHeight].join(' '));

              var zoom = Math.min(draft.types.length(this.target._svgMaxWidth) / targetWidth, draft.types.length(this.target._svgMaxHeight) / targetHeight);

              var svgWidth = targetWidth * zoom;
              var svgHeight = targetHeight * zoom;

              this.target._svg.setAttribute('width', svgWidth);
              this.target._svg.setAttribute('height', svgHeight);

              // console.info('aspect ratio:', this.target.aspectRatio);
            }
          };

          listener.apply({ target: _this }, ['width']);
          listener.apply({ target: _this }, ['height']);

          _this.on('change', listener);

          svg.appendChild(_render(_this.parent));
        })();
      }

      return this._svg;
    }
  });
})();