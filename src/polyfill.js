(function (window, document) {
  'use strict';

  var meterElement = document.createElement('meter');

  // native support
  if (meterElement.max === 1) {
    return;
  }

  var documentElement = document.documentElement;
  // there is no moz/ms/o vendor prefix
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

  var support = {
    MutationObserver: typeof window.MutationObserver !== 'undefined',
    addEventListener: 'addEventListener' in document,
    attachEvent: 'attachEvent' in document
  };

  var prototype = meterElement.constructor.prototype;
  var setAttribute = prototype.setAttribute;
  var removeAttribute = prototype.removeAttr;
  var METER_VALUE_CLASSES = {
    inner: 'meter-inner-element',
    bar: 'meter-bar',
    optimum: 'meter-optimum-value',
    suboptimum: 'meter-suboptimum-value',
    subsuboptimum: 'meter-even-less-good-value'
  }

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
    value: 0,
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

  function isMeter(el) {
    return el && el.tagName.toUpperCase() === 'METER'
  }

  function polyfillShadow(context) {
    var meters = [];
    if (isMeter(context)) {
      meters = [context];
    } else {
      meters = (context || documentElement).getElementsByTagName('meter');
    }

    each(meters, function(meter) {
      if (isMeter(meter) && !meter.hasAttribute('_polyfill')) {
        meter.innerHTML = METER_SHADOW_HTML;
        meter.setAttribute('_polyfill', '');
        // fix
        if (meter.max < meter.min) {
          meter.max = meter.min;
        }
        if (meter.low < meter.min) {
          meter.low = meter.min;
        }
        if (meter.high > meter.max) {
          meter.high = meter.max;
        }
        if (meter.high < meter.low) {
          meter.high = meter.low;
        }
        setValue(meter);
      }
    });
  }

  function polyfillAttr() {
    each(meterAttrs, function(prop) {
      var initalValue = METER_INITAL_VALUES[prop];
      Object.defineProperty(prototype, prop, {
        set: function(value) {
          if (isMeter(this)) {
            return setAttribute.call(this, prop, value);
          }
        },
        get: function() {
          if (isMeter(this)) {
            if (this.hasAttribute(prop)) {
              return +this.getAttribute(prop);
            } else if (prop === 'low') {
              return this.min;
            } else if (prop === 'high') {
              return this.max;
            } else if (prop === 'optimum') {
              return (this.max - this.min) / 2 + this.min;
            } else {
              return initalValue;
            }
          }
        }
      });
    });

    Object.defineProperty(prototype, 'setAttribute', {
      value: function(name, value) {
        if (!isMeter(this)) {
          setAttribute.call(this, name, value);
        }
        name = name.toLowerCase();
        switch(name) {
          case 'min':
            setAttribute.call(this, name, value);
            if (this.max < value) {
              setAttribute.call(this, 'max', value);
            }
            break;
          case 'max':
            setAttribute.call(this, name, value);
            if (this.min > value) {
              setAttribute.call(this, 'min', value);
            }
            break;
          case 'low':
            value = Math.min(Math.max(value, this.min), this.max);
            setAttribute.call(this, name, value);
            if (this.high < value) {
              setAttribute.call(this, 'high', value);
            }
            break;
          case 'high':
            value = Math.min(Math.max(value, this.min), this.max);
            setAttribute.call(this, name, value);
            if (this.low > value) {
              setAttribute.call(this, 'low', value);
            }
            break;
          case 'optimum':
            value = Math.min(Math.max(value, this.min), this.max);
            setAttribute.call(this, name, value);
            break;
          default:
            break;
        }

        if (name === 'min' || name === 'max') {
          if (this.low < this.min || this.low > this.max) {
            setAttribute.call(this, 'low', Math.min(Math.max(this.min, this.low), this.max));
          }
          if (this.high < this.min || this.high > this.max) {
            setAttribute.call(this, 'high', Math.min(Math.max(this.min, this.low), this.max));
          }
          if (this.hasAttribute('optinum') && (this.optinum < this.min || this.optinum > this.max)) {
            this.removeAttribute('optinum');
          }
        }

        setValue(this);
        return setAttribute.call(this, name, value);
      }
    });

    Object.defineProperty(prototype, 'removeAttribute', {
      value: function(name) {
        if (isMeter(this)) {
          setValue(this);
        }
        return removeAttribute.call(this, name);
      }
    });
  }

  function setValue(meter) {
    meter = meter || this;
    // div should be replaced
    var valueEl = meter.getElementsByTagName('div')[2];
    if (!valueEl) {
      throw ('meter not polyfilled');
    }

    var value = meter.value;
    var max = meter.max;
    var min = meter.min;
    var low = meter.low;
    var high = meter.high;

    var optimum = meter.optimum;

    var valueClass = METER_VALUE_CLASSES.optimum;
    if (
      low === high ||
      high === max ||
      low === min ||
      (optimum >= low && optimum <= high)
    ) {
      if (
        (low <= optimum && value < low) ||
        (low > optimum && value > low) ||
        (high < optimum && value < high) ||
        (high >= optimum && value > high)
      ){
        valueClass = METER_VALUE_CLASSES.suboptimum;
      }
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
    }

    var width = min === max ? 0 : (value - min) / (max - min) * 100 + '%';
    valueEl.className = valueClass;
    valueEl.style.width = width;
  }

  function observer() {
    if (MutationObserver) {
      var observer = new MutationObserver(function(mutations) {
        for (var i = 0, len = mutations.length; i < len; i ++) {
          var type = mutations[i].type;
          var target = mutations[i].target
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

      on(documentElement, 'propertychange', function(e) {
        console.log('propertychange');
        console.log(e);
      });
    }
  }

  function polyfill() {
    polyfillAttr();
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
        polyfill();
      } catch (_) {
        window.setTimeout(doScroll, 50);
      }
    })();
  }
})(this, document);
