/**
 * meter-polyfill - Polyfill for the meter element
 * @version v1.2.0
 * @license MIT
 * @copyright fisker Cheung
 * @link https://github.com/fisker/meter-polyfill
 */
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

  var NOOP = function() {};

  var LEVEL_OPTIMUM = 1;
  var LEVEL_SUBOPTIMUM = 2;
  var LEVEL_SUBSUBOPTIMUM = 3;
  var METER_CLASS_PREFIX = 'meter-';

  var METER_VALUE_CLASSES = {
    inner: METER_CLASS_PREFIX + 'inner-element',
    bar: METER_CLASS_PREFIX + 'bar'
  };

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

  // TODO:
  // use getComputedStyle find the right calculator
  var isFirefox = window.navigator.userAgent.indexOf('Firefox') > -1;

  var document = window.document;

  var meterElement = document[METHOD_CREATE_ELEMENT](METER_TAG);
  var nativeSupport = meterElement[PROP_MAX] === METER_INITAL_VALUES[PROP_MAX];

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

  function isVoidValue(obj) {
    var floatValue = parseFloat(obj);
    return isUndefined(obj) || isNaN(floatValue) || !isFinite(floatValue);
  }

  function getPropValue(meter, prop) {
    var value = meter[prop];
    var isNull = value === null;
    var min;
    var max;
    var low;
    value = parseFloat(value);
    switch (prop) {
      case PROP_MIN:
        value = isNull ?
          METER_INITAL_VALUES[PROP_MIN] :
          value;
        break;
      case PROP_MAX:
        min = getPropValue(meter, PROP_MIN);
        value = isNull ?
          mathMax(min, METER_INITAL_VALUES[PROP_MAX]) :
          mathMax(min, value);
        break;
      case PROP_LOW:
        min = getPropValue(meter, PROP_MIN);
        max = getPropValue(meter, PROP_MAX);
        value = isNull ?
          min :
          mathMin(mathMax(min, value), max);
        break;
      case PROP_HIGH:
        max = getPropValue(meter, PROP_MAX);
        low = getPropValue(meter, PROP_LOW);
        value = isNull ?
          max :
          mathMin(mathMax(low, value), max);
        break;
      case PROP_OPTIMUM:
        min = getPropValue(meter, PROP_MIN);
        max = getPropValue(meter, PROP_MAX);
        value = isNull ?
          (max - min) / 2 + min :
          mathMin(mathMax(min, value), max);
        break;
      case PROP_VALUE:
        min = getPropValue(meter, PROP_MIN);
        max = getPropValue(meter, PROP_MAX);
        value = isNull ?
          min :
          mathMin(mathMax(min, value), max);
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

  var meterPolyfill = {
    CLASSES: METER_VALUE_CLASSES,
    LEVEL_SUBOPTIMUM: LEVEL_SUBOPTIMUM,
    LEVEL_OPTIMUM: LEVEL_OPTIMUM,
    LEVEL_SUBSUBOPTIMUM: LEVEL_SUBSUBOPTIMUM,
    calc: calcLevel,
    polyfill: NOOP
  };

  if (nativeSupport) {
    return meterPolyfill;
  }

  /* polyfill starts */

  var POLYFILL_SIGN = '_polyfill';

  var documentElement = document.documentElement;

  var defineProperty;
  if (Object.defineProperty) {
    defineProperty = function(o, property, etters) {
      etters.enumerable = true;
      etters.configurable = true;

      try {
        Object.defineProperty(o, property, etters);
      } catch (e) {
        if (e.number === -0x7FF5EC54) {
          etters.enumerable = false;
          Object.defineProperty(o, property, etters);
        }
      }
    };
  } else {
    if ('__defineSetter__' in documentElement) {
      defineProperty = function(o, property, etters) {
        if (etters.get) {
          o.__defineGetter__(property, etters.get);
        }
        if (etters.set) {
          o.__defineSetter__(property, etters.set);
        }
      };
    } else {
      defineProperty = function(o, property, etters) {
        if (etters.get) {
          o[property] = etters.get.call(o);
        }
      };
    }
  }

  // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
  var bind = Function.prototype.bind || function(oThis) {
    var args = Array.prototype.slice.call(arguments, 1);
    var fnToBind = this;
    var NOOP = function() {};
    var fnBound = function() {
        return fnToBind.apply(
          this instanceof NOOP ? this : oThis || this,
          args.concat(Array.prototype.slice.call(arguments))
          );
    };

    if (this.prototype) {
      NOOP.prototype = this.prototype;
    }
    fnBound.prototype = new NOOP();

    return fnBound;
  };

  var HTML_METER_ELEMENT_CONSTRICTOR_NAME = [
    'HTML',
    METER_TAG.replace(/^(.)(.*)$/, function(_, $1, $2) {
        return $1.toUpperCase() + $2.toLowerCase();
    }),
    'Element'
  ].join('');

  function createNativeFunction(fnName, fn) {
    function toString() {
      return 'function ' + fnName + '() { [native code] }';
    }

    var nativeToString = toString.toString.toString;

    // firfox shows bound toString in console not bug
    // ie7/8 is buggy without bind
    toString.toString = bind.call(nativeToString, nativeToString);
    // some browsers shows empty function name in toString.toString.toString
    toString.toString.toString = toString.toString;

    fn.toString = toString;
    return fn;
  }

  // ie 8 document.createElement is not a function
  // ie 7 document.createElement.apply is undefined
  var createElement = (function(createElement) {
    if (createElement.apply) {
      return function() {
        return createElement.apply(document, arguments);
      };
    } else {
      return function(tagName, options) {
        return createElement(tagName, options);
      };
    }
  })(document[METHOD_CREATE_ELEMENT]);

  var HTMLMeterElement = window[HTML_METER_ELEMENT_CONSTRICTOR_NAME] || (function() {
    var HTMLMeterElement = createNativeFunction(HTML_METER_ELEMENT_CONSTRICTOR_NAME, function() {
      throw new TypeError('Illegal constructor');
    });

    // ie 8 constructor is null
    var prototype = (
      window.HTMLElement ||
      meterElement.constructor ||
      window.Element ||
      window.Node ||
      NOOP).prototype;

    if (Object.create) {
      prototype = Object.create(prototype);
    }

    HTMLMeterElement.prototype = prototype;
    HTMLMeterElement.constructor = HTMLMeterElement.prototype.constructor = HTMLMeterElement;

    return window[HTML_METER_ELEMENT_CONSTRICTOR_NAME] = HTMLMeterElement;
  })();

  // there is no moz/ms/o vendor prefix
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var isObservered = false;
  var isReady = false;

  meterElement[METER_TAG] = METER_TAG; // for attersAsProps test
  var supports = {
    MutationObserver: !!MutationObserver,
    addEventListener: !!window.addEventListener,
    attachEvent: !!window.attachEvent,
    attersAsProps: meterElement.getAttribute(METER_TAG) === METER_TAG, // (IE8- bug)
    unknownElement: !!meterElement.constructor,
    hasAttribute: !!meterElement.hasAttribute,
    propertychange: 'onpropertychange' in document
  };

  function on(el, events, listener, useCapture) {
    if (!el) {
      return;
    }
    each(events.split(' '), function(event) {
      if (supports.addEventListener) {
        el.addEventListener(event, listener, !!useCapture);
      } else if (supports.attachEvent) {
        el.attachEvent('on' + event, listener);
      } else {
        el['on' + event] = listener;
      }
    });
  }

  if (!supports.MutationObserver) {
    var supportsDOMNodeInserted = false;
    var supportsDOMAttrModified = false;
    var testDiv = createElement('div');
    var testChild = createElement('div');
    on(testDiv, 'DOMNodeInserted', function() {
      supportsDOMNodeInserted = true;
    });
    testDiv.appendChild(testChild);
    on(testDiv, 'DOMAttrModified', function() {
      supportsDOMAttrModified = true;
    });
    testDiv.setAttribute(PROP_MIN, 1);
    testChild = null;
    testDiv = null;

    supports.DOMNodeInserted = supportsDOMNodeInserted;
    supports.DOMAttrModified = supportsDOMAttrModified;
  }

  var METER_SHADOW_HTML = [
    '<div class="' + METER_VALUE_CLASSES.inner + '">',
      '<div class="' + METER_VALUE_CLASSES.bar + '">',
        '<div class="' + METER_VALUE_CLASSES[LEVEL_SUBOPTIMUM] + '" style="width: 0">',
        '</div>',
      '</div>',
    '</div>'
  ].join('');

  var mathMin = Math[PROP_MIN];
  var mathMax = Math[PROP_MAX];
  var setTimeout = window.setTimeout;

  function hasAttribute(el, name) {
    if (supports.hasAttribute) {
      return el.hasAttribute(name);
    } else {
      return el.getAttribute(name) !== null;
    }
  }

  function updateMeterStyle(meter) {
    var level = calcLevel(meter);

    try {
      var valueElement = meter.getElementsByTagName('div')[2];
      valueElement.className = level.className;
      valueElement.style.width = level.percentage + '%';
    } catch (_) {}

    return meter;
  }

  // over write document.createElement
  document[METHOD_CREATE_ELEMENT] = createNativeFunction(METHOD_CREATE_ELEMENT, function() {
    var el = createElement.apply(document, arguments);
    if (isMeter(el)) {
      polyfill(el);
    }
    return el;
  });

  function observerSubtree() {
    if (isObservered) {
      return;
    }

    // observe subtree
    if (supports.MutationObserver) {
      var observer = new MutationObserver(function(mutations) {
        each(mutations, function(mutation) {
          polyfill(mutation.target);
        });
      });

      observer.observe(documentElement, {
        subtree: true,
        childList: true
      });
    } else if (supports.DOMNodeInserted) {
      on(documentElement, 'DOMNodeInserted', function(e) {
        polyfill(e.target);
      });
    } else {
      // any idea ?
    }
    isObservered = true;
  }

  function polyfill(context) {
    var meters = [];
    if (isMeter(context)) {
      meters = [context];
    } else {
      meters = (context || document).getElementsByTagName(METER_TAG);
    }

    each(meters, function(meter) {
      if (meter[POLYFILL_SIGN]) {
        return;
      }

      if (!hasAttribute(meter, POLYFILL_SIGN)) {
        // ie 8 throws
        try {
          meter.constructor = HTMLMeterElement;
        } catch (_) {}

        // ie8 need clone meter might be a new node
        meter = createShadowDom(meter);
        defineEtter(meter);
        observerAttr(meter);

        meter.setAttribute(POLYFILL_SIGN, '');
      }

      updateMeterStyle(meter);
      meter[POLYFILL_SIGN] = true;
    });
  }

  function observerAttr(meter) {
    // observe subtree
    if (supports.MutationObserver) {
      var observer = new MutationObserver(function(mutations) {
        each(mutations, function(mutation) {
          updateMeterStyle(mutation.target);
        });
      });
      observer.observe(meter, {
        attributes: true,
        attributeFilter: METER_PROPS
      });
    } else if (supports.DOMAttrModified) {
      on(meter, 'DOMAttrModified', function(e) {
        if (METER_PROPS.join(' ').indexOf(e.attrName) > -1) {
          updateMeterStyle(e.target);
        }
      });
    } else if (supports.propertychange) {
      on(meter, 'propertychange', function(e) {
        if (METER_PROPS.join(' ').indexOf(e.propertyName) > -1) {
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
        var slashMeters = parent.getElementsByTagName('/' + METER_TAG);
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
    var METHOD_SET_ATTRIBUTE = 'setAttribute';
    var METHOD_CLONE_NODE = 'cloneNode';
    var propValues = {};
    var setAttribute = bind.call(meter[METHOD_SET_ATTRIBUTE], meter);
    var cloneNode = bind.call(meter[METHOD_CLONE_NODE], meter);

    each(METER_PROPS, function(prop) {
      propValues[prop] = meter.getAttribute(prop);
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
          throw new TypeError('Failed to set the \'' + prop + '\' property on \'' + HTML_METER_ELEMENT_CONSTRICTOR_NAME + '\': The provided double value is non-finite.');
        }

        setAttribute(prop, '' + meter[prop]);

        propValues[prop] = value === null ? null : value;
        updateMeterStyle(meter);
        return value;
      };
    }

    each(METER_PROPS, function(prop) {
      var etters = {
        get: getGetter(prop)
      };
      if (!supports.attersAsProps) {
        etters.set = getSetter(prop);
      }
      defineProperty(meter, prop, etters);
    });

    var attributeSetter = createNativeFunction(METHOD_SET_ATTRIBUTE, function(attr, value) {
      setAttribute(attr, value);
      attr = attr.toLowerCase();
      each(METER_PROPS, function(prop) {
        if (prop === attr) {
          propValues[prop] = isVoidValue(value) || value === null ? null : value;
          updateMeterStyle(meter);
        }
      });
    });

    defineProperty(meter, METHOD_SET_ATTRIBUTE, {
      value: attributeSetter
    });

    var cloneNodeMethd = createNativeFunction(METHOD_CLONE_NODE, function(deep) {
      var clone = cloneNode(false);
      clone.removeAttribute(POLYFILL_SIGN);
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
      isTop = window.frameElement === null;
    } catch (_) {}

    if (!supports.addEventListener && documentElement.doScroll && isTop) {
      (function doScroll() {
        try {
          documentElement.doScroll();
        } catch (_) {
          return setTimeout(doScroll, 50);
        }
        isReady = true;
      })();
    }
  })();

  (function polyfillWhenReady() {
    if (isReady) {
      polyfill();
      observerSubtree();
    } else {
      setTimeout(polyfillWhenReady, 50);
    }
  })();

  meterPolyfill.polyfill = polyfill;
  return meterPolyfill;
});
