const R = require('ramda');

import { SVG } from './constants';
import BasicSvg from './BasicSvg';
import { element } from './utils';

const Svg = selector => {
	
	const parentEl = document.querySelector(selector);
	const svg = new BasicSvg(SVG);

	parentEl.append(element(svg));
	
	return svg;
};

export default Svg;
