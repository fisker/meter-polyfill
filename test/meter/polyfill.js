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

  var METER_TAG = 'METER';
  var VERSION = '1.3.0';

  var isFirefox = window.navigator.userAgent.indexOf('Firefox') > -1;

  var NOOP = function() {};

  var LEVEL_OPTIMUM = 1;
  var LEVEL_SUBOPTIMUM = 2;
  var LEVEL_SUBSUBOPTIMUM = 3;

  var METER_CLASS_PREFIX = METER_TAG.toLowerCase() + '-';
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

  var METER_PROPS = [PROP_MIN, PROP_MAX, PROP_LOW, PROP_HIGH, PROP_OPTIMUM, PROP_VALUE];

  var METHOD_CREATE_ELEMENT = 'createElement';

  var METER_INITAL_VALUES = {
    min: 0,
    max: 1
  };

  // var PRECISION = isFirefox ? 16 : 6; // firefox and chrome use different precision

  var document = window.document;

  var meterElement = document[METHOD_CREATE_ELEMENT](METER_TAG);
  var nativeSupport = meterElement[PROP_MAX] === METER_INITAL_VALUES[PROP_MAX];

  var mathMin = Math[PROP_MIN];
  var mathMax = Math[PROP_MAX];

  function between(value, low, high) {
    return mathMin(mathMax(low, value), high);
  }

  function isMeter(el) {
    return el && el.tagName && el.tagName.toUpperCase() === METER_TAG;
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

  function isVoidValue(obj) {
    if (isNull(obj)) {
      return false;
    }
    var floatValue = parseFloat(obj);
    return isUndefined(obj) || isNaN(floatValue) || !isFinite(floatValue);
  }

  function getPropValue(meter, prop) {
    var value = meter[prop];
    var isNullValue = isNull(value);
    var min;
    var max;
    value = parseFloat(value);
    switch (prop) {
      case PROP_MIN:
        value = isNullValue ?
          METER_INITAL_VALUES[PROP_MIN] :
          value;
        break;

      case PROP_MAX:
        min = getPropValue(meter, PROP_MIN);
        value = isNullValue ?
          mathMax(min, METER_INITAL_VALUES[PROP_MAX]) :
          mathMax(min, value);
        break;

      case PROP_LOW:
        min = getPropValue(meter, PROP_MIN);
        value = isNullValue ?
          min :
          between(value, min, getPropValue(meter, PROP_MAX));
        break;

      case PROP_HIGH:
        max = getPropValue(meter, PROP_MAX);
        value = isNullValue ?
          max :
          between(value, getPropValue(meter, PROP_LOW), max);
        break;

      case PROP_OPTIMUM:
        min = getPropValue(meter, PROP_MIN);
        max = getPropValue(meter, PROP_MAX);
        value = isNullValue ?
          (max - min) / 2 + min :
          between(value, min, max);
        break;

      case PROP_VALUE:
        min = getPropValue(meter, PROP_MIN);
        value = isNullValue ?
          min :
          between(value, min, getPropValue(meter, PROP_MAX));
        break;

      default:
        break;
    }
    return value;
  }

  function fixProps(propValues) {
    each(METER_PROPS, function(prop) {
      var value = propValues[prop];
      if (isVoidValue(value)) {
        value = null;
      }
      if (propValues[prop] !== value) {
        propValues[prop] = value;
      }
    });
    return propValues;
  }

  function calcLevel(meter) {
    var propValues = {};
    each(METER_PROPS, function(prop) {
      propValues[prop] = meter[prop];
    });
    propValues = fixProps(propValues);

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
      percentage: percentage,
      level: level,
      className: METER_VALUE_CLASSES[level]
    };
  }

  var meterPolyfill = nativeSupport ? NOOP : (function(){
    /* polyfill starts */

    var POLYFILL_FLAG = '_polyfill';

    var METHOD_DOM_NODE_INSERTED = 'DOMNodeInserted';
    var METHOD_DOM_ATTR_MODIFIED = 'DOMAttrModified';
    var METHOD_SET_ATTRIBUTE = 'setAttribute';
    var METHOD_HAS_ATTRIBUTE = 'hasAttribute';
    var METHOD_GET_ATTRIBUTE = 'getAttribute';
    var METHOD_CLONE_NODE = 'cloneNode';
    var METHOD_APPEND_CHILD = 'appendChild';
    var METHOD_ADD_EVENT_LISTENER = 'addEventListener';
    var METHOD_ATTACH_EVENT = 'attachEvent';
    var METHOD_GET_ELEMENTS_BY_TAG_NAME = 'getElementsByTagName';
    var METHOD_PROTOTYPE = 'prototype';
    var METHOD_CONSTRUCTOR = 'constructor';
    var METHOD_CALL = 'call';
    var METHOD_APPLY = 'apply';

    var DIV_TAG = 'DIV';

    var TIMEOUT_FREQUENCY = 50;

    var documentElement = document.documentElement;

    var defineProperty;
    var objectDefineProperty = Object.defineProperty;
    var METHOD_DEFINE_SETTER = '__defineSetter__';
    var METHOD_DEFINE_GETTER = '__defineGetter__';
    if (objectDefineProperty) {
      defineProperty = function(o, property, etters) {
        etters.enumerable = true;
        etters.configurable = true;

        try {
          objectDefineProperty(o, property, etters);
        } catch (e) {
          if (e.number === -0x7FF5EC54) {
            etters.enumerable = false;
            objectDefineProperty(o, property, etters);
          }
        }
      };
    } else {
      if (METHOD_DEFINE_SETTER in documentElement) {
        defineProperty = function(o, property, etters) {
          if (etters.get) {
            o[METHOD_DEFINE_GETTER](property, etters.get);
          }
          if (etters.set) {
            o[METHOD_DEFINE_SETTER](property, etters.set);
          }
        };
      } else {
        defineProperty = function(o, property, etters) {
          if (etters.get) {
            o[property] = etters.get[METHOD_CALL](o);
          }
        };
      }
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
    var bind = Function[METHOD_PROTOTYPE].bind || function(oThis) {
      var slice = Array[METHOD_PROTOTYPE].slice;
      var args = slice[METHOD_CALL](arguments, 1);
      var fnToBind = this;
      var NOOP = function() {};
      var fnBound = function() {
        return fnToBind[METHOD_APPLY](
          this instanceof NOOP ? this : oThis || this,
          args.concat(slice[METHOD_CALL](arguments))
          );
      };

      if (this[METHOD_PROTOTYPE]) {
        NOOP[METHOD_PROTOTYPE] = this[METHOD_PROTOTYPE];
      }
      fnBound[METHOD_PROTOTYPE] = new NOOP();

      return fnBound;
    };

    function throwTypeError(msg) {
      throw new TypeError(msg);
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
    // Production steps of ECMA-262, Edition 5, 15.2.3.5
    // Reference: http://es5.github.io/#x15.2.3.5
    var create = Object.create || (function() {
      function Temp() {}
      var hasOwn = Object[METHOD_PROTOTYPE].hasOwnProperty;

      return function (O) {
        if (typeof O !== 'object') {
          throwTypeError('Object ' + METHOD_PROTOTYPE + ' may only be an Object or null');
        }
        Temp[METHOD_PROTOTYPE] = O;
        var obj = new Temp();
        Temp[METHOD_PROTOTYPE] = null;
        if (arguments.length > 1) {
          var Properties = Object(arguments[1]);
          for (var prop in Properties) {
            if (hasOwn[METHOD_CALL](Properties, prop)) {
              obj[prop] = Properties[prop];
            }
          }
        }
        return obj;
      };
    })();

    var HTML_METER_ELEMENT_CONSTRICTOR_NAME = [
      'HTML',
      METER_TAG.charAt(0).toUpperCase(),
      METER_TAG.slice(1).toLowerCase(),
      'Element'
    ].join('');

    // ie 8 document.createElement is not a function
    // ie 7 document.createElement.apply is undefined
    var createElement = (function(createElement) {
      return function(tagName, options) {
        return createElement[METHOD_APPLY] ?
          createElement[METHOD_APPLY](document, arguments) :
          createElement(tagName, options);
      };
    })(document[METHOD_CREATE_ELEMENT]);

    function createNativeFunction(fnName, fn) {
      var METHOD_TO_STRING = 'toString';

      function toString() {
        return 'function ' + fnName + '() { [native code] }';
      }

      var nativeToString = toString[METHOD_TO_STRING][METHOD_TO_STRING];

      // firfox shows bound toString in console not bug
      // ie7/8 is buggy without bind
      toString[METHOD_TO_STRING] = bind[METHOD_CALL](nativeToString, nativeToString);
      // some browsers shows empty function name in toString.toString.toString
      toString[METHOD_TO_STRING][METHOD_TO_STRING] = toString[METHOD_TO_STRING];

      fn[METHOD_TO_STRING] = toString;
      return fn;
    }

    var HTMLMeterElement = window[HTML_METER_ELEMENT_CONSTRICTOR_NAME] || (function() {
      var HTMLMeterElement = createNativeFunction(HTML_METER_ELEMENT_CONSTRICTOR_NAME, function() {
        throwTypeError('Illegal ' + METHOD_CONSTRUCTOR + '' + (isFirefox ? '.' : ''));
      });

      // ie 8 constructor is null
      var prototype = (
        window.HTMLElement ||
        meterElement[METHOD_CONSTRUCTOR] ||
        window.Element ||
        window.Node ||
        NOOP)[METHOD_PROTOTYPE];

      prototype = create(prototype);

      HTMLMeterElement[METHOD_PROTOTYPE] = prototype;
      HTMLMeterElement[METHOD_PROTOTYPE][METHOD_CONSTRUCTOR] = HTMLMeterElement;

      return window[HTML_METER_ELEMENT_CONSTRICTOR_NAME] = HTMLMeterElement;
    })();

    // there is no moz/ms/o vendor prefix
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var isReady = false;

    meterElement[METER_TAG] = METER_TAG; // for attersAsProps test

    var SUPPORTS_MUTATION_OBSERVER = !!MutationObserver;
    var SUPPORTS_ADD_EVENT_LISTENER = !!window[METHOD_ADD_EVENT_LISTENER];
    var SUPPORTS_ATTACH_EVENT = !!window[METHOD_ATTACH_EVENT];
    var SUPPORTS_ATTERS_AS_PROPS = meterElement[METHOD_GET_ATTRIBUTE](METER_TAG) === METER_TAG; // (IE8- bug)
    var SUPPORTS_HAS_ATTRIBUTE = !!meterElement[METHOD_HAS_ATTRIBUTE];
    var SUPPORTS_PROPERTYCHANGE = 'onpropertychange' in document;
    var SUPPORTS_DOM_NODE_INSERTED;
    var SUPPORTS_DOM_ATTR_MODIFIED;

    if (!SUPPORTS_MUTATION_OBSERVER) {
      var testDiv = createElement(DIV_TAG);
      var testChild = createElement(DIV_TAG);
      on(testDiv, METHOD_DOM_NODE_INSERTED, function() {
        SUPPORTS_DOM_NODE_INSERTED = true;
      });
      testDiv[METHOD_APPEND_CHILD](testChild);
      on(testDiv, METHOD_DOM_ATTR_MODIFIED, function() {
        SUPPORTS_DOM_ATTR_MODIFIED = true;
      });
      testDiv[METHOD_SET_ATTRIBUTE](PROP_MIN, 1);
      testChild = null;
      testDiv = null;
    }

    function on(el, events, listener, useCapture) {
      if (!el) {
        return;
      }
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

    function hasAttribute(el, name) {
      return SUPPORTS_HAS_ATTRIBUTE ?
        el[METHOD_HAS_ATTRIBUTE](name) :
        !isNull(el[METHOD_GET_ATTRIBUTE](name));
    }

    function updateMeterStyle(meter) {
      var level = calcLevel(meter);

      try {
        var valueElement = meter[METHOD_GET_ELEMENTS_BY_TAG_NAME](DIV_TAG)[2];
        valueElement.className = level.className;
        valueElement.style.width = level.percentage + '%';
      } catch (_) {}

      return meter;
    }

    // over write document.createElement
    document[METHOD_CREATE_ELEMENT] = createNativeFunction(METHOD_CREATE_ELEMENT, function() {
      var el = createElement[METHOD_APPLY](document, arguments);
      if (isMeter(el)) {
        polyfill(el);
      }
      return el;
    });

    function observerSubtree() {
      // observe subtree
      if (SUPPORTS_MUTATION_OBSERVER) {
        var observer = new MutationObserver(function(mutations) {
          each(mutations, function(mutation) {
            polyfill(mutation.target);
          });
        });

        observer.observe(documentElement, {
          subtree: true,
          childList: true
        });
      } else if (SUPPORTS_DOM_NODE_INSERTED) {
        on(documentElement, METHOD_DOM_NODE_INSERTED, function(e) {
          polyfill(e.target);
        });
      } else {
        // any idea ?
      }
    }

    function polyfill(context) {
      context = context || documentElement;
      var meters = [];
      if (isMeter(context)) {
        meters = [context];
      } else if (context && context.length) {
        each(context, function(context) {
          polyfill(context);
        });
        return;
      } else {
        meters = context[METHOD_GET_ELEMENTS_BY_TAG_NAME](METER_TAG);
      }

      each(meters, function(meter) {
        if (meter[POLYFILL_FLAG]) {
          return;
        }

        if (!hasAttribute(meter, POLYFILL_FLAG)) {
          // ie 8 throws
          try {
            meter[METHOD_CONSTRUCTOR] = HTMLMeterElement;
          } catch (_) {}

          // ie8 need clone meter might be a new node
          meter = createShadowDom(meter);
          defineEtter(meter);
          observerAttr(meter);

          meter[METHOD_SET_ATTRIBUTE](POLYFILL_FLAG, VERSION);
        }

        updateMeterStyle(meter);
        meter[POLYFILL_FLAG] = VERSION;
      });
    }

    function isMeterProp(prop) {
      return METER_PROPS.join(' ').indexOf(prop) > -1;
    }

    function observerAttr(meter) {
      // observe subtree
      if (SUPPORTS_MUTATION_OBSERVER) {
        var observer = new MutationObserver(function(mutations) {
          each(mutations, function(mutation) {
            updateMeterStyle(mutation.target);
          });
        });
        observer.observe(meter, {
          attributes: true,
          attributeFilter: METER_PROPS
        });
      } else if (SUPPORTS_DOM_ATTR_MODIFIED) {
        on(meter, METHOD_DOM_ATTR_MODIFIED, function(e) {
          if (isMeterProp(e.attrName)) {
            updateMeterStyle(e.target);
          }
        });
      } else if (SUPPORTS_PROPERTYCHANGE) {
        on(meter, 'propertychange', function(e) {
          if (isMeterProp(e.propertyName)) {
            updateMeterStyle(e.srcElement);
          }
        });
      } else {
        // anything ?
      }
    }

    function createShadowDom(meter) {
      if (meter.canHaveChildren === false || meter.canHaveHTML === false) {
        // ie 8 fails on innerHTML meter
        var parent = meter.parentNode;
        if (parent) {
          var meterClone = createElement(METER_TAG);
          each(METER_PROPS, function(prop) {
            var value = meter[prop];
            if (!isVoidValue(value)) {
              meterClone[prop] = meter[prop];
            }
          });
          parent.replaceChild(meterClone, meter);
          meterClone.innerHTML = METER_SHADOW_HTML;
          meter = meterClone;

          // remove </meter><//meter>
          var slashMeters = parent[METHOD_GET_ELEMENTS_BY_TAG_NAME]('/' + METER_TAG);
          each(slashMeters, function(slashMeter) {
            parent.removeChild(slashMeter);
          });

          // anotherway remove </meter><//meter>
          // var next = meter;
          // while (next = next.nextSibling) {
          //   if (next.tagName.toUpperCase() === '/' + METER_TAG) {
          //     parent.removeChild(next);
          //   }
          // }
        }
      } else {
        meter.innerHTML = METER_SHADOW_HTML;
      }
      return meter;
    }

    function defineEtter(meter) {
      var propValues = {};
      var setAttribute = bind[METHOD_CALL](meter[METHOD_SET_ATTRIBUTE], meter);
      var cloneNode = bind[METHOD_CALL](meter[METHOD_CLONE_NODE], meter);

      each(METER_PROPS, function(prop) {
        propValues[prop] = meter[METHOD_GET_ATTRIBUTE](prop);
      });

      propValues = fixProps(propValues);

      function getGetter(prop) {
        return function() {
          return getPropValue(propValues, prop);
        };
      }

      function getSetter(prop) {
        return function(value) {
          if (isVoidValue(value)) {
            var errorMessage = isFirefox ?
              'Value being assigned to ' + HTML_METER_ELEMENT_CONSTRICTOR_NAME + '.' + prop + ' is not a finite floating-point value.' :
              'Failed to set the \'' + prop + '\' property on \'' + HTML_METER_ELEMENT_CONSTRICTOR_NAME + '\': The provided double value is non-finite.';
            throwTypeError(errorMessage);
          }

          value = isNull(value) ? 0 : parseFloat(value);

          setAttribute(prop, value);
          propValues[prop] = value;
          updateMeterStyle(meter);
          return value;
        };
      }

      if (!SUPPORTS_ATTERS_AS_PROPS) {
        each(METER_PROPS, function(prop) {
          defineProperty(meter, prop, {
            get: getGetter(prop),
            set: getSetter(prop)
          });
        });
      }

      var attributeSetter = createNativeFunction(METHOD_SET_ATTRIBUTE, function(attr, value) {
        setAttribute(attr, value);
        attr = attr.toLowerCase();
        each(METER_PROPS, function(prop) {
          if (prop === attr) {
            propValues[prop] = isVoidValue(value) || isNull(value) ? null : parseFloat(value);
            updateMeterStyle(meter);
          }
        });
      });

      defineProperty(meter, METHOD_SET_ATTRIBUTE, {
        value: attributeSetter
      });

      var cloneNodeMethd = createNativeFunction(METHOD_CLONE_NODE, function(deep) {
        var clone = cloneNode(false);
        clone.removeAttribute(POLYFILL_FLAG);
        polyfill(clone);
        return clone;
      });

      defineProperty(meter, METHOD_CLONE_NODE, {
        value: cloneNodeMethd
      });
    }

    (function checkReady() {
      function completed() {
        if (document.readyState === 'complete') {
          isReady = true;
        }
      }
      completed();

      on(document, 'DOMContentLoaded', function() {
        isReady = true;
      });

      on(window, 'load', function() {
        isReady = true;
      });

      on(document, 'readystatechange', completed);

      // uglify will break window without a wrapper
      var isTop = false;
      try {
        isTop = isNull(window.frameElement);
      } catch (_) {}

      if (!SUPPORTS_ADD_EVENT_LISTENER && documentElement.doScroll && isTop) {
        (function doScroll() {
          try {
            documentElement.doScroll();
            isReady = true;
          } catch (_) {
            return setTimeout(doScroll, TIMEOUT_FREQUENCY);
          }
        })();
      }
    })();

    (function polyfillWhenReady() {
      if (isReady) {
        polyfill();
        observerSubtree();
      } else {
        setTimeout(polyfillWhenReady, TIMEOUT_FREQUENCY);
      }
    })();

    return polyfill;
  })();

  meterPolyfill.version = VERSION;
  meterPolyfill.support = nativeSupport;
  meterPolyfill.CLASSES = METER_VALUE_CLASSES;
  meterPolyfill.LEVEL_SUBOPTIMUM = LEVEL_SUBOPTIMUM;
  meterPolyfill.LEVEL_OPTIMUM = LEVEL_OPTIMUM;
  meterPolyfill.LEVEL_SUBSUBOPTIMUM = LEVEL_SUBSUBOPTIMUM;
  meterPolyfill.calc = calcLevel;

  return meterPolyfill;
});
