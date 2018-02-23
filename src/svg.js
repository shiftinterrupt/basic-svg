import { NS, SVG } from './constants';
import BasicSvg from './BasicSvg';
import { element, createElement } from './utils';

const Svg = selector => {
	
	const parentEl = document.querySelector(selector);
	const svg = createElement(NS, SVG);

	parentEl.append(svg);
	
	return svg;
};

export default Svg;
