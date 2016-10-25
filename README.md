Polyfill for the meter element

known issue: 
1. uglifyjs breaks code for ie < 9, polyfill.js works
2. currently firefox shows diffently from chrome
3. ie<9 might not work completely

test:
https://fisker.github.io/meter-polyfill/test/meter.html
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
