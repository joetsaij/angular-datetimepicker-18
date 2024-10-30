import { Inject, Injectable, Optional } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { NgxMatDateAdapter } from './date-adapter';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
// TODO(mmalerba): Remove when we no longer support safari 9.
/** Whether the browser supports the Intl API. */
let SUPPORTS_INTL_API;
// We need a try/catch around the reference to `Intl`, because accessing it in some cases can
// cause IE to throw. These cases are tied to particular versions of Windows and can happen if
// the consumer is providing a polyfilled `Map`. See:
// https://github.com/Microsoft/ChakraCore/issues/3189
// https://github.com/angular/components/issues/15687
try {
    SUPPORTS_INTL_API = typeof Intl != 'undefined';
}
catch {
    SUPPORTS_INTL_API = false;
}
/** The default month names to use if Intl API is not available. */
const DEFAULT_MONTH_NAMES = {
    long: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],
    short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
};
/** The default date names to use if Intl API is not available. */
const DEFAULT_DATE_NAMES = range(31, (i) => String(i + 1));
/** The default day of the week names to use if Intl API is not available. */
const DEFAULT_DAY_OF_WEEK_NAMES = {
    long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
};
/**
 * Matches strings that have the form of a valid RFC 3339 string
 * (https://tools.ietf.org/html/rfc3339). Note that the string may not actually be a valid date
 * because the regex will match strings an with out of bounds month, date, etc.
 */
const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:(?:\+|-)\d{2}:\d{2}))?)?$/;
/** Creates an array and fills it with values. */
function range(length, valueFunction) {
    const valuesArray = Array(length);
    for (let i = 0; i < length; i++) {
        valuesArray[i] = valueFunction(i);
    }
    return valuesArray;
}
/** Adapts the native JS Date for use with cdk-based components that work with dates. */
export class NgxMatNativeDateAdapter extends NgxMatDateAdapter {
    constructor(matDateLocale, platform) {
        super();
        /**
         * Whether to use `timeZone: 'utc'` with `Intl.DateTimeFormat` when formatting dates.
         * Without this `Intl.DateTimeFormat` sometimes chooses the wrong timeZone, which can throw off
         * the result. (e.g. in the en-US locale `new Date(1800, 7, 14).toLocaleDateString()`
         * will produce `'8/13/1800'`.
         *
         * TODO(mmalerba): drop this variable. It's not being used in the code right now. We're now
         * getting the string representation of a Date object from its utc representation. We're keeping
         * it here for sometime, just for precaution, in case we decide to revert some of these changes
         * though.
         */
        this.useUtcForDisplay = true;
        super.setLocale(matDateLocale);
        // IE does its own time zone correction, so we disable this on IE.
        this.useUtcForDisplay = !platform.TRIDENT;
        this._clampDate = platform.TRIDENT || platform.EDGE;
    }
    getYear(date) {
        return date.getFullYear();
    }
    getMonth(date) {
        return date.getMonth();
    }
    getDate(date) {
        return date.getDate();
    }
    getDayOfWeek(date) {
        return date.getDay();
    }
    getMonthNames(style) {
        if (SUPPORTS_INTL_API) {
            const dtf = new Intl.DateTimeFormat(this.locale, {
                month: style,
                timeZone: 'utc',
            });
            return range(12, (i) => this._stripDirectionalityCharacters(this._format(dtf, new Date(2017, i, 1))));
        }
        return DEFAULT_MONTH_NAMES[style];
    }
    getDateNames() {
        if (SUPPORTS_INTL_API) {
            const dtf = new Intl.DateTimeFormat(this.locale, {
                day: 'numeric',
                timeZone: 'utc',
            });
            return range(31, (i) => this._stripDirectionalityCharacters(this._format(dtf, new Date(2017, 0, i + 1))));
        }
        return DEFAULT_DATE_NAMES;
    }
    getDayOfWeekNames(style) {
        if (SUPPORTS_INTL_API) {
            const dtf = new Intl.DateTimeFormat(this.locale, {
                weekday: style,
                timeZone: 'utc',
            });
            return range(7, (i) => this._stripDirectionalityCharacters(this._format(dtf, new Date(2017, 0, i + 1))));
        }
        return DEFAULT_DAY_OF_WEEK_NAMES[style];
    }
    getYearName(date) {
        if (SUPPORTS_INTL_API) {
            const dtf = new Intl.DateTimeFormat(this.locale, {
                year: 'numeric',
                timeZone: 'utc',
            });
            return this._stripDirectionalityCharacters(this._format(dtf, date));
        }
        return String(this.getYear(date));
    }
    getFirstDayOfWeek() {
        // We can't tell using native JS Date what the first day of the week is, we default to Sunday.
        return 0;
    }
    getNumDaysInMonth(date) {
        return this.getDate(this._createDateWithOverflow(this.getYear(date), this.getMonth(date) + 1, 0));
    }
    clone(date) {
        return new Date(date.getTime());
    }
    createDate(year, month, date) {
        // Check for invalid month and date (except upper bound on date which we have to check after
        // creating the Date).
        if (month < 0 || month > 11) {
            throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
        }
        if (date < 1) {
            throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
        }
        let result = this._createDateWithOverflow(year, month, date);
        // Check that the date wasn't above the upper bound for the month, causing the month to overflow
        if (result.getMonth() != month) {
            throw Error(`Invalid date "${date}" for month with index "${month}".`);
        }
        return result;
    }
    today() {
        return new Date();
    }
    parse(value) {
        // We have no way using the native JS Date to set the parse format or locale, so we ignore these
        // parameters.
        if (typeof value == 'number') {
            return new Date(value);
        }
        return value ? new Date(Date.parse(value)) : null;
    }
    format(date, displayFormat) {
        if (!this.isValid(date)) {
            throw Error('NativeDateAdapter: Cannot format invalid date.');
        }
        if (SUPPORTS_INTL_API) {
            // On IE and Edge the i18n API will throw a hard error that can crash the entire app
            // if we attempt to format a date whose year is less than 1 or greater than 9999.
            if (this._clampDate && (date.getFullYear() < 1 || date.getFullYear() > 9999)) {
                date = this.clone(date);
                date.setFullYear(Math.max(1, Math.min(9999, date.getFullYear())));
            }
            displayFormat = { ...displayFormat, timeZone: 'utc' };
            const dtf = new Intl.DateTimeFormat(this.locale, displayFormat);
            return this._stripDirectionalityCharacters(this._format(dtf, date));
        }
        return this._stripDirectionalityCharacters(date.toDateString());
    }
    addCalendarYears(date, years) {
        return this.addCalendarMonths(date, years * 12);
    }
    addCalendarMonths(date, months) {
        let newDate = this._createDateWithOverflow(this.getYear(date), this.getMonth(date) + months, this.getDate(date));
        // It's possible to wind up in the wrong month if the original month has more days than the new
        // month. In this case we want to go to the last day of the desired month.
        // Note: the additional + 12 % 12 ensures we end up with a positive number, since JS % doesn't
        // guarantee this.
        if (this.getMonth(newDate) != (((this.getMonth(date) + months) % 12) + 12) % 12) {
            newDate = this._createDateWithOverflow(this.getYear(newDate), this.getMonth(newDate), 0);
        }
        return newDate;
    }
    addCalendarDays(date, days) {
        return this._createDateWithOverflow(this.getYear(date), this.getMonth(date), this.getDate(date) + days);
    }
    toIso8601(date) {
        return [
            date.getUTCFullYear(),
            this._2digit(date.getUTCMonth() + 1),
            this._2digit(date.getUTCDate()),
        ].join('-');
    }
    /**
     * Returns the given value if given a valid Date or null. Deserializes valid ISO 8601 strings
     * (https://www.ietf.org/rfc/rfc3339.txt) into valid Dates and empty string into null. Returns an
     * invalid date for all other values.
     */
    deserialize(value) {
        if (typeof value === 'string') {
            if (!value) {
                return null;
            }
            // The `Date` constructor accepts formats other than ISO 8601, so we need to make sure the
            // string is the right format first.
            if (ISO_8601_REGEX.test(value)) {
                let date = new Date(value);
                if (this.isValid(date)) {
                    return date;
                }
            }
        }
        return super.deserialize(value);
    }
    isDateInstance(obj) {
        return obj instanceof Date;
    }
    isValid(date) {
        return !isNaN(date.getTime());
    }
    invalid() {
        return new Date(NaN);
    }
    getHour(date) {
        return date.getHours();
    }
    getMinute(date) {
        return date.getMinutes();
    }
    getSecond(date) {
        return date.getSeconds();
    }
    setHour(date, value) {
        date.setHours(value);
    }
    setMinute(date, value) {
        date.setMinutes(value);
    }
    setSecond(date, value) {
        date.setSeconds(value);
    }
    /** Creates a date but allows the month and date to overflow. */
    _createDateWithOverflow(year, month, date) {
        const result = new Date(year, month, date);
        // We need to correct for the fact that JS native Date treats years in range [0, 99] as
        // abbreviations for 19xx.
        if (year >= 0 && year < 100) {
            result.setFullYear(this.getYear(result) - 1900);
        }
        return result;
    }
    /**
     * Pads a number to make it two digits.
     * @param n The number to pad.
     * @returns The padded number.
     */
    _2digit(n) {
        return ('00' + n).slice(-2);
    }
    /**
     * Strip out unicode LTR and RTL characters. Edge and IE insert these into formatted dates while
     * other browsers do not. We remove them to make output consistent and because they interfere with
     * date parsing.
     * @param str The string to strip direction characters from.
     * @returns The stripped string.
     */
    _stripDirectionalityCharacters(str) {
        return str.replace(/[\u200e\u200f]/g, '');
    }
    /**
     * When converting Date object to string, javascript built-in functions may return wrong
     * results because it applies its internal DST rules. The DST rules around the world change
     * very frequently, and the current valid rule is not always valid in previous years though.
     * We work around this problem building a new Date object which has its internal UTC
     * representation with the local date and time.
     * @param dtf Intl.DateTimeFormat object, containg the desired string format. It must have
     *    timeZone set to 'utc' to work fine.
     * @param date Date from which we want to get the string representation according to dtf
     * @returns A Date object with its UTC representation based on the passed in date info
     */
    _format(dtf, date) {
        // Passing the year to the constructor causes year numbers <100 to be converted to 19xx.
        // To work around this we use `setUTCFullYear` and `setUTCHours` instead.
        const d = new Date();
        d.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        d.setUTCHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
        return dtf.format(d);
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatNativeDateAdapter, deps: [{ token: MAT_DATE_LOCALE, optional: true }, { token: i1.Platform }], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatNativeDateAdapter }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatNativeDateAdapter, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_DATE_LOCALE]
                }] }, { type: i1.Platform }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlLWRhdGUtYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2RhdGV0aW1lLXBpY2tlci9zcmMvbGliL2NvcmUvbmF0aXZlLWRhdGUtYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDN0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7QUFFbkQsNkRBQTZEO0FBQzdELGlEQUFpRDtBQUNqRCxJQUFJLGlCQUEwQixDQUFDO0FBRS9CLDZGQUE2RjtBQUM3Riw4RkFBOEY7QUFDOUYscURBQXFEO0FBQ3JELHNEQUFzRDtBQUN0RCxxREFBcUQ7QUFDckQsSUFBSSxDQUFDO0lBQ0gsaUJBQWlCLEdBQUcsT0FBTyxJQUFJLElBQUksV0FBVyxDQUFDO0FBQ2pELENBQUM7QUFBQyxNQUFNLENBQUM7SUFDUCxpQkFBaUIsR0FBRyxLQUFLLENBQUM7QUFDNUIsQ0FBQztBQUVELG1FQUFtRTtBQUNuRSxNQUFNLG1CQUFtQixHQUFHO0lBQzFCLElBQUksRUFBRTtRQUNKLFNBQVM7UUFDVCxVQUFVO1FBQ1YsT0FBTztRQUNQLE9BQU87UUFDUCxLQUFLO1FBQ0wsTUFBTTtRQUNOLE1BQU07UUFDTixRQUFRO1FBQ1IsV0FBVztRQUNYLFNBQVM7UUFDVCxVQUFVO1FBQ1YsVUFBVTtLQUNYO0lBQ0QsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7SUFDM0YsTUFBTSxFQUFFLENBQUMs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QUFDLENBQUM7SUFDdkIsQ0FBQztpSUEvU1UsdUJBQXVCLGtCQWlCRixlQUFlO3FJQWpCcEMsdUJBQXVCOzsyRkFBdkIsdUJBQXVCO2tCQURuQyxVQUFVOzswQkFrQkksUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGxhdGZvcm0gfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xyXG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUsIE9wdGlvbmFsIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE1BVF9EQVRFX0xPQ0FMRSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xyXG5pbXBvcnQgeyBOZ3hNYXREYXRlQWRhcHRlciB9IGZyb20gJy4vZGF0ZS1hZGFwdGVyJztcclxuXHJcbi8vIFRPRE8obW1hbGVyYmEpOiBSZW1vdmUgd2hlbiB3ZSBubyBsb25nZXIgc3VwcG9ydCBzYWZhcmkgOS5cclxuLyoqIFdoZXRoZXIgdGhlIGJyb3dzZXIgc3VwcG9ydHMgdGhlIEludGwgQVBJLiAqL1xyXG5sZXQgU1VQUE9SVFNfSU5UTF9BUEk6IGJvb2xlYW47XHJcblxyXG4vLyBXZSBuZWVkIGEgdHJ5L2NhdGNoIGFyb3VuZCB0aGUgcmVmZXJlbmNlIHRvIGBJbnRsYCwgYmVjYXVzZSBhY2Nlc3NpbmcgaXQgaW4gc29tZSBjYXNlcyBjYW5cclxuLy8gY2F1c2UgSUUgdG8gdGhyb3cuIFRoZXNlIGNhc2VzIGFyZSB0aWVkIHRvIHBhcnRpY3VsYXIgdmVyc2lvbnMgb2YgV2luZG93cyBhbmQgY2FuIGhhcHBlbiBpZlxyXG4vLyB0aGUgY29uc3VtZXIgaXMgcHJvdmlkaW5nIGEgcG9seWZpbGxlZCBgTWFwYC4gU2VlOlxyXG4vLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L0NoYWtyYUNvcmUvaXNzdWVzLzMxODlcclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9pc3N1ZXMvMTU2ODdcclxudHJ5IHtcclxuICBTVVBQT1JUU19JTlRMX0FQSSA9IHR5cGVvZiBJbnRsICE9ICd1bmRlZmluZWQnO1xyXG59IGNhdGNoIHtcclxuICBTVVBQT1JUU19JTlRMX0FQSSA9IGZhbHNlO1xyXG59XHJcblxyXG4vKiogVGhlIGRlZmF1bHQgbW9udGggbmFtZXMgdG8gdXNlIGlmIEludGwgQVBJIGlzIG5vdCBhdmFpbGFibGUuICovXHJcbmNvbnN0IERFRkFVTFRfTU9OVEhfTkFNRVMgPSB7XHJcbiAgbG9uZzogW1xyXG4gICAgJ0phbnVhcnknLFxyXG4gICAgJ0ZlYnJ1YXJ5JyxcclxuICAgICdNYXJjaCcsXHJcbiAgICAnQXByaWwnLFxyXG4gICAgJ01heScsXHJcbiAgICAnSnVuZScsXHJcbiAgICAnSnVseScsXHJcbiAgICAnQXVndXN0JyxcclxuICAgICdTZXB0ZW1iZXInLFxyXG4gICAgJ09jdG9iZXInLFxyXG4gICAgJ05vdmVtYmVyJyxcclxuICAgICdEZWNlbWJlcicsXHJcbiAgXSxcclxuICBzaG9ydDogWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddLFxyXG4gIG5hcnJvdzogWydKJywgJ0YnLCAnTScsICdBJywgJ00nLCAnSicsICdKJywgJ0EnLCAnUycsICdPJywgJ04nLCAnRCddLFxyXG59O1xyXG5cclxuLyoqIFRoZSBkZWZhdWx0IGRhdGUgbmFtZXMgdG8gdXNlIGlmIEludGwgQVBJIGlzIG5vdCBhdmFpbGFibGUuICovXHJcbmNvbnN0IERFRkFVTFRfREFURV9OQU1FUyA9IHJhbmdlKDMxLCAoaSkgPT4gU3RyaW5nKGkgKyAxKSk7XHJcblxyXG4vKiogVGhlIGRlZmF1bHQgZGF5IG9mIHRoZSB3ZWVrIG5hbWVzIHRvIHVzZSBpZiBJbnRsIEFQSSBpcyBub3QgYXZhaWxhYmxlLiAqL1xyXG5jb25zdCBERUZBVUxUX0RBWV9PRl9XRUVLX05BTUVTID0ge1xyXG4gIGxvbmc6IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXSxcclxuICBzaG9ydDogWydTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnXSxcclxuICBuYXJyb3c6IFsnUycsICdNJywgJ1QnLCAnVycsICdUJywgJ0YnLCAnUyddLFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1hdGNoZXMgc3RyaW5ncyB0aGF0IGhhdmUgdGhlIGZvcm0gb2YgYSB2YWxpZCBSRkMgMzMzOSBzdHJpbmdcclxuICogKGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzMzM5KS4gTm90ZSB0aGF0IHRoZSBzdHJpbmcgbWF5IG5vdCBhY3R1YWxseSBiZSBhIHZhbGlkIGRhdGVcclxuICogYmVjYXVzZSB0aGUgcmVnZXggd2lsbCBtYXRjaCBzdHJpbmdzIGFuIHdpdGggb3V0IG9mIGJvdW5kcyBtb250aCwgZGF0ZSwgZXRjLlxyXG4gKi9cclxuY29uc3QgSVNPXzg2MDFfUkVHRVggPVxyXG4gIC9eXFxkezR9LVxcZHsyfS1cXGR7Mn0oPzpUXFxkezJ9OlxcZHsyfTpcXGR7Mn0oPzpcXC5cXGQrKT8oPzpafCg/Oig/OlxcK3wtKVxcZHsyfTpcXGR7Mn0pKT8pPyQvO1xyXG5cclxuLyoqIENyZWF0ZXMgYW4gYXJyYXkgYW5kIGZpbGxzIGl0IHdpdGggdmFsdWVzLiAqL1xyXG5mdW5jdGlvbiByYW5nZTxUPihsZW5ndGg6IG51bWJlciwgdmFsdWVGdW5jdGlvbjogKGluZGV4OiBudW1iZXIpID0+IFQpOiBUW10ge1xyXG4gIGNvbnN0IHZhbHVlc0FycmF5ID0gQXJyYXkobGVuZ3RoKTtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YWx1ZXNBcnJheVtpXSA9IHZhbHVlRnVuY3Rpb24oaSk7XHJcbiAgfVxyXG4gIHJldHVybiB2YWx1ZXNBcnJheTtcclxufVxyXG5cclxuLyoqIEFkYXB0cyB0aGUgbmF0aXZlIEpTIERhdGUgZm9yIHVzZSB3aXRoIGNkay1iYXNlZCBjb21wb25lbnRzIHRoYXQgd29yayB3aXRoIGRhdGVzLiAqL1xyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBOZ3hNYXROYXRpdmVEYXRlQWRhcHRlciBleHRlbmRzIE5neE1hdERhdGVBZGFwdGVyPERhdGU+IHtcclxuICAvKiogV2hldGhlciB0byBjbGFtcCB0aGUgZGF0ZSBiZXR3ZWVuIDEgYW5kIDk5OTkgdG8gYXZvaWQgSUUgYW5kIEVkZ2UgZXJyb3JzLiAqL1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2NsYW1wRGF0ZTogYm9vbGVhbjtcclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0byB1c2UgYHRpbWVab25lOiAndXRjJ2Agd2l0aCBgSW50bC5EYXRlVGltZUZvcm1hdGAgd2hlbiBmb3JtYXR0aW5nIGRhdGVzLlxyXG4gICAqIFdpdGhvdXQgdGhpcyBgSW50bC5EYXRlVGltZUZvcm1hdGAgc29tZXRpbWVzIGNob29zZXMgdGhlIHdyb25nIHRpbWVab25lLCB3aGljaCBjYW4gdGhyb3cgb2ZmXHJcbiAgICogdGhlIHJlc3VsdC4gKGUuZy4gaW4gdGhlIGVuLVVTIGxvY2FsZSBgbmV3IERhdGUoMTgwMCwgNywgMTQpLnRvTG9jYWxlRGF0ZVN0cmluZygpYFxyXG4gICAqIHdpbGwgcHJvZHVjZSBgJzgvMTMvMTgwMCdgLlxyXG4gICAqXHJcbiAgICogVE9ETyhtbWFsZXJiYSk6IGRyb3AgdGhpcyB2YXJpYWJsZS4gSXQncyBub3QgYmVpbmcgdXNlZCBpbiB0aGUgY29kZSByaWdodCBub3cuIFdlJ3JlIG5vd1xyXG4gICAqIGdldHRpbmcgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIERhdGUgb2JqZWN0IGZyb20gaXRzIHV0YyByZXByZXNlbnRhdGlvbi4gV2UncmUga2VlcGluZ1xyXG4gICAqIGl0IGhlcmUgZm9yIHNvbWV0aW1lLCBqdXN0IGZvciBwcmVjYXV0aW9uLCBpbiBjYXNlIHdlIGRlY2lkZSB0byByZXZlcnQgc29tZSBvZiB0aGVzZSBjaGFuZ2VzXHJcbiAgICogdGhvdWdoLlxyXG4gICAqL1xyXG4gIHVzZVV0Y0ZvckRpc3BsYXk6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBASW5qZWN0KE1BVF9EQVRFX0xPQ0FMRSkgbWF0RGF0ZUxvY2FsZTogc3RyaW5nLCBwbGF0Zm9ybTogUGxhdGZvcm0pIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICBzdXBlci5zZXRMb2NhbGUobWF0RGF0ZUxvY2FsZSk7XHJcblxyXG4gICAgLy8gSUUgZG9lcyBpdHMgb3duIHRpbWUgem9uZSBjb3JyZWN0aW9uLCBzbyB3ZSBkaXNhYmxlIHRoaXMgb24gSUUuXHJcbiAgICB0aGlzLnVzZVV0Y0ZvckRpc3BsYXkgPSAhcGxhdGZvcm0uVFJJREVOVDtcclxuICAgIHRoaXMuX2NsYW1wRGF0ZSA9IHBsYXRmb3JtLlRSSURFTlQgfHwgcGxhdGZvcm0uRURHRTtcclxuICB9XHJcblxyXG4gIGdldFllYXIoZGF0ZTogRGF0ZSk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpO1xyXG4gIH1cclxuXHJcbiAgZ2V0TW9udGgoZGF0ZTogRGF0ZSk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gZGF0ZS5nZXRNb250aCgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0RGF0ZShkYXRlOiBEYXRlKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBkYXRlLmdldERhdGUoKTtcclxuICB9XHJcblxyXG4gIGdldERheU9mV2VlayhkYXRlOiBEYXRlKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBkYXRlLmdldERheSgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0TW9udGhOYW1lcyhzdHlsZTogJ2xvbmcnIHwgJ3Nob3J0JyB8ICduYXJyb3cnKTogc3RyaW5nW10ge1xyXG4gICAgaWYgKFNVUFBPUlRTX0lOVExfQVBJKSB7XHJcbiAgICAgIGNvbnN0IGR0ZiA9IG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KHRoaXMubG9jYWxlLCB7XHJcbiAgICAgICAgbW9udGg6IHN0eWxlLFxyXG4gICAgICAgIHRpbWVab25lOiAndXRjJyxcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiByYW5nZSgxMiwgKGkpID0+XHJcbiAgICAgICAgdGhpcy5fc3RyaXBEaXJlY3Rpb25hbGl0eUNoYXJhY3RlcnModGhpcy5fZm9ybWF0KGR0ZiwgbmV3IERhdGUoMjAxNywgaSwgMSkpKSxcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBERUZBVUxUX01PTlRIX05BTUVTW3N0eWxlXTtcclxuICB9XHJcblxyXG4gIGdldERhdGVOYW1lcygpOiBzdHJpbmdbXSB7XHJcbiAgICBpZiAoU1VQUE9SVFNfSU5UTF9BUEkpIHtcclxuICAgICAgY29uc3QgZHRmID0gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQodGhpcy5sb2NhbGUsIHtcclxuICAgICAgICBkYXk6ICdudW1lcmljJyxcclxuICAgICAgICB0aW1lWm9uZTogJ3V0YycsXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gcmFuZ2UoMzEsIChpKSA9PlxyXG4gICAgICAgIHRoaXMuX3N0cmlwRGlyZWN0aW9uYWxpdHlDaGFyYWN0ZXJzKHRoaXMuX2Zvcm1hdChkdGYsIG5ldyBEYXRlKDIwMTcsIDAsIGkgKyAxKSkpLFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIERFRkFVTFRfREFURV9OQU1FUztcclxuICB9XHJcblxyXG4gIGdldERheU9mV2Vla05hbWVzKHN0eWxlOiAnbG9uZycgfCAnc2hvcnQnIHwgJ25hcnJvdycpOiBzdHJpbmdbXSB7XHJcbiAgICBpZiAoU1VQUE9SVFNfSU5UTF9BUEkpIHtcclxuICAgICAgY29uc3QgZHRmID0gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQodGhpcy5sb2NhbGUsIHtcclxuICAgICAgICB3ZWVrZGF5OiBzdHlsZSxcclxuICAgICAgICB0aW1lWm9uZTogJ3V0YycsXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gcmFuZ2UoNywgKGkpID0+XHJcbiAgICAgICAgdGhpcy5fc3RyaXBEaXJlY3Rpb25hbGl0eUNoYXJhY3RlcnModGhpcy5fZm9ybWF0KGR0ZiwgbmV3IERhdGUoMjAxNywgMCwgaSArIDEpKSksXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gREVGQVVMVF9EQVlfT0ZfV0VFS19OQU1FU1tzdHlsZV07XHJcbiAgfVxyXG5cclxuICBnZXRZZWFyTmFtZShkYXRlOiBEYXRlKTogc3RyaW5nIHtcclxuICAgIGlmIChTVVBQT1JUU19JTlRMX0FQSSkge1xyXG4gICAgICBjb25zdCBkdGYgPSBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCh0aGlzLmxvY2FsZSwge1xyXG4gICAgICAgIHllYXI6ICdudW1lcmljJyxcclxuICAgICAgICB0aW1lWm9uZTogJ3V0YycsXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gdGhpcy5fc3RyaXBEaXJlY3Rpb25hbGl0eUNoYXJhY3RlcnModGhpcy5fZm9ybWF0KGR0ZiwgZGF0ZSkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFN0cmluZyh0aGlzLmdldFllYXIoZGF0ZSkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0Rmlyc3REYXlPZldlZWsoKTogbnVtYmVyIHtcclxuICAgIC8vIFdlIGNhbid0IHRlbGwgdXNpbmcgbmF0aXZlIEpTIERhdGUgd2hhdCB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrIGlzLCB3ZSBkZWZhdWx0IHRvIFN1bmRheS5cclxuICAgIHJldHVybiAwO1xyXG4gIH1cclxuXHJcbiAgZ2V0TnVtRGF5c0luTW9udGgoZGF0ZTogRGF0ZSk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXREYXRlKFxyXG4gICAgICB0aGlzLl9jcmVhdGVEYXRlV2l0aE92ZXJmbG93KHRoaXMuZ2V0WWVhcihkYXRlKSwgdGhpcy5nZXRNb250aChkYXRlKSArIDEsIDApLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGNsb25lKGRhdGU6IERhdGUpOiBEYXRlIHtcclxuICAgIHJldHVybiBuZXcgRGF0ZShkYXRlLmdldFRpbWUoKSk7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVEYXRlKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF0ZTogbnVtYmVyKTogRGF0ZSB7XHJcbiAgICAvLyBDaGVjayBmb3IgaW52YWxpZCBtb250aCBhbmQgZGF0ZSAoZXhjZXB0IHVwcGVyIGJvdW5kIG9uIGRhdGUgd2hpY2ggd2UgaGF2ZSB0byBjaGVjayBhZnRlclxyXG4gICAgLy8gY3JlYXRpbmcgdGhlIERhdGUpLlxyXG4gICAgaWYgKG1vbnRoIDwgMCB8fCBtb250aCA+IDExKSB7XHJcbiAgICAgIHRocm93IEVycm9yKGBJbnZhbGlkIG1vbnRoIGluZGV4IFwiJHttb250aH1cIi4gTW9udGggaW5kZXggaGFzIHRvIGJlIGJldHdlZW4gMCBhbmQgMTEuYCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRhdGUgPCAxKSB7XHJcbiAgICAgIHRocm93IEVycm9yKGBJbnZhbGlkIGRhdGUgXCIke2RhdGV9XCIuIERhdGUgaGFzIHRvIGJlIGdyZWF0ZXIgdGhhbiAwLmApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCByZXN1bHQgPSB0aGlzLl9jcmVhdGVEYXRlV2l0aE92ZXJmbG93KHllYXIsIG1vbnRoLCBkYXRlKTtcclxuICAgIC8vIENoZWNrIHRoYXQgdGhlIGRhdGUgd2Fzbid0IGFib3ZlIHRoZSB1cHBlciBib3VuZCBmb3IgdGhlIG1vbnRoLCBjYXVzaW5nIHRoZSBtb250aCB0byBvdmVyZmxvd1xyXG4gICAgaWYgKHJlc3VsdC5nZXRNb250aCgpICE9IG1vbnRoKSB7XHJcbiAgICAgIHRocm93IEVycm9yKGBJbnZhbGlkIGRhdGUgXCIke2RhdGV9XCIgZm9yIG1vbnRoIHdpdGggaW5kZXggXCIke21vbnRofVwiLmApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICB0b2RheSgpOiBEYXRlIHtcclxuICAgIHJldHVybiBuZXcgRGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgcGFyc2UodmFsdWU6IGFueSk6IERhdGUgfCBudWxsIHtcclxuICAgIC8vIFdlIGhhdmUgbm8gd2F5IHVzaW5nIHRoZSBuYXRpdmUgSlMgRGF0ZSB0byBzZXQgdGhlIHBhcnNlIGZvcm1hdCBvciBsb2NhbGUsIHNvIHdlIGlnbm9yZSB0aGVzZVxyXG4gICAgLy8gcGFyYW1ldGVycy5cclxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicpIHtcclxuICAgICAgcmV0dXJuIG5ldyBEYXRlKHZhbHVlKTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZSA/IG5ldyBEYXRlKERhdGUucGFyc2UodmFsdWUpKSA6IG51bGw7XHJcbiAgfVxyXG5cclxuICBmb3JtYXQoZGF0ZTogRGF0ZSwgZGlzcGxheUZvcm1hdDogT2JqZWN0KTogc3RyaW5nIHtcclxuICAgIGlmICghdGhpcy5pc1ZhbGlkKGRhdGUpKSB7XHJcbiAgICAgIHRocm93IEVycm9yKCdOYXRpdmVEYXRlQWRhcHRlcjogQ2Fubm90IGZvcm1hdCBpbnZhbGlkIGRhdGUuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKFNVUFBPUlRTX0lOVExfQVBJKSB7XHJcbiAgICAgIC8vIE9uIElFIGFuZCBFZGdlIHRoZSBpMThuIEFQSSB3aWxsIHRocm93IGEgaGFyZCBlcnJvciB0aGF0IGNhbiBjcmFzaCB0aGUgZW50aXJlIGFwcFxyXG4gICAgICAvLyBpZiB3ZSBhdHRlbXB0IHRvIGZvcm1hdCBhIGRhdGUgd2hvc2UgeWVhciBpcyBsZXNzIHRoYW4gMSBvciBncmVhdGVyIHRoYW4gOTk5OS5cclxuICAgICAgaWYgKHRoaXMuX2NsYW1wRGF0ZSAmJiAoZGF0ZS5nZXRGdWxsWWVhcigpIDwgMSB8fCBkYXRlLmdldEZ1bGxZZWFyKCkgPiA5OTk5KSkge1xyXG4gICAgICAgIGRhdGUgPSB0aGlzLmNsb25lKGRhdGUpO1xyXG4gICAgICAgIGRhdGUuc2V0RnVsbFllYXIoTWF0aC5tYXgoMSwgTWF0aC5taW4oOTk5OSwgZGF0ZS5nZXRGdWxsWWVhcigpKSkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBkaXNwbGF5Rm9ybWF0ID0geyAuLi5kaXNwbGF5Rm9ybWF0LCB0aW1lWm9uZTogJ3V0YycgfTtcclxuXHJcbiAgICAgIGNvbnN0IGR0ZiA9IG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KHRoaXMubG9jYWxlLCBkaXNwbGF5Rm9ybWF0KTtcclxuICAgICAgcmV0dXJuIHRoaXMuX3N0cmlwRGlyZWN0aW9uYWxpdHlDaGFyYWN0ZXJzKHRoaXMuX2Zvcm1hdChkdGYsIGRhdGUpKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9zdHJpcERpcmVjdGlvbmFsaXR5Q2hhcmFjdGVycyhkYXRlLnRvRGF0ZVN0cmluZygpKTtcclxuICB9XHJcblxyXG4gIGFkZENhbGVuZGFyWWVhcnMoZGF0ZTogRGF0ZSwgeWVhcnM6IG51bWJlcik6IERhdGUge1xyXG4gICAgcmV0dXJuIHRoaXMuYWRkQ2FsZW5kYXJNb250aHMoZGF0ZSwgeWVhcnMgKiAxMik7XHJcbiAgfVxyXG5cclxuICBhZGRDYWxlbmRhck1vbnRocyhkYXRlOiBEYXRlLCBtb250aHM6IG51bWJlcik6IERhdGUge1xyXG4gICAgbGV0IG5ld0RhdGUgPSB0aGlzLl9jcmVhdGVEYXRlV2l0aE92ZXJmbG93KFxyXG4gICAgICB0aGlzLmdldFllYXIoZGF0ZSksXHJcbiAgICAgIHRoaXMuZ2V0TW9udGgoZGF0ZSkgKyBtb250aHMsXHJcbiAgICAgIHRoaXMuZ2V0RGF0ZShkYXRlKSxcclxuICAgICk7XHJcblxyXG4gICAgLy8gSXQncyBwb3NzaWJsZSB0byB3aW5kIHVwIGluIHRoZSB3cm9uZyBtb250aCBpZiB0aGUgb3JpZ2luYWwgbW9udGggaGFzIG1vcmUgZGF5cyB0aGFuIHRoZSBuZXdcclxuICAgIC8vIG1vbnRoLiBJbiB0aGlzIGNhc2Ugd2Ugd2FudCB0byBnbyB0byB0aGUgbGFzdCBkYXkgb2YgdGhlIGRlc2lyZWQgbW9udGguXHJcbiAgICAvLyBOb3RlOiB0aGUgYWRkaXRpb25hbCArIDEyICUgMTIgZW5zdXJlcyB3ZSBlbmQgdXAgd2l0aCBhIHBvc2l0aXZlIG51bWJlciwgc2luY2UgSlMgJSBkb2Vzbid0XHJcbiAgICAvLyBndWFyYW50ZWUgdGhpcy5cclxuICAgIGlmICh0aGlzLmdldE1vbnRoKG5ld0RhdGUpICE9ICgoKHRoaXMuZ2V0TW9udGgoZGF0ZSkgKyBtb250aHMpICUgMTIpICsgMTIpICUgMTIpIHtcclxuICAgICAgbmV3RGF0ZSA9IHRoaXMuX2NyZWF0ZURhdGVXaXRoT3ZlcmZsb3codGhpcy5nZXRZZWFyKG5ld0RhdGUpLCB0aGlzLmdldE1vbnRoKG5ld0RhdGUpLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3RGF0ZTtcclxuICB9XHJcblxyXG4gIGFkZENhbGVuZGFyRGF5cyhkYXRlOiBEYXRlLCBkYXlzOiBudW1iZXIpOiBEYXRlIHtcclxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVEYXRlV2l0aE92ZXJmbG93KFxyXG4gICAgICB0aGlzLmdldFllYXIoZGF0ZSksXHJcbiAgICAgIHRoaXMuZ2V0TW9udGgoZGF0ZSksXHJcbiAgICAgIHRoaXMuZ2V0RGF0ZShkYXRlKSArIGRheXMsXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgdG9Jc284NjAxKGRhdGU6IERhdGUpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgZGF0ZS5nZXRVVENGdWxsWWVhcigpLFxyXG4gICAgICB0aGlzLl8yZGlnaXQoZGF0ZS5nZXRVVENNb250aCgpICsgMSksXHJcbiAgICAgIHRoaXMuXzJkaWdpdChkYXRlLmdldFVUQ0RhdGUoKSksXHJcbiAgICBdLmpvaW4oJy0nKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGdpdmVuIHZhbHVlIGlmIGdpdmVuIGEgdmFsaWQgRGF0ZSBvciBudWxsLiBEZXNlcmlhbGl6ZXMgdmFsaWQgSVNPIDg2MDEgc3RyaW5nc1xyXG4gICAqIChodHRwczovL3d3dy5pZXRmLm9yZy9yZmMvcmZjMzMzOS50eHQpIGludG8gdmFsaWQgRGF0ZXMgYW5kIGVtcHR5IHN0cmluZyBpbnRvIG51bGwuIFJldHVybnMgYW5cclxuICAgKiBpbnZhbGlkIGRhdGUgZm9yIGFsbCBvdGhlciB2YWx1ZXMuXHJcbiAgICovXHJcbiAgZGVzZXJpYWxpemUodmFsdWU6IGFueSk6IERhdGUgfCBudWxsIHtcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIGlmICghdmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICAvLyBUaGUgYERhdGVgIGNvbnN0cnVjdG9yIGFjY2VwdHMgZm9ybWF0cyBvdGhlciB0aGFuIElTTyA4NjAxLCBzbyB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGVcclxuICAgICAgLy8gc3RyaW5nIGlzIHRoZSByaWdodCBmb3JtYXQgZmlyc3QuXHJcbiAgICAgIGlmIChJU09fODYwMV9SRUdFWC50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUodmFsdWUpO1xyXG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWQoZGF0ZSkpIHtcclxuICAgICAgICAgIHJldHVybiBkYXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN1cGVyLmRlc2VyaWFsaXplKHZhbHVlKTtcclxuICB9XHJcblxyXG4gIGlzRGF0ZUluc3RhbmNlKG9iajogYW55KSB7XHJcbiAgICByZXR1cm4gb2JqIGluc3RhbmNlb2YgRGF0ZTtcclxuICB9XHJcblxyXG4gIGlzVmFsaWQoZGF0ZTogRGF0ZSkge1xyXG4gICAgcmV0dXJuICFpc05hTihkYXRlLmdldFRpbWUoKSk7XHJcbiAgfVxyXG5cclxuICBpbnZhbGlkKCk6IERhdGUge1xyXG4gICAgcmV0dXJuIG5ldyBEYXRlKE5hTik7XHJcbiAgfVxyXG5cclxuICBnZXRIb3VyKGRhdGU6IERhdGUpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIGRhdGUuZ2V0SG91cnMoKTtcclxuICB9XHJcbiAgZ2V0TWludXRlKGRhdGU6IERhdGUpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIGRhdGUuZ2V0TWludXRlcygpO1xyXG4gIH1cclxuICBnZXRTZWNvbmQoZGF0ZTogRGF0ZSk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gZGF0ZS5nZXRTZWNvbmRzKCk7XHJcbiAgfVxyXG5cclxuICBzZXRIb3VyKGRhdGU6IERhdGUsIHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGRhdGUuc2V0SG91cnModmFsdWUpO1xyXG4gIH1cclxuICBzZXRNaW51dGUoZGF0ZTogRGF0ZSwgdmFsdWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgZGF0ZS5zZXRNaW51dGVzKHZhbHVlKTtcclxuICB9XHJcbiAgc2V0U2Vjb25kKGRhdGU6IERhdGUsIHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGRhdGUuc2V0U2Vjb25kcyh2YWx1ZSk7XHJcbiAgfVxyXG5cclxuICAvKiogQ3JlYXRlcyBhIGRhdGUgYnV0IGFsbG93cyB0aGUgbW9udGggYW5kIGRhdGUgdG8gb3ZlcmZsb3cuICovXHJcbiAgcHJpdmF0ZSBfY3JlYXRlRGF0ZVdpdGhPdmVyZmxvdyh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcikge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpO1xyXG5cclxuICAgIC8vIFdlIG5lZWQgdG8gY29ycmVjdCBmb3IgdGhlIGZhY3QgdGhhdCBKUyBuYXRpdmUgRGF0ZSB0cmVhdHMgeWVhcnMgaW4gcmFuZ2UgWzAsIDk5XSBhc1xyXG4gICAgLy8gYWJicmV2aWF0aW9ucyBmb3IgMTl4eC5cclxuICAgIGlmICh5ZWFyID49IDAgJiYgeWVhciA8IDEwMCkge1xyXG4gICAgICByZXN1bHQuc2V0RnVsbFllYXIodGhpcy5nZXRZZWFyKHJlc3VsdCkgLSAxOTAwKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQYWRzIGEgbnVtYmVyIHRvIG1ha2UgaXQgdHdvIGRpZ2l0cy5cclxuICAgKiBAcGFyYW0gbiBUaGUgbnVtYmVyIHRvIHBhZC5cclxuICAgKiBAcmV0dXJucyBUaGUgcGFkZGVkIG51bWJlci5cclxuICAgKi9cclxuICBwcml2YXRlIF8yZGlnaXQobjogbnVtYmVyKSB7XHJcbiAgICByZXR1cm4gKCcwMCcgKyBuKS5zbGljZSgtMik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdHJpcCBvdXQgdW5pY29kZSBMVFIgYW5kIFJUTCBjaGFyYWN0ZXJzLiBFZGdlIGFuZCBJRSBpbnNlcnQgdGhlc2UgaW50byBmb3JtYXR0ZWQgZGF0ZXMgd2hpbGVcclxuICAgKiBvdGhlciBicm93c2VycyBkbyBub3QuIFdlIHJlbW92ZSB0aGVtIHRvIG1ha2Ugb3V0cHV0IGNvbnNpc3RlbnQgYW5kIGJlY2F1c2UgdGhleSBpbnRlcmZlcmUgd2l0aFxyXG4gICAqIGRhdGUgcGFyc2luZy5cclxuICAgKiBAcGFyYW0gc3RyIFRoZSBzdHJpbmcgdG8gc3RyaXAgZGlyZWN0aW9uIGNoYXJhY3RlcnMgZnJvbS5cclxuICAgKiBAcmV0dXJucyBUaGUgc3RyaXBwZWQgc3RyaW5nLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX3N0cmlwRGlyZWN0aW9uYWxpdHlDaGFyYWN0ZXJzKHN0cjogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1tcXHUyMDBlXFx1MjAwZl0vZywgJycpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiBjb252ZXJ0aW5nIERhdGUgb2JqZWN0IHRvIHN0cmluZywgamF2YXNjcmlwdCBidWlsdC1pbiBmdW5jdGlvbnMgbWF5IHJldHVybiB3cm9uZ1xyXG4gICAqIHJlc3VsdHMgYmVjYXVzZSBpdCBhcHBsaWVzIGl0cyBpbnRlcm5hbCBEU1QgcnVsZXMuIFRoZSBEU1QgcnVsZXMgYXJvdW5kIHRoZSB3b3JsZCBjaGFuZ2VcclxuICAgKiB2ZXJ5IGZyZXF1ZW50bHksIGFuZCB0aGUgY3VycmVudCB2YWxpZCBydWxlIGlzIG5vdCBhbHdheXMgdmFsaWQgaW4gcHJldmlvdXMgeWVhcnMgdGhvdWdoLlxyXG4gICAqIFdlIHdvcmsgYXJvdW5kIHRoaXMgcHJvYmxlbSBidWlsZGluZyBhIG5ldyBEYXRlIG9iamVjdCB3aGljaCBoYXMgaXRzIGludGVybmFsIFVUQ1xyXG4gICAqIHJlcHJlc2VudGF0aW9uIHdpdGggdGhlIGxvY2FsIGRhdGUgYW5kIHRpbWUuXHJcbiAgICogQHBhcmFtIGR0ZiBJbnRsLkRhdGVUaW1lRm9ybWF0IG9iamVjdCwgY29udGFpbmcgdGhlIGRlc2lyZWQgc3RyaW5nIGZvcm1hdC4gSXQgbXVzdCBoYXZlXHJcbiAgICogICAgdGltZVpvbmUgc2V0IHRvICd1dGMnIHRvIHdvcmsgZmluZS5cclxuICAgKiBAcGFyYW0gZGF0ZSBEYXRlIGZyb20gd2hpY2ggd2Ugd2FudCB0byBnZXQgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBhY2NvcmRpbmcgdG8gZHRmXHJcbiAgICogQHJldHVybnMgQSBEYXRlIG9iamVjdCB3aXRoIGl0cyBVVEMgcmVwcmVzZW50YXRpb24gYmFzZWQgb24gdGhlIHBhc3NlZCBpbiBkYXRlIGluZm9cclxuICAgKi9cclxuICBwcml2YXRlIF9mb3JtYXQoZHRmOiBJbnRsLkRhdGVUaW1lRm9ybWF0LCBkYXRlOiBEYXRlKSB7XHJcbiAgICAvLyBQYXNzaW5nIHRoZSB5ZWFyIHRvIHRoZSBjb25zdHJ1Y3RvciBjYXVzZXMgeWVhciBudW1iZXJzIDwxMDAgdG8gYmUgY29udmVydGVkIHRvIDE5eHguXHJcbiAgICAvLyBUbyB3b3JrIGFyb3VuZCB0aGlzIHdlIHVzZSBgc2V0VVRDRnVsbFllYXJgIGFuZCBgc2V0VVRDSG91cnNgIGluc3RlYWQuXHJcbiAgICBjb25zdCBkID0gbmV3IERhdGUoKTtcclxuICAgIGQuc2V0VVRDRnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpKTtcclxuICAgIGQuc2V0VVRDSG91cnMoZGF0ZS5nZXRIb3VycygpLCBkYXRlLmdldE1pbnV0ZXMoKSwgZGF0ZS5nZXRTZWNvbmRzKCksIGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCkpO1xyXG4gICAgcmV0dXJuIGR0Zi5mb3JtYXQoZCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==