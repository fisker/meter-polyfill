(function() {
  'use strict';

  function each(obj, fn) {
    if (obj.length) {
      for (var i = 0, len = obj.length; i < len; i++) {
        if (fn(obj[i], i, obj) === true) {
          break;
        }
      }
    } else {
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          if (fn(obj[i], i, obj) === true) {
            break;
          }
        }
      }

    }
  }

  function assign(target, sources) {
    var output = target;
    each(arguments, function(source, index) {
      if (index === 0) {
        return;
      }

      each(source, function(value, key) {
        output[key] = value;
      })
    });
    return output;
  }

  function encodeHTML(s) {
    return s.replace(/</g, '&lt;');
  }

  function mkId() {
    var now = +new Date;
    return Math.floor(now + now * Math.random()).toString(16).slice(-8);
  }


  var testCase = [];

  // empty
  testCase.push({
    'name': 'empty',
    'desc': 'empty meter should be 0 width green.',
    'cases': [{}]
  });

  // value
  testCase.push({
    'name': 'value',
    'cases': [{value: .5}]
  });

  // low
  (function() {
    var cases = [];
    var prop = {low: .4};
    each([.3, .5, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'low1',
      'cases': cases
    });
  })();

  // low
  (function() {
    var cases = [];
    var prop = {low: .5};
    each([.3, .5, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'low2',
      'cases': cases
    });
  })();

  // low
  (function() {
    var cases = [];
    var prop = {low: .6};
    each([.3, .5, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'low3',
      'cases': cases
    });
  })();

  // 'high'
  (function() {
    var cases = [];
    var prop = {high: .4};
    each([.3, .5, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'high1',
      'cases': cases
    });
  })();

  // 'high'
  (function() {
    var cases = [];
    var prop = {high: .5};
    each([.3, .5, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'high2',
      'cases': cases
    });
  })();

  // 'high'
  (function() {
    var cases = [];
    var prop = {high: .6};
    each([.3, .5, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'high3',
      'cases': cases
    });
  })();

  // 'low<high'
  (function() {
    var cases = [];
    var prop = {low:.3, high: .7};
    each([.2, .3, .5, .7, .8], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'low<hig1',
      'cases': cases
    });
  })();

  // 'low<high'
  (function() {
    var cases = [];
    var prop = {low:.5, high: .7};
    each([.2, .5, .7, .8], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'low<hig2',
      'cases': cases
    });
  })();

  // 'low<high'
  (function() {
    var cases = [];
    var prop = {low:.3, high: .5};
    each([.2, 0.3, .5, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'low<hig3',
      'cases': cases
    });
  })();

  // 'low=high'
  (function() {
    var cases = [];
    var prop = {low:.4, high: .4};
    each([.3, .4, .5, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'low=high1',
      'cases': cases
    });
  })();

  // 'low=high'
  (function() {
    var cases = [];
    var prop = {low:.5, high: .5};
    each([.3, .5, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'low=high2',
      'cases': cases
    });
  })();

  // 'low=high'
  (function() {
    var cases = [];
    var prop = {low:.6, high: .6};
    each([.3, .5, .6, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'low=high3',
      'desc': 'if low>=high && value=low, firefox and chrome show different style.',
      'cases': cases
    });
  })();

  // 'low>high'
  (function() {
    var cases = [];
    var prop = {low:.7, high: .3};
    each([.2, .3, .5, .7, .8], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'low>high',
      'desc': 'if low>=high && value=low, firefox and chrome show different style.',
      'cases': cases
    });
  })();

  // optimum
  (function() {
    var cases = [];
    var prop = {optimum: .5};
    each([.3, .5, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'optimum',
      'cases': cases
    });
  })();

  // optimum<low
  (function() {
    var cases = [];
    var prop = {optimum: .2, low: .3, high: 0.7};
    each([.1, .2, .3, .5, .7, .8], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'optimum<low',
      'cases': cases
    });
  })();

  // optimum=low
  (function() {
    var cases = [];
    var prop = {optimum: .3, low: .3, high: 0.7};
    each([.2, .3, .5, .7, .8], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'optimum=low',
      'cases': cases
    });
  })();

  // low<optimum<high
  (function() {
    var cases = [];
    var prop = {optimum: .5, low: .3, high: 0.7};
    each([.2, .3, .5, .6, .7, .8], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'low<optimum<high',
      'cases': cases
    });
  })();

  // optimum=high
  (function() {
    var cases = [];
    var prop = {optimum: .7, low: .3, high: 0.7};
    each([0.2, .3, .5, .6, .7, .8], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'optimum=high',
      'cases': cases
    });
  })();

  // optimum>high
  (function() {
    var cases = [];
    var prop = {optimum: .8, low: .3, high: 0.7};
    each([0.2, .3, .5, .7, .8, .9], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'optimum>high',
      'desc': 'if optimum>high && value=high, firefox and chrome show different style.',
      'cases': cases
    });
  })();


  var METER_INITAL_VALUES = {
    min: 0,
    max: 1,
    low: 0,
    high: 1,
    value: 0,
    optimum: 0.5
  };
  var meter = document.createElement('meter');
  function show() {
    var s = [];
    'min,max,low,high,value,optinum'.split(',').forEach(function(key) {s.push(key +'='+ meter[key]);});
    console.log(s.join(' ,'))
  }

  var METER_VALUE_CLASSES = {
    inner: 'meter-inner-element',
    bar: 'meter-bar',
    optimum: 'meter-optimum-value',
    suboptimum: 'meter-suboptimum-value',
    subsuboptimum: 'meter-even-less-good-value'
  }

  function calcClass(value, low, high, min, max, optimum) {

    // fix
    if (max < min) {
      max = min;
    }
    if (low < min) {
      low = min;
    }
    if (high > max) {
      high = max;
    }
    if (high < low) {
      high = low;
    }

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
      ){
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
      // high > optimum && value === high
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

    return valueClass;
  }

  // render
  function render() {
    var nav = [];
    var html = [];

    each(testCase, function(category) {
      var caseName = encodeHTML(category.name);
      var caseId = 'case-' + mkId();
      var caseDesc = category.desc;
      var casesHTML = [];
      each(category.cases, function(test, index) {
        var props = [];
        each(test, function(value, key) {
          props.push(key + '="' + value + '"');
        });
        var attrs = props.length ? ' ' + props.join(' ') : '';
        var params = props.join(' ');
        var meterId = 'meter-' + mkId();

        var value = 'value' in test ? test.value : METER_INITAL_VALUES.value;
        var max = 'max' in test ? test.max : METER_INITAL_VALUES.max;
        var min = 'min' in test ? test.min : METER_INITAL_VALUES.min;
        var low = 'low' in test ? test.low : METER_INITAL_VALUES.low;
        var high = 'high' in test ? test.high : METER_INITAL_VALUES.high;
        var optimum = 'optimum' in test ? test.optimum : METER_INITAL_VALUES.optimum;
        var valueClass = calcClass(value, low, high, min, max, optimum);

        casesHTML.push([
          '<dt>' + params + '</dt>',
          '<dd>',
            '<meter id="' + meterId + '"' + attrs + '></meter>',
            '<div class="color">color: <span class="' + valueClass + '"></span></div>',
          '</dd>'
        ].join(''));
      });
      nav.push('<a href="#' + caseId + '">' + caseName + '</a>');
      html.push([
        '<div class="page" id="' + caseId + '">',
        '<h1>' + caseName + '</h1>',
        caseDesc ? '<div class="desc">' + caseDesc + '</div>' : '',
        '<dl>' + casesHTML.join('') + '</dl>',
        '</div>'
      ].join(''));
    });

    document.getElementById('js-container').innerHTML = [
      '<div class="nav">' + nav.join('') + '</div>',
      '<div class="desc tip">',
        supportMeter ?
        'your browser support native meter.' :
        'your browser NOT support native meter.',
      '</div>',
      html.join('')
      ].join('');
  }

  function testResult() {
    var meters = document.getElementsByTagName('meter');
    var failedCounter = 0;
    each(meters, function(meter) {
      var passed = false;
      var colorSpan = meter.nextSibling.getElementsByTagName('span')[0];

      try {
        var pollyfillColor = meter.getElementsByTagName('div')[2].className;
        var resultColor = colorSpan.className;
        if (pollyfillColor === resultColor) {
          passed = true;
        }
      } catch(_) {}

      try {
        var firefoxMeterbarColor = getComputedStyle(meter, '::-moz-meter-bar').backgroundImage;
        var resultColor = getComputedStyle(colorSpan).backgroundImage;
        if (firefoxMeterbarColor === resultColor) {
          passed = true;
        }
      } catch(_) {}

      var result = document.createElement('div');
      result.className = 'result';
      result.innerHTML = passed ? '<span style="color:green">√ passed</span>' : '<span style="color:red">× failed</span>';

      if (!passed) {
        failedCounter ++;
      }

      meter.parentNode.appendChild(result);
    });

    alert(failedCounter + ' test case failed.')
  }


  window.test = {
    inertMeterByHTML: function(){
      var container = document.getElementById('js-test-container');
      container.innerHTML = '<meter value="0.5"></meter>';
      var success = false;
      try {
        var meter = container.getElementsByTagName('meter')[0];
        if (meter.max === 1) {
          if (!supportMeter) {
            success = meter.hasAttribute('_polyfill');
          } else {
            success = true;
          }
        }
      } catch(_) {}
      alert(success? 'success' : 'failed')
    }
  };



  window.onload = function() {
    render();
    (function check() {
      var meters = document.getElementsByTagName('meter');
      var done = true;
      each(meters, function(meter) {
        if (meter.max !== 1 || (!supportMeter && !meter.hasAttribute('_polyfill'))) {
          window.setTimeout(check, 500);
          done = false;
          return true;
        }
      });
      if (done) {
        testResult();
      }
    })();
  };
})();
