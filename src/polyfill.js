/* globals define: true, module: true*/
(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function() {
      return factory(root);
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(root);
  } else {
    root.meterPolyfill = factory(root);
  }
})(this, function(window) {
  'use strict';

  var LEVEL_SUBOPTIMUN = 1;
  var LEVEL_OPTIMUN = 2;
  var LEVEL_SUBSUBOPTIMUN = 3;
  var PROP_MIN = 'min';
  var PROP_MAX = 'max';
  var PROP_LOW = 'low';
  var PROP_HIGH = 'high';
  var PROP_VALUE = 'value';
  var PROP_OPTIMUN = 'optimum';
  var METER_PROPS = [PROP_MIN, PROP_MAX, PROP_LOW, PROP_HIGH, PROP_VALUE, PROP_OPTIMUN];
  var METER_TAG = 'METER';
  var METER_CLASS_PREFIX = 'meter-';

  var METER_VALUE_CLASSES = {
    inner: METER_CLASS_PREFIX + 'inner-element',
    bar: METER_CLASS_PREFIX + 'bar'
  };

  METER_VALUE_CLASSES[LEVEL_OPTIMUN] = METER_CLASS_PREFIX + 'optimum-value';
  METER_VALUE_CLASSES[LEVEL_SUBOPTIMUN] = METER_CLASS_PREFIX + 'suboptimum-value';
  METER_VALUE_CLASSES[LEVEL_SUBSUBOPTIMUN] = METER_CLASS_PREFIX + 'even-less-good-value';

  var document = window.document;
  var documentElement = document.documentElement;
  // there is no moz/ms/o vendor prefix
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var isObservered = false;
  var isReady = false;
  // TODO:
  // use getComputedStyle find the right calculator
  var isFirefox = window.navigator.userAgent.indexOf('Firefox') > -1;

  var meterElement = document.createElement(METER_TAG);
  meterElement[PROP_MIN] = '1';
  meterElement.setAttribute(PROP_HIGH, '1');

  var support = {
    native: meterElement[PROP_MAX] === 1,
    MutationObserver: typeof MutationObserver !== 'undefined',
    addEventListener: !!window.addEventListener,
    attachEvent: !!window.attachEvent,
    syncAttribute: meterElement.getAttribute(PROP_LOW) === '1' && meterElement[PROP_HIGH] === '1',
    unknownElement: !!meterElement.constructor,
    hasAttribute: !!meterElement.hasAttribute
  };

  var METER_INITAL_VALUES = {
    min: 0,
    max: 1,
    low: 0,
    high: 1
  };

  var METER_SHADOW_HTML = [
    '<div class="' + METER_VALUE_CLASSES.inner + '">',
      '<div class="' + METER_VALUE_CLASSES.bar + '">',
        '<div class="' + METER_VALUE_CLASSES[LEVEL_SUBOPTIMUN] + '" style="width: 0">',
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

  function on(el, events, listener, useCapture) {
    each(events.split(' '), function(event) {
      if (support.addEventListener) {
        el.addEventListener(event, listener, useCapture);
      } else if (support.attachEvent) {
        el.attachEvent('on' + event, listener);
      } else {
        el['on' + event] = listener;
      }
    });
  }

  if (!Function.prototype.bind) {
    Function.prototype.bind = function(self) {
      var fn = this;
      return function() {
        return fn.apply(self, arguments);
      }
    }
  }

  function createNativeFunction(fnName, fn) {
    function toString() {
      return 'function ' + fnName + '() { [native code] }';
    };

    var nativeToString = toString.toString.toString;

    // firfox shows bound toString in console not bug
    // ie7/8 is buggy without bind
    toString.toString = nativeToString.bind(nativeToString);
    // some browsers shows empty function name in toString.toString.toString
    toString.toString.toString = toString.toString;

    fn.toString = toString;
    return fn;
  }

  function hasAttribute(el, name) {
    if (support.hasAttribute) {
      return el.hasAttribute(name);
    } else {
      return el.getAttribute(name) !== null;
    }
  }

  function isMeter(el) {
    return el && el.tagName && el.tagName.toUpperCase() === METER_TAG;
  }

  function fixProps(meter, props) {
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
          break;
        case PROP_HIGH:
          if (meter[PROP_HIGH] > meter[PROP_MAX]) {
            meter[PROP_HIGH] = meter[PROP_MAX];
          }
          if (meter[PROP_HIGH] < meter[PROP_LOW]) {
            meter[PROP_HIGH] = meter[PROP_LOW];
          }
          break;
        case PROP_VALUE:
          if (isMeter(meter) && typeof meter[PROP_VALUE] === 'undefined') {
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
        case PROP_OPTIMUN:
          if (
            (typeof meter[PROP_OPTIMUN] === 'undefined') ||
            (meter[PROP_OPTIMUN] < meter[PROP_MIN] || meter[PROP_OPTIMUN] > meter[PROP_MAX])
          ) {
            if (isMeter(meter)) {
              meter.removeAttribute(PROP_OPTIMUN);
            } else {
              meter[PROP_OPTIMUN] = meter[PROP_MIN] + (meter[PROP_MAX] - meter[PROP_MIN]) / 2;
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
    var optimum = props[PROP_OPTIMUN];
    var value = props[PROP_VALUE];

    var percentage = min === max ? 0 : (value - min) / (max - min) * 100;
    var level = LEVEL_OPTIMUN;

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
        level = LEVEL_SUBOPTIMUN;
      }
    } else if (low === high) {
      if (
        (low <= optimum && value < low) ||
        (high > optimum && value > high)
      ) {
        level = LEVEL_SUBSUBOPTIMUN;
      }
    } else if (optimum < low) {
      if (value > low && value <= high) {
        level = LEVEL_SUBOPTIMUN;
      } else if (value > high) {
        level = LEVEL_SUBSUBOPTIMUN;
      }
    } else if (optimum > high) {
      if (value >= low && value < high) {
        level = LEVEL_SUBOPTIMUN;
      } else if (value < low) {
        level = LEVEL_SUBSUBOPTIMUN;
      }
    }

    // firefox show diffently from chrome when
    // value === high/low
    if (isFirefox &&
      (
        (optimum > high && value === high) ||
        (optimum < low && value === low)
      )
     ) {
      level = LEVEL_SUBOPTIMUN;
    }

    return {
      percentage: percentage,
      level: level,
      style: METER_VALUE_CLASSES[level]
    };
  }

  function createShadow(meter) {
    if (support.native || !isMeter(meter) || hasAttribute(meter, '_polyfill')) {
      return meter;
    }

    meter.innerHTML = METER_SHADOW_HTML;
    meter.setAttribute('_polyfill', '');

    fixProps(meter, [PROP_MAX, PROP_LOW, PROP_HIGH, PROP_VALUE]);
    updateMeterStyle(meter);
    return meter;
  }

  function setMeterAttribute(meter, attr, value) {
    switch (attr) {
      case PROP_MIN:
        meter.setAttribute(attr, value);
        fixProps(meter, [PROP_MAX, PROP_LOW, PROP_HIGH, PROP_VALUE, PROP_OPTIMUN]);
        break;
      case PROP_MAX:
        value = max(value, meter[PROP_MAX]);
        meter.setAttribute(attr, value);
        fixProps(meter, [PROP_LOW, PROP_HIGH, PROP_VALUE, PROP_OPTIMUN]);
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
      case PROP_OPTIMUN:
        value = min(max(value, meter[PROP_MIN]), meter[PROP_MAX]);
        meter.setAttribute(attr, value);
        break;
      default:
        meter.setAttribute(attr, value);
    }
    updateMeterStyle(meter);
  }

  function updateMeterStyle(meter) {
    if (support.native) {
      return;
    }

    var innerDivs = meter.getElementsByTagName('div');
    if (!innerDivs.length || !innerDivs[2]) {
      return createShadow(meter);
    }
    var valueElement = innerDivs[2];

    var props = {};
    each(METER_PROPS, function(prop) {
      if (support.unknownElement) {
        props[prop] = +meter[prop];
      } else if (hasAttribute(meter, prop)) {
        props[prop] = +meter.getAttribute(prop);
      }else {
        props[prop] = METER_INITAL_VALUES[prop];
      }
    });

    var level = calcLevel(props);
    valueElement.className = METER_VALUE_CLASSES[level.level];
    valueElement.style.width = level.percentage + '%';

    return meter;
  }

  function observer() {
    if (isObservered) {
      return;
    }
    if (support.MutationObserver) {
      var observer = new MutationObserver(function(mutations) {
        each(mutations, function(mutation) {
          polyfill(mutation.target);
        });
      });
      observer.observe(documentElement, {
        attributes: true,
        attributeFilter: METER_PROPS,
        subtree: true,
        childList: true
      });
    } else {
      on(documentElement, 'DOMNodeInserted DOMAttrModified', function(e) {
        polyfill(e.target);
      });
    }
    isObservered = true;
  }

  function polyfill(context) {
    if (support.native) {
      return;
    }

    var meters = [];
    if (isMeter(context)) {
      meters = [context];
    } else {
      meters = (context || documentElement).getElementsByTagName('meter');
    }

    each(meters, function(meter) {
      updateMeterStyle(meter);
    });
  }

  (function pollyfillGetterSetter() {
    if (!support.unknownElement) {
      return;
    }

    var prototype = meterElement.constructor.prototype;
    function getSetter(prop) {
      return function(value) {
        if (isMeter(this)) {
          setMeterAttribute(this, prop.toLowerCase(), +value);
        } else {
          return this[prop] = value;
        }
      };
    }

    (function getGetter(prop) {
      return function() {
        if (isMeter(this)) {
          if (hasAttribute(this, prop)) {
            return +this.getAttribute(prop);
          } else if (prop === PROP_LOW) {
            return this[PROP_MIN];
          } else if (prop === PROP_HIGH) {
            return this[PROP_MAX];
          } else if (prop === PROP_OPTIMUN) {
            return (this[PROP_MAX] - this[PROP_MIN]) / 2 + this[PROP_MIN];
          } else if (prop === PROP_VALUE) {
            return this[PROP_MIN];
          }
          return METER_INITAL_VALUES[prop];
        } else {
          return this[prop];
        }
      };
    }

    each(METER_PROPS, function(prop) {
      var props = {};
      if (!support.syncAttribute) {
        props.set = getSetter(prop);
      }
      props.get = getGetter(prop);
      Object.defineProperty(prototype, prop, props);
    });
  })();

  (function polyfillDocument() {
    var createElement = document.createElement;

    function HTMLMeterElement() {
      var el = createElement.apply(document, arguments);
      return polyfill(el);
    }
    HTMLMeterElement.constructor = HTMLMeterElement;
    HTMLMeterElement.prototype = meterElement.constructor.prototype;
    window.HTMLMeterElement = createNativeFunction('HTMLMeterElement', HTMLMeterElement);

    function documentCreateElemennt(tag) {
      if (tag.toUpperCase() === METER_TAG) {
        return HTMLMeterElement.call(document, arguments);
      } else {
        return createElement.apply(document, arguments);
      }
    }
    documentCreateElemennt.toString = nativeToString('createElement');
    document.createElement = createNativeFunction('createElement', documentCreateElemennt);
  })();

  (function checkReady() {
    if (document.readyState === 'complete') {
      isReady = true;
    }

    on(document, 'DOMContentLoaded', function() {
      isReady = true;
    });

    on(window, 'load', function() {
      isReady = true;
    });

    // uglify will break window without a wrapper
    var isTop = false;
    try {
      isTop === window.frameElement === null;
    } catch (_) {}

    if (!support.addEventListener && documentElement.doScroll && isTop) {
      (function doScroll() {
        try {
          documentElement.doScroll('left');
        } catch (_) {
          return setTimeout(doScroll, 50);
        }
        isReady = true;
      })();
    }
  })();

  (function autoPolyfill() {
    if (!isReady) {
      setTimeout(autoPolyfill, 50);
    } else {
      polyfill();
      observer();
    }
  })();

  return {
    CLASSES: METER_VALUE_CLASSES,
    INITAL_VALUES: METER_INITAL_VALUES,
    LEVEL_SUBOPTIMUN: LEVEL_SUBOPTIMUN,
    LEVEL_OPTIMUN: LEVEL_OPTIMUN,
    LEVEL_SUBSUBOPTIMUN: LEVEL_SUBSUBOPTIMUN,
    polyfill: polyfill,
    fix: fixProps,
    calc: calcLevel
  };

});
