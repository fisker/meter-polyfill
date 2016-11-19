# meter-polyfill
>
Polyfill for the meter element

[![npm](https://img.shields.io/npm/v/meter-polyfill.svg?style=flat-square)](https://www.npmjs.com/package/meter-polyfill) 
[![npm](https://img.shields.io/npm/l/meter-polyfill.svg?style=flat-square)](https://www.npmjs.com/package/meter-polyfill)

### NPM
```
npm install --save meter-polyfill
````

### Bower
```
bower install --save meter-polyfill
````

## test

https://fisker.github.io/meter-polyfill/test/meter/meter.html

for browsers supports `meter`, use `fakemeter` to test

https://fisker.github.io/meter-polyfill/test/fakemeter/meter.html

## api
```
meterPolyfill(); // document contains meter
meterPolyfill(document.getElementById('container')); // dom contains meter
meterPolyfill(document.getElementsByTagName('div')); // domlist contains meter
meterPolyfill(meter); // meter
meterPolyfill(document.getElementsByTagName('meter')); // meters
meterPolyfill([meter1,meter2])// arrays
meterPolyfill([div1,div2])// arrays

meterPolyfill.version // version number
meterPolyfill.support // native `meter` support
meterPolyfill.CLASSES // class list of value element
meterPolyfill.LEVEL_SUBOPTIMUM // LEVEL_SUBOPTIMUM;
meterPolyfill.LEVEL_OPTIMUM // LEVEL_OPTIMUM;
meterPolyfill.LEVEL_SUBSUBOPTIMUM // LEVEL_SUBSUBOPTIMUM;
meterPolyfill.calc // calculate meter/propValue

var calcResult = meterPolyfill.calc(meter); // meter
var calcResult = meterPolyfill.calc(propValues); // Object propValues
calcResult[min/max/low/high/optimum/value] // for browsers not support getters
calcResult.percentage // value width percentage(0-100)
calcResult.level // value level 
calcResult.className // value className

```

## usage

```
<link rel="stylesheet" href="https://unpkg.com/meter-polyfill/dist/meter-polyfill.min.css">
<script src="https://unpkg.com/meter-polyfill/dist/meter-polyfill.min.js"></script>
<script>
console.log(meterPolyfill);
</script>
```

amd loader
```
<link rel="stylesheet" href="https://unpkg.com/meter-polyfill/dist/meter-polyfill.min.css">
<script src="require.min.js"></script>
<script>
require(['https://unpkg.com/meter-polyfill/dist/meter-polyfill.min.js'], function(meterPolyfill) {
  console.log(meterPolyfill);
});
</script>
```

## known issue(s): 

1. uglifyjs(v2.7.3) breaks code for ie < 9

   use `meter-polyfill.js` instead. until uglifyjs fix this bug

2. currently firefox shows diffently from chrome

3. ie<9 might not work completely

4. innerHTML createMeter is not polyfilled imidiately. 
   1. call `meterPolyfill(parentNode)` manually.
   2. render to the dom tree, it will be polyfilled.
