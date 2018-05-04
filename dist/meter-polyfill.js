/**
 * meter-polyfill - Polyfill for the meter element
 * @version v1.7.3
 * @license MIT
 * @copyright fisker Cheung
 * @link https://github.com/fisker/meter-polyfill
 */
/* globals define: true, module: true*/
;(function(root, factory) {
  'use strict'

  if (typeof define === 'function' && define.amd) {
    define(function() {
      return factory(root)
    })
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(root)
  } else {
    root.meterPolyfill = factory(root)
  }
})(this, function(window) {
  'use strict'

  var document = window.document

  function throwError(message, constructor) {
    throw new (constructor || Error)(message)
  }

  if (!document) {
    throwError('meter-polyfill requires a window with a document.')
  }

  var isFirefox = window.navigator.userAgent.indexOf('Firefox') > -1

  var METHOD_TO_UPPER_CASE = 'toUpperCase'
  var METHOD_TO_LOWER_CASE = 'toLowerCase'

  var METER_TAG_NAME = 'METER'
  var METER_INTERFACE = 'HTMLMeterElement'
  var VERSION = '1.7.3'

  var NOOP = function() {} // eslint no-empty-function: 0
  var TRUE = true
  var FALSE = false
  var NULL = null

  var LEVEL_OPTIMUM = 1
  var LEVEL_SUBOPTIMUM = 2
  var LEVEL_SUBSUBOPTIMUM = 3

  var METER_CLASS_PREFIX = METER_TAG_NAME[METHOD_TO_LOWER_CASE]() + '-'
  var METER_VALUE_CLASSES = {}
  METER_VALUE_CLASSES[LEVEL_OPTIMUM] = METER_CLASS_PREFIX + 'optimum-value'
  METER_VALUE_CLASSES[LEVEL_SUBOPTIMUM] =
    METER_CLASS_PREFIX + 'suboptimum-value'
  METER_VALUE_CLASSES[LEVEL_SUBSUBOPTIMUM] =
    METER_CLASS_PREFIX + 'even-less-good-value'

  var PROP_MIN = 'min'
  var PROP_MAX = 'max'
  var PROP_LOW = 'low'
  var PROP_HIGH = 'high'
  var PROP_VALUE = 'value'
  var PROP_OPTIMUM = 'optimum'
  var PROP_LABELS = 'labels'

  var METER_PROPS = [
    PROP_MIN,
    PROP_MAX,
    PROP_LOW,
    PROP_HIGH,
    PROP_OPTIMUM,
    PROP_VALUE
  ]

  var METER_INITAL_VALUES = {
    min: 0,
    max: 1,
    value: 0
  }

  // var PRECISION = isFirefox ? 16 : 6; // firefox and chrome use different precision

  var PROP_LENGTH = 'length'
  var METHOD_CREATE_ELEMENT = 'createElement'

  var meterElement = document[METHOD_CREATE_ELEMENT](METER_TAG_NAME)
  var nativeSupport = meterElement[PROP_MAX] === METER_INITAL_VALUES[PROP_MAX]

  var toFloat = Number.parseFloat || parseFloat

  /**
   * return value less than high
   * @param  {Number} value
   * @param  {Number} high
   * @return {Number}
   */
  // function lessThan(value, high) {
  //   if (value > high) {
  //     value = high;
  //   }
  //   return value;
  // }

  /**
   * return value greater than low
   * @param  {Number} value
   * @param  {Number} low
   * @return {Number}
   */
  function greaterThan(value, low) {
    if (value < low) {
      value = low
    }
    return value
  }

  function nearest(value, low, high) {
    if (value < low) {
      value = low
    }

    if (value > high) {
      value = high
    }

    return value
  }

  function each(arrLike, func) {
    var i = 0
    var len = arrLike[PROP_LENGTH]
    for (; i < len; i++) {
      if (func(arrLike[i], i) === FALSE) {
        break
      }
    }
  }

  function isUndefined(obj) {
    return typeof obj === 'undefined'
  }

  function isNull(obj) {
    return obj === NULL
  }

  function isValidValue(obj) {
    return isNull(obj) || isFinite(toFloat(obj))
  }

  function parseValue(value, valueForNull) {
    if (arguments.length === 1) {
      valueForNull = NULL
    }
    return !isValidValue(value) || isNull(value) ? valueForNull : toFloat(value)
  }

  function assignValues(target, source) {
    each(METER_PROPS, function(prop) {
      target[prop] = parseValue(source[prop])
    })
    return target
  }

  function getPropValue(propValues, prop) {
    var value = propValues[prop]
    var isNullValue = isNull(value)
    var min
    var max
    switch (prop) {
      case PROP_MIN:
        value = isNullValue ? METER_INITAL_VALUES[PROP_MIN] : value
        break

      case PROP_MAX:
        value = isNullValue ? METER_INITAL_VALUES[PROP_MAX] : value
        min = getPropValue(propValues, PROP_MIN)
        value = greaterThan(value, min)
        break

      case PROP_LOW:
        min = getPropValue(propValues, PROP_MIN)
        value = isNullValue
          ? min
          : nearest(value, min, getPropValue(propValues, PROP_MAX))
        break

      case PROP_HIGH:
        max = getPropValue(propValues, PROP_MAX)
        value = isNullValue
          ? max
          : nearest(value, getPropValue(propValues, PROP_LOW), max)
        break

      case PROP_OPTIMUM:
        min = getPropValue(propValues, PROP_MIN)
        max = getPropValue(propValues, PROP_MAX)
        value = isNullValue ? (max - min) / 2 + min : nearest(value, min, max)
        break

      case PROP_VALUE:
        value = isNullValue ? METER_INITAL_VALUES[PROP_VALUE] : value
        min = getPropValue(propValues, PROP_MIN)
        max = getPropValue(propValues, PROP_MAX)
        value = nearest(value, min, max)
        break

      default:
        break
    }

    return value
  }

  function meterCalculator(meter, keys) {
    var propValues = assignValues({}, meter)
    var returnValues = {}
    each(METER_PROPS, function(prop) {
      returnValues[prop] = propValues[prop] = getPropValue(propValues, prop)
    })

    var min = propValues[PROP_MIN]
    var max = propValues[PROP_MAX]
    var low = propValues[PROP_LOW]
    var high = propValues[PROP_HIGH]
    var optimum = propValues[PROP_OPTIMUM]
    var value = propValues[PROP_VALUE]

    var percentage = min === max ? 0 : (value - min) / (max - min) * 100
    var level = LEVEL_OPTIMUM

    if (high === max || low === min || (optimum >= low && optimum <= high)) {
      if (
        (low <= optimum && value < low) ||
        (low > optimum && value > low) ||
        (high < optimum && value < high) ||
        (high >= optimum && value > high)
      ) {
        level = LEVEL_SUBOPTIMUM
      }
    } else if (low === high) {
      if ((low <= optimum && value < low) || (high > optimum && value > high)) {
        level = LEVEL_SUBSUBOPTIMUM
      }
    } else if (optimum < low) {
      if (value > low && value <= high) {
        level = LEVEL_SUBOPTIMUM
      } else if (value > high) {
        level = LEVEL_SUBSUBOPTIMUM
      }
    } else if (optimum > high) {
      if (value >= low && value < high) {
        level = LEVEL_SUBOPTIMUM
      } else if (value < low) {
        level = LEVEL_SUBSUBOPTIMUM
      }
    }

    // firefox show diffently from chrome
    // when value === high/low or min === max
    if (isFirefox) {
      if (min === max) {
        percentage = 100
      }

      if (
        (optimum > high && value === high) ||
        (optimum < low && value === low)
      ) {
        level = LEVEL_SUBOPTIMUM
      }
    }

    returnValues.percentage = percentage
    returnValues.level = level
    returnValues.className = METER_VALUE_CLASSES[level]

    return returnValues
  }

  var PROP_PROTOTYPE = 'prototype'
  var PROP_CONSTRUCTOR = 'constructor'
  var PROP_PROTO = '__proto__'

  var METHOD_CALL = 'call'
  var METHOD_APPLY = 'apply'
  var METHOD_CONCAT = 'concat'
  var METHOD_SLICE = 'slice'
  var METHOD_TO_STRING = 'toString'
  var METHOD_JOIN = 'join'

  var oObject = Object
  var arrayPrototype = Array[PROP_PROTOTYPE]
  var funcPrototype = Function[PROP_PROTOTYPE]
  // var objPrototype = oObject[PROP_PROTOTYPE];

  var objectDefineProperty = oObject.defineProperty

  var slice = arrayPrototype[METHOD_SLICE]
  var apply = funcPrototype[METHOD_APPLY]
  var concat = arrayPrototype[METHOD_CONCAT]
  var bind = funcPrototype.bind
  var create = oObject.create
  var join = arrayPrototype[METHOD_JOIN]

  var funcToString = funcPrototype[METHOD_TO_STRING]
  var TO_STRING = '' + funcToString

  function funcApplyCall(func, oThis, args) {
    return apply[METHOD_CALL](func, oThis, args)
  }

  function arraySliceCall(arrLike) {
    var args = funcApplyCall(slice, arguments, [1])
    return funcApplyCall(slice, arrLike, args)
  }

  function funcCallCall(func, oThis) {
    var args = arraySliceCall(arguments, 2)
    return funcApplyCall(func, oThis, args)
  }

  function arrayConcatCall(arrLike, arrLike2) {
    return funcCallCall(concat, arrLike, arrLike2)
  }

  function arrayJoinCall(arrLike, separator) {
    return funcCallCall(join, arrLike, separator)
  }

  if (!bind) {
    // simple bind
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
    bind = function(oThis) {
      var args = arraySliceCall(arguments, 1)
      var funcToBind = this
      return function() {
        args = arrayConcatCall(args, arguments)
        return funcApplyCall(funcToBind, oThis, args)
      }
    }
  }

  function funcBindCall(func) {
    return funcApplyCall(bind, func, arraySliceCall(arguments, 1))
  }

  if (!create) {
    create = function(proto) {
      // simple but enough
      NOOP[PROP_PROTOTYPE] = proto
      return new NOOP()
    }
  }

  // is Array.prototype includes/indexOf Faster?
  function includes(arrLike, v) {
    var found = FALSE
    each(arrLike, function(item) {
      if (item === v) {
        found = TRUE
        return FALSE
      }
    })
    return found
  }

  function memoize(func) {
    var cache = {}
    return function() {
      var args = arguments
      var key = arrayJoinCall(args, '_')
      if (!(key in cache)) {
        cache[key] = funcApplyCall(func, NULL, args)
      }
      return cache[key]
    }
  }

  function throwTypeError(message) {
    throwError(message, TypeError)
  }

  var nativeToString = funcBindCall(funcToString, funcToString)
  nativeToString[METHOD_TO_STRING] = nativeToString

  var getToStringFunc = memoize(function(funcName) {
    function toString() {
      return TO_STRING.replace(METHOD_TO_STRING, funcName)
    }
    toString[METHOD_TO_STRING] = nativeToString
    return toString
  })

  function pretendNativeFunction(funcName, func) {
    func[METHOD_TO_STRING] = getToStringFunc(funcName)
    return func
  }

  var PROP_GET = 'get'
  var PROP_SET = 'set'

  function defineProperty(o, property, descriptor) {
    if (objectDefineProperty) {
      descriptor.configurable = TRUE

      try {
        return objectDefineProperty(o, property, descriptor)
      } catch (e) {
        var PROP_ENUMERABLE = 'enumerable'
        if (descriptor[PROP_ENUMERABLE] && e.number === -0x7ff5ec54) {
          descriptor[PROP_ENUMERABLE] = FALSE
          return objectDefineProperty(o, property, descriptor)
        }
      }
    } else {
      var METHOD_DEFINE_SETTER = '__defineSetter__'
      var METHOD_DEFINE_GETTER = '__defineGetter__'
      if (descriptor[PROP_GET]) {
        if (METHOD_DEFINE_GETTER in o) {
          o[METHOD_DEFINE_GETTER](property, descriptor[PROP_GET])
        } else {
          o[property] = funcBindCall(descriptor[PROP_GET], o)
        }
      }

      if (descriptor[PROP_SET] && METHOD_DEFINE_SETTER in o) {
        o[METHOD_DEFINE_SETTER](property, descriptor[PROP_SET])
      }

      if (descriptor[PROP_VALUE]) {
        o[property] = descriptor[PROP_VALUE]
      }
    }
  }

  var PROP_ID = 'id'
  var PROP_FOR = 'htmlFor'
  var PROP_CONTROL = 'control'

  var METHOD_GET_ELEMENTS_BY_TAG_NAME = 'getElementsByTagName'
  var METHOD_SET_ATTRIBUTE = 'setAttribute'

  var getElementById = funcBindCall(document.getElementById, document)
  var HTMLElement = window.HTMLElement || window.Element || window.Node || NOOP
  var documentElement = document.documentElement

  var LABEL_TAG_NAME = 'LABEL'

  var allLabels = documentElement[METHOD_GET_ELEMENTS_BY_TAG_NAME](
    LABEL_TAG_NAME
  )
  var allMeters = documentElement[METHOD_GET_ELEMENTS_BY_TAG_NAME](
    METER_TAG_NAME
  )

  // ie 8 document.createElement is not a function
  // ie 7 document.createElement.apply is undefined
  var createElement = funcBindCall(document[METHOD_CREATE_ELEMENT], document)

  function isElement(el, tagName) {
    var PROP_TAGNAME = 'tagName'
    return (
      el &&
      el[PROP_TAGNAME] &&
      el[PROP_TAGNAME][METHOD_TO_UPPER_CASE]() === tagName
    )
  }

  ;(function(HTMLLabelElement) {
    var LABELABLE_ELEMENTS = (
      'BUTTON INPUT KEYGEN ' +
      METER_TAG_NAME +
      ' OUTPUT PROGRESS SELECT TEXTAREA'
    ).split(' ')

    function findLabelAssociatedElement() {
      var label = this
      var htmlFor = label[PROP_FOR]
      if (htmlFor) {
        return getElementById(htmlFor)
      }

      var childNodes = label.getElementsByTagName('*')
      var associated = NULL
      each(childNodes, function(node) {
        var tagName = node.tagName[METHOD_TO_UPPER_CASE]()
        if (includes(LABELABLE_ELEMENTS, tagName)) {
          associated = node
          return FALSE
        }
      })

      return associated
    }

    var HTMLLabelElementPrototype =
      HTMLLabelElement && HTMLLabelElement[PROP_PROTOTYPE]
    if (!HTMLLabelElementPrototype) {
      return
    }
    if (!(PROP_CONTROL in HTMLLabelElementPrototype)) {
      defineProperty(
        HTMLLabelElementPrototype,
        PROP_CONTROL,
        getPropDescriptor(findLabelAssociatedElement)
      )
    }
  })(window.HTMLLabelElement)

  function getErrorMessage(testFunc, defaultMsg) {
    try {
      testFunc()
    } catch (e) {
      return e.message
    }
    return defaultMsg
  }

  // find right msg by test on a non-finite prop of known element
  var PROP_PLACEHOLDER = '{prop}'
  var MSG_NON_FINITE = (function() {
    var PROP_VOLUME = 'volume'
    var audioNonFiniteMsg = getErrorMessage(function() {
      if (Audio) {
        new Audio()[PROP_VOLUME] = 'x'
      }
    })

    if (audioNonFiniteMsg) {
      return audioNonFiniteMsg
        .replace('HTMLMediaElement', METER_INTERFACE)
        .replace(PROP_VOLUME, PROP_PLACEHOLDER)
    }

    var progressNonFiniteMsg = getErrorMessage(function() {
      var progress = createElement('PROGRESS')
      progress[PROP_MAX] = 'x'
    })

    if (progressNonFiniteMsg) {
      return progressNonFiniteMsg
        .replace('HTMLProgressElement', METER_INTERFACE)
        .replace(PROP_MAX, PROP_PLACEHOLDER)
    }

    return METER_INTERFACE + '.' + PROP_VOLUME + ' error'
  })()

  var getNonFiniteMsgs = memoize(function(prop) {
    return MSG_NON_FINITE.replace(PROP_PLACEHOLDER, prop)
  })

  // only get necessary props
  var getPropDependencies = memoize(function(prop) {
    var props = {}
    props[PROP_MIN] = []
    props[PROP_MAX] = [PROP_MIN]
    props[PROP_LOW] = props[PROP_OPTIMUM] = props[PROP_VALUE] = [
      PROP_MIN,
      PROP_MAX
    ]
    props[PROP_HIGH] = [PROP_MIN, PROP_MAX, PROP_LOW]
    return arrayConcatCall(props[prop], [prop])
  })

  var METHOD_GET_ATTRIBUTE = 'getAttribute'
  // use common getter & setter
  function getPropGetter(prop) {
    return function() {
      var meter = this
      var propValues = {}
      each(getPropDependencies(prop), function(prop) {
        propValues[prop] = parseValue(meter[METHOD_GET_ATTRIBUTE](prop))
      })

      return getPropValue(propValues, prop)
    }
  }

  function getPropSetter(prop) {
    return function(value) {
      var meter = this
      if (!isValidValue(value)) {
        throwTypeError(getNonFiniteMsgs(prop))
      }

      meter[METHOD_SET_ATTRIBUTE](prop, '' + parseValue(value, 0))
      return value
    }
  }

  function lablesGetter() {
    var meter = this
    var assignedLables = []
    var i = 0
    var propId = meter[PROP_ID]

    each(allLabels, function(label) {
      var propFor = label[PROP_FOR]

      if (
        label[PROP_CONTROL] === meter ||
        (!propFor &&
          label[METHOD_GET_ELEMENTS_BY_TAG_NAME](METER_TAG_NAME)[0] ===
            meter) ||
        (propFor && propFor === propId)
      ) {
        assignedLables[i++] = label
      }
    })

    return assignedLables
  }

  function getPropDescriptor(getter, setter) {
    return {
      enumerable: TRUE,
      get: getter,
      set: setter
    }
  }

  function getValueDescriptor(value) {
    return {
      value: value
    }
  }

  var getMeterDescriptors = memoize(function(prop) {
    return prop === PROP_LABELS
      ? getPropDescriptor(lablesGetter)
      : getPropDescriptor(getPropGetter(prop), getPropSetter(prop))
  })

  var HTMLMeterElement = (function(HTMLMeterElement) {
    var MSG_ILLEAGE_CONSTRUCTOR = getErrorMessage(function() {
      HTMLElement && new HTMLElement()
    }, 'Illegal constructor')

    var HTMLMeterElementPrototype
    if (HTMLMeterElement) {
      HTMLMeterElementPrototype = HTMLMeterElement[PROP_PROTOTYPE]
    } else {
      HTMLMeterElement = window[METER_INTERFACE] = function() {
        throwTypeError(MSG_ILLEAGE_CONSTRUCTOR)
      }
      HTMLMeterElementPrototype = create(HTMLElement[PROP_PROTOTYPE])
      HTMLMeterElementPrototype[PROP_CONSTRUCTOR] = HTMLMeterElement
      HTMLMeterElement[PROP_PROTOTYPE] = HTMLMeterElementPrototype
      HTMLMeterElement = pretendNativeFunction(
        METER_INTERFACE,
        HTMLMeterElement
      )
    }

    if (!meterElement || !meterElement[PROP_LABELS]) {
      defineProperty(
        HTMLMeterElementPrototype,
        PROP_LABELS,
        getMeterDescriptors(PROP_LABELS)
      )
    }

    each(METER_PROPS, function(prop) {
      if (!(prop in HTMLMeterElementPrototype)) {
        defineProperty(
          HTMLMeterElementPrototype,
          prop,
          getMeterDescriptors(prop)
        )
      }
    })

    return HTMLMeterElement
  })(window[METER_INTERFACE])

  var meterPolyfill =
    meterElement[PROP_CONSTRUCTOR] === HTMLMeterElement
      ? NOOP
      : (function() {
          /* polyfill starts */

          var POLYFILL_FLAG = '_polyfill'

          var METHOD_REMOVE_CHILD = 'removeChild'
          var METHOD_REMOVE_ATTRIBUTE = 'removeAttribute'
          var METHOD_APPEND_CHILD = 'appendChild'
          var METHOD_ADD_EVENT_LISTENER = 'addEventListener'
          var METHOD_ATTACH_EVENT = 'attachEvent'
          var PROP_FIRST_CHILD = 'firstChild'

          var DIV_TAG_NAME = 'DIV'

          var DIV_OPENING_TAG = '<div class="'
          var DIV_CLOSING_TAG = '</div>'

          var TIMEOUT_FREQUENCY = 10

          // there is no moz/ms/o vendor prefix
          var MutationObserver =
            window.MutationObserver || window.WebKitMutationObserver
          meterElement[POLYFILL_FLAG] = VERSION // for attersAsProps test

          var SUPPORTS_MUTATION_OBSERVER = !!MutationObserver
          var SUPPORTS_ADD_EVENT_LISTENER = !!window[METHOD_ADD_EVENT_LISTENER]
          var SUPPORTS_ATTACH_EVENT = !!window[METHOD_ATTACH_EVENT]
          // ie <= 8 attributes are same as properties
          var SUPPORTS_ATTERS_AS_PROPS =
            meterElement[METHOD_GET_ATTRIBUTE](POLYFILL_FLAG) === VERSION
          var SUPPORTS_PROPERTYCHANGE = 'onpropertychange' in document
          var SUPPORTS_DOM_NODE_INSERTED = FALSE
          var SUPPORTS_DOM_ATTR_MODIFIED = FALSE

          var METHOD_DOM_NODE_INSERTED = 'DOMNodeInserted'
          var METHOD_DOM_ATTR_MODIFIED = 'DOMAttrModified'
          if (!SUPPORTS_MUTATION_OBSERVER) {
            var testDiv = createElement(DIV_TAG_NAME)
            var testChild = createElement(DIV_TAG_NAME)

            on(testDiv, METHOD_DOM_NODE_INSERTED, function() {
              SUPPORTS_DOM_NODE_INSERTED = TRUE
            })
            on(testDiv, METHOD_DOM_ATTR_MODIFIED, function() {
              SUPPORTS_DOM_ATTR_MODIFIED = TRUE
            })

            testDiv[METHOD_APPEND_CHILD](testChild)
            testDiv[METHOD_SET_ATTRIBUTE](POLYFILL_FLAG, VERSION)

            testDiv = testChild = NULL
          }

          function on(target, eventTypes, listener, useCapture) {
            each(eventTypes.split(' '), function(type) {
              if (SUPPORTS_ADD_EVENT_LISTENER) {
                target[METHOD_ADD_EVENT_LISTENER](type, listener, !!useCapture)
              } else if (SUPPORTS_ATTACH_EVENT) {
                target[METHOD_ATTACH_EVENT]('on' + type, listener)
              } else {
                target['on' + type] = listener
              }
            })
          }

          function observe(target, callback, options) {
            var observer = new MutationObserver(callback)
            observer.observe(target, options)
            return observer
          }

          var METER_SHADOW_HTML = [
            DIV_OPENING_TAG + METER_CLASS_PREFIX + 'inner-element">',
            DIV_OPENING_TAG + METER_CLASS_PREFIX + 'bar">',
            DIV_OPENING_TAG +
              METER_VALUE_CLASSES[LEVEL_SUBOPTIMUM] +
              '" style="width: 0%">',
            DIV_CLOSING_TAG,
            DIV_CLOSING_TAG,
            DIV_CLOSING_TAG
          ][METHOD_JOIN]('')

          var setTimeout = window.setTimeout
          var setInterval = window.setInterval

          function walkContext(context, tagName, func) {
            context = context[PROP_LENGTH]
              ? context
              : context[METHOD_GET_ELEMENTS_BY_TAG_NAME](tagName)
            each(context, function(context) {
              func(context)
            })
          }

          function observerAttributes(target, attrs, callback) {
            if (SUPPORTS_MUTATION_OBSERVER) {
              observe(
                target,
                function(mutations) {
                  each(mutations, function(mutation) {
                    var atrr = mutation.attributeName[METHOD_TO_LOWER_CASE]()
                    callback(target, atrr)
                  })
                },
                {
                  attributes: TRUE,
                  attributeFilter: attrs
                }
              )
            } else if (SUPPORTS_DOM_ATTR_MODIFIED) {
              on(target, METHOD_DOM_ATTR_MODIFIED, function(e) {
                var attr = e.attrName[METHOD_TO_LOWER_CASE]()
                if (includes(attrs, attr)) {
                  callback(target, attr)
                }
              })
            } else if (SUPPORTS_PROPERTYCHANGE) {
              on(target, 'propertychange', function(e) {
                var prop = e.propertyName[METHOD_TO_LOWER_CASE]()
                if (includes(attrs, prop)) {
                  callback(target, prop)
                }
              })
            }
            // anything else?
          }

          function polyfillMeter(context) {
            if (!isElement(context, METER_TAG_NAME)) {
              return walkContext(
                context || allMeters,
                METER_TAG_NAME,
                polyfillMeter
              )
            }

            var meter = context
            if (meter.constructor !== HTMLMeterElement) {
              meter.innerHTML = METER_SHADOW_HTML
              defineMeterProperties(meter)
              updateMeterStyle(meter)
              observerAttributes(meter, METER_PROPS, triggerAttrChange)
            }
          }

          function updateMeterStyle(meter) {
            var result = meterCalculator(meter)

            var PROP_CLASS_NAME = 'className'
            var PROP_STYLE = 'style'
            var PROP_WIDTH = 'width'

            var valueElement =
              meter[PROP_FIRST_CHILD][PROP_FIRST_CHILD][PROP_FIRST_CHILD]

            // only update when necessary
            var currentClassName = valueElement[PROP_CLASS_NAME]
            var changeClassName = result[PROP_CLASS_NAME]
            if (currentClassName !== changeClassName) {
              valueElement[PROP_CLASS_NAME] = changeClassName
            }

            var currentWidth = valueElement[PROP_STYLE][PROP_WIDTH]
            var changeWidth = result.percentage + '%'
            if (currentWidth !== changeWidth) {
              valueElement[PROP_STYLE][PROP_WIDTH] = changeWidth
            }
            return meter
          }

          function triggerAttrChange(meter, attr) {
            if (includes(METER_PROPS, attr[METHOD_TO_LOWER_CASE]())) {
              updateMeterStyle(meter)
            }
          }

          function defineMeterProperties(meter) {
            var HTMLMeterElementPrototype = HTMLMeterElement[PROP_PROTOTYPE]

            meter[PROP_PROTO] = HTMLMeterElementPrototype
            meter[POLYFILL_FLAG] = VERSION

            var properties = {}

            // if (!SUPPORTS_ATTERS_AS_PROPS) {
            //   each(METER_PROPS, function(prop) {
            //     properties[prop] = getMeterDescriptors(prop);
            //   });
            // }

            // properties[PROP_LABELS] = getMeterDescriptors(PROP_LABELS);
            // properties[POLYFILL_FLAG] = getMeterDescriptors(VERSION);

            if (!SUPPORTS_ATTERS_AS_PROPS) {
              var setAttribute = funcBindCall(
                meter[METHOD_SET_ATTRIBUTE],
                meter
              )

              var methodSetAttribute = pretendNativeFunction(
                METHOD_SET_ATTRIBUTE,
                function(attr, value) {
                  setAttribute(attr, value)
                  triggerAttrChange(meter, attr)
                }
              )

              properties[METHOD_SET_ATTRIBUTE] = getValueDescriptor(
                methodSetAttribute
              )
            }

            if (SUPPORTS_ATTERS_AS_PROPS) {
              var removeAttribute = funcBindCall(
                meter[METHOD_REMOVE_ATTRIBUTE],
                meter
              )

              var methodRemoveAttribute = pretendNativeFunction(
                METHOD_REMOVE_ATTRIBUTE,
                function(attr) {
                  removeAttribute(attr)
                  triggerAttrChange(meter, attr)
                }
              )

              properties[METHOD_REMOVE_ATTRIBUTE] = getValueDescriptor(
                methodRemoveAttribute
              )
            }

            var METHOD_CLONE_NODE = 'cloneNode'
            var cloneNode = funcBindCall(meter[METHOD_CLONE_NODE], meter)
            var methodCloneNode = pretendNativeFunction(
              METHOD_CLONE_NODE,
              function(deep) {
                var clone = cloneNode(FALSE)
                if (SUPPORTS_ATTERS_AS_PROPS) {
                  clone[METHOD_REMOVE_ATTRIBUTE](POLYFILL_FLAG)
                }
                polyfillMeter(clone)
                return clone
              }
            )

            properties[METHOD_CLONE_NODE] = getValueDescriptor(methodCloneNode)

            for (var prop in properties) {
              if (properties.hasOwnProperty(prop)) {
                defineProperty(meter, prop, properties[prop])
              }
            }
          }

          // overwrite document.createElement
          document[METHOD_CREATE_ELEMENT] = pretendNativeFunction(
            METHOD_CREATE_ELEMENT,
            function() {
              var el = funcApplyCall(createElement, document, arguments)
              if (isElement(el, METER_TAG_NAME)) {
                polyfillMeter(el)
              }
              return el
            }
          )

          function observerDocument() {
            var PROP_TARGET = 'target'
            if (SUPPORTS_MUTATION_OBSERVER) {
              // observe subtree
              observe(
                documentElement,
                function(mutations) {
                  each(mutations, function(mutation) {
                    polyfillMeter(mutation[PROP_TARGET])
                  })
                },
                {
                  subtree: TRUE,
                  childList: TRUE
                }
              )
            } else {
              if (SUPPORTS_DOM_NODE_INSERTED) {
                on(documentElement, METHOD_DOM_NODE_INSERTED, function(e) {
                  polyfillMeter(e[PROP_TARGET])
                })
              } else {
                setInterval(polyfillMeter, TIMEOUT_FREQUENCY)
              }
            }
          }

          ;(function() {
            var isReady = FALSE
            var isTop = FALSE

            function setReady() {
              isReady = TRUE
            }

            function completed() {
              if (document.readyState === 'complete') {
                setReady()
              }
            }

            try {
              isTop = isNull(window.frameElement)
            } catch (_) {}

            if (
              !SUPPORTS_ADD_EVENT_LISTENER &&
              documentElement.doScroll &&
              isTop
            ) {
              ;(function doScroll() {
                try {
                  documentElement.doScroll()
                  setReady()
                } catch (_) {
                  setTimeout(doScroll, TIMEOUT_FREQUENCY)
                }
              })()
            }

            on(document, 'DOMContentLoaded', setReady)
            on(window, 'load', setReady)
            on(document, 'readystatechange', completed)
            completed()
            ;(function polyfillWhenReady() {
              if (isReady) {
                polyfillMeter()
                observerDocument()
              } else {
                setTimeout(polyfillWhenReady, TIMEOUT_FREQUENCY)
              }
            })()
          })()

          return polyfillMeter
        })()

  meterPolyfill.version = VERSION
  meterPolyfill.CLASSES = METER_VALUE_CLASSES
  meterPolyfill.LEVEL_SUBOPTIMUM = LEVEL_SUBOPTIMUM
  meterPolyfill.LEVEL_OPTIMUM = LEVEL_OPTIMUM
  meterPolyfill.LEVEL_SUBSUBOPTIMUM = LEVEL_SUBSUBOPTIMUM
  meterPolyfill.calc = meterCalculator

  return meterPolyfill
})
