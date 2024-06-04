/* eslint-disable prettier/prettier */
export function convertToUTC(date: Date) {
    return new Date(date.toUTCString())
}