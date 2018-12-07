const { compose } = require('ramda');

import { PI } from './constants';
import { setAttr, setOrigin } from './BasicSvg';
import {
	getOrigin,
	isPolygon
} from './utils';
import { getSides, getCentroid, getPoints, getTheta } from './polygon';
import {
	pointSum,
	pointDiff,
	pointQuot,
	segmentLength
} from './point';

const { sin, cos, tan, asin, acos, atan, sqrt, abs } = Math;

const sumNext = (delta, getter) => pointSum(delta, getter.next().value);
const combineDeltas = deltaGetters => deltaGetters.reduce(sumNext, [ 0, 0 ]);
const applyDeltas = (points, deltaGetters) => points.map(p => pointSum(p, combineDeltas(deltaGetters)));

const iterators = {
	*standard (svg, points, deltaGetters, frames, duration, interval) {
		while (frames-- > 0) {
			points = yield points;
			points = applyDeltas(points, deltaGetters);
			setOrigin(svg, points[0]);
		}
	},
	*polygon (svg, points, deltaGetters, frames, duration, interval) {
		while (frames-- > 0) {
			points = yield points;
			points = applyDeltas(points, deltaGetters);
			setAttr(svg, 'points', points);
		}
	}
};

export const animate = (svg, deltaGetters, duration, interval = 10) => {

	const frames = duration / interval;

	deltaGetters = deltaGetters.map(getter => getter(svg)(duration, interval));

	let points = isPolygon(svg) ? getPoints(svg) : [ getOrigin(svg) ];

	const iterator = isPolygon(svg) ? iterators.polygon : iterators.standard;
	const iter = iterator(svg, points, deltaGetters, frames, duration, interval);

	return new Promise((resolve, reject) => {

		const id = setInterval(() => {

			const next = iter.next(points);

			if (next.done) {
				return resolve(clearInterval(id));
			};
			points = next.value;

		}, interval);
	});
};

export const oscillate = (amplitude = [ 0, 0 ], cycles = [ 1, 1 ]) =>
	svg => function* (duration, interval) {

		const dims = isPolygon(svg) ? getSides(svg) : 1;
		const frames = duration / interval;
		const framesPerCycle = frames / cycles;
		const thetaDelta = 2 * PI / framesPerCycle;

		let i = -1;
		while (++i < frames) {
			for (let j = 0; j < dims; j++) {
				yield [
					amplitude[0] * (sin((i + 1) * thetaDelta) - sin(i * thetaDelta)),
					amplitude[1] * (-cos((i + 1) * thetaDelta) + cos(i * thetaDelta))
				];
			}
		}
	};

const oscill = (range, cycles, fn) => () => {

	const [ first, second ] = range;

	let diff = 0;
	let sign = 1;

	if (first < 0) {
		diff = second - first
		sign = -1;
	} else if (first > 0) {
		diff = first - second;
	} else {
		if (second < 0) {
			diff = -1 * second;
			sign = -1;
		} else if (second > 0) {
			diff = second;
		}
	}
	//const framesPerCycle = frames / cycles;
	//const absDelta = diff / framesPerCycle;

	let i = -1;
	let k = diff - abs(first);

	return { k, diff, sign, cycles };
	while (++i < frames) {

		if (x++ % diff == 0 && i != 0) {
			sign *= -1;
		}
		const delta = sign * absDelta;
		yield delta
	}
};

export const translate = ([ x, y ], fn = LINEAR) => svg => {
	
	const frameDelta = (i, [ x, y ], t) => [
		x * (sin((i + 1) * t) - sin(i * t)),
		y * (sin((i + 1) * t) - sin(i * t))
	];
	const dims = isPolygon(svg) ? getSides(svg) : 1;

	const gen = {
		linear: {
			*standard (duration, interval) {
				const frames = duration / interval;
				const framesPerCycle = frames / cycles;

				if (typeof x == 'function') {
					const { k, diff, sign, cycles } = x();
					const absDelta = diff / framesPerCycle;

					let i = -1;
					while (++i < frames) {

						if (k++ % diff == 0 && i != 0) {
							sign *= -1;
						}
						const delta = sign * absDelta;
						yield delta
					}
				} else {
					const delta = pointQuot([ x, y ], frames);

					let i = -1;
					while (++i < frames) {
						yield delta;
					}
				}
			},
			*polygon (duration, interval) {
				const frames = duration / interval;
				const delta = pointQuot([ x, y ], frames);

				let i = -1;
				while (++i < frames) {
					for (let j = 0; j < dims; j++) {
						yield delta;
					}
				}
			}
		},
		sin: {
			*standard (duration, interval) {
				const frames = duration / interval;
				const thetaDelta = PI / (2 * frames);

				let i = -1;
				while (++i < frames) {
					yield frameDelta(i, [ x, y ], thetaDelta);
				}
			},
			*polygon (duration, interval) {
				const frames = duration / interval;
				const thetaDelta = PI / (2 * frames);

				let i = -1;
				while (++i < frames) {
					for (let j = 0; j < dims; j++) {
						yield frameDelta(i, [ x, y ], thetaDelta);
					}
				}
			}
		}
	};
	return isPolygon(svg) ? gen[fn].polygon : gen[fn].standard;
};

export const rotate = theta => svg => function* (duration, interval) {

	const points = isPolygon(svg) ? getPoints(svg) : [ getOrigin(svg) ];
	const dims = points.length;
	const centroid = isPolygon(svg) ? getCentroid(svg) : getOrigin(svg);
	const frames = duration / interval;
	const delta = theta / frames;

	let i = -1;
	while (++i < frames) {
		for (let j = 0; j < dims; j++) {
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
