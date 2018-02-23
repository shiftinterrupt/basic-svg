const { prop, compose, curry, equals } = require('ramda');

import { RECT, CIRCLE, POLYGON } from './constants';
import {
	getPoints as getPolygonPoints,
	getSides as getPolygonSides,
	getCentroid as getPolygonCentroid
} from './polygon';

const join = char => o => o.join(char);
export const stringifyPoint = join(',');
export const stringifyPoints = arr => join(' ')(arr.map(stringifyPoint));
export const createElement = (ns, name) => document.createElementNS(ns, name);
export const element = prop(['el']);

export const localName = el => {
	const parts = el.localName.split(':');
	return parts[parts.length - 1];
}
export const attr = (el, attr) => el.getAttribute(attr);
export const data = prop(['data']);
export const getPoints = compose(getPolygonPoints, data);
export const getSides = compose(getPolygonSides, data);
export const getCentroid = compose(getPolygonCentroid, data);

export const isShape = shape => compose(equals(shape), localName);
export const isRect = isShape(RECT);
export const isCircle = isShape(CIRCLE);
export const isPolygon = isShape(POLYGON);

const int = v => parseInt(v, 10);

export const getOrigin = svg => {
	
	switch(localName(svg)) {
		case CIRCLE:
			return [ int(attr(svg,'cx')), int(attr(svg,'cy')) ];

		case RECT:
			return [ int(attr(svg,'x')), int(attr(svg,'y')) ];

		case POLYGON:
			return getCentroid(svg);
	}
}

