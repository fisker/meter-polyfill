(function (window, document) {
  'use strict';

  var meterElement = document.createElement('meter');

  // native support
  if (meterElement.max === 1) {
    // return;
  }

  var documentElement = document.documentElement;
  // there is no moz/ms/o vendor prefix
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  meterElement.low = '1';
  meterElement.setAttribute('high', '1');

  var support = {
    MutationObserver: typeof window.MutationObserver !== 'undefined',
    addEventListener: 'addEventListener' in document,
    attachEvent: 'attachEvent' in document,
    syncAttribute: meterElement.getAttribute('low') === '1' && meterElement.high === '1',
    unknownElement: !!meterElement.constructor,
    hasAttribute: !!meterElement.hasAttribute
  };

  var METER_VALUE_CLASSES = {
    inner: 'meter-inner-element',
    bar: 'meter-bar',
    optimum: 'meter-optimum-value',
    suboptimum: 'meter-suboptimum-value',
    subsuboptimum: 'meter-even-less-good-value'
  };

  var METER_SHADOW_HTML = [
    '<div class="' + METER_VALUE_CLASSES.inner + '">',
      '<div class="' + METER_VALUE_CLASSES.bar + '">',
        '<div class="' + METER_VALUE_CLASSES.optimum + '">',
        '</div>',
      '</div>',
    '</div>'
  ].join('');

  var METER_INITAL_VALUES = {
    min: 0,
    max: 1,
    low: 0,
    high: 1,
    value: undefined,
    optimum: undefined
  };

  var meterAttrs = [];
  for (var prop in METER_INITAL_VALUES) {
    if (METER_INITAL_VALUES.hasOwnProperty(prop)) {
      meterAttrs.push(prop);
    }
  }

  function each(arrLike, fn) {
    for (var i = 0, len = arrLike.length; i < len; i++) {
      fn(arrLike[i], i);
    }
  }

  function on(el, event, type, listener, useCapture) {
    if (support.addEventListener) {
      el.addEventListener(event, type, listener, useCapture);
    } else if (support.attachEvent) {
      el.attachEvent('on' + event, type, listener);
    } else {
      el['on' + event] = listener;
    }
  }

  function hasAttribute(name) {
    if (support.hasAttribute) {
      return this.hasAttribute(name);
    } else {
      return this.getAttribute(name) !== null;
    }
  }

  function isMeter(el) {
    return el && el.tagName && el.tagName.toUpperCase() === 'METER';
  }

  function polyfillShadow(context) {
    var meters = [];
    if (isMeter(context)) {
      meters = [context];
    } else {
      meters = (context || documentElement).getElementsByTagName('meter');
    }

    each(meters, function(meter) {
      if (isMeter(meter) && !hasAttribute.call(meter, '_polyfill')) {
        meter.innerHTML = METER_SHADOW_HTML;
        meter.setAttribute('_polyfill', '');
        fixValue.call(meter, [
          'max',
          'low',
          'high',
          'value',
          'optimum',
        ]);
        setValue(meter);
      }
    });
  }

  function fixValue(fixProps) {
    var meter = this;
    each(fixProps, function(prop) {
      if (prop === 'max' && meter.max < meter.min) {
        meter.max = meter.min;
      } else if (prop === 'low' && meter.low < meter.min) {
        meter.low = meter.min;
      } else if (prop === 'high') {
        if (meter.high > meter.max) {
          meter.high = meter.max;
        }
        if (meter.high < meter.low) {
          meter.high = meter.low;
        }
      } else if (prop === 'value') {
        if ((meter.value < meter.min) || (typeof meter.value === 'undefined')) {
          meter.value = meter.min;
        }
        if (meter.value > meter.max) {
          meter.value = meter.max;
        }
      } else if (prop === 'optimum') {
        if ((meter.optimum < meter.min || meter.optimum > meter.max) || (typeof meter.optimum === 'undefined')) {
          if (isMeter(meter) && hasAttribute.call(meter, 'optimum')) {
            meter.removeAttribute('optimum');
          } else {
            meter.optimum = meter.min + (meter.max - meter.min) / 2;
          }
        }
      }
    });
  }

  var isGetterDefined = false;
  function polyfillGetterSetter() {
    if (isGetterDefined) {
      return;
    }
    isGetterDefined = true;
    var prototype = meterElement.constructor.prototype;
    function setter(prop) {
      return function(value) {
        if (!isMeter(this)) {
          return
        }
        prop = prop.toLowerCase();
        value = + value;
        switch (prop) {
          case 'min':
            this.setAttribute(prop, value);
            fixValue.call(this, ['max', 'low', 'high', 'value', 'optimum']);
            break;
          case 'max':
            value = Math.max(value, this.min);
            this.setAttribute(prop, value);
            fixValue.call(this, ['low', 'high', 'value', 'optimum']);
            break;
          case 'low':
            value = Math.min(Math.max(value, this.min), this.max);
            this.setAttribute(prop, value);
            fixValue.call(this, ['high']);
            break;
          case 'high':
            value = Math.min(Math.max(value, this.min, this.low), this.max);
            this.setAttribute(prop, value);
            break;
          case 'optimum':
            value = Math.min(Math.max(value, this.min), this.max);
            this.setAttribute(prop, value);
            break;
          default:
            this.setAttribute(prop, value);
        }
        setValue(this);
      };
    }

    function getter(prop) {
      return function () {
        if (isMeter(this)) {
          if (hasAttribute.call(this, prop)) {
            return +this.getAttribute(prop);
          } else if (prop === 'low') {
            return this.min;
          } else if (prop === 'high') {
            return this.max;
          } else if (prop === 'optimum') {
            return (this.max - this.min) / 2 + this.min;
          } else if (prop === 'value') {
            return this.min;
          }
          return METER_INITAL_VALUES[prop];
        }
      };
    }

    each(meterAttrs, function(prop) {
      var props = {};
      if (!support.syncAttribute) {
        props.set = setter(prop);
      }
      props.get = getter(prop);
      Object.defineProperty(prototype, prop, props);
    });
  }

  function setValue(meter) {
    meter = meter || this;
    if (!isMeter(meter)) {
      return;
    }
    // div should be replaced
    var valueEl = meter.getElementsByTagName('div')[2];
    if (!valueEl) {
      return polyfillShadow(meter);
    }

    var values = {};
    each(meterAttrs, function(attr) {
      if (support.unknownElement) {
        values[attr] = +meter[attr];
      } else {
        if (hasAttribute.call(meter, attr)) {
          values[attr] = +meter.getAttribute(attr);
        } else {
          values[attr] = METER_INITAL_VALUES[attr];
        }
      }
    });

    if (support.syncAttribute) {
      fixValue.call(values, ['max', 'low', 'high', 'value', 'optimum']);
    }

    var min = values.min;
    var max = values.max;
    var low = values.low;
    var high = values.high;
    var optimum = values.optimum;
    var value = values.value;

    var valueClass = METER_VALUE_CLASSES.optimum;
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
        valueClass = METER_VALUE_CLASSES.suboptimum;
      }
    } else if (low === high) {
      if (
        (low <= optimum && value < low) ||
        (high > optimum && value > high)
      ) {
        valueClass = METER_VALUE_CLASSES.subsuboptimum;
      }

      // firefox show diffently from chrome when
      // value === high
    } else if (optimum < low) {
      if (value > low && value <= high) {
        valueClass = METER_VALUE_CLASSES.suboptimum;
      } else if (value > high) {
        valueClass = METER_VALUE_CLASSES.subsuboptimum;
      }
    } else if (optimum > high) {
      if (value >= low && value < high) {
        valueClass = METER_VALUE_CLASSES.suboptimum;
      } else if (value < low) {
        valueClass = METER_VALUE_CLASSES.subsuboptimum;
      }

      // firefox show diffently from chrome when
      // value === high
    }

    var width = min === max ? 0 : (value - min) / (max - min) * 100 + '%';

    valueEl.className = valueClass;
    valueEl.style.width = width;
  }

  var isObservered = false;
  function observer() {
    if (isObservered) {
      return;
    }
    if (MutationObserver) {
      var observer = new MutationObserver(function(mutations) {
        for (var i = 0, len = mutations.length; i < len; i++) {
          var type = mutations[i].type;
          var target = mutations[i].target;
          if (type === 'attributes') {
            setValue(target);
          } else {
            polyfillShadow(target);
          }
        }
      });
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: meterAttrs,
        subtree: true,
        childList: true
      });
    } else {
      on(documentElement, 'DOMNodeInserted', function(e) {
        polyfillShadow(e.target);
      });

      on(documentElement, 'DOMAttrModified', function(e) {
        setValue(e.target);
      });

      // each(document.getElementsByTagName('meter'), function(meter) {
      //   on(meter, 'propertychange', function(e) {
      //     console.log('propertychange');
      //     console.log(e);
      //   });
      // });

    }
    isObservered = true;
  }

  function polyfill() {
    if (support.unknownElement) {
      polyfillGetterSetter();
    }
    polyfillShadow();
    observer();
  }

  if (document.readyState === 'complete') {
    polyfill();
  }

  on(document, 'DOMContentLoaded', polyfill);

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
})(this, document);
