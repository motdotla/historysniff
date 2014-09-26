# historysniff

JS script to deduce a visitors' browser history from a manifest file of webapps.

## Usage

```html
<script src='/build/historysniff.js'></script>
<script>
  var apps = [
    {"name": "facebook", "url": "https://fbstatic-a.akamaihd.net/rsrc.php/v2/yh/r/xQ0DwmqUr-m.png"},
    {"name": "twitter", "url": "https://abs.twimg.com/a/1375759071/t1/img/twitter_web_sprite_icons.png"}
  ];

  historysniff.bind('match', function(result) {
    console.log("match", result);
  });
  historysniff.bind('nomatch', function(result) {
    console.log("nomatch", result);
  });

  historysniff.check(apps);
</script>
```

Optionally, you can adjust the `ms_measurement` up or down.


```javscript
historysniff.ms_measurement = 5000;
historysniff.check(apps);
```

## Developer Setup

```
npm install
grunt
```

Visit <http://localhost:3000> and open up the development console.
