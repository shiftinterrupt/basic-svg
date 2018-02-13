const R = require('ramda');

import {
	PI,
	ORIENT_RADIUS,
	ORIENT_APOTHEM,
	TRIANGLE,
	SQUARE,
	PENTAGON,
	HEXAGON,
	SEPTAGON,
	OCTAGON
} from './constants';

export const polygonSides = {
	[TRIANGLE]: 3,
	[SQUARE]: 4,
	[PENTAGON]: 5,
	[HEXAGON]: 6,
	[SEPTAGON]: 7,
	[OCTAGON]: 8
};

const { sin, cos, tan, asin, acos, atan, sqrt } = Math;

export const exteriorAngle = sides => (2 * PI) / sides;
export const interiorAngle = sides => PI - exteriorAngle(sides);

export const getTheta = ([ x, y ]) => {
	if (x == 0) {
		return (y > 0) ? PI / 2 : (3 * PI) / 2;
	} else if (y == 0) {
		return (x > 0) ? 0 : PI;
	} else if (x < 0) {
		return PI + atan(y / x);
	} else {
		return (y > 0) ? atan(y / x) : 2 * PI + atan(y / x);
	}
};

/**
 * sin(theta) == (side / 2) / radius;
 * cos(theta) == apothem / radius;
 * tan(theta) == (side / 2) / apothem;
 */
const derivers = {
	radius: (theta, { side, apothem }) => side ?
		side / (2 * sin(theta)) : apothem / cos(theta),
	side: (theta, { radius, apothem }) => radius ?
		2 * radius * sin(theta) : 2 * apothem * tan(theta),
	apothem: (theta, { radius, side }) => radius ?
		radius * cos(theta) : side / (2 * tan(theta))
};

const makeDeriver = (theta, def) => prop => derivers[prop].call(null, theta, def);

export const getPoints = o => o.points;
export const getSides = o => 'points' in o ? o.points.length : 0;

export const RegularPolygon = ({
	sides,
	origin,
	radius,
	side,
	apothem,
	orient
}) => {
	
	sides = sides || 3;
	origin = origin || [ 0, 0 ];
	orient = orient || ORIENT_RADIUS;

	const theta = exteriorAngle(sides) / 2;
	const derive = makeDeriver(theta, { radius, side, apothem });

	let rotate = orient;
	
	if (orient === ORIENT_RADIUS) {
		rotate = 0;
	} else if (orient === ORIENT_APOTHEM) {
		rotate = theta;
	}

	radius = radius || derive('radius');

	return Polygon(R.range(0, sides).map(i => [
		origin[0] + radius * cos((i * 2 * theta) + rotate),
		origin[1] + radius * sin((i * 2 * theta) + rotate)
	]));
};

export const Polygon = points => ({
	points
});

const nextPoint = (i, points) => points[i + 1] || points[0];

export const getArea = poly => (1 / 2) * getPoints(poly).reduce((dblArea, [ x, y ], i, points) => {

	const [ x1, y1 ] = nextPoint(i, points);

	return dblArea + x * y1 - x1 * y;

}, 0);

export const getCentroid = poly => {

	const areaK = 1 / (6 * getArea(poly));
	const points = getPoints(poly);

	const nextX = ([ x, y ], [ x1, y1 ]) => (x + x1) * (x * y1 - x1 * y);
	const nextY = ([ x, y ], [ x1, y1 ]) => (y + y1) * (x * y1 - x1 * y);

	const makeSummer = fn => (sum, [ x, y ], i, points) => sum + fn([ x, y ], nextPoint(i, points));

	return [
		areaK * points.reduce(makeSummer(nextX), 0),
		areaK * points.reduce(makeSummer(nextY), 0)
	];
};
