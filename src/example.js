import { PI, LINEAR, SIN } from './constants';
import { Polygon } from './polygon';
import {
	Svg,
	animate,
	rotate,
	translate,
	oscillate
} from './svg';

document.addEventListener('DOMContentLoaded', () => {

	const svg = Svg('body').attrs({
		width: '1700',
		height: '800'
	});

	const circle = svg.append('circle', {
		radius: 25,
		origin: [ 900, 300 ]
	}).styles({
		fill: '#d2dee8'
	});

	const triangle = svg.append('triangle', {
		origin: [ 900, 250 ],
		radius: 20
	}).styles({
		fill: '#9392d1'
	});

	const square = svg.append('square', {
		origin: [ 900, 200 ],
		radius: 25
	}).styles({
		fill: '#e1769f'
	});

	const pentagon = svg.append('pentagon', {
		origin: [ 900, 150 ],
		radius: 25
	}).styles({
		fill: '#bf9ac8'
	});

	const hexagon = svg.append('hexagon', {
		origin: [ 900, 100 ],
		radius: 25
	}).styles({
		fill: '#353573'
	});
	
	const square2 = svg.append('square', {
		origin: [ 100, 50 ],
		radius: 20
	}).styles({
		fill: 'purple'
	});

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
