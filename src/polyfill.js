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

  var METER_TAG = '<%= METER_TAG %>';
  var LEVEL_OPTIMUM = 1;
  var LEVEL_SUBOPTIMUM = 2;
  var LEVEL_SUBSUBOPTIMUM = 3;
  var PROP_MIN = 'min';
  var PROP_MAX = 'max';
  var PROP_LOW = 'low';
  var PROP_HIGH = 'high';
  var PROP_VALUE = 'value';
  var PROP_OPTIMUM = 'optimum';
  var METER_PROPS = [PROP_MIN, PROP_MAX, PROP_LOW, PROP_HIGH, PROP_VALUE, PROP_OPTIMUM];
  var METER_CLASS_PREFIX = 'meter-';
  var HTML_METER_ELEMENT_CONSTRICTOR_NAME = [
    'HTML',
    METER_TAG.replace(/^(.)(.*)$/,function(_, $1, $2){
        return $1.toUpperCase() + $2.toLowerCase()
    }),
    'Element'].join('');
  var DOCUMENT_CREAMENT_METHOD = 'createElement';

  var METER_VALUE_CLASSES = {
    inner: METER_CLASS_PREFIX + 'inner-element',
    bar: METER_CLASS_PREFIX + 'bar'
  };

  METER_VALUE_CLASSES[LEVEL_OPTIMUM] = METER_CLASS_PREFIX + 'optimum-value';
  METER_VALUE_CLASSES[LEVEL_SUBOPTIMUM] = METER_CLASS_PREFIX + 'suboptimum-value';
  METER_VALUE_CLASSES[LEVEL_SUBSUBOPTIMUM] = METER_CLASS_PREFIX + 'even-less-good-value';

  var METER_INITAL_VALUES = {
    min: 0,
    max: 1,
    low: 0,
    high: 1
  };

  var NOOP = function() {};

  var meterPolyfill = {
    CLASSES: METER_VALUE_CLASSES,
    INITAL_VALUES: METER_INITAL_VALUES,
    LEVEL_SUBOPTIMUM: LEVEL_SUBOPTIMUM,
    LEVEL_OPTIMUM: LEVEL_OPTIMUM,
    LEVEL_SUBSUBOPTIMUM: LEVEL_SUBSUBOPTIMUM,
    polyfill: NOOP
  };

  if (!Function.prototype.bind) {
    Function.prototype.bind = function(self) {
      var fn = this;
      return function() {
        return fn.apply(self, arguments);
      };
    };
  }

  function createNativeFunction(fnName, fn) {
    function toString() {
      return 'function ' + fnName + '() { [native code] }';
    }

    var nativeToString = toString.toString.toString;

    // firfox shows bound toString in console not bug
    // ie7/8 is buggy without bind
    toString.toString = nativeToString.bind(nativeToString);
    // some browsers shows empty function name in toString.toString.toString
    toString.toString.toString = toString.toString;

    fn.toString = toString;
    return fn;
  }

  var document = window.document;
  var documentElement = document.documentElement;
  // ie 8. document.createElement is not a function
  var createElement = Function.prototype.bind.call(document[DOCUMENT_CREAMENT_METHOD], document);

  var meterElement = createElement(METER_TAG);
  var nativeSupport = meterElement[PROP_MAX] === METER_INITAL_VALUES[PROP_MAX];

  var HTMLMeterElement = window[HTML_METER_ELEMENT_CONSTRICTOR_NAME] || (function() {
    function HTMLMeterElement() {
      throw new TypeError('Illegal constructor');
    }

    // ie 8 constructor is null
    var prototype = (
      window.HTMLElement ||
      meterElement.constructor ||
      window.Element ||
      window.Node ||
      function() {}).prototype;

    if (Object.create) {
      prototype = Object.create(prototype);
    }

    HTMLMeterElement.prototype = prototype;

    var nativeFn = createNativeFunction(HTML_METER_ELEMENT_CONSTRICTOR_NAME, HTMLMeterElement);
    nativeFn.constructor = nativeFn.prototype.constructor = nativeFn;
    return window[HTML_METER_ELEMENT_CONSTRICTOR_NAME] = nativeFn;
  })();

  // there is no moz/ms/o vendor prefix
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var isObservered = false;
  var isReady = false;
  // TODO:
  // use getComputedStyle find the right calculator
  var isFirefox = window.navigator.userAgent.indexOf('Firefox') > -1;

  function isUndefinedOrNaN(obj) {
    return typeof obj === 'undefined' || isNaN(obj);
  }

  function isMeter(el) {
    return el && el.tagName && el.tagName.toUpperCase() === METER_TAG;
  }

  function fixProps(meter, props) {
    var isMeterElement = isMeter(meter);
    // must has a min/max value
    each([PROP_MIN, PROP_MAX], function(prop) {
      var value = +meter[prop];
      if (isNaN(value)) {
        meter[prop] = METER_INITAL_VALUES[prop];
      }
    });
    each(props || METER_PROPS, function(prop) {
      switch (prop) {
        case PROP_MAX:
          if (meter[PROP_MAX] < meter[PROP_MIN]) {
            meter[PROP_MAX] = meter[PROP_MIN];
          }
          break;
        case PROP_LOW:
          if (meter[PROP_LOW] < meter[PROP_MIN]) {
            meter[PROP_LOW] = meter[PROP_MIN];
          }
          if (!isMeterElement && isUndefinedOrNaN(meter[PROP_LOW])) {
            meter[PROP_LOW] = meter[PROP_MIN];
          }
          break;
        case PROP_HIGH:
          if (meter[PROP_HIGH] > meter[PROP_MAX]) {
            meter[PROP_HIGH] = meter[PROP_MAX];
          }
          if (meter[PROP_HIGH] < meter[PROP_LOW]) {
            meter[PROP_HIGH] = meter[PROP_LOW];
          }
          if (!isMeterElement && isUndefinedOrNaN(meter[PROP_HIGH])) {
            meter[PROP_HIGH] = meter[PROP_MAX];
          }
          break;
        case PROP_VALUE:
          if (isMeterElement && isUndefinedOrNaN(meter[PROP_VALUE])) {
            meter.removeAttribute(PROP_VALUE);
          } else {
            if (
              (meter[PROP_VALUE] < meter[PROP_MIN]) ||
              (typeof meter[PROP_VALUE] === 'undefined')
            ) {
              meter[PROP_VALUE] = meter[PROP_MIN];
            }
            if (meter[PROP_VALUE] > meter[PROP_MAX]) {
              meter[PROP_VALUE] = meter[PROP_MAX];
            }
          }
          break;
        case PROP_OPTIMUM:
          if (
            isUndefinedOrNaN(meter[PROP_OPTIMUM]) ||
            (meter[PROP_OPTIMUM] < meter[PROP_MIN] || meter[PROP_OPTIMUM] > meter[PROP_MAX])
          ) {
            if (isMeterElement) {
              meter.removeAttribute(PROP_OPTIMUM);
            } else {
              meter[PROP_OPTIMUM] = meter[PROP_MIN] + (meter[PROP_MAX] - meter[PROP_MIN]) / 2;
            }
          }
          break;
        default:
          break;
      }
    });
    return meter;
  }

  function calcLevel(props) {
    props = fixProps(props);

    var min = props[PROP_MIN];
    var max = props[PROP_MAX];
    var low = props[PROP_LOW];
    var high = props[PROP_HIGH];
    var optimum = props[PROP_OPTIMUM];
    var value = props[PROP_VALUE];

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

    // firefox show diffently from chrome when
    // value === high/low && min === max
    if (isFirefox && min === max) {
      percentage = 100;
    }


    if (isFirefox &&
      (
        (optimum > high && value === high) ||
        (optimum < low && value === low)
      )
     ) {
      level = LEVEL_SUBOPTIMUM;
    }

    return {
      percentage: percentage,
      level: level,
      className: METER_VALUE_CLASSES[level]
    };
  }

  meterPolyfill.calc = calcLevel;

  if (nativeSupport) {
    return meterPolyfill;
  }

  meterElement[METER_TAG] = METER_TAG;
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

  var min = Math[PROP_MIN];
  var max = Math[PROP_MAX];
  var setTimeout = window.setTimeout;


  // help functions

  function each(arrLike, fn) {
    for (var i = 0, len = arrLike.length; i < len; i++) {
      fn(arrLike[i], i);
    }
  }

  function hasAttribute(el, name) {
    if (supports.hasAttribute) {
      return el.hasAttribute(name);
    } else {
      return el.getAttribute(name) !== null;
    }
  }

  function createShadow(meter) {
    if (!isMeter(meter) || hasAttribute(meter, '_polyfill')) {
      return meter;
    }

    meter.setAttribute('_polyfill', '');
    meter.innerHTML = METER_SHADOW_HTML;

    fixProps(meter, [PROP_MAX, PROP_LOW, PROP_HIGH, PROP_VALUE]);

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
    } else if (supports.DOMNodeInserted) {
      on(meter, 'DOMAttrModified', function(e) {
        if (METER_PROPS.join(' ').indexOf(e.attrName) > -1) {
          updateMeterStyle(e.target);
        }
      });
    } else if (supports.propertychange) {
      on(meter, 'propertychange', function(e) {
        // console.log('propertychange');
        // console.log(e);
      });
    } else {
      // anything ?
    }
    updateMeterStyle(meter);
    return meter;
  }

  function setMeterAttribute(meter, attr, value) {
    switch (attr) {
      case PROP_MIN:
        meter.setAttribute(attr, value);
        fixProps(meter, [PROP_MAX, PROP_LOW, PROP_HIGH, PROP_VALUE, PROP_OPTIMUM]);
        break;
      case PROP_MAX:
        value = max(value, meter[PROP_MIN]);
        meter.setAttribute(attr, value);
        fixProps(meter, [PROP_LOW, PROP_HIGH, PROP_VALUE, PROP_OPTIMUM]);
        break;
      case PROP_LOW:
        value = min(max(value, meter[PROP_MIN]), meter[PROP_MAX]);
        meter.setAttribute(attr, value);
        fixProps(meter, [PROP_HIGH]);
        break;
      case PROP_HIGH:
        value = min(max(value, meter[PROP_MIN], meter[PROP_LOW]), meter[PROP_MAX]);
        meter.setAttribute(attr, value);
        break;
      case PROP_OPTIMUM:
        value = min(max(value, meter[PROP_MIN]), meter[PROP_MAX]);
        meter.setAttribute(attr, value);
        break;
      default:
        meter.setAttribute(attr, value);
    }
    updateMeterStyle(meter);
  }

  function updateMeterStyle(meter) {

    if (!hasAttribute(meter, '_polyfill')) {
      return createShadow(meter);
    }

    var innerDivs = meter.getElementsByTagName('div');
    if (!innerDivs.length || !innerDivs[2]) {
      throw new Error(METER_TAG + ' polyfilled shadow dom is not currect.');
    }
    var valueElement = innerDivs[2];

    var props = {};
    each(METER_PROPS, function(prop) {
      if (supports.unknownElement) {
        props[prop] = +meter[prop];
      } else if (hasAttribute(meter, prop)) {
        props[prop] = +meter.getAttribute(prop);
      } else {
        props[prop] = METER_INITAL_VALUES[prop];
      }
    });

    var level = calcLevel(props);
    valueElement.className = level.className;
    valueElement.style.width = level.percentage + '%';

    return meter;
  }

  // over write document.createElement
  function documentCreateElemennt(tagName) {
    var el = createElement.apply(document, arguments);
    if (isMeter(el)) {
      polyfill(el);
    }
    return el;
  }
  document[DOCUMENT_CREAMENT_METHOD] = createNativeFunction([DOCUMENT_CREAMENT_METHOD], documentCreateElemennt);

  // maybe also cloneNode ??

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
      meters = (context || documentElement).getElementsByTagName(METER_TAG);
    }

    each(meters, function(meter) {
      // ie 8 fails
      try {
        meter.constructor = HTMLMeterElement;
      } catch(_) {}
      pollyfillGetterSetter(meter);
      updateMeterStyle(meter);
    });
  }

  function pollyfillGetterSetter(meter) {
    if (!supports.unknownElement) {
      return;
    }

    var prototype = meterElement.constructor.prototype;
    function getSetter(prop) {
      if (supports.attersAsProps) {
        return;
      }
      return function(value) {
        setMeterAttribute(this, prop.toLowerCase(), +value);
      };
    }

    function getGetter(prop) {
      return function() {
        if (isMeter(this)) {
          if (hasAttribute(this, prop)) {
            return +this.getAttribute(prop);
          } else if (prop === PROP_LOW) {
            return this[PROP_MIN];
          } else if (prop === PROP_HIGH) {
            return this[PROP_MAX];
          } else if (prop === PROP_OPTIMUM) {
            return (this[PROP_MAX] - this[PROP_MIN]) / 2 + this[PROP_MIN];
          } else if (prop === PROP_VALUE) {
            return this[PROP_MIN];
          }
          return METER_INITAL_VALUES[prop];
        }

        return this.getAttribute(prop);
      };
    }

    each(METER_PROPS, function(prop) {
      Object.defineProperty(meter, prop, {
        // enumerable: true, // can't do this on ie8
        // configurable: true
        set: getSetter(prop),
        get: getGetter(prop)
      });
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
