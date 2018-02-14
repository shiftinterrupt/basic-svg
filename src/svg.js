const R = require('ramda');

import {
	LINEAR,
	SIN,
	PI,
	NS,
	SVG,
	POLYGON,
	CIRCLE,
	RECT,
	TRIANGLE,
	SQUARE,
	PENTAGON,
	HEXAGON,
	SEPTAGON,
	OCTOGON
} from './constants';
import {
	pointSum,
	pointDiff,
	pointQuot,
	segmentLength
} from './point';

import {
	Circle,
	Polygon,
	RegularPolygon,
	getTheta,
	exteriorAngle,
	getSides as getPolygonSides,
	getCentroid as getPolygonCentroid,
	getPoints as getPolygonPoints,
	polygonSides
} from './polygon';

const { sin, cos, tan, asin, acos, atan, sqrt } = Math;

const createElement = (ns, name) => document.createElementNS(ns, name);
const element = o => o.el;
const localName = el => {
	const parts = el.localName.split(':');
	return parts[parts.length - 1];
}
const attr = (svg, attr) => element(svg).getAttribute(attr);
const data = R.prop(['data']);
const getPoints = R.compose(getPolygonPoints, data);
const getSides = R.compose(getPolygonSides, data);
const getCentroid = R.compose(getPolygonCentroid, data);

class BasicSvg {

	constructor(name) {
		this.el = createElement(NS, name);
	}

	attr(key, val) {
		element(this).setAttribute(key, val);
		return this;
	}

	attrs(obj) {
		R.keys(obj).map(key => this.attr(key, obj[key]));
		return this;
	}

	style(key, val) {
		element(this).style[key] = val;
		return this;
	}

	styles(obj) {
		R.keys(obj).map(key => this.style(key, obj[key]));
		return this;
	}

	points(points) {

		this.data.points = points;
		element(this).setAttribute('points', stringifyPoints(points));

		return this;
	}

	origin([ x, y ]) {
		return this.attrs({
			'cx': x,
			'cy': y
		});
	}

	data(d) {
		this.data = d;
		return this;
	}

	append(sub, def) {

		if (typeof sub === 'string') {

			let svgObj;

			switch(sub) {
				case RECT:
					svgObj = new BasicSvg(RECT);
					element(this).append(element(svgObj));
					break;

				case CIRCLE:

					svgObj = new BasicSvg(CIRCLE);
					svgObj.attrs({
						'r': def.radius,
						'cx': def.origin[0],
						'cy': def.origin[1]
					});
					svgObj.data = def;

					element(this).append(element(svgObj));

					break;

				case TRIANGLE:
				case SQUARE:
				case PENTAGON:
				case HEXAGON:
				case SEPTAGON:
				case OCTAGON:

					const poly = RegularPolygon(
						R.assoc('sides', polygonSides[sub], def)
					);
					svgObj = new BasicSvg(POLYGON);
					svgObj.points(getPolygonPoints(poly)).data(poly);;

					element(this).append(element(svgObj));

					break;
			}
			return svgObj;

		}

		element(this).append(element(sub));

		return sub;
	}
}

const getOrigin = svg => {
	
	switch(R.compose(localName, element)(svg)) {
		case CIRCLE:
			return [ attr(svg,'cx'), attr(svg,'cy') ];
		case RECT:
			return [
				attr(svg,'x') + attr(svg,'width') / 2,
				attr(svg,'y') + attr(svg,'height') / 2
			];
		case POLYGON:
			return getCentroid(svg);
	}
}

export const Svg = selector => {
	
	const parentEl = document.querySelector(selector);
	const svg = new BasicSvg(SVG);

	parentEl.append(element(svg));
	
	return svg;
};

const join = char => o => o.join(char);
const stringifyPoint = join(',');
const stringifyPoints = arr => join(' ')(arr.map(stringifyPoint));

const sumNext = (delta, getter) => pointSum(delta, getter.next().value);
const combineDeltas = deltaGetters => deltaGetters.reduce(sumNext, [ 0, 0 ]);
const applyDeltas = (points, deltaGetters) => points.map(p => pointSum(p, combineDeltas(deltaGetters)));

const iter = function* (svg, points, deltaGetters, frames, duration, interval) {

	if (points.length == 1) {
		while (frames-- > 0) {
			points = yield points;
			points = applyDeltas(points, deltaGetters);
			svg.origin(points[0]);
		}
	} else {
		while (frames-- > 0) {
			points = yield points;
			points = applyDeltas(points, deltaGetters);
			svg.points(points);
		}
	}
};

export const animate = (svg, deltaGetters, duration, interval = 10) => {

	const { data } = svg;
	const frames = duration / interval;

	deltaGetters = deltaGetters.map(getter => getter(svg, duration, interval));

	let points = getPoints(svg) || [ getOrigin(svg) ];

	const it = iter(svg, points, deltaGetters, frames, duration, interval);

	return new Promise((resolve, reject) => {

		const id = setInterval(() => {

			const next = it.next(points);

			if (next.done) {
				clearInterval(id);
				resolve();
				return
			};
			points = next.value;

		}, interval);
	});
};

export const oscillate = (amplitude = [ [ 0, 0 ], [ 0, 0 ] ], cycles = [ 1, 1 ]) => {

	return function* (svg, duration, interval) {

		const sides = getSides(svg);
		const frames = duration / interval;
		const framesPerCycle = frames / cycles;
		const thetaDelta = 2 * PI / framesPerCycle;

		let i = -1;
		while (++i < frames) {
			for (let j = 0; j < sides; j++) {
				yield [
					amplitude[0] * (sin((i + 1) * thetaDelta) - sin(i * thetaDelta)),
					amplitude[1] * (-cos((i + 1) * thetaDelta) + cos(i * thetaDelta))
				];
			}
		}
	};
};

export const translate = (distance = [ 0, 0 ], fn = LINEAR) => {

	const gen = {
		*linear (svg, duration, interval) {
			const sides = getSides(svg);
			const frames = duration / interval;
			const delta = pointQuot(distance, frames);

			let i = -1;
			if (sides) {
				while (++i < frames) {
					for (let j = 0; j < sides; j++) {
						yield delta;
					}
				}
			} else {
				while (++i < frames) {
					yield delta;
				}
			}
		},
		*sin (svg, duration, interval) {
			const sides = getSides(svg);
			const frames = duration / interval;
			const thetaDelta = PI / (2 * frames);

			const frameDelta = (i, [ x, y ], t) => [
				x * (sin((i + 1) * t) - sin(i * t)),
				y * (sin((i + 1) * t) - sin(i * t))
			];

			let i = -1;

			if (sides) {
				while (++i < frames) {
					for (let j = 0; j < sides; j++) {
						yield frameDelta(i, distance, thetaDelta);
					}
				}
			} else {
				while (++i < frames) {
					yield frameDelta(i, distance, thetaDelta);
				}
			}
		}
	};
	return gen[fn];
};

export const rotate = theta => {

	return function* (svg, duration, interval) {

		const points = getPoints(svg);
		const sides = getSides(svg);
		const centroid = getCentroid(svg);
		const frames = duration / interval;
		const delta = theta / frames;

		let i = -1;
		while (++i < frames) {
			for (let j = 0; j < sides; j++) {
				const point = points[j];
				const radius = segmentLength(point, centroid);
				const t0 = R.compose(getTheta, pointDiff)(centroid, point);
				const tc = t0 + (i + 1) * delta;
				const tp = t0 + i * delta;
				
				yield [
					radius * (cos(tc) - cos(tp)),
					radius * (sin(tc) - sin(tp))
				];
			}
		}
	};
};
