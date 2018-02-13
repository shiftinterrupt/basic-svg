const { sqrt } = Math;

// Returns the difference between two points
export const pointDiff = ([ x1, y1 ], [ x2, y2 ]) => [ x2 - x1, y2 - y1 ];

// Returns true if two points are equal
export const pointEqual = ([ x1, y1 ], [ x2, y2 ]) => x1 == x2 && y1 == y2;

// Returns the point after taking the quotient of each component and a scalar value
export const pointQuot = ([ x, y ], k) => [ x / k, y / k ];

// Returns the sum of all points passed in
export const pointSum = (...points) => points.reduce(
	([ sumX, sumY ], [ dX, dY ]) => [ sumX + dX, sumY + dY ]
);

// Returns the distance between two points
export const segmentLength = ([ x1, y1 ], [ x2, y2 ]) => sqrt((x2 - x1)**2 + (y2 - y1)**2);
