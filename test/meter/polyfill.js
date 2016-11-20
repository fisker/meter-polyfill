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

  var document = window.document;

  function throwError(msg, constructor) {
    throw new (constructor || Error)(msg);
  }

  if (!document) {
    throwError('meter-polyfill requires a window with a document.');
  }

  var isFirefox = window.navigator.userAgent.indexOf('Firefox') > -1;

  var METER_TAG_NAME = 'METER';
  var VERSION = '1.5.1';

  var METHOD_TO_UPPER_CASE = 'toUpperCase';
  var METHOD_TO_LOWER_CASE = 'toLowerCase';


  /* eslint no-empty-function: 0 */
  var NOOP = function() {};
  var TRUE = true;
  var FALSE = false;
  var NULL = null;

  var LEVEL_OPTIMUM = 1;
  var LEVEL_SUBOPTIMUM = 2;
  var LEVEL_SUBSUBOPTIMUM = 3;

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

  var METER_PROPS = [PROP_MIN, PROP_MAX, PROP_LOW, PROP_HIGH, PROP_OPTIMUM, PROP_VALUE];

  var METER_INITAL_VALUES = {
    min: 0,
    max: 1,
    value: 0
  };

  // var PRECISION = isFirefox ? 16 : 6; // firefox and chrome use different precision

  var PROP_LENGTH = 'length';
  var METHOD_CREATE_ELEMENT = 'createElement';

  var meterElement = document[METHOD_CREATE_ELEMENT](METER_TAG_NAME);
  var nativeSupport = meterElement[PROP_MAX] === METER_INITAL_VALUES[PROP_MAX];

  // function lessThan(value, high) {
  //   if (value > high) {
  //     value = high;
  //   }
  //   return value;
  // }

  function greaterThan(value, low) {
    if (value < low) {
      value = low;
    }
    return value;
  }

  function nearest(value, low, high) {
    if (value < low) {
      value = low;
    }

    if (value > high) {
      value = high;
    }

    return value;
  }

  function each(arrLike, func) {
    var i = 0;
    var len = arrLike[PROP_LENGTH];
    for (; i < len; i++) {
      if (func(arrLike[i], i) === TRUE) {
        break;
      }
    }
  }

  function isUndefined(obj) {
    return typeof obj === 'undefined';
  }

  function isNull(obj) {
    return obj === NULL;
  }

  function isValidValue(obj) {
    return isNull(obj) || (!isNaN(obj) && isFinite(obj));
  }

  function parseValue(value, valueForNull) {
    if (isUndefined(valueForNull)) {
      valueForNull = NULL;
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
        value = isNullValue ?
          METER_INITAL_VALUES[PROP_MAX] :
          value;
        min = getPropValue(propValues, PROP_MIN);
        value = greaterThan(value, min);
        break;

      case PROP_LOW:
        min = getPropValue(propValues, PROP_MIN);
        value = isNullValue ?
          min :
          nearest(value, min, getPropValue(propValues, PROP_MAX));
        break;

      case PROP_HIGH:
        max = getPropValue(propValues, PROP_MAX);
        value = isNullValue ?
          max :
          nearest(value, getPropValue(propValues, PROP_LOW), max);
        break;

      case PROP_OPTIMUM:
        min = getPropValue(propValues, PROP_MIN);
        max = getPropValue(propValues, PROP_MAX);
        value = isNullValue ?
          (max - min) / 2 + min :
          nearest(value, min, max);
        break;

      case PROP_VALUE:
        value = isNullValue ?
          METER_INITAL_VALUES[PROP_VALUE] :
          value;
        min = getPropValue(propValues, PROP_MIN);
        max = getPropValue(propValues, PROP_MAX);
        value = nearest(value, min, max);
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

  var meterPolyfill = nativeSupport ? NOOP : (function() {
    /* polyfill starts */

    var POLYFILL_FLAG = '_polyfill';

    var PROP_LABELS = 'labels';

    var METHOD_REMOVE_CHILD = 'removeChild';
    var METHOD_SET_ATTRIBUTE = 'setAttribute';
    // var METHOD_HAS_ATTRIBUTE = 'hasAttribute';
    var METHOD_GET_ATTRIBUTE = 'getAttribute';
    var METHOD_REMOVE_ATTRIBUTE = 'removeAttribute';
    var METHOD_APPEND_CHILD = 'appendChild';
    var METHOD_ADD_EVENT_LISTENER = 'addEventListener';
    var METHOD_ATTACH_EVENT = 'attachEvent';
    var METHOD_GET_ELEMENTS_BY_TAG_NAME = 'getElementsByTagName';
    var PROP_FIRST_CHILD = 'firstChild';

    var PROP_PROTOTYPE = 'prototype';
    var PROP_CONSTRUCTOR = 'constructor';
    var PROP_PROTO = '__proto__';

    var METHOD_CALL = 'call';
    var METHOD_APPLY = 'apply';
    var METHOD_CONCAT = 'concat';
    var METHOD_SLICE = 'slice';

    var DIV_TAG_NAME = 'DIV';
    var LABEL_TAG_NAME = 'LABEL';
    var DIV_OPENING_TAG = '<div class="';
    var DIV_CLOSING_TAG = '</div>';

    var TIMEOUT_FREQUENCY = 10;

    var PROP_ID = 'id';
    var PROP_FOR = 'htmlFor';

    var documentElement = document.documentElement;
    var allLabels = documentElement[METHOD_GET_ELEMENTS_BY_TAG_NAME](LABEL_TAG_NAME);
    var allMeters = documentElement[METHOD_GET_ELEMENTS_BY_TAG_NAME](METER_TAG_NAME);

    var oObject = Object;
    var arrayPrototype = Array[PROP_PROTOTYPE];
    var funcPrototype = Function[PROP_PROTOTYPE];
    // var objectPrototype = oObject[PROP_PROTOTYPE];

    var slice = arrayPrototype[METHOD_SLICE];
    var apply = funcPrototype[METHOD_APPLY];
    var concat = arrayPrototype[METHOD_CONCAT];

    function funcApplyCall(func, oThis, args) {
      return apply[METHOD_CALL](func, oThis, args);
    }

    function arraySliceCall(arrLike) {
      var args = funcApplyCall(slice, arguments, [1]);
      return funcApplyCall(slice, arrLike, args);
    }

    function arrayConcatCall(arrLike) {
      var args = arraySliceCall(arguments, 1);
      return funcApplyCall(concat, arrLike, args);
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
    var bind = funcPrototype.bind || function(oThis) {
      var args = arraySliceCall(arguments, 1);
      var funcToBind = this;
      return function() {
        args = arrayConcatCall(args, arguments);
        return funcApplyCall(funcToBind, oThis, args);
      };
    };

    function funcBindCall(func) {
      return funcApplyCall(bind, func, arraySliceCall(arguments, 1));
    }

    // only get necessary props
    var propDependencies = {};
    propDependencies[PROP_MIN] = [];
    propDependencies[PROP_MAX] = [PROP_MIN];
    propDependencies[PROP_LOW] =
      propDependencies[PROP_OPTIMUM] =
      propDependencies[PROP_VALUE] =
      [PROP_MIN, PROP_MAX];
    propDependencies[PROP_HIGH] = [PROP_MIN, PROP_MAX, PROP_LOW];

    each(METER_PROPS, function(prop) {
      propDependencies[prop] = arrayConcatCall(propDependencies[prop], [prop]);
    });


    var defineProperty;
    var objectDefineProperty = oObject.defineProperty;
    if (objectDefineProperty) {
      defineProperty = function(o, property, descriptor) {
        var PROP_ENUMERABLE = 'enumerable';
        var PROP_CONFIGURABLE = 'configurable';
        if (descriptor[PROP_ENUMERABLE] !== FALSE) {
          descriptor[PROP_ENUMERABLE] = TRUE;
        }
        descriptor[PROP_CONFIGURABLE] = TRUE;

        try {
          objectDefineProperty(o, property, descriptor);
        } catch (e) {
          if (descriptor[PROP_ENUMERABLE] && e.number === -0x7FF5EC54) {
            descriptor[PROP_ENUMERABLE] = FALSE;
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
            o[property] = funcBindCall(descriptor[PROP_GET], o);
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

    function includes(arrLike, v) {
      var found = false;
      each(arrLike, function(item) {
        if (item === v) {
          return found = true;
        }
      });
      return found;
    }

    function throwTypeError(msg) {
      throwError(msg, TypeError);
    }

    function isElement(el, tagName) {
      var PROP_TAGNAME = 'tagName';
      return el && el[PROP_TAGNAME] && el[PROP_TAGNAME][METHOD_TO_UPPER_CASE]() === tagName;
    }

    var HTML_METER_ELEMENT_CONSTRICTOR_NAME = 'HTML' +
      METER_TAG_NAME.charAt(0)[METHOD_TO_UPPER_CASE]() +
      METER_TAG_NAME[METHOD_SLICE](1)[METHOD_TO_LOWER_CASE]() +
      'Element';


    // ie 8 document.createElement is not a function
    // ie 7 document.createElement.apply is undefined
    var createElement = (function(createElement) {
      return function(tagName, options) {
        return createElement[METHOD_APPLY] ?
          funcApplyCall(createElement, document, arguments) :
          createElement(tagName, options);
      };
    })(document[METHOD_CREATE_ELEMENT]);


    var METHOD_TO_STRING = 'toString';
    var funcToString = funcPrototype[METHOD_TO_STRING];
    funcToString = funcBindCall(funcToString, funcToString);
    funcToString[METHOD_TO_STRING] = funcToString;

    // cache toStingFunctions
    var toStingFns = {};
    function createNativeFunction(funcName, func) {
      func[METHOD_TO_STRING] = toStingFns[funcName] ||
        (toStingFns[funcName] = (function() {
          function toString() {
            return 'function ' + funcName + '() { [native code] }';
          }

          toString[METHOD_TO_STRING] = funcToString;
          return toString;
        })());
      return func;
    }

    var HTMLMeterElement = window[HTML_METER_ELEMENT_CONSTRICTOR_NAME] ||
      (window[HTML_METER_ELEMENT_CONSTRICTOR_NAME] = (function() {
        var HTMLMeterElement = createNativeFunction(
          HTML_METER_ELEMENT_CONSTRICTOR_NAME,
          function() {
            throwTypeError('Illegal ' + PROP_CONSTRUCTOR + '' + (isFirefox ? '.' : ''));
          });

        var htmlElementPrototype = create((window.HTMLElement ||
          meterElement[PROP_CONSTRUCTOR] ||
          window.Element ||
          window.Node ||
          NOOP)[PROP_PROTOTYPE]);

        defineProperty(htmlElementPrototype, PROP_CONSTRUCTOR, {
          enumerable: FALSE,
          value: HTMLMeterElement
        });

        HTMLMeterElement[PROP_PROTOTYPE] = htmlElementPrototype;
        HTMLMeterElement[PROP_PROTO] = htmlElementPrototype;

        return HTMLMeterElement;
      })());

    // there is no moz/ms/o vendor prefix
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    meterElement[POLYFILL_FLAG] = VERSION; // for attersAsProps test

    var SUPPORTS_MUTATION_OBSERVER = !!MutationObserver;
    var SUPPORTS_ADD_EVENT_LISTENER = !!window[METHOD_ADD_EVENT_LISTENER];
    var SUPPORTS_ATTACH_EVENT = !!window[METHOD_ATTACH_EVENT];
    // (IE8- bug)
    var SUPPORTS_ATTERS_AS_PROPS = meterElement[METHOD_GET_ATTRIBUTE](POLYFILL_FLAG) ===
      VERSION;
    // var SUPPORTS_HAS_ATTRIBUTE = !!meterElement[METHOD_HAS_ATTRIBUTE];
    var SUPPORTS_PROPERTYCHANGE = 'onpropertychange' in document;
    var SUPPORTS_DOM_NODE_INSERTED = FALSE;
    var SUPPORTS_DOM_ATTR_MODIFIED = FALSE;


    var METHOD_DOM_NODE_INSERTED = 'DOMNodeInserted';
    var METHOD_DOM_ATTR_MODIFIED = 'DOMAttrModified';
    if (!SUPPORTS_MUTATION_OBSERVER) {
      var testDiv = createElement(DIV_TAG_NAME);
      var testChild = createElement(DIV_TAG_NAME);

      on(testDiv, METHOD_DOM_NODE_INSERTED, function() {
        SUPPORTS_DOM_NODE_INSERTED = TRUE;
      });
      on(testDiv, METHOD_DOM_ATTR_MODIFIED, function() {
        SUPPORTS_DOM_ATTR_MODIFIED = TRUE;
      });

      testDiv[METHOD_APPEND_CHILD](testChild);
      testDiv[METHOD_SET_ATTRIBUTE](POLYFILL_FLAG, VERSION);

      testDiv = testChild = NULL;
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
      DIV_OPENING_TAG + METER_CLASS_PREFIX + 'inner-element">',
        DIV_OPENING_TAG + METER_CLASS_PREFIX + 'bar">',
          DIV_OPENING_TAG + METER_VALUE_CLASSES[LEVEL_SUBOPTIMUM] + '" style="width: 0%">',
          DIV_CLOSING_TAG,
        DIV_CLOSING_TAG,
      DIV_CLOSING_TAG
    ].join('');

    var setTimeout = window.setTimeout;
    var setInterval = window.setInterval;

    // function hasAttribute(el, name) {
    //   return SUPPORTS_HAS_ATTRIBUTE ?
    //     el[METHOD_HAS_ATTRIBUTE](name) :
    //     !isNull(el[METHOD_GET_ATTRIBUTE](name));
    // }

    function walkContext(context, tagName, func) {
      context = context[PROP_LENGTH] ? context : context[METHOD_GET_ELEMENTS_BY_TAG_NAME](tagName);
      each(context, function(context) {
        func(context);
      });
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
          attributes: TRUE,
          attributeFilter: attrs
        });
      } else if (SUPPORTS_DOM_ATTR_MODIFIED) {
        on(el, METHOD_DOM_ATTR_MODIFIED, function(e) {
          var attr = e.attrName[METHOD_TO_LOWER_CASE]();
          if (includes(attrs, attr)) {
            callback(attr);
          }
        });
      } else if (SUPPORTS_PROPERTYCHANGE) {
        on(el, 'propertychange', function(e) {
          var prop = e.propertyName[METHOD_TO_LOWER_CASE]();
          if (includes(attrs, prop)) {
            callback(prop);
          }
        });
      }

      // anything else?
    }

    function polyfillMeter(context) {
      if (!isElement(context, METER_TAG_NAME)) {
        return walkContext(context || allMeters, METER_TAG_NAME, polyfillMeter);
      }

      var meter = context;
      if (!meter[POLYFILL_FLAG]) {
        // ie8 might need clone meter
        // so meter might be a new node
        meter = createShadowDom(meter);
        defineMeterProperties(meter);

        observerAttributes(meter, METER_PROPS, function(attr) {
          triggerAttrChange(meter, attr);
        });
        updateMeterStyle(meter);
      }

    }

    function updateMeterStyle(meter) {
      var result = meterCalculator(meter);

      var PROP_CLASS_NAME = 'className';
      var PROP_STYLE = 'style';
      var PROP_WIDTH = 'width';

      var valueElement = meter[PROP_FIRST_CHILD][PROP_FIRST_CHILD][PROP_FIRST_CHILD];
      var currentClassName = valueElement[PROP_CLASS_NAME];
      var currentWidth = valueElement[PROP_STYLE][PROP_WIDTH];
      var changeClassName = result[PROP_CLASS_NAME];
      var changeWidth = result.percentage + '%';
      if (currentClassName !== changeClassName) {
        valueElement[PROP_CLASS_NAME] = changeClassName;
      }
      if (currentWidth !== changeWidth) {
        valueElement[PROP_STYLE][PROP_WIDTH] = changeWidth;
      }
      return meter;
    }

    function triggerAttrChange(meter, attr) {
      if (includes(METER_PROPS, attr[METHOD_TO_LOWER_CASE]())) {
        updateMeterStyle(meter);
      }
    }

    function createShadowDom(meter) {
      if (meter.canHaveChildren === FALSE || meter.canHaveHTML === FALSE) {
        // ie 8 fails on innerHTML created meter
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

    // use common getter & setter
    function getter(prop) {
      var meter = this;
      var propValues = {};

      each(propDependencies[prop], function(prop) {
        propValues[prop] = parseValue(meter[METHOD_GET_ATTRIBUTE](prop));
      });
      return getPropValue(propValues, prop);
    }

    function setter(prop, value) {
      if (!isValidValue(value)) {
        var errorMessage = isFirefox ?

          'Value being assigned to ' +
          HTML_METER_ELEMENT_CONSTRICTOR_NAME + '.' + prop +
          ' is not a finite floating-point value.' :

          'Failed to set the \'' + prop + '\' property on ' +
          '\'' + HTML_METER_ELEMENT_CONSTRICTOR_NAME + '\'' +
          ': The provided double value is non-finite.';

        throwTypeError(errorMessage);
      }

      this[METHOD_SET_ATTRIBUTE](prop, '' + parseValue(value, 0));
      return value;
    }

    function getMeterLables(meter) {
      var assignedLables = [];
      var i = 0;

      each(allLabels, function(label) {
        var propFor = label[PROP_FOR];
        var propId = meter[PROP_ID];

        if (
          (label.control === meter) ||
          (!propFor && label[METHOD_GET_ELEMENTS_BY_TAG_NAME](METER_TAG_NAME)[0] === meter) ||
          (propFor && propFor === propId)
          ) {
          assignedLables[i++] = label;
        }
      });

      return assignedLables;
    }

    function defineMeterProperties(meter) {
      var properties = {};

      if (!SUPPORTS_ATTERS_AS_PROPS) {
        each(METER_PROPS, function(prop) {
          properties[prop] = {
            get: funcBindCall(getter, meter, prop),
            set: funcBindCall(setter, meter, prop)
          };
        });
      }

      properties[PROP_LABELS] = {
        writeable: FALSE,
        get: function() {
          return getMeterLables(meter);
        }
      };

      if (!SUPPORTS_ATTERS_AS_PROPS) {
        var setAttribute = funcBindCall(meter[METHOD_SET_ATTRIBUTE], meter);

        var methodSetAttribute = createNativeFunction(METHOD_SET_ATTRIBUTE, function(attr, value) {
          setAttribute(attr, value);
          triggerAttrChange(meter, attr);
        });

        properties[METHOD_SET_ATTRIBUTE] = {
          enumerable: FALSE,
          value: methodSetAttribute
        };
      }

      if (SUPPORTS_ATTERS_AS_PROPS) {
        var removeAttribute = funcBindCall(meter[METHOD_REMOVE_ATTRIBUTE], meter);

        var methodRemoveAttribute = createNativeFunction(METHOD_REMOVE_ATTRIBUTE, function(attr) {
          removeAttribute(attr);
          triggerAttrChange(meter, attr);
        });

        properties[METHOD_REMOVE_ATTRIBUTE] = {
          enumerable: FALSE,
          value: methodRemoveAttribute
        };
      }

      var METHOD_CLONE_NODE = 'cloneNode';
      var cloneNode = funcBindCall(meter[METHOD_CLONE_NODE], meter);
      var methodCloneNode = createNativeFunction(METHOD_CLONE_NODE, function(deep) {
        var clone = cloneNode(FALSE);
        if (SUPPORTS_ATTERS_AS_PROPS) {
          clone[METHOD_REMOVE_ATTRIBUTE](POLYFILL_FLAG);
        }
        polyfillMeter(clone);
        return clone;
      });

      properties[METHOD_CLONE_NODE] = {
        enumerable: FALSE,
        value: methodCloneNode
      };

      properties[POLYFILL_FLAG] = {
        enumerable: FALSE,
        writeable: FALSE,
        value: VERSION
      };

      properties[METHOD_TO_STRING] = {
        enumerable: FALSE,
        writeable: FALSE,
        value: HTMLMeterElement[METHOD_TO_STRING]
      };

      properties[PROP_CONSTRUCTOR] = {
        enumerable: FALSE,
        value: HTMLMeterElement
      };

      for (var prop in properties) {
        if (properties.hasOwnProperty(prop)) {
          defineProperty(meter, prop, properties[prop]);
        }
      }

      meter[PROP_PROTO] = HTMLMeterElement.prototype;
    }

    // overwrite document.createElement
    document[METHOD_CREATE_ELEMENT] = createNativeFunction(METHOD_CREATE_ELEMENT, function() {
      var el = funcApplyCall(createElement, document, arguments);
      if (isElement(el, METER_TAG_NAME)) {
        polyfillMeter(el);
      }
      return el;
    });

    function observerDocument() {
      var PROP_TARGET = 'target';
      if (SUPPORTS_MUTATION_OBSERVER) {
        // observe subtree
        new MutationObserver(function(mutations) {
          each(mutations, function(mutation) {
            polyfillMeter(mutation[PROP_TARGET]);
          });
        })
        .observe(documentElement, {
          subtree: TRUE,
          childList: TRUE
        });
      } else {
        if (SUPPORTS_DOM_NODE_INSERTED) {
          on(documentElement, METHOD_DOM_NODE_INSERTED, function(e) {
            polyfillMeter(e[PROP_TARGET]);
          });
        } else {
          setInterval(polyfillMeter, TIMEOUT_FREQUENCY);
        }
      }
    }

    (function() {
      var isReady = FALSE;
      var isTop = FALSE;

      function setReady() {
        isReady = TRUE;
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
          polyfillMeter();
          observerDocument();
        } else {
          setTimeout(polyfillWhenReady, TIMEOUT_FREQUENCY);
        }
      })();
    })();

    return polyfillMeter;
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
