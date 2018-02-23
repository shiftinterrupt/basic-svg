import Svg from './svg';
import { create, append, createAndAppend } from './BasicSvg';
import { PI, LINEAR, SIN } from './constants';
import { animate, rotate, translate, oscillate } from './animate';

document.addEventListener('DOMContentLoaded', () => {

	const svg = Svg('body');

	const data = [
		{
			type: 'circle',
			radius: 25,
			origin: [ 900, 300 ],
			styles: {
				fill: '#d2dee8'
			}
		},
		{
			type: 'triangle',
			origin: [ 900, 250 ],
			radius: 20,
			styles: {
				fill: '#9392d1'
			}
		},
		{
			type: 'square',
			origin: [ 900, 200 ],
			radius: 25,
			styles: {
				fill: '#e1769f'
			}
		},
		{
			type: 'pentagon',
			origin: [ 900, 150 ],
			radius: 25,
			styles: {
				fill: '#bf9ac8'
			}
		},
		{
			type: 'hexagon',
			origin: [ 900, 100 ],
			radius: 25,
			styles: {
				fill: '#353573'
			}
		},
		{
			type: 'square',
			origin: [ 100, 50 ],
			radius: 20,
			styles: {
				fill: 'purple'
			}
		}
	];

	const [
		circle,
		triangle,
		square,
		pentagon,
		hexagon,
		square2
	] = createAndAppend(svg, data);

	setTimeout(() => {
		animate(triangle, [
			rotate(16 * PI),
			oscillate([ 100, 100 ], 5),
		], 10000);
		animate(square, [
			rotate(8 * PI),
			oscillate([ 150, 150 ], 4)
		], 10000);
		animate(pentagon, [
			rotate(8 * PI),
			oscillate([ 200, 200 ], 3)
		], 10000);
		animate(hexagon, [
			rotate(5 * PI),
			oscillate([ 250, 250 ], 2)
		], 10000);
		animate(square2, [
			translate([ 2000, 500 ], SIN),
			rotate(16 * PI),
			oscillate([ 100, 100 ], 6)
		], 10000);
	}, 1000);
});
