const R = require('ramda');

import {
	getPoints as getPolygonPoints,
	getSides as getPolygonSides,
	getCentroid as getPolygonCentroid
} from './polygon';

const join = char => o => o.join(char);
export const stringifyPoint = join(',');
export const stringifyPoints = arr => join(' ')(arr.map(stringifyPoint));
export const createElement = (ns, name) => document.createElementNS(ns, name);
export const element = R.prop(['el']);

export const localName = el => {
	const parts = el.localName.split(':');
	return parts[parts.length - 1];
}
export const attr = (svg, attr) => element(svg).getAttribute(attr);
export const data = R.prop(['data']);
export const getPoints = R.compose(getPolygonPoints, data);
export const getSides = R.compose(getPolygonSides, data);
export const getCentroid = R.compose(getPolygonCentroid, data);

export const getOrigin = svg => {
	
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

