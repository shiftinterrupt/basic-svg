Basic SVG
=============

A simple SVG library in JavaScript.

Usage
-------

```javascript
const svg = Svg('body').attrs({
    width: '1700',
    height: '800'
});

const square = svg.append('square', {
    origin: [ 100, 50 ],
    radius: 20
}).styles({
    fill: 'purple'
});

animate(square, [
    translate([ 2000, 500 ], SIN),
    rotate(16 * PI),
    oscillate([ 100, 100 ], 6)
], 1000);
```
