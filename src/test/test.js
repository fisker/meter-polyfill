(function() {
  'use strict';

  var test = {};
  var isFirefox = window.navigator.userAgent.indexOf('Firefox') > -1;

  var body = document.body || document.getElementsByTagName('body')[0];

  function HTMLEncode(s) {
    return ('' + s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function each(obj, fn) {
    if (obj.length > 1) {
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

  if (!window.getComputedStyle) {
    getComputedStyle = function(el) {
      return el.currentStyle;
    }
  }

  function hasAttribute(el, name) {
    if (el.hasAttribute) {
      return el.hasAttribute(name);
    } else {
      return el.getAttribute(name) !== null;
    }
  }

  function setTbodyInnerHTML(tbody, html) {
    try {
      tbody.innerHTML = html;
    } catch(_) {
      // ie 9-
      var div = document.createElement('div');
      div.innerHTML = '<table><tbody>' + html + '</tbody>tbody></table>';
      var newTbody = div.getElementsByTagName('tbody')[0];
      tbody.parentNode.replaceChild(newTbody, tbody);
    }
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
    cases.push({min: -1});
    cases.push({min: -2, max: -1});

    testCase.push({
      'name': 'min1',
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
      'name': 'min2',
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
      'name': 'min3',
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
      'name': 'min4',
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
      'name': 'min5',
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

  function buildMeter(tag, options) {
    var attrs = [];
    each(options, function(value, key) {
      attrs.push(key + '="' + value + '"');
    });
    return '<' + tag + ' ' + attrs.join(' ') + '>' + '</' + tag + '>';
  }

  var TO_STRING = '' + Function.prototype.toString;
  function getNativeFunctionSource(funcName) {
    return TO_STRING.replace('toString', funcName);
  }

  function showPropTest() {
    var propTest = [
      [
        'document.createElement',
        function () {
          return document.createElement.toString();
        },
        getNativeFunctionSource('createElement')
      ],
      [
        'document.createElement.toString',
        function () {
          return document.createElement.toString.toString();
        },
        getNativeFunctionSource('toString')
      ],
      [
        'document.createElement.toString.toString',
        function () {
          return document.createElement.toString.toString.toString();
        },
        getNativeFunctionSource('toString')
      ],
      [
        METER_INTERFACE,
        function () {
          return window[METER_INTERFACE].toString();
        },
        getNativeFunctionSource(METER_INTERFACE)
      ],
      [
        'new ' + METER_INTERFACE + '()',
        function () {
          try {
            return new window[METER_INTERFACE]();
          } catch (e) {
            return e.message;
          }
        },
        isFirefox ? 'Illegal constructor.' : 'Illegal constructor'
      ],
      [
        METER_INTERFACE + '.prototype.constructor',
        function () {
          return window[METER_INTERFACE].prototype.constructor;
        },
        window[METER_INTERFACE]
      ],
      [
        'document.createElement(\'' + METER_TAG_NAME + '\').constructor',
        function () {
          return document.createElement(METER_TAG_NAME).constructor;
        },
        window[METER_INTERFACE]
      ],
      [
        'meter.max = "010"',
        function () {
          var meter = document.createElement(METER_TAG_NAME);
          meter.max = '010';
          return parseFloat(meter.max);
        },
        10
      ],
      [
        'meter.max = 010',
        function () {
          var meter = document.createElement(METER_TAG_NAME);
          meter.max = 8; //010;
          return parseFloat(meter.max);
        },
        8
      ],
      [
        'meter.max = "1e2"',
        function () {
          var meter = document.createElement(METER_TAG_NAME);
          meter.max = '1e2';
          return parseFloat(meter.max);
        },
        100
      ],
      [
        'meter.max = 1e2',
        function () {
          var meter = document.createElement(METER_TAG_NAME);
          meter.max = 1e2;
          return parseFloat(meter.max);
        },
        100
      ],
      [
        'meter.max = null',
        function () {
          var meter = document.createElement(METER_TAG_NAME);
          meter.max = null;
          return parseFloat(meter.max);
        },
        0
      ],
      [
        'meter.max = "fisker"',
        function () {
          var meter = document.createElement(METER_TAG_NAME);
          try {
            meter.max = 'fisker';
          } catch(e) {
            return e.message;
          }
        },
        isFirefox ?
          'Value being assigned to ' + METER_INTERFACE + '.max is not a finite floating-point value.':
          'Failed to set the \'max\' property on \'' + METER_INTERFACE + '\': The provided double value is non-finite.'
      ],
      [
        'meter.setAttribute("max", "010")',
        function () {
          var meter = document.createElement(METER_TAG_NAME);
          meter.setAttribute('max', '010');
          return parseFloat(meter.max);
        },
        10
      ],
      [
        'meter.setAttribute("max", "1e2")',
        function () {
          var meter = document.createElement(METER_TAG_NAME);
          meter.setAttribute('max', '1e2');
          return parseFloat(meter.max);
        },
        100
      ],
      [
        'meter.setAttribute("max", "null")',
        function () {
          var meter = document.createElement(METER_TAG_NAME);
          meter.setAttribute('max', 'null');
          return parseFloat(meter.max);
        },
        1
      ],
      [
        'meter.setAttribute("max", null)',
        function () {
          var meter = document.createElement(METER_TAG_NAME);
          meter.setAttribute('max', null);
          return parseFloat(meter.max);
        },
        1
      ],
      [
        'meter.setAttribute("max", "fisker")',
        function () {
          var meter = document.createElement(METER_TAG_NAME);
          meter.setAttribute('max', 'fisker');
          return parseFloat(meter.max);
        },
        1
      ],
      [
        'meter.value = 2;meter.value;meter.max=10;meter.value;',
        function () {
          var values = [];
          var meter = document.createElement(METER_TAG_NAME);
          meter.value = 2;
          values.push(meter.value);
          meter.max = 10;
          values.push(meter.value);
          return values;
        },
        [1, 2]
      ],
      [
        'meter.value = -1;meter.value;meter.min=-10;meter.value;',
        function () {
          var values = [];
          var meter = document.createElement(METER_TAG_NAME);
          meter.value = -1;
          values.push(meter.value);
          meter.min = -10;
          values.push(meter.value);
          return values;
        },
        [0, -1]
      ],
      [
        'meter.value = 1;meter.value;meter.removeAttribute("value");meter.value;',
        function () {
          var values = [];
          var meter = document.createElement(METER_TAG_NAME);
          meter.value = 1;
          values.push(meter.value);
          meter.removeAttribute('value');
          values.push(meter.value);
          return values;
        },
        [1, 0]
      ],
      [
        'div.innerHTML = "<meter></meter>"',
        function () {
          var div = document.createElement('div');
          body.appendChild(div);
          div.innerHTML = '<' + METER_TAG_NAME + '></' + METER_TAG_NAME + '>';
          var meter = div.getElementsByTagName(METER_TAG_NAME)[0];
          var max = parseFloat(meter.max);
          body.removeChild(div);
          return max === 1;
        },
        true
      ],
      [
        'meter.cloneNode().max',
        function () {
          var meter = document.createElement(METER_TAG_NAME).cloneNode();
          return parseFloat(meter.max);
        },
        1
      ],
      [
        'meter.cloneNode(true).max',
        function () {
          var meter = document.createElement(METER_TAG_NAME).cloneNode(true);
          return parseFloat(meter.max);
        },
        1
      ],
    ];

    var html = [];
    each(propTest, function(test) {
      if (!test) {
        return;
      }
      var result = test[1]();
      var assertResult = test[2];
      if (Object.prototype.toString.call(assertResult) === '[object Array]') {
        result = '[' + result.join(',') + ']';
        assertResult = '[' + assertResult.join(',') + ']';
      }
      var resultMsg = result === assertResult ?
        '<span class="result-pass">√</span>':
        '<span class="result-failed">×</span>';
      html.push([
        '<tr>',
          '<td>' + HTMLEncode(test[0]) + '</td>',
          '<td>',
            HTMLEncode(result),
          '</td>',
          '<td>',
            resultMsg,
          '</td>',
        '</tr>'
      ].join(''));
    });
    setTbodyInnerHTML(document.getElementById('js-test-prototype-container'), html.join(''));
  }
  test.showPropTest = showPropTest;

  function showTestCases() {
    var html = [];

    var index = 1;
    each(testCase, function(category) {
      each(category.cases, function(test) {
        var level = meterPolyfill.calc(test);
        html.push([
          '<tr>',
            '<td>' + (index++) + '</td>',
            '<td>' + buildMeter('meter', test) + '</td>',
            '<td>' + buildMeter(METER_TAG_NAME, test) + '</td>',
            '<td><span class="color-indicator ' + level.className + '"></span></td>',
            '<td>',
              '<span class="percentage-indicator">',
                '<i style="width:' + level.percentage +'%"></i>',
                level.percentage.toFixed(2) + '%',
              '</span>',
            '</td>',
          '</tr>'
        ].join(''));
      });
    });
    setTbodyInnerHTML(document.getElementById('js-test-cases-container'), html.join(''));
  }
  test.showTestCases = showTestCases;
  window.test = test;
})();
