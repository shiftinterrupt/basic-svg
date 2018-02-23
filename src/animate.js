const { compose } = require('ramda');

import { PI } from './constants';
import {
	getOrigin,
	getPoints,
	getSides,
	getCentroid,
	isPolygon
} from './utils';
import { getTheta } from './polygon';
import {
	pointSum,
	pointDiff,
	pointQuot,
	segmentLength
} from './point';

const { sin, cos, tan, asin, acos, atan, sqrt } = Math;

const sumNext = (delta, getter) => pointSum(delta, getter.next().value);
const combineDeltas = deltaGetters => deltaGetters.reduce(sumNext, [ 0, 0 ]);
const applyDeltas = (points, deltaGetters) => points.map(p => pointSum(p, combineDeltas(deltaGetters)));

const iterators = {
	*standard (svg, points, deltaGetters, frames, duration, interval) {
		while (frames-- > 0) {
			points = yield points;
			points = applyDeltas(points, deltaGetters);
			svg.origin(points[0]);
		}
	},
	*polygon (svg, points, deltaGetters, frames, duration, interval) {
		while (frames-- > 0) {
			points = yield points;
			points = applyDeltas(points, deltaGetters);
			svg.points(points);
		}
	}
};

export const animate = (svg, deltaGetters, duration, interval = 10) => {

	const frames = duration / interval;

	deltaGetters = deltaGetters.map(getter => getter(svg, duration, interval));

	let points = getPoints(svg) || [ getOrigin(svg) ];

	const iterator = isPolygon(svg) ? iterators.polygon : iterators.standard;
	const it = iterator(svg, points, deltaGetters, frames, duration, interval);

	return new Promise((resolve, reject) => {

		const id = setInterval(() => {

			const next = it.next(points);

			if (next.done) {
				clearInterval(id);
				return resolve();
			};
			points = next.value;

		}, interval);
	});
};

export const oscillate = (amplitude = [ 0, 0 ], cycles = [ 1, 1 ]) => {

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
				const t0 = compose(getTheta, pointDiff)(centroid, point);
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
