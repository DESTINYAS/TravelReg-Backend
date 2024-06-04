// duration-calculator.ts

export function calculateDurationInMinutes(departureDateTime: Date, arrivalDateTime: Date): number {
    if (!departureDateTime || !arrivalDateTime) {
      throw new Error('Departure or arrival datetime is missing');
    }
  
    const diffInMilliseconds = arrivalDateTime.getTime() - departureDateTime.getTime();
    const diffInMinutes = Math.round(diffInMilliseconds / (1000 * 60)); // Convert milliseconds to minutes
    return diffInMinutes;
  }
  