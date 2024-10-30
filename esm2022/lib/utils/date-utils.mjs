export const LIMIT_TIMES = {
    minHour: 0,
    maxHour: 24,
    minMinute: 0,
    maxMinute: 60,
    minSecond: 0,
    maxSecond: 60,
    meridian: 12,
};
export const MERIDIANS = {
    AM: 'AM',
    PM: 'PM',
};
export const DEFAULT_STEP = 1;
export const NUMERIC_REGEX = /[^0-9]/g;
export const PATTERN_INPUT_HOUR = /^(2[0-3]|[0-1][0-9]|[0-9])$/;
export const PATTERN_INPUT_MINUTE = /^([0-5][0-9]|[0-9])$/;
export const PATTERN_INPUT_SECOND = /^([0-5][0-9]|[0-9])$/;
export function formatTwoDigitTimeValue(val) {
    const txt = val.toString();
    return txt.length > 1 ? txt : `0${txt}`;
}
export function createMissingDateImplError(provider) {
    return Error(`NgxMatDatetimePicker: No provider found for ${provider}. You must import one of the following ` +
        `modules at your application root: NgxMatNativeDateModule, NgxMatMomentModule, or provide a ` +
        `custom implementation.`);
}
/** Formats a range of years. */
export function formatYearRange(start, end) {
    return `${start} \u2013 ${end}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2RhdGV0aW1lLXBpY2tlci9zcmMvbGliL3V0aWxzL2RhdGUtdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHO0lBQ3pCLE9BQU8sRUFBRSxDQUFDO0lBQ1YsT0FBTyxFQUFFLEVBQUU7SUFDWCxTQUFTLEVBQUUsQ0FBQztJQUNaLFNBQVMsRUFBRSxFQUFFO0lBQ2IsU0FBUyxFQUFFLENBQUM7SUFDWixTQUFTLEVBQUUsRUFBRTtJQUNiLFFBQVEsRUFBRSxFQUFFO0NBQ2IsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRztJQUN2QixFQUFFLEVBQUUsSUFBSTtJQUNSLEVBQUUsRUFBRSxJQUFJO0NBQ1QsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDOUIsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQztBQUV2QyxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyw2QkFBNkIsQ0FBQztBQUNoRSxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxzQkFBc0IsQ0FBQztBQUMzRCxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxzQkFBc0IsQ0FBQztBQUUzRCxNQUFNLFVBQVUsdUJBQXVCLENBQUMsR0FBVztJQUNqRCxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0IsT0FBTyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzFDLENBQUM7QUFFRCxNQUFNLFVBQVUsMEJBQTBCLENBQUMsUUFBZ0I7SUFDekQsT0FBTyxLQUFLLENBQ1YsK0NBQStDLFFBQVEseUNBQXlDO1FBQzlGLDZGQUE2RjtRQUM3Rix3QkFBd0IsQ0FDM0IsQ0FBQztBQUNKLENBQUM7QUFFRCxnQ0FBZ0M7QUFDaEMsTUFBTSxVQUFVLGVBQWUsQ0FBQyxLQUFhLEVBQUUsR0FBVztJQUN4RCxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgTElNSVRfVElNRVMgPSB7XHJcbiAgbWluSG91cjogMCxcclxuICBtYXhIb3VyOiAyNCxcclxuICBtaW5NaW51dGU6IDAsXHJcbiAgbWF4TWludXRlOiA2MCxcclxuICBtaW5TZWNvbmQ6IDAsXHJcbiAgbWF4U2Vjb25kOiA2MCxcclxuICBtZXJpZGlhbjogMTIsXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgTUVSSURJQU5TID0ge1xyXG4gIEFNOiAnQU0nLFxyXG4gIFBNOiAnUE0nLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU1RFUCA9IDE7XHJcbmV4cG9ydCBjb25zdCBOVU1FUklDX1JFR0VYID0gL1teMC05XS9nO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBBVFRFUk5fSU5QVVRfSE9VUiA9IC9eKDJbMC0zXXxbMC0xXVswLTldfFswLTldKSQvO1xyXG5leHBvcnQgY29uc3QgUEFUVEVSTl9JTlBVVF9NSU5VVEUgPSAvXihbMC01XVswLTldfFswLTldKSQvO1xyXG5leHBvcnQgY29uc3QgUEFUVEVSTl9JTlBVVF9TRUNPTkQgPSAvXihbMC01XVswLTldfFswLTldKSQvO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFR3b0RpZ2l0VGltZVZhbHVlKHZhbDogbnVtYmVyKSB7XHJcbiAgY29uc3QgdHh0ID0gdmFsLnRvU3RyaW5nKCk7XHJcbiAgcmV0dXJuIHR4dC5sZW5ndGggPiAxID8gdHh0IDogYDAke3R4dH1gO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IocHJvdmlkZXI6IHN0cmluZykge1xyXG4gIHJldHVybiBFcnJvcihcclxuICAgIGBOZ3hNYXREYXRldGltZVBpY2tlcjogTm8gcHJvdmlkZXIgZm91bmQgZm9yICR7cHJvdmlkZXJ9LiBZb3UgbXVzdCBpbXBvcnQgb25lIG9mIHRoZSBmb2xsb3dpbmcgYCArXHJcbiAgICAgIGBtb2R1bGVzIGF0IHlvdXIgYXBwbGljYXRpb24gcm9vdDogTmd4TWF0TmF0aXZlRGF0ZU1vZHVsZSwgTmd4TWF0TW9tZW50TW9kdWxlLCBvciBwcm92aWRlIGEgYCArXHJcbiAgICAgIGBjdXN0b20gaW1wbGVtZW50YXRpb24uYCxcclxuICApO1xyXG59XHJcblxyXG4vKiogRm9ybWF0cyBhIHJhbmdlIG9mIHllYXJzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0WWVhclJhbmdlKHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gYCR7c3RhcnR9IFxcdTIwMTMgJHtlbmR9YDtcclxufVxyXG4iXX0=