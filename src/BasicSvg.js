const { keys, assoc } = require('ramda');
import { localName, isRect, isCircle, isPolygon } from './utils';

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

export default class BasicSvg {

	constructor(name) {
		this.el = createElement(NS, name);
	}

	attr(key, val) {
		if (val === undefined) {
			return element(this).getAttribute(key);
		}
		element(this).setAttribute(key, val);
		return this;
	}

	attrs(obj) {
		if (obj) {
			keys(obj).map(key => this.attr(key, obj[key]));
			return this;
		}

		const attrsObj = {};
		const attrs = element(this).attributes;

		for (let i = 0, numAttrs = attrs.length, attr; i < numAttrs; i++) {
			attr = attrs[i];
			attrsObj[ attr.nodeName ] = attr.nodeValue;
		}

		return attrsObj;
	}

	style(key, val) {
		element(this).style[key] = val;
		return this;
	}

	styles(obj) {
		keys(obj).map(key => this.style(key, obj[key]));
		return this;
	}

	points(points) {

		this.data.points = points;
		element(this).setAttribute('points', stringifyPoints(points));

		return this;
	}

	origin(point) {
		if (isRect(this)) {
			if (point === undefined) {
				return [ this.attr('x'), this.attr('y') ];
			}
			return this.attrs({ x: point[0], y: point[1] });

		} else if (isCircle(this)) {
			if (point === undefined) {
				return [ this.attr('cx'), this.attr('cy') ];
			}
			return this.attrs({ cx: point[0], cy: point[1] });

		} else if (isPolygon(this)) {
			// Todo
			return this;
		}
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
					svgObj.data = def;
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
						assoc('sides', polygonSides[sub], def)
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
