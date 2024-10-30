import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
/** Datepicker data that requires internationalization. */
export class NgxMatDatepickerIntl {
    constructor() {
        /**
         * Stream that emits whenever the labels here are changed. Use this to notify
         * components if the labels have changed after initialization.
         */
        this.changes = new Subject();
        /** A label for the calendar popup (used by screen readers). */
        this.calendarLabel = 'Calendar';
        /** A label for the button used to open the calendar popup (used by screen readers). */
        this.openCalendarLabel = 'Open calendar';
        /** Label for the button used to close the calendar popup. */
        this.closeCalendarLabel = 'Close calendar';
        /** A label for the previous month button (used by screen readers). */
        this.prevMonthLabel = 'Previous month';
        /** A label for the next month button (used by screen readers). */
        this.nextMonthLabel = 'Next month';
        /** A label for the previous year button (used by screen readers). */
        this.prevYearLabel = 'Previous year';
        /** A label for the next year button (used by screen readers). */
        this.nextYearLabel = 'Next year';
        /** A label for the previous multi-year button (used by screen readers). */
        this.prevMultiYearLabel = 'Previous 24 years';
        /** A label for the next multi-year button (used by screen readers). */
        this.nextMultiYearLabel = 'Next 24 years';
        /** A label for the 'switch to month view' button (used by screen readers). */
        this.switchToMonthViewLabel = 'Choose date';
        /** A label for the 'switch to year view' button (used by screen readers). */
        this.switchToMultiYearViewLabel = 'Choose month and year';
        /**
         * A label for the first date of a range of dates (used by screen readers).
         * @deprecated Provide your own internationalization string.
         * @breaking-change 17.0.0
         */
        this.startDateLabel = 'Start date';
        /**
         * A label for the last date of a range of dates (used by screen readers).
         * @deprecated Provide your own internationalization string.
         * @breaking-change 17.0.0
         */
        this.endDateLabel = 'End date';
    }
    /** Formats a range of years (used for visuals). */
    formatYearRange(start, end) {
        return `${start} \u2013 ${end}`;
    }
    /** Formats a label for a range of years (used by screen readers). */
    formatYearRangeLabel(start, end) {
        return `${start} to ${end}`;
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerIntl, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerIntl, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerIntl, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1pbnRsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZGF0ZXRpbWUtcGlja2VyL3NyYy9saWIvZGF0ZXBpY2tlci1pbnRsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQzs7QUFFL0IsMERBQTBEO0FBRTFELE1BQU0sT0FBTyxvQkFBb0I7SUFEakM7UUFFRTs7O1dBR0c7UUFDTSxZQUFPLEdBQWtCLElBQUksT0FBTyxFQUFRLENBQUM7UUFFdEQsK0RBQStEO1FBQy9ELGtCQUFhLEdBQUcsVUFBVSxDQUFDO1FBRTNCLHVGQUF1RjtRQUN2RixzQkFBaUIsR0FBRyxlQUFlLENBQUM7UUFFcEMsNkRBQTZEO1FBQzdELHVCQUFrQixHQUFHLGdCQUFnQixDQUFDO1FBRXRDLHNFQUFzRTtRQUN0RSxtQkFBYyxHQUFHLGdCQUFnQixDQUFDO1FBRWxDLGtFQUFrRTtRQUNsRSxtQkFBYyxHQUFHLFlBQVksQ0FBQztRQUU5QixxRUFBcUU7UUFDckUsa0JBQWEsR0FBRyxlQUFlLENBQUM7UUFFaEMsaUVBQWlFO1FBQ2pFLGtCQUFhLEdBQUcsV0FBVyxDQUFDO1FBRTVCLDJFQUEyRTtRQUMzRSx1QkFBa0IsR0FBRyxtQkFBbUIsQ0FBQztRQUV6Qyx1RUFBdUU7UUFDdkUsdUJBQWtCLEdBQUcsZUFBZSxDQUFDO1FBRXJDLDhFQUE4RTtRQUM5RSwyQkFBc0IsR0FBRyxhQUFhLENBQUM7UUFFdkMsNkVBQTZFO1FBQzdFLCtCQUEwQixHQUFHLHVCQUF1QixDQUFDO1FBRXJEOzs7O1dBSUc7UUFDSCxtQkFBYyxHQUFHLFlBQVksQ0FBQztRQUU5Qjs7OztXQUlHO1FBQ0gsaUJBQVksR0FBRyxVQUFVLENBQUM7S0FXM0I7SUFUQyxtREFBbUQ7SUFDbkQsZUFBZSxDQUFDLEtBQWEsRUFBRSxHQUFXO1FBQ3hDLE9BQU8sR0FBRyxLQUFLLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUVELHFFQUFxRTtJQUNyRSxvQkFBb0IsQ0FBQyxLQUFhLEVBQUUsR0FBVztRQUM3QyxPQUFPLEdBQUcsS0FBSyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQzlCLENBQUM7aUlBOURVLG9CQUFvQjtxSUFBcEIsb0JBQW9CLGNBRFAsTUFBTTs7MkZBQ25CLG9CQUFvQjtrQkFEaEMsVUFBVTttQkFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuXHJcbi8qKiBEYXRlcGlja2VyIGRhdGEgdGhhdCByZXF1aXJlcyBpbnRlcm5hdGlvbmFsaXphdGlvbi4gKi9cclxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcclxuZXhwb3J0IGNsYXNzIE5neE1hdERhdGVwaWNrZXJJbnRsIHtcclxuICAvKipcclxuICAgKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuZXZlciB0aGUgbGFiZWxzIGhlcmUgYXJlIGNoYW5nZWQuIFVzZSB0aGlzIHRvIG5vdGlmeVxyXG4gICAqIGNvbXBvbmVudHMgaWYgdGhlIGxhYmVscyBoYXZlIGNoYW5nZWQgYWZ0ZXIgaW5pdGlhbGl6YXRpb24uXHJcbiAgICovXHJcbiAgcmVhZG9ubHkgY2hhbmdlczogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XHJcblxyXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgY2FsZW5kYXIgcG9wdXAgKHVzZWQgYnkgc2NyZWVuIHJlYWRlcnMpLiAqL1xyXG4gIGNhbGVuZGFyTGFiZWwgPSAnQ2FsZW5kYXInO1xyXG5cclxuICAvKiogQSBsYWJlbCBmb3IgdGhlIGJ1dHRvbiB1c2VkIHRvIG9wZW4gdGhlIGNhbGVuZGFyIHBvcHVwICh1c2VkIGJ5IHNjcmVlbiByZWFkZXJzKS4gKi9cclxuICBvcGVuQ2FsZW5kYXJMYWJlbCA9ICdPcGVuIGNhbGVuZGFyJztcclxuXHJcbiAgLyoqIExhYmVsIGZvciB0aGUgYnV0dG9uIHVzZWQgdG8gY2xvc2UgdGhlIGNhbGVuZGFyIHBvcHVwLiAqL1xyXG4gIGNsb3NlQ2FsZW5kYXJMYWJlbCA9ICdDbG9zZSBjYWxlbmRhcic7XHJcblxyXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgcHJldmlvdXMgbW9udGggYnV0dG9uICh1c2VkIGJ5IHNjcmVlbiByZWFkZXJzKS4gKi9cclxuICBwcmV2TW9udGhMYWJlbCA9ICdQcmV2aW91cyBtb250aCc7XHJcblxyXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgbmV4dCBtb250aCBidXR0b24gKHVzZWQgYnkgc2NyZWVuIHJlYWRlcnMpLiAqL1xyXG4gIG5leHRNb250aExhYmVsID0gJ05leHQgbW9udGgnO1xyXG5cclxuICAvKiogQSBsYWJlbCBmb3IgdGhlIHByZXZpb3VzIHllYXIgYnV0dG9uICh1c2VkIGJ5IHNjcmVlbiByZWFkZXJzKS4gKi9cclxuICBwcmV2WWVhckxhYmVsID0gJ1ByZXZpb3VzIHllYXInO1xyXG5cclxuICAvKiogQSBsYWJlbCBmb3IgdGhlIG5leHQgeWVhciBidXR0b24gKHVzZWQgYnkgc2NyZWVuIHJlYWRlcnMpLiAqL1xyXG4gIG5leHRZZWFyTGFiZWwgPSAnTmV4dCB5ZWFyJztcclxuXHJcbiAgLyoqIEEgbGFiZWwgZm9yIHRoZSBwcmV2aW91cyBtdWx0aS15ZWFyIGJ1dHRvbiAodXNlZCBieSBzY3JlZW4gcmVhZGVycykuICovXHJcbiAgcHJldk11bHRpWWVhckxhYmVsID0gJ1ByZXZpb3VzIDI0IHllYXJzJztcclxuXHJcbiAgLyoqIEEgbGFiZWwgZm9yIHRoZSBuZXh0IG11bHRpLXllYXIgYnV0dG9uICh1c2VkIGJ5IHNjcmVlbiByZWFkZXJzKS4gKi9cclxuICBuZXh0TXVsdGlZZWFyTGFiZWwgPSAnTmV4dCAyNCB5ZWFycyc7XHJcblxyXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgJ3N3aXRjaCB0byBtb250aCB2aWV3JyBidXR0b24gKHVzZWQgYnkgc2NyZWVuIHJlYWRlcnMpLiAqL1xyXG4gIHN3aXRjaFRvTW9udGhWaWV3TGFiZWwgPSAnQ2hvb3NlIGRhdGUnO1xyXG5cclxuICAvKiogQSBsYWJlbCBmb3IgdGhlICdzd2l0Y2ggdG8geWVhciB2aWV3JyBidXR0b24gKHVzZWQgYnkgc2NyZWVuIHJlYWRlcnMpLiAqL1xyXG4gIHN3aXRjaFRvTXVsdGlZZWFyVmlld0xhYmVsID0gJ0Nob29zZSBtb250aCBhbmQgeWVhcic7XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgbGFiZWwgZm9yIHRoZSBmaXJzdCBkYXRlIG9mIGEgcmFuZ2Ugb2YgZGF0ZXMgKHVzZWQgYnkgc2NyZWVuIHJlYWRlcnMpLlxyXG4gICAqIEBkZXByZWNhdGVkIFByb3ZpZGUgeW91ciBvd24gaW50ZXJuYXRpb25hbGl6YXRpb24gc3RyaW5nLlxyXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTcuMC4wXHJcbiAgICovXHJcbiAgc3RhcnREYXRlTGFiZWwgPSAnU3RhcnQgZGF0ZSc7XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgbGFiZWwgZm9yIHRoZSBsYXN0IGRhdGUgb2YgYSByYW5nZSBvZiBkYXRlcyAodXNlZCBieSBzY3JlZW4gcmVhZGVycykuXHJcbiAgICogQGRlcHJlY2F0ZWQgUHJvdmlkZSB5b3VyIG93biBpbnRlcm5hdGlvbmFsaXphdGlvbiBzdHJpbmcuXHJcbiAgICogQGJyZWFraW5nLWNoYW5nZSAxNy4wLjBcclxuICAgKi9cclxuICBlbmREYXRlTGFiZWwgPSAnRW5kIGRhdGUnO1xyXG5cclxuICAvKiogRm9ybWF0cyBhIHJhbmdlIG9mIHllYXJzICh1c2VkIGZvciB2aXN1YWxzKS4gKi9cclxuICBmb3JtYXRZZWFyUmFuZ2Uoc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGAke3N0YXJ0fSBcXHUyMDEzICR7ZW5kfWA7XHJcbiAgfVxyXG5cclxuICAvKiogRm9ybWF0cyBhIGxhYmVsIGZvciBhIHJhbmdlIG9mIHllYXJzICh1c2VkIGJ5IHNjcmVlbiByZWFkZXJzKS4gKi9cclxuICBmb3JtYXRZZWFyUmFuZ2VMYWJlbChzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYCR7c3RhcnR9IHRvICR7ZW5kfWA7XHJcbiAgfVxyXG59XHJcbiJdfQ==