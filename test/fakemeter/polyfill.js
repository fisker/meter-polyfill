/* globals define: true, module: true*/
(function(root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(factory(root));
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(root);
  } else {
    root.meterPolyfill = factory(root);
  }
})(this, function(window) {
  'use strict';

  var METER_TAG_NAME = 'FAKEMETER';
  var VERSION = '1.5.0';

  var isFirefox = window.navigator.userAgent.indexOf('Firefox') > -1;

  var NOOP = function() {};

  var LEVEL_OPTIMUM = 1;
  var LEVEL_SUBOPTIMUM = 2;
  var LEVEL_SUBSUBOPTIMUM = 3;

  var METHOD_TO_UPPER_CASE = 'toUpperCase';
  var METHOD_TO_LOWER_CASE = 'toLowerCase';

  var METER_CLASS_PREFIX = METER_TAG_NAME[METHOD_TO_LOWER_CASE]() + '-';
  var METER_VALUE_CLASSES = {};
  METER_VALUE_CLASSES[LEVEL_OPTIMUM] = METER_CLASS_PREFIX + 'optimum-value';
  METER_VALUE_CLASSES[LEVEL_SUBOPTIMUM] = METER_CLASS_PREFIX + 'suboptimum-value';
  METER_VALUE_CLASSES[LEVEL_SUBSUBOPTIMUM] = METER_CLASS_PREFIX + 'even-less-good-value';

  var PROP_MIN = 'min';
  var PROP_MAX = 'max';
  var PROP_LOW = 'low';
  var PROP_HIGH = 'high';
  var PROP_VALUE = 'value';
  var PROP_OPTIMUM = 'optimum';
  var PROP_LABELS = 'labels';

  var METER_PROPS = [PROP_MIN, PROP_MAX, PROP_LOW, PROP_HIGH, PROP_OPTIMUM, PROP_VALUE];

  var METHOD_CREATE_ELEMENT = 'createElement';

  var METER_INITAL_VALUES = {
    min: 0,
    max: 1,
    value: 0
  };

  // var PRECISION = isFirefox ? 16 : 6; // firefox and chrome use different precision

  var document = window.document;

  var meterElement = document[METHOD_CREATE_ELEMENT](METER_TAG_NAME);
  var nativeSupport = meterElement[PROP_MAX] === METER_INITAL_VALUES[PROP_MAX];

  var mathMin = Math[PROP_MIN];
  var mathMax = Math[PROP_MAX];


  function between(value, low, high) {
    return mathMin(mathMax(low, value), high);
  }

  function isElement(el, tagName) {
    var PROP_TAGNAME = 'tagName';
    return el && el[PROP_TAGNAME] && el[PROP_TAGNAME][METHOD_TO_UPPER_CASE]() === tagName;
  }

  function each(arrLike, fn) {
    var i = 0;
    var len = arrLike.length;
    for (; i < len; i++) {
      fn(arrLike[i], i);
    }
  }

  function isUndefined(obj) {
    return typeof obj === 'undefined';
  }

  function isNull(obj) {
    return obj === null;
  }

  function isValidValue(obj) {
    return isNull(obj) || (!isNaN(obj) && isFinite(obj));
  }

  function parseValue(value, valueForNull) {
    if (isUndefined(valueForNull)) {
      valueForNull = null;
    }
    return !isValidValue(value) || isNull(value) ?
      valueForNull :
      parseFloat(value);
  }

  function assignValues(target, source) {
    each(METER_PROPS, function(prop) {
      target[prop] = parseValue(source[prop]);
    });
    return target;
  }

  function getPropValue(propValues, prop) {
    var value = propValues[prop];
    var isNullValue = isNull(value);
    var min;
    var max;
    switch (prop) {
      case PROP_MIN:
        value = isNullValue ?
          METER_INITAL_VALUES[PROP_MIN] :
          value;
        break;

      case PROP_MAX:
        min = getPropValue(propValues, PROP_MIN);
        value = isNullValue ?
          mathMax(min, METER_INITAL_VALUES[PROP_MAX]) :
          mathMax(min, value);
        break;

      case PROP_LOW:
        min = getPropValue(propValues, PROP_MIN);
        value = isNullValue ?
          min :
          between(value, min, getPropValue(propValues, PROP_MAX));
        break;

      case PROP_HIGH:
        max = getPropValue(propValues, PROP_MAX);
        value = isNullValue ?
          max :
          between(value, getPropValue(propValues, PROP_LOW), max);
        break;

      case PROP_OPTIMUM:
        min = getPropValue(propValues, PROP_MIN);
        max = getPropValue(propValues, PROP_MAX);
        value = isNullValue ?
          (max - min) / 2 + min :
          between(value, min, max);
        break;

      case PROP_VALUE:
        min = getPropValue(propValues, PROP_MIN);
        max = getPropValue(propValues, PROP_MAX);
        value = isNullValue ?
          between(METER_INITAL_VALUES[PROP_VALUE], min, max) :
          between(value, min, max);
        break;

      default:
        break;
    }
    return value;
  }

  function meterCalculator(meter) {
    var propValues = assignValues({}, meter);

    var min = getPropValue(propValues, PROP_MIN);
    var max = getPropValue(propValues, PROP_MAX);
    var low = getPropValue(propValues, PROP_LOW);
    var high = getPropValue(propValues, PROP_HIGH);
    var optimum = getPropValue(propValues, PROP_OPTIMUM);
    var value = getPropValue(propValues, PROP_VALUE);

    var percentage = min === max ? 0 : (value - min) / (max - min) * 100;
    var level = LEVEL_OPTIMUM;

    if (
      high === max ||
      low === min ||
      (optimum >= low && optimum <= high)
    ) {
      if (
        (low <= optimum && value < low) ||
        (low > optimum && value > low) ||
        (high < optimum && value < high) ||
        (high >= optimum && value > high)
      ) {
        level = LEVEL_SUBOPTIMUM;
      }
    } else if (low === high) {
      if (
        (low <= optimum && value < low) ||
        (high > optimum && value > high)
      ) {
        level = LEVEL_SUBSUBOPTIMUM;
      }
    } else if (optimum < low) {
      if (value > low && value <= high) {
        level = LEVEL_SUBOPTIMUM;
      } else if (value > high) {
        level = LEVEL_SUBSUBOPTIMUM;
      }
    } else if (optimum > high) {
      if (value >= low && value < high) {
        level = LEVEL_SUBOPTIMUM;
      } else if (value < low) {
        level = LEVEL_SUBSUBOPTIMUM;
      }
    }

    // firefox show diffently from chrome
    // when value === high/low or min === max
    if (isFirefox) {
      if (min === max) {
        percentage = 100;
      }

      if (
          (optimum > high && value === high) ||
          (optimum < low && value === low)
       ) {
        level = LEVEL_SUBOPTIMUM;
      }
    }

    return {
      min: min,
      max: max,
      low: low,
      high: high,
      optimum: optimum,
      value: value,
      percentage: percentage,
      level: level,
      className: METER_VALUE_CLASSES[level]
    };
  }

  var meterPolyfill = nativeSupport ? NOOP : (function(){
    /* polyfill starts */

    var POLYFILL_FLAG = '_polyfill';

    var METHOD_REMOVE_CHILD = 'removeChild';
    var METHOD_SET_ATTRIBUTE = 'setAttribute';
    var METHOD_HAS_ATTRIBUTE = 'hasAttribute';
    var METHOD_GET_ATTRIBUTE = 'getAttribute';
    var METHOD_REMOVE_ATTRIBUTE = 'removeAttribute';
    var METHOD_APPEND_CHILD = 'appendChild';
    var METHOD_ADD_EVENT_LISTENER = 'addEventListener';
    var METHOD_ATTACH_EVENT = 'attachEvent';
    var METHOD_GET_ELEMENTS_BY_TAG_NAME = 'getElementsByTagName';
    var METHOD_CALL = 'call';
    var METHOD_APPLY = 'apply';

    var PROP_PROTOTYPE = 'prototype';
    var PROP_CONSTRUCTOR = 'constructor';
    var PROP_PROTO = '__proto__';

    var oObject = Object;
    var arrayPrototype = Array[PROP_PROTOTYPE];
    var functionPrototype = Function[PROP_PROTOTYPE];
    var objectPrototype = oObject[PROP_PROTOTYPE];

    var DIV_TAG_NAME = 'DIV';
    var LABEL_TAG_NAME = 'LABEL';

    var TIMEOUT_FREQUENCY = 10;

    var documentElement = document.documentElement;
    var labels = documentElement[METHOD_GET_ELEMENTS_BY_TAG_NAME](LABEL_TAG_NAME);
    var meters = documentElement[METHOD_GET_ELEMENTS_BY_TAG_NAME](METER_TAG_NAME);

    var PROP_ID = 'id';
    // var PROP_FOR = 'htmlFor';
    var ATTR_FOR = 'for';

    var METER_ATTRS = METER_PROPS.concat([PROP_ID]);
    var LABEL_ATTRS = [ATTR_FOR];

    var defineProperty;
    var objectDefineProperty = oObject.defineProperty;
    if (objectDefineProperty) {
      defineProperty = function(o, property, descriptor) {
        var PROP_ENUMERABLE = 'enumerable';
        var PROP_CONFIGURABLE = 'configurable';

        descriptor[PROP_ENUMERABLE] = descriptor[PROP_ENUMERABLE] === false ? descriptor[PROP_ENUMERABLE] : true;
        descriptor[PROP_CONFIGURABLE] = true;

        try {
          objectDefineProperty(o, property, descriptor);
        } catch (e) {
          if (e.number === -0x7FF5EC54) {
            descriptor[PROP_ENUMERABLE] = false;
            objectDefineProperty(o, property, descriptor);
          }
        }
      };
    } else {
      var METHOD_DEFINE_SETTER = '__defineSetter__';
      var METHOD_DEFINE_GETTER = '__defineGetter__';
      var SUPPORTS_DEFINE_SETTER = METHOD_DEFINE_SETTER in documentElement;
      defineProperty = function(o, property, descriptor) {
        var PROP_GET = 'get';
        var PROP_SET = 'set';
        if (SUPPORTS_DEFINE_SETTER) {
          if (descriptor[PROP_GET]) {
            o[METHOD_DEFINE_GETTER](property, descriptor[PROP_GET]);
          }
          if (descriptor[PROP_SET]) {
            o[METHOD_DEFINE_SETTER](property, descriptor[PROP_SET]);
          }
        } else {
          if (descriptor[PROP_GET]) {
            o[property] = descriptor[PROP_GET][METHOD_CALL](o);
          }
        }

        if (descriptor[PROP_VALUE]) {
          o[property] = descriptor[PROP_VALUE];
        }
      };
    }

    var create = oObject.create || function(proto) {
      // simple but enough
      NOOP[PROP_PROTOTYPE] = proto;
      return new NOOP();
    };

    var indexOf = arrayPrototype.indexOf || function(v) {
      var i = this.length;
      while (i-- && this[i] !== v) {}
      return i;
    };

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
    var bind = functionPrototype.bind || function(oThis) {
      var slice = arrayPrototype.slice;
      var args = slice[METHOD_CALL](arguments, 1);
      var fnToBind = this;
      var fnBound = function() {
        return fnToBind[METHOD_APPLY](
          oThis,
          args.concat(slice[METHOD_CALL](arguments))
        );
      };
      fnBound[PROP_PROTOTYPE] = create(fnToBind[PROP_PROTOTYPE] || null);
      return fnBound;
    };

    function isMeterProp(prop) {
      return indexOf[METHOD_CALL](METER_PROPS, prop) > -1;
    }

    function isMeterAttr(attr) {
      attr = attr[METHOD_TO_LOWER_CASE]();
      return indexOf[METHOD_CALL](METER_ATTRS, attr) > -1;
    }

    function throwTypeError(msg) {
      throw new TypeError(msg);
    }

    var HTML_METER_ELEMENT_CONSTRICTOR_NAME = 'HTML' +
      METER_TAG_NAME.charAt(0)[METHOD_TO_UPPER_CASE]() +
      METER_TAG_NAME.slice(1)[METHOD_TO_LOWER_CASE]() +
      'Element';

    // ie 8 document.createElement is not a function
    // ie 7 document.createElement.apply is undefined
    var createElement = (function(createElement) {
      return function(tagName, options) {
        return createElement[METHOD_APPLY] ?
          createElement[METHOD_APPLY](document, arguments) :
          createElement(tagName, options);
      };
    })(document[METHOD_CREATE_ELEMENT]);


    var METHOD_TO_STRING = 'toString';
    var nativeToString = oObject[METHOD_TO_STRING];
    nativeToString = bind[METHOD_CALL](nativeToString, nativeToString);
    nativeToString[METHOD_TO_STRING] = nativeToString;

    function createNativeFunction(fnName, fn) {
      function toString() {
        return 'function ' + fnName + '() { [native code] }';
      }

      toString[METHOD_TO_STRING] = nativeToString;

      fn[METHOD_TO_STRING] = toString;
      return fn;
    }

    var HTMLMeterElement = window[HTML_METER_ELEMENT_CONSTRICTOR_NAME] ||
      (window[HTML_METER_ELEMENT_CONSTRICTOR_NAME] = (function() {
        var HTMLMeterElement = createNativeFunction(HTML_METER_ELEMENT_CONSTRICTOR_NAME, function() {
          throwTypeError('Illegal ' + PROP_CONSTRUCTOR + '' + (isFirefox ? '.' : ''));
        });

        var htmlElementPrototype = create((window.HTMLElement ||
          meterElement[PROP_CONSTRUCTOR] ||
          window.Element ||
          window.Node ||
          NOOP)[PROP_PROTOTYPE]);

        defineProperty(htmlElementPrototype, PROP_CONSTRUCTOR, {
          enumerable: false,
          value: HTMLMeterElement
        });

        HTMLMeterElement[PROP_PROTOTYPE] = htmlElementPrototype;
        HTMLMeterElement[PROP_PROTO] = htmlElementPrototype;

        return HTMLMeterElement;
      })());

    function unique(array) {
      var uniqueArray = [];
      var i = 0;
      each(array, function(item) {
        if (indexOf.call(uniqueArray, item) === -1) {
          uniqueArray[i++] = item;
        }
      });
      return uniqueArray;
    }

    // there is no moz/ms/o vendor prefix
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    meterElement[METER_TAG_NAME] = METER_TAG_NAME; // for attersAsProps test

    var SUPPORTS_MUTATION_OBSERVER = !!MutationObserver;
    var SUPPORTS_ADD_EVENT_LISTENER = !!window[METHOD_ADD_EVENT_LISTENER];
    var SUPPORTS_ATTACH_EVENT = !!window[METHOD_ATTACH_EVENT];
    var SUPPORTS_ATTERS_AS_PROPS = meterElement[METHOD_GET_ATTRIBUTE](METER_TAG_NAME) === METER_TAG_NAME; // (IE8- bug)
    var SUPPORTS_HAS_ATTRIBUTE = !!meterElement[METHOD_HAS_ATTRIBUTE];
    var SUPPORTS_PROPERTYCHANGE = 'onpropertychange' in document;
    var SUPPORTS_DOM_NODE_INSERTED = false;
    var SUPPORTS_DOM_ATTR_MODIFIED = false;
    var SUPPORTS_DOM_NODE_REMOVED = false;


    var METHOD_DOM_NODE_INSERTED = 'DOMNodeInserted';
    var METHOD_DOM_ATTR_MODIFIED = 'DOMAttrModified';
    var METHOD_DOM_NODE_REMOVED = 'DOMNodeRemoved';
    if (!SUPPORTS_MUTATION_OBSERVER) {
      var testDiv = createElement(DIV_TAG_NAME);
      var testChild = createElement(DIV_TAG_NAME);

      on(testDiv, METHOD_DOM_NODE_INSERTED, function() {
        SUPPORTS_DOM_NODE_INSERTED = true;
      });
      on(testDiv, METHOD_DOM_ATTR_MODIFIED, function() {
        SUPPORTS_DOM_ATTR_MODIFIED = true;
      });
      on(testDiv, METHOD_DOM_NODE_REMOVED, function() {
        SUPPORTS_DOM_NODE_REMOVED = true;
      });

      testDiv[METHOD_APPEND_CHILD](testChild);
      testDiv[METHOD_SET_ATTRIBUTE](PROP_MIN, 1);

      documentElement[METHOD_APPEND_CHILD](testDiv);
      testDiv[METHOD_REMOVE_CHILD](testChild);
      documentElement[METHOD_REMOVE_CHILD](testDiv);

      testChild = testDiv = null;
    }


    function on(el, events, listener, useCapture) {
      each(events.split(' '), function(event) {
        if (SUPPORTS_ADD_EVENT_LISTENER) {
          el[METHOD_ADD_EVENT_LISTENER](event, listener, !!useCapture);
        } else if (SUPPORTS_ATTACH_EVENT) {
          el[METHOD_ATTACH_EVENT]('on' + event, listener);
        } else {
          el['on' + event] = listener;
        }
      });
    }

    var METER_SHADOW_HTML = [
      '<div class="' + METER_CLASS_PREFIX + 'inner-element">',
        '<div class="' + METER_CLASS_PREFIX + 'bar">',
          '<div class="' + METER_VALUE_CLASSES[LEVEL_SUBOPTIMUM] + '" style="width: 0">',
          '</div>',
        '</div>',
      '</div>'
    ].join('');

    var setTimeout = window.setTimeout;
    var setInterval = window.setInterval;

    function hasAttribute(el, name) {
      return SUPPORTS_HAS_ATTRIBUTE ?
        el[METHOD_HAS_ATTRIBUTE](name) :
        !isNull(el[METHOD_GET_ATTRIBUTE](name));
    }

    function observerAttributes(el, attrs, callback) {
      if (SUPPORTS_MUTATION_OBSERVER) {
        new MutationObserver(function(mutations) {
          each(mutations, function(mutation) {
            var atrr = mutation.attributeName[METHOD_TO_LOWER_CASE]();
            callback(atrr);
          });
        })
        .observe(el, {
          attributes: true,
          attributeFilter: attrs
        });
      } else if (SUPPORTS_DOM_ATTR_MODIFIED) {
        on(el, METHOD_DOM_ATTR_MODIFIED, function(e) {
          var attr = e.attrName[METHOD_TO_LOWER_CASE]();
          if (indexOf[METHOD_CALL](attrs, attr) > -1) {
            callback(attr);
          }
        });
      } else if (SUPPORTS_PROPERTYCHANGE) {
        on(el, 'propertychange', function(e) {
          var prop = e.propertyName[METHOD_TO_LOWER_CASE]();
          if (indexOf[METHOD_CALL](attrs, prop) > -1) {
            callback(prop);
          }
        });
      } else {
        // anything ?
      }
    }

    function updateMeterStyle(meter) {
      var result = meterCalculator(meter);
      try {
        var valueElement = meter[METHOD_GET_ELEMENTS_BY_TAG_NAME](DIV_TAG_NAME)[2];
        valueElement.className = result.className;
        valueElement.style.width = result.percentage + '%';
      } catch (_) {}

      return meter;
    }

    // labels
    function getMeterLables(meter) {
      var assignedLables = [];
      var i = 0;

      each(labels, function(label) {
        if (label.control === meter) {
          assignedLables[i++] = label;
          return;
        }
        var htmlFor = label.htmlFor;
        if (!htmlFor) {
          var labelMeters = label[METHOD_GET_ELEMENTS_BY_TAG_NAME](METER_TAG_NAME);
          if (indexOf[METHOD_CALL](labelMeters, meter) !== -1) {
            assignedLables[i++] = label;
          }
        } else if (label.htmlFor === meter.id) {
          assignedLables[i++] = label;
        }
      });

      return assignedLables;
    }

    function polyfill(context) {
      context = context || documentElement;
      if (context.length) {
        return each(context, function(context) {
          polyfill(context);
        });
      }

      var meters = isElement(context, METER_TAG_NAME) ?
        [context] :
        context[METHOD_GET_ELEMENTS_BY_TAG_NAME](METER_TAG_NAME);

      each(meters, function(meter) {
        if (meter[POLYFILL_FLAG]) {
          return;
        }

        // ie8 need clone meter might be a new node
        meter = createShadowDom(meter);
        defineMeterProperties(meter);

        observerAttributes(meter, METER_ATTRS, function(attr) {
          triggerAttrChange(meter, attr);
        });

        updateMeterStyle(meter);
      });
    }

    function triggerAttrChange(meter, attr) {
      if (attr === PROP_ID) {
        assignLables(meter);
      } else {
        updateMeterStyle(meter);
      }
    }

    function createShadowDom(meter) {
      if (meter.canHaveChildren === false || meter.canHaveHTML === false) {
        // ie 8 fails on innerHTML meter
        var parent = meter.parentNode;
        if (parent) {
          var meterClone = assignValues(createElement(METER_TAG_NAME), meter);
          parent.replaceChild(meterClone, meter);
          meter = meterClone;

          // remove </meter><//meter>
          var slashMeters = parent[METHOD_GET_ELEMENTS_BY_TAG_NAME]('/' + METER_TAG_NAME);
          each(slashMeters, function(slashMeter) {
            parent[METHOD_REMOVE_CHILD](slashMeter);
          });

          // another way to remove </meter><//meter>
          // var next = meter;
          // while (next = next.nextSibling) {
          //   if (next.tagName[METHOD_TO_UPPER_CASE]() === '/' + METER_TAG_NAME) {
          //     parent[METHOD_REMOVE_CHILD](next);
          //   }
          // }
        }
      }

      meter.innerHTML = METER_SHADOW_HTML;
      return meter;
    }

    function defineMeterProperties(meter) {
      var METHOD_CLONE_NODE = 'cloneNode';
      var properties = {};

      var propValues = {};
      var setAttribute = bind[METHOD_CALL](meter[METHOD_SET_ATTRIBUTE], meter);
      var cloneNode = bind[METHOD_CALL](meter[METHOD_CLONE_NODE], meter);
      var removeAttribute = bind[METHOD_CALL](meter[METHOD_REMOVE_ATTRIBUTE], meter);

      each(METER_PROPS, function(prop) {
        propValues[prop] = parseValue(meter[METHOD_GET_ATTRIBUTE](prop));
      });

      function getGetter(prop) {
        return function() {
          return getPropValue(propValues, prop);
        };
      }

      function getSetter(prop) {
        return function(value) {
          if (!isValidValue(value)) {
            var errorMessage = isFirefox ?
              'Value being assigned to ' + HTML_METER_ELEMENT_CONSTRICTOR_NAME + '.' + prop + ' is not a finite floating-point value.' :
              'Failed to set the \'' + prop + '\' property on \'' + HTML_METER_ELEMENT_CONSTRICTOR_NAME + '\': The provided double value is non-finite.';
            throwTypeError(errorMessage);
          }

          value = parseValue(value, 0);

          if (propValues[prop] !== value) {
            setAttribute(prop, value);
            propValues[prop] = value;
            updateMeterStyle(meter);
          }
          return value;
        };
      }

      if (!SUPPORTS_ATTERS_AS_PROPS) {
        each(METER_PROPS, function(prop) {
          properties[prop] = {
            get: getGetter(prop),
            set: getSetter(prop)
          };
        });
      }

      properties[PROP_LABELS] = {
        writeable: false,
        value: getMeterLables(meter)
      };

      var methodSetAttribute = createNativeFunction(METHOD_SET_ATTRIBUTE, function(attr, value) {
        setAttribute(attr, value);
        var prop = attr[METHOD_TO_LOWER_CASE]();
        if (!isMeterAttr(prop)) {
          return;
        }
        if (prop === PROP_ID) {
          triggerAttrChange(meter, prop);
        } else {
          var value = parseValue(value);
          if (propValues[prop] !== value) {
            propValues[prop] = parseValue(value);
            triggerAttrChange(meter, prop);
          }
        }
      });

      if (!SUPPORTS_ATTERS_AS_PROPS) {
        properties[METHOD_SET_ATTRIBUTE] = {
          enumerable: false,
          value: methodSetAttribute
        };
      }

      var methodRemoveAttribute = createNativeFunction(METHOD_REMOVE_ATTRIBUTE, function(attr) {
        removeAttribute(attr);
        var prop = attr[METHOD_TO_LOWER_CASE]();
        if (!isMeterAttr(attr)) {
          return;
        }
        if (prop === PROP_ID) {
          triggerAttrChange(meter, prop);
        } else {
          propValues[prop] = null;
          triggerAttrChange(meter, prop);
        }
      });

      properties[METHOD_REMOVE_ATTRIBUTE] = {
        enumerable: false,
        value: methodRemoveAttribute
      };

      var methodCloneNode = createNativeFunction(METHOD_CLONE_NODE, function(deep) {
        var clone = cloneNode(false);
        if (SUPPORTS_ATTERS_AS_PROPS) {
          clone[METHOD_REMOVE_ATTRIBUTE](POLYFILL_FLAG);
        }
        polyfill(clone);
        return clone;
      });

      properties[METHOD_CLONE_NODE] = {
        enumerable: false,
        value: methodCloneNode
      };

      properties[POLYFILL_FLAG] = {
        enumerable: false,
        writeable: false,
        value: VERSION
      };

      properties[PROP_CONSTRUCTOR] = {
        enumerable: false,
        value: HTMLMeterElement
      };


      for (var prop in properties) {
        if (properties.hasOwnProperty(prop)) {
          defineProperty(meter, prop, properties[prop]);
        }
      }
      meter[PROP_PROTO] = HTMLMeterElement.prototype;
    }

    function assignLables(meter) {
      each(meter ? [meter] : meters, function(meter) {
        var labels = getMeterLables(meter);
        if (meter.labels.length || labels.length) {
          defineProperty(meter, PROP_LABELS, {
            enumerable: true,
            writeable: false,
            value: labels
          });
        }
      });
    }

    // over write document.createElement
    document[METHOD_CREATE_ELEMENT] = createNativeFunction(METHOD_CREATE_ELEMENT, function() {
      var el = createElement[METHOD_APPLY](document, arguments);
      if (isElement(el, METER_TAG_NAME)) {
        polyfill(el);
      }
      return el;
    });

    var observedLables = [];
    function observerLabels() {
      each(labels, function(label) {
        if (indexOf[METHOD_CALL](observedLables, label) > -1) {
          return;
        }
        observerAttributes(label, LABEL_ATTRS, function() {
          assignLables();
        });
        observedLables.push(label);
      });
    }

    function observerDocument() {
      if (SUPPORTS_MUTATION_OBSERVER) {
        // observe subtree
        new MutationObserver(function(mutations) {
          each(mutations, function(mutation) {
            polyfill(mutation.target);
          });

          observerLabels();
          assignLables();
        })
        .observe(documentElement, {
          subtree: true,
          childList: true
        });
      } else {
        if (SUPPORTS_DOM_NODE_INSERTED) {
          on(documentElement, METHOD_DOM_NODE_INSERTED, function(e) {
            polyfill(e.target);
            observerLabels();
            assignLables();
          });
        } else {
          setInterval(function() {
            each(labels, function(label) {
              if (indexOf[METHOD_CALL](observedLables, label) === -1) {
                // new label inserted
                observerLabels();
                assignLables();
              }
            });
          }, TIMEOUT_FREQUENCY);
        }

        if (SUPPORTS_DOM_NODE_REMOVED) {
          on(documentElement, METHOD_DOM_NODE_REMOVED, function(e) {
            setTimeout(assignLables, TIMEOUT_FREQUENCY);
          });
        } else {
          setInterval(function() {
            each(observedLables, function(label, index) {
              if (indexOf[METHOD_CALL](labels, label) === -1) {
                // label has been removed
                observedLables.splice(index, 1);
                assignLables();
              }
            });
          }, TIMEOUT_FREQUENCY);
        }
      }

      observerLabels();
    }

    (function() {
      var isReady = false;
      var isTop = false;

      function setReady() {
        isReady = true;
      }

      function completed() {
        if (document.readyState === 'complete') {
          setReady();
        }
      }

      try {
        isTop = isNull(window.frameElement);
      } catch (_) {}

      if (!SUPPORTS_ADD_EVENT_LISTENER && documentElement.doScroll && isTop) {
        (function doScroll() {
          try {
            documentElement.doScroll();
            setReady();
          } catch (_) {
            setTimeout(doScroll, TIMEOUT_FREQUENCY);
          }
        })();
      }

      on(document, 'DOMContentLoaded', setReady);
      on(window, 'load', setReady);
      on(document, 'readystatechange', completed);
      completed();

      (function polyfillWhenReady() {
        if (isReady) {
          polyfill();
          observerDocument();
        } else {
          setTimeout(polyfillWhenReady, TIMEOUT_FREQUENCY);
        }
      })();
    })();

    return polyfill;
  })();

  meterPolyfill.version = VERSION;
  meterPolyfill.support = nativeSupport;
  meterPolyfill.CLASSES = METER_VALUE_CLASSES;
  meterPolyfill.LEVEL_SUBOPTIMUM = LEVEL_SUBOPTIMUM;
  meterPolyfill.LEVEL_OPTIMUM = LEVEL_OPTIMUM;
  meterPolyfill.LEVEL_SUBSUBOPTIMUM = LEVEL_SUBSUBOPTIMUM;
  meterPolyfill.calc = meterCalculator;

  return meterPolyfill;
});
