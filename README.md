# Polyfill for the meter element

## known issue: 

1. uglifyjs(v2.7.3) breaks code for ie < 9

   use `meter-polyfill.js` instead. until uglifyjs fix this bug

2. currently firefox shows diffently from chrome

3. ie<9 might not work completely

4. innerHTML createMeter is not polyfilled imidiately. 
   1. call `meterPolyfill.polyfill(parentNode)` manually
   2. it will be polyfilled after parentNode rendered in the dom tree

## test

https://fisker.github.io/meter-polyfill/test/meter/meter.html

for browsers supports `meter`, use `fakemeter` to test

https://fisker.github.io/meter-polyfill/test/fakemeter/meter.html

## api
```
  meterPolyfill(document.getElementById('fisker')); // dom contains meter
  meterPolyfill(document.getElementsByTagName('div')); // domlist contains meter
  meterPolyfill(); // document contains meter

  meterPolyfill.version // version number
  meterPolyfill.support // native `meter` support
  meterPolyfill.CLASSES // class list of value element
  meterPolyfill.LEVEL_SUBOPTIMUM // LEVEL_SUBOPTIMUM;
  meterPolyfill.LEVEL_OPTIMUM // LEVEL_OPTIMUM;
  meterPolyfill.LEVEL_SUBSUBOPTIMUM // LEVEL_SUBSUBOPTIMUM;
  meterPolyfill.calc // calculate meter/propValue

  var calcResult = meterPolyfill.calc(meter);
  calcResult.percentage // value width percentage(0-100)
  calcResult.level // value level 
  calcResult.className // value className

```

## usage

```
<script src="path/to/meter-polyfill.min.js"></script>
<script>
console.log(meterPolyfill);
</script>
```

amd loader
```
<script src="require.min.js"></script>
<script>
require(['path/to/meter-polyfill.min.js'], function(meterPolyfill) {
  console.log(meterPolyfill);
});
</script>
```
