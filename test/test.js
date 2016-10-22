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
      'desc': 'if low>=high && value=low, firefox and chrome show different style.',
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
      'desc': 'if optimum<low && value=low, firefox and chrome show different style.',
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


  // min
  (function() {
    var cases = [];
    var prop = {min: .4};
    each([.4, .5, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'min1',
      'cases': cases
    });
  })();

  // min
  (function() {
    var cases = [];
    var prop = {min: .5};
    each([.4, .5, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'min2',
      'cases': cases
    });
  })();

  // min
  (function() {
    var cases = [];
    var prop = {min: 1};
    each([.4, .5, .7, 1], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'min3',
      'cases': cases
    });
  })();

  // min
  (function() {
    var cases = [];
    var prop = {min: 1.1};
    each([.4, .5, .7, 1, 1.1], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'min4',
      'cases': cases
    });
  })();

  // max
  (function() {
    var cases = [];
    var prop = {max: .6};
    each([.5, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'max1',
      'cases': cases
    });
  })();

  // max
  (function() {
    var cases = [];
    var prop = {max: .5};
    each([.4, .5, .7], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'max2',
      'cases': cases
    });
  })();

  // max
  (function() {
    var cases = [];
    var prop = {max: .4};
    each([.1, .4, .5], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'max3',
      'cases': cases
    });
  })();

  // max
  (function() {
    var cases = [];
    var prop = {max: 0};
    each([-1.1, 0, .1, .5], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'max4',
      'cases': cases
    });
  })();

  // max
  (function() {
    var cases = [];
    var prop = {max: -1};
    each([-1.1, 0, .5], function(value) {
      cases.push(assign({}, prop, {
        value: value
      }));
    });

    testCase.push({
      'name': 'max5',
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
  };

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
    if (value < min) {
      value = min;
    }
    if (value > max) {
      value = max;
    }

    if (optimum > max || optimum < min) {
      optimum = min + (max - high) / 2;
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
        caseDesc ? '<div class="desc">' + encodeHTML(caseDesc) + '</div>' : '',
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
        var resultStyle = colorSpan.className;
        var resultColor = getComputedStyle(colorSpan).backgroundImage;
        var firefoxMeterbarColor = getComputedStyle(meter, '::-moz-meter-bar').backgroundImage;
        var firefoxMeterbarClass = '';
        if(firefoxMeterbarColor.indexOf('rgb(170, 221, 119)') > -1 ){
          firefoxMeterbarClass = METER_VALUE_CLASSES.optimum
        } else if(firefoxMeterbarColor.indexOf('rgb(255, 238, 119)') > -1 ){
          firefoxMeterbarClass = METER_VALUE_CLASSES.suboptimum
        } else if(firefoxMeterbarColor.indexOf('rgb(255, 119, 119)') > -1 ){
          firefoxMeterbarClass = METER_VALUE_CLASSES.subsuboptimum
        }

        if (firefoxMeterbarColor === resultColor || firefoxMeterbarClass === resultStyle) {
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

    if (failedCounter) {
      alert(failedCounter + ' of ' + meters.length + ' test case failed.');
    } else {
      alert('all test passed');
    }
  }


  function isPolyfilledMeter(meter) {
    if (!supportMeter) {
      return meter.max === 1 && meter.hasAttribute('_polyfill');
    } else {
      return meter.max === 1;
    }
  }

  window.test = {
    inertMeterByHTML: function(){
      var container = document.getElementById('js-test-container');
      var id = 'meter-' + mkId();
      container.innerHTML += '<meter id="' + id + '" value="0.5"></meter>';
      var meter = document.getElementById(id);
      if (isPolyfilledMeter(meter)) {
        alert('success');
      } else {
        alert('failed');
      }
    },
    inertMeterByCreateElement: function(){
      var container = document.getElementById('js-test-container');
      var id = 'meter-' + mkId();
      var meter = document.createElement('meter');
      meter.value = 0.5;
      meter.id = id;
      container.appendChild(meter);
      if (isPolyfilledMeter(meter)) {
        alert('success');
      } else {
        alert('failed');
      }
    },
    changeAttr: function() {
      var container = document.getElementById('js-test-container');
      var id = 'meter-' + mkId();
      var meter = document.createElement('meter');
      meter.value = 0.2;
      meter.id = id;
      container.appendChild(meter);
      meter.setAttribute('value', .8);
      if (isPolyfilledMeter(meter) && meter.value === .8) {
        alert('success');
      } else {
        alert('failed');
      }
    },
    changeValue: function() {
      var container = document.getElementById('js-test-container');
      var id = 'meter-' + mkId();
      var meter = document.createElement('meter');
      meter.value = 0.2;
      meter.id = id;
      container.appendChild(meter);
      meter.value = .8;
      if (isPolyfilledMeter(meter) && meter.value === .8) {
        alert('success');
      } else {
        alert('failed');
      }
    }
  };



  window.onload = function() {
    render();
    (function check() {
      var meters = document.getElementsByTagName('meter');
      var done = true;
      each(meters, function(meter) {
        if ((typeof meter.max !== 'number') || (!supportMeter && !meter.hasAttribute('_polyfill'))) {
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
