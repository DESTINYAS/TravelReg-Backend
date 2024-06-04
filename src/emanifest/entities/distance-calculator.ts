
import * as geolib from 'geolib'; // Import geolib library

export function calculateDistance(start: any, end: any): number {
  if (!start || !end) {
    console.log('Start or end point is missing');
    return null;
  }

  const isValidCoordinate = (coordinate: any) => {
    return (
      typeof coordinate === 'object' &&
      typeof coordinate.latitude === 'number' &&
      typeof coordinate.longitude === 'number'
    );
  };

  if (!isValidCoordinate(start) || !isValidCoordinate(end)) {
    // throw new Error('Invalid coordinates');
    console.log('Start or end point is missing');
    return null;
  }

  const distance = geolib.getDistance(start, end);
  return distance / 1000; // Convert meters to kilometers
}
