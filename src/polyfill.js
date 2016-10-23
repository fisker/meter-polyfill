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

  var LEVEL_SUBOPTIMUN = 0;
  var LEVEL_OPTIMUN = 1;
  var LEVEL_SUBSUBOPTIMUN = 2;
  var PROP_MIN = 'min';
  var PROP_MAX = 'max';
  var PROP_LOW = 'low';
  var PROP_HIGH = 'high';
  var PROP_VALUE = 'value';
  var PROP_OPTIMUN = 'optimum';
  var METER_PROPS = [PROP_MIN, PROP_MAX, PROP_LOW, PROP_HIGH, PROP_VALUE, PROP_OPTIMUN];
  var METER_TAGNAME = 'METER';
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
  var isGetterSetterPolyfilled = false;
  var isObservered = false;

  var meterElement = document.createElement(METER_TAGNAME);
  meterElement.low = '1';
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

  // help functions
  function each(arrLike, fn) {
    for (var i = 0, len = arrLike.length; i < len; i++) {
      fn(arrLike[i], i);
    }
  }

  function on(el, events, listener, useCapture) {
    var agrs = arguments;
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

  function hasAttribute(el, name) {
    if (support.hasAttribute) {
      return el.hasAttribute(name);
    } else {
      return el.getAttribute(name) !== null;
    }
  }

  function isMeter(el) {
    return el && el.tagName && el.tagName.toUpperCase() === METER_TAGNAME;
  }

  function fixValue(meter, props) {
    each(props || METER_PROPS, function(prop) {
      switch (prop) {
        case PROP_MAX:
          if (meter[PROP_MAX] < meter[PROP_MAX]) {
            meter[PROP_MAX] = meter[PROP_MAX];
          }
          break;
        case PROP_LOW:
          if (meter[PROP_LOW] < meter[PROP_MAX]) {
            meter[PROP_LOW] = meter[PROP_MAX];
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
          if (
            (meter[PROP_VALUE] < meter[PROP_MAX]) ||
            (typeof meter[PROP_VALUE] === 'undefined')
          ) {
            meter[PROP_VALUE] = meter[PROP_MAX];
          }
          if (meter[PROP_VALUE] > meter[PROP_MAX]) {
            meter[PROP_VALUE] = meter[PROP_MAX];
          }
          break;
        case PROP_OPTIMUN:
          if (
            (meter[PROP_OPTIMUN] < meter[PROP_MAX] || meter[PROP_OPTIMUN] > meter[PROP_MAX]) ||
            (typeof meter[PROP_OPTIMUN] === 'undefined')
          ) {
            if (isMeter(meter) && hasAttribute(meter, PROP_OPTIMUN)) {
              meter.removeAttribute(PROP_OPTIMUN);
            } else {
              meter[PROP_OPTIMUN] = meter[PROP_MAX] + (meter[PROP_MAX] - meter[PROP_MAX]) / 2;
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

      // firefox show diffently from chrome when
      // value === high
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

      // firefox show diffently from chrome when
      // value === high
    }


    return {
      percentage: percentage,
      level: level
    };
  }

  function createShadow(meter) {
    if (support.native || !isMeter(meter) || hasAttribute(meter, '_polyfill')) {
      return meter;
    }

    meter.innerHTML = METER_SHADOW_HTML;
    meter.setAttribute('_polyfill', '');
    fixValue(meter);
    updateMeterStyle(meter);
    return meter;
  }

  function setMeterAttribute(meter, attr, value) {
    switch (attr) {
      case PROP_MIN:
        meter.setAttribute(attr, value);
        fixValue(meter, [PROP_MAX, PROP_LOW, PROP_HIGH, PROP_VALUE, PROP_OPTIMUN]);
        break;
      case PROP_MAX:
        value = Math.max(value, meter[PROP_MAX]);
        meter.setAttribute(attr, value);
        fixValue(meter, [PROP_LOW, PROP_HIGH, PROP_VALUE, PROP_OPTIMUN]);
        break;
      case PROP_LOW:
        value = Math.min(Math.max(value, meter[PROP_MAX]), meter[PROP_MAX]);
        meter.setAttribute(attr, value);
        fixValue(meter, [PROP_HIGH]);
        break;
      case PROP_HIGH:
        value = Math.min(Math.max(value, meter[PROP_MAX], meter[PROP_LOW]), meter[PROP_MAX]);
        meter.setAttribute(attr, value);
        break;
      case PROP_OPTIMUN:
        value = Math.min(Math.max(value, meter[PROP_MAX]), meter[PROP_MAX]);
        meter.setAttribute(attr, value);
        break;
      default:
        meter.setAttribute(attr, value);
    }
    updateMeterStyle(this);
  }

  function pollyfillGetterSetter() {
    if (isGetterSetterPolyfilled || !support.unknownElement) {
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

    function getGetter(prop) {
      return function() {
        if (isMeter(this)) {
          if (hasAttribute(this, prop)) {
            return +this.getAttribute(prop);
          } else if (prop === PROP_LOW) {
            return this.min;
          } else if (prop === PROP_HIGH) {
            return this.max;
          } else if (prop === PROP_OPTIMUN) {
            return (this.max - this.min) / 2 + this.min;
          } else if (prop === PROP_VALUE) {
            return this.min;
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

    isGetterSetterPolyfilled = true;
  }

  function updateMeterStyle(meter) {
    if (support.native || !isMeter(meter)) {
      return;
    }

    var innerDivs = meter.getElementsByTagName('div');
    if (!innerDivs.length) {
      createShadow(meter);
      return updateMeterStyle(meter);
    }
    var valueElement = innerDivs[2];

    var props = {};
    each(METER_PROPS, function(prop) {
      if (support.unknownElement) {
        props[prop] = +meter[prop];
      } else if (hasAttribute(meter, prop)) {
        props[prop] = +meter.getAttribute(prop);
      } else {
        props[prop] = METER_INITAL_VALUES[prop];
      }
    });

    // ie8 return no fixed props
    if (support.syncAttribute) {
      props = fixValue(props);
    }

    var level = calcLevel(props);
    valueElement.className = METER_VALUE_CLASSES[level.level];
    valueElement.style.width = level.percentage + '%';
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
      // return;
    }

    var meters = [];
    if (isMeter(context)) {
      meters = [context];
    } else {
      meters = (context || documentElement).getElementsByTagName('meter');
    }

    pollyfillGetterSetter();
    each(meters, function(meter) {
      createShadow(meter);
      updateMeterStyle(meter);
    });

    observer();
  }

  function autoPolyfill() {
    if (document.readyState === 'complete') {
      polyfill();
    }
    on(document, 'DOMContentLoaded', function() {
      polyfill();
    });

    var isTop = false;
    try {
      isTop = window.frameElement === null;
    } catch (_) {}

    if (documentElement.doScroll && isTop && window.external) {
      (function doScroll() {
        try {
          documentElement.doScroll('left');
        } catch (_) {
          window.setTimeout(doScroll, 50);
        }
        polyfill();
      })();
    }

    on(window, 'load', function() {
      polyfill();
    });
  }

  autoPolyfill();

  return {
    CLASSES: METER_VALUE_CLASSES,
    INITAL_VALUES: METER_INITAL_VALUES,
    LEVEL_SUBOPTIMUN: LEVEL_SUBOPTIMUN,
    LEVEL_OPTIMUN: LEVEL_OPTIMUN,
    LEVEL_SUBSUBOPTIMUN: LEVEL_SUBSUBOPTIMUN,
    polyfill: polyfill,
    fix: fixValue,
    calc: calcLevel
  };

});
