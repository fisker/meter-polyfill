(function() {
  'use strict';

  var METER_TAG = 'FAKEMETER';
  var HTML_METER_ELEMENT_CONSTRICTOR_NAME = [
    'HTML',
    METER_TAG.replace(/^(.)(.*)$/,function(_, $1, $2){
        return $1.toUpperCase() + $2.toLowerCase()
    }),
    'Element'].join('');
  var supportMeter = document.createElement('meter').max === 1;
  var test = {};

  var METER_INITAL_VALUES = meterPolyfill.INITAL_VALUES;
  var METER_VALUE_CLASSES = meterPolyfill.CLASSES;
  var LEVEL_SUBOPTIMUN = meterPolyfill.LEVEL_SUBOPTIMUN;
  var LEVEL_OPTIMUN = meterPolyfill.LEVEL_OPTIMUN;
  var LEVEL_SUBSUBOPTIMUN = meterPolyfill.LEVEL_SUBSUBOPTIMUN;

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

  function buildMeter(tag, options) {
    var attrs = [];
    each(options, function(value, key) {
      attrs.push(key + '="' + value + '"');
    });
    return '<' + tag + ' ' + attrs.join(' ') + '>' + '</' + tag + '>';
  }

  function showPropTest() {
    var propTest = [
      [
        'document.createElement',
        function () {
          return '' + document.createElement;
        },
        'function createElement() { [native code] }'
      ],
      [
        'document.createElement.toString',
        function () {
          return '' + document.createElement.toString;
        },
        window.toString.toString.toString()
      ],
      [
        'document.createElement.toString.toString',
        function () {
          return '' + document.createElement.toString.toString;
        },
        window.toString.toString.toString()
      ],
      [
        HTML_METER_ELEMENT_CONSTRICTOR_NAME,
        function () {
          return '' + window[HTML_METER_ELEMENT_CONSTRICTOR_NAME];
        },
        'function HTMLFakemeterElement() { [native code] }'
      ],
      [
        'new ' + HTML_METER_ELEMENT_CONSTRICTOR_NAME + '()',
        function () {
          try {
            return new window[HTML_METER_ELEMENT_CONSTRICTOR_NAME]();
          } catch (e) {
            return e.message;
          }
        },
        'Illegal constructor'
      ],
      [
        HTML_METER_ELEMENT_CONSTRICTOR_NAME + '.constructor',
        function () {
          return window[HTML_METER_ELEMENT_CONSTRICTOR_NAME].constructor;
        },
        window[HTML_METER_ELEMENT_CONSTRICTOR_NAME]
      ],
      [
        HTML_METER_ELEMENT_CONSTRICTOR_NAME + '.prototype.constructor',
        function () {
          return window[HTML_METER_ELEMENT_CONSTRICTOR_NAME].prototype.constructor;
        },
        window[HTML_METER_ELEMENT_CONSTRICTOR_NAME]
      ],
    ];

    var html = [];
    each(propTest, function(test) {
      var result = test[1]();
      var resultMsg = result === test[2] ?
        '<span class="result-pass">√</span>':
        '<span class="result-failed">×</span>';
      html.push([
        '<tr>',
          '<td>' + test[0] + '</td>',
          '<td>',
            result,
          '</td>',
          '<td>',
            resultMsg,
          '</td>',
        '</tr>'
      ].join(''));
    });
    document.getElementById('js-test-prototype-container').innerHTML = html.join('');
  }
  test.showPropTest = showPropTest;

  function showTestCases() {
    var html = [];

    var index = 1;
    each(testCase, function(category) {
      each(category.cases, function(test) {
        var props = meterPolyfill.fix(assign({}, test));
        var level = meterPolyfill.calc(props);
        html.push([
          '<tr>',
            '<td>' + (index++) + '</td>',
            '<td>' + buildMeter('meter', test) + '</td>',
            '<td>' + buildMeter(METER_TAG, test) + '</td>',
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
    document.getElementById('js-test-cases-container').innerHTML = html.join('');
  }
  test.showTestCases = showTestCases;


  // // render
  // function render() {
  //   var nav = [];
  //   var html = [];

  //   each(testCase, function(category) {
  //     var caseName = encodeHTML(category.name);
  //     var caseId = 'case-' + mkId();
  //     var caseDesc = category.desc;
  //     var casesHTML = [];
  //     each(category.cases, function(test, index) {
  //       var props = [];
  //       each(test, function(value, key) {
  //         props.push(key + '="' + value + '"');
  //       });
  //       var attrs = props.length ? ' ' + props.join(' ') : '';
  //       var params = props.join(' ');
  //       var meterId = 'meter-' + mkId();

  //       // console.log(caseName);
  //       var values = assign({}, METER_INITAL_VALUES, test);
  //       // console.log(values);
  //       values = meterPolyfill.fix(values);
  //       // console.log(values);
  //       var level = meterPolyfill.calc(values);
  //       // console.log(meterPolyfill.calc(values));

  //       casesHTML.push([
  //         '<dt>' + params + '</dt>',
  //         '<dd>',
  //           '<' + METER_TAG + ' id="' + meterId + '"' + attrs + '></' + METER_TAG + '>',
  //           '<div class="color">color: <span class="' + METER_VALUE_CLASSES[level.level] + '"></span></div>',
  //           '<div class="percentage">percentage: <span>' + level.percentage.toFixed(2) + '</span></div>',
  //         '</dd>'
  //       ].join(''));
  //     });
  //     nav.push('<a href="#' + caseId + '">' + caseName + '</a>');
  //     html.push([
  //       '<div class="page" id="' + caseId + '">',
  //       '<h1>' + caseName + '</h1>',
  //       caseDesc ? '<div class="desc">' + encodeHTML(caseDesc) + '</div>' : '',
  //       '<dl>' + casesHTML.join('') + '</dl>',
  //       '</div>'
  //     ].join(''));
  //   });

  //   document.getElementById('js-container').innerHTML = [
  //     '<div class="nav">' + nav.join('') + '</div>',
  //     '<div class="desc tip">',
  //       supportMeter ?
  //       'your browser support native meter.' :
  //       'your browser NOT support native meter.',
  //     '</div>',
  //     html.join('')
  //     ].join('');
  // }

  // function testResult() {
  //   var testMeter = document.createElement(METER_TAG);
  //   try {
  //     testMeter.value = .5;
  //   } catch(_) {}
  //   var isFirfoxMeter = (testMeter, '::-moz-meter-bar').width === '50%';

  //   var meters = document.getElementsByTagName(METER_TAG);
  //   var failedCounter = 0;
  //   each(meters, function(meter) {

  //     var resultHTML = [];
  //     var colorPassed;
  //     var percentagePassed;
  //     var colorSpan = meter.nextSibling.getElementsByTagName('span')[0];
  //     var percentageSpan = meter.nextSibling.nextSibling.getElementsByTagName('span')[0];



  //     var resultColorLevel = (function() {
  //       var className = colorSpan.className;
  //       var resultColorLevel;
  //       each(METER_VALUE_CLASSES, function(style, key) {
  //         if (style === className){
  //           resultColorLevel = key;
  //           return true;
  //         }
  //       });
  //       return +resultColorLevel;
  //     })();
  //     var resultPercent = + percentageSpan.innerHTML;

  //     var meterColorLevel = (function() {
  //       // if (isFirfoxMeter) {
  //         try {
  //           var firefoxBg = getComputedStyle(meter, '::-moz-meter-bar').backgroundImage;
  //           if(firefoxBg.indexOf('rgb(170, 221, 119)') > -1 ){
  //             return LEVEL_OPTIMUN;
  //           } else if(firefoxBg.indexOf('rgb(255, 238, 119)') > -1 ){
  //             return LEVEL_SUBOPTIMUN;
  //           } else if(firefoxBg.indexOf('rgb(255, 119, 119)') > -1 ){
  //             return LEVEL_SUBSUBOPTIMUN;
  //           }
  //         } catch(_) {}
  //       // } else {
  //         try {
  //           var colorLevel;
  //           var pollyfillColor = meter.getElementsByTagName('div')[2].className;
  //           each(METER_VALUE_CLASSES, function(style, key) {
  //             if (style === pollyfillColor){
  //               colorLevel = key;
  //               return true;
  //             }
  //           });
  //           return +colorLevel;
  //         } catch(_) {}
  //       // }
  //     })();


  //     var meterPercent = (function() {
  //       // if (isFirfoxMeter) {
  //       // } else {
  //         try {
  //           var pollyfillPercent = meter.getElementsByTagName('div')[2].style.width;
  //           return +(pollyfillPercent + '').replace('%', '');
  //         } catch(_) {}
  //       // }
  //         try {
  //           var firefoxWidth = getComputedStyle(meter, '::-moz-meter-bar').width;
  //           return +(firefoxWidth + '').replace('%', '');
  //         } catch(_) {}
  //     })();

  //     if (typeof meterColorLevel !=='undefined' && typeof resultColorLevel !=='undefined') {
  //       colorPassed = meterColorLevel === resultColorLevel;
  //       resultHTML.push('<span style="color:' + (colorPassed ? 'green' : 'red') + '">color:' + (colorPassed ? '√' : '×') + '</span>');
  //     }

  //     if (typeof meterPercent !=='undefined' && typeof resultPercent !=='undefined') {
  //       percentagePassed = Math.abs(meterPercent - resultPercent) < 0.011;
  //       resultHTML.push('<span style="color:' + (percentagePassed ? 'green' : 'red') + '">percentage:' + (percentagePassed ? '√ ' : '× ') + '</span>');
  //     }

  //     var result = document.createElement('div');
  //     result.className = 'result';
  //     result.innerHTML = resultHTML.length ? resultHTML.join(', ') : '<span style="color:gray">? unknown</span>';

  //     if (colorPassed === false || percentagePassed === false) {
  //       failedCounter ++;
  //     }

  //     meter.parentNode.appendChild(result);
  //     if (colorPassed === true && percentagePassed === true) {
  //       meter.parentNode.className = 'passed';
  //     }
  //   });

  //   if (failedCounter) {
  //     alert(failedCounter + ' of ' + meters.length + ' test case failed.');
  //   }
  // }


  // function isPolyfilledMeter(meter) {
  //   if (!supportMeter) {
  //     return meter.max === 1 && hasAttribute(meter, '_polyfill');
  //   } else {
  //     return meter.max === 1;
  //   }
  // }

  // window.test = {
  //   inertMeterByHTML: function(){
  //     var container = document.getElementById('js-test-container');
  //     var id = 'meter-' + mkId();
  //     container.innerHTML += '<' + METER_TAG + ' id="' + id + '" value="0.5"></' + METER_TAG + '>';
  //     var meter = document.getElementById(id);
  //     if (isPolyfilledMeter(meter)) {
  //       alert('success');
  //     } else {
  //       alert('failed');
  //     }
  //   },
  //   inertMeterByCreateElement: function(){
  //     var container = document.getElementById('js-test-container');
  //     var id = 'meter-' + mkId();
  //     var meter = document.createElement(METER_TAG);
  //     meter.value = 0.5;
  //     meter.id = id;
  //     container.appendChild(meter);
  //     if (isPolyfilledMeter(meter)) {
  //       alert('success');
  //     } else {
  //       alert('failed');
  //     }
  //   },
  //   changeAttr: function() {
  //     var container = document.getElementById('js-test-container');
  //     var id = 'meter-' + mkId();
  //     var meter = document.createElement(METER_TAG);
  //     meter.value = 0.2;
  //     meter.id = id;
  //     container.appendChild(meter);
  //     meter.setAttribute('value', .8);
  //     if (isPolyfilledMeter(meter) && meter.value === .8) {
  //       alert('success');
  //     } else {
  //       alert('failed');
  //     }
  //   },
  //   changeValue: function() {
  //     var container = document.getElementById('js-test-container');
  //     var id = 'meter-' + mkId();
  //     var meter = document.createElement(METER_TAG);
  //     meter.value = 0.2;
  //     meter.id = id;
  //     container.appendChild(meter);
  //     meter.value = .8;
  //     if (isPolyfilledMeter(meter) && meter.value === .8) {
  //       alert('success');
  //     } else {
  //       alert('failed');
  //     }
  //   },
  //   hidePassed: function() {
  //     each(document.getElementsByTagName('dd'), function(dd) {
  //       if (dd.className === 'passed') {
  //         dd.style.display = 'none';
  //         var dt = dd.previousSibling;
  //         dt.style.display = 'none';
  //         var dl = dd.parentNode;
  //         var div = dl.parentNode;
  //         if (dl.getBoundingClientRect().height === 0) {
  //           div.style.display = 'none';
  //         }
  //       }
  //     });
  //   }
  // };

  // window.onload = function() {
  //   render();
  //   (function check() {
  //     var meters = document.getElementsByTagName(METER_TAG);
  //     var done = true;
  //     each(meters, function(meter) {
  //       if ((typeof meter.max === 'undefined') || (!supportMeter && !hasAttribute(meter,'_polyfill'))) {
  //         window.setTimeout(check, 500);
  //         done = false;
  //         return true;
  //       }
  //     });
  //     if (done) {
  //       testResult();
  //     }
  //   })();
  // };

  window.test = test;
})();
