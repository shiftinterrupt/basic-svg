const { keys, assoc } = require('ramda');
import { localName, isRect, isCircle, isPolygon } from './utils';
import { resetOrigin, pointsFromStr } from './polygon';

import {
	NS,
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
	RegularPolygon,
	polygonSides,
	getPoints as getPolygonPoints
} from './polygon';

import { element, createElement, stringifyPoints } from './utils';

export const append = (svg, el) => {
	svg.append(el);
	return el;
};

export const createAndAppend = (svg, def) => Array.isArray(def) ?
	def.map(row => append(svg, create(row))) :
	append(svg, create(def));

export const setAttr = (el, key, val) => el.setAttribute(key, val);
export const getAttr = (el, key) => el.getAttribute(key);

export const setOrigin = (el, [ x, y ]) => {

	switch(localName(el)) {
		case CIRCLE:
			setAttr(el, 'cx', x);
			setAttr(el, 'cy', y);
			return el;

		case RECT:
			setAttr(el, 'x', x);
			setAttr(el, 'y', y);
			return el;

		case POLYGON:
			setAttr(el, 'points', resetOrigin(
				pointsFromStr(getAttr(el, 'points')), [ x, y ])
			);
			return el;
	}
};

export const create = def => {

	const { type } = def;

	if (typeof type == 'string') {
		let el;

		switch(type) {
			case RECT:
				el = createElement(NS, type);

				if (Array.isArray(def.origin)) {
					setOrigin(el, def.origin);
				}
				if (typeof def.width == 'number') {
					setAttr(el, 'width', def.width);
				}
				if (typeof def.height == 'number') {
					setAttr(el, 'height', def.height);
				}
				if (def.styles instanceof Object) {
					for (const key in def.styles) {
						el.style[key] = def.styles[key];
					}
				}
				return el;

			case CIRCLE:
				el = createElement(NS, type);

				if (Array.isArray(def.origin)) {
					setOrigin(el, def.origin);
				}
				if (typeof def.radius == 'number') {
					setAttr(el, 'r', def.radius);
				}
				if (def.styles instanceof Object) {
					for (const key in def.styles) {
						el.style[key] = def.styles[key];
					}
				}
				return el;

			case TRIANGLE:
			case SQUARE:
			case PENTAGON:
			case HEXAGON:
			case SEPTAGON:
			case OCTAGON:
				el = createElement(NS, 'polygon');

				const points = RegularPolygon(
					assoc('sides', polygonSides[type], def)
				);
				el.setAttribute('points', stringifyPoints(points));

				if (def.styles instanceof Object) {
					for (const key in def.styles) {
						el.style[key] = def.styles[key];
					}
				}
				return el;
		}
	} else if (typeof type == 'object') {

	} else if (Array.isArray(type)) {

	}
};
