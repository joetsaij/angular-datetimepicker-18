import { DOWN_ARROW, END, ENTER, HOME, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, SPACE, UP_ARROW, } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, Inject, Input, Optional, ViewEncapsulation, input, output, viewChild, } from '@angular/core';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { NgxMatCalendarBody, NgxMatCalendarCell, } from './calendar-body';
import { NGX_MAT_DATE_FORMATS } from './core/date-formats';
import { NgxDateRange } from './date-selection-model';
import { createMissingDateImplError } from './datepicker-errors';
import * as i0 from "@angular/core";
import * as i1 from "./core/date-adapter";
import * as i2 from "@angular/cdk/bidi";
/**
 * An internal component used to display a single year in the datepicker.
 * @docs-private
 */
export class NgxMatYearView {
    /** The date to display in this year view (everything other than the year is ignored). */
    get activeDate() {
        return this._activeDate;
    }
    set activeDate(value) {
        let oldActiveDate = this._activeDate;
        const validDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value)) ||
            this._dateAdapter.today();
        this._activeDate = this._dateAdapter.clampDate(validDate, this.minDate, this.maxDate);
        if (this._dateAdapter.getYear(oldActiveDate) !== this._dateAdapter.getYear(this._activeDate)) {
            this._init();
        }
    }
    /** The currently selected date. */
    get selected() {
        return this._selected;
    }
    set selected(value) {
        if (value instanceof NgxDateRange) {
            this._selected = value;
        }
        else {
            this._selected = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
        }
        this._setSelectedMonth(value);
    }
    /** The minimum selectable date. */
    get minDate() {
        return this._minDate;
    }
    set minDate(value) {
        this._minDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    /** The maximum selectable date. */
    get maxDate() {
        return this._maxDate;
    }
    set maxDate(value) {
        this._maxDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    constructor(_changeDetectorRef, _dateFormats, _dateAdapter, _dir) {
        this._changeDetectorRef = _changeDetectorRef;
        this._dateFormats = _dateFormats;
        this._dateAdapter = _dateAdapter;
        this._dir = _dir;
        this._rerenderSubscription = Subscription.EMPTY;
        /** A function used to filter which dates are selectable. */
        this.dateFilter = input();
        /** Function that can be used to add custom CSS classes to date cells. */
        this.dateClass = input();
        /** Emits when a new month is selected. */
        this.selectedChange = output();
        /** Emits the selected month. This doesn't imply a change on the selected date */
        this.monthSelected = output();
        /** Emits when any date is activated. */
        this.activeDateChange = output();
        /** The body of calendar table */
        this._matCalendarBody = viewChild(NgxMatCalendarBody);
        if (!this._dateAdapter) {
            throw createMissingDateImplError('NgxMatDateAdapter');
        }
        if (!this._dateFormats) {
            throw createMissingDateImplError('NGX_MAT_DATE_FORMATS');
        }
        this._activeDate = this._dateAdapter.today();
    }
    ngAfterContentInit() {
        this._rerenderSubscription = this._dateAdapter.localeChanges
            .pipe(startWith(null))
            .subscribe(() => this._init());
    }
    ngOnDestroy() {
        this._rerenderSubscription.unsubscribe();
    }
    /** Handles when a new month is selected. */
    _monthSelected(event) {
        const month = event.value;
        const selectedMonth = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), month, 1);
        this.monthSelected.emit(selectedMonth);
        const selectedDate = this._getDateFromMonth(month);
        this.selectedChange.emit(selectedDate);
    }
    /**
     * Takes the index of a calendar body cell wrapped in in an event as argument. For the date that
     * corresponds to the given cell, set `activeDate` to that date and fire `activeDateChange` with
     * that date.
     *
     * This function is used to match each component's model of the active date with the calendar
     * body cell that was focused. It updates its value of `activeDate` synchronously and updates the
     * parent's value asynchronously via the `activeDateChange` event. The child component receives an
     * updated value asynchronously via the `activeCell` Input.
     */
    _updateActiveDate(event) {
        const month = event.value;
        const oldActiveDate = this._activeDate;
        this.activeDate = this._getDateFromMonth(month);
        if (this._dateAdapter.compareDate(oldActiveDate, this.activeDate)) {
            this.activeDateChange.emit(this.activeDate);
        }
    }
    /** Handles keydown events on the calendar body when calendar is in year view. */
    _handleCalendarBodyKeydown(event) {
        // TODO(mmalerba): We currently allow keyboard navigation to disabled dates, but just prevent
        // disabled ones from being selected. This may not be ideal, we should look into whether
        // navigation should skip over disabled dates, and if so, how to implement that efficiently.
        const oldActiveDate = this._activeDate;
        const isRtl = this._isRtl();
        switch (event.keyCode) {
            case LEFT_ARROW:
                this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, isRtl ? 1 : -1);
                break;
            case RIGHT_ARROW:
                this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, isRtl ? -1 : 1);
                break;
            case UP_ARROW:
                this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, -4);
                break;
            case DOWN_ARROW:
                this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, 4);
                break;
            case HOME:
                this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, -this._dateAdapter.getMonth(this._activeDate));
                break;
            case END:
                this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, 11 - this._dateAdapter.getMonth(this._activeDate));
                break;
            case PAGE_UP:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? -10 : -1);
                break;
            case PAGE_DOWN:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? 10 : 1);
                break;
            case ENTER:
            case SPACE:
                // Note that we only prevent the default action here while the selection happens in
                // `keyup` below. We can't do the selection here, because it can cause the calendar to
                // reopen if focus is restored immediately. We also can't call `preventDefault` on `keyup`
                // because it's too late (see #23305).
                this._selectionKeyPressed = true;
                break;
            default:
                // Don't prevent default or focus active cell on keys that we don't explicitly handle.
                return;
        }
        if (this._dateAdapter.compareDate(oldActiveDate, this.activeDate)) {
            this.activeDateChange.emit(this.activeDate);
            this._focusActiveCellAfterViewChecked();
        }
        // Prevent unexpected default actions such as form submission.
        event.preventDefault();
    }
    /** Handles keyup events on the calendar body when calendar is in year view. */
    _handleCalendarBodyKeyup(event) {
        if (event.keyCode === SPACE || event.keyCode === ENTER) {
            if (this._selectionKeyPressed) {
                this._monthSelected({
                    value: this._dateAdapter.getMonth(this._activeDate),
                    event,
                });
            }
            this._selectionKeyPressed = false;
        }
    }
    /** Initializes this year view. */
    _init() {
        this._setSelectedMonth(this.selected);
        this._todayMonth = this._getMonthInCurrentYear(this._dateAdapter.today());
        this._yearLabel = this._dateAdapter.getYearName(this.activeDate);
        let monthNames = this._dateAdapter.getMonthNames('short');
        // First row of months only contains 5 elements so we can fit the year label on the same row.
        this._months = [
            [0, 1, 2, 3],
            [4, 5, 6, 7],
            [8, 9, 10, 11],
        ].map((row) => row.map((month) => this._createCellForMonth(month, monthNames[month])));
        this._changeDetectorRef.markForCheck();
    }
    /** Focuses the active cell after the microtask queue is empty. */
    _focusActiveCell() {
        this._matCalendarBody()._focusActiveCell();
    }
    /** Schedules the matCalendarBody to focus the active cell after change detection has run */
    _focusActiveCellAfterViewChecked() {
        this._matCalendarBody()._scheduleFocusActiveCellAfterViewChecked();
    }
    /**
     * Gets the month in this year that the given Date falls on.
     * Returns null if the given Date is in another year.
     */
    _getMonthInCurrentYear(date) {
        return date && this._dateAdapter.getYear(date) == this._dateAdapter.getYear(this.activeDate)
            ? this._dateAdapter.getMonth(date)
            : null;
    }
    /**
     * Takes a month and returns a new date in the same day and year as the currently active date.
     *  The returned date will have the same month as the argument date.
     */
    _getDateFromMonth(month) {
        const normalizedDate = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), month, 1);
        const daysInMonth = this._dateAdapter.getNumDaysInMonth(normalizedDate);
        return this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), month, Math.min(this._dateAdapter.getDate(this.activeDate), daysInMonth));
    }
    /** Creates an MatCalendarCell for the given month. */
    _createCellForMonth(month, monthName) {
        const date = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), month, 1);
        const ariaLabel = this._dateAdapter.format(date, this._dateFormats.display.monthYearA11yLabel);
        const cellClasses = this.dateClass() ? this.dateClass()(date, 'year') : undefined;
        return new NgxMatCalendarCell(month, monthName.toLocaleUpperCase(), ariaLabel, this._shouldEnableMonth(month), cellClasses);
    }
    /** Whether the given month is enabled. */
    _shouldEnableMonth(month) {
        const activeYear = this._dateAdapter.getYear(this.activeDate);
        if (month === undefined ||
            month === null ||
            this._isYearAndMonthAfterMaxDate(activeYear, month) ||
            this._isYearAndMonthBeforeMinDate(activeYear, month)) {
            return false;
        }
        if (!this.dateFilter()) {
            return true;
        }
        const firstOfMonth = this._dateAdapter.createDate(activeYear, month, 1);
        // If any date in the month is enabled count the month as enabled.
        for (let date = firstOfMonth; this._dateAdapter.getMonth(date) == month; date = this._dateAdapter.addCalendarDays(date, 1)) {
            if (this.dateFilter()(date)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Tests whether the combination month/year is after this.maxDate, considering
     * just the month and year of this.maxDate
     */
    _isYearAndMonthAfterMaxDate(year, month) {
        if (this.maxDate) {
            const maxYear = this._dateAdapter.getYear(this.maxDate);
            const maxMonth = this._dateAdapter.getMonth(this.maxDate);
            return year > maxYear || (year === maxYear && month > maxMonth);
        }
        return false;
    }
    /**
     * Tests whether the combination month/year is before this.minDate, considering
     * just the month and year of this.minDate
     */
    _isYearAndMonthBeforeMinDate(year, month) {
        if (this.minDate) {
            const minYear = this._dateAdapter.getYear(this.minDate);
            const minMonth = this._dateAdapter.getMonth(this.minDate);
            return year < minYear || (year === minYear && month < minMonth);
        }
        return false;
    }
    /** Determines whether the user has the RTL layout direction. */
    _isRtl() {
        return this._dir && this._dir.value === 'rtl';
    }
    /** Sets the currently-selected month based on a model value. */
    _setSelectedMonth(value) {
        if (value instanceof NgxDateRange) {
            this._selectedMonth =
                this._getMonthInCurrentYear(value.start) || this._getMonthInCurrentYear(value.end);
        }
        else {
            this._selectedMonth = this._getMonthInCurrentYear(value);
        }
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatYearView, deps: [{ token: i0.ChangeDetectorRef }, { token: NGX_MAT_DATE_FORMATS, optional: true }, { token: i1.NgxMatDateAdapter, optional: true }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    /** @nocollapse */ static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.2.0", version: "18.0.3", type: NgxMatYearView, isStandalone: true, selector: "ngx-mat-year-view", inputs: { activeDate: { classPropertyName: "activeDate", publicName: "activeDate", isSignal: false, isRequired: false, transformFunction: null }, selected: { classPropertyName: "selected", publicName: "selected", isSignal: false, isRequired: false, transformFunction: null }, minDate: { classPropertyName: "minDate", publicName: "minDate", isSignal: false, isRequired: false, transformFunction: null }, maxDate: { classPropertyName: "maxDate", publicName: "maxDate", isSignal: false, isRequired: false, transformFunction: null }, dateFilter: { classPropertyName: "dateFilter", publicName: "dateFilter", isSignal: true, isRequired: false, transformFunction: null }, dateClass: { classPropertyName: "dateClass", publicName: "dateClass", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { selectedChange: "selectedChange", monthSelected: "monthSelected", activeDateChange: "activeDateChange" }, viewQueries: [{ propertyName: "_matCalendarBody", first: true, predicate: NgxMatCalendarBody, descendants: true, isSignal: true }], exportAs: ["ngxMatYearView"], ngImport: i0, template: "<table class=\"mat-calendar-table\" role=\"grid\">\r\n  <thead aria-hidden=\"true\" class=\"mat-calendar-table-header\">\r\n    <tr>\r\n      <th class=\"mat-calendar-table-header-divider\" colspan=\"4\"></th>\r\n    </tr>\r\n  </thead>\r\n  <tbody\r\n    ngx-mat-calendar-body\r\n    [label]=\"_yearLabel\"\r\n    [rows]=\"_months\"\r\n    [todayValue]=\"_todayMonth!\"\r\n    [startValue]=\"_selectedMonth!\"\r\n    [endValue]=\"_selectedMonth!\"\r\n    [labelMinRequiredCells]=\"2\"\r\n    [numCols]=\"4\"\r\n    [cellAspectRatio]=\"4 / 7\"\r\n    [activeCell]=\"_dateAdapter.getMonth(activeDate)\"\r\n    (selectedValueChange)=\"_monthSelected($event)\"\r\n    (activeDateChange)=\"_updateActiveDate($event)\"\r\n    (keyup)=\"_handleCalendarBodyKeyup($event)\"\r\n    (keydown)=\"_handleCalendarBodyKeydown($event)\"></tbody>\r\n</table>\r\n", dependencies: [{ kind: "component", type: NgxMatCalendarBody, selector: "[ngx-mat-calendar-body]", inputs: ["label", "rows", "todayValue", "startValue", "endValue", "labelMinRequiredCells", "numCols", "activeCell", "isRange", "cellAspectRatio", "comparisonStart", "comparisonEnd", "previewStart", "previewEnd", "startDateAccessibleName", "endDateAccessibleName"], outputs: ["selectedValueChange", "previewChange", "activeDateChange", "dragStarted", "dragEnded"], exportAs: ["matCalendarBody"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatYearView, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-mat-year-view', exportAs: 'ngxMatYearView', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgxMatCalendarBody], template: "<table class=\"mat-calendar-table\" role=\"grid\">\r\n  <thead aria-hidden=\"true\" class=\"mat-calendar-table-header\">\r\n    <tr>\r\n      <th class=\"mat-calendar-table-header-divider\" colspan=\"4\"></th>\r\n    </tr>\r\n  </thead>\r\n  <tbody\r\n    ngx-mat-calendar-body\r\n    [label]=\"_yearLabel\"\r\n    [rows]=\"_months\"\r\n    [todayValue]=\"_todayMonth!\"\r\n    [startValue]=\"_selectedMonth!\"\r\n    [endValue]=\"_selectedMonth!\"\r\n    [labelMinRequiredCells]=\"2\"\r\n    [numCols]=\"4\"\r\n    [cellAspectRatio]=\"4 / 7\"\r\n    [activeCell]=\"_dateAdapter.getMonth(activeDate)\"\r\n    (selectedValueChange)=\"_monthSelected($event)\"\r\n    (activeDateChange)=\"_updateActiveDate($event)\"\r\n    (keyup)=\"_handleCalendarBodyKeyup($event)\"\r\n    (keydown)=\"_handleCalendarBodyKeydown($event)\"></tbody>\r\n</table>\r\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NGX_MAT_DATE_FORMATS]
                }] }, { type: i1.NgxMatDateAdapter, decorators: [{
                    type: Optional
                }] }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }], propDecorators: { activeDate: [{
                type: Input
            }], selected: [{
                type: Input
            }], minDate: [{
                type: Input
            }], maxDate: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWVhci12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZGF0ZXRpbWUtcGlja2VyL3NyYy9saWIveWVhci12aWV3LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZGF0ZXRpbWUtcGlja2VyL3NyYy9saWIveWVhci12aWV3Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUNMLFVBQVUsRUFDVixHQUFHLEVBQ0gsS0FBSyxFQUNMLElBQUksRUFDSixVQUFVLEVBQ1YsU0FBUyxFQUNULE9BQU8sRUFDUCxXQUFXLEVBQ1gsS0FBSyxFQUNMLFFBQVEsR0FDVCxNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFFTCx1QkFBdUIsRUFFdkIsU0FBUyxFQUNULE1BQU0sRUFDTixLQUFLLEVBRUwsUUFBUSxFQUNSLGlCQUFpQixFQUNqQixLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsR0FDVixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQ0wsa0JBQWtCLEVBQ2xCLGtCQUFrQixHQUduQixNQUFNLGlCQUFpQixDQUFDO0FBRXpCLE9BQU8sRUFBRSxvQkFBb0IsRUFBcUIsTUFBTSxxQkFBcUIsQ0FBQztBQUM5RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdEQsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0scUJBQXFCLENBQUM7Ozs7QUFFakU7OztHQUdHO0FBVUgsTUFBTSxPQUFPLGNBQWM7SUFNekIseUZBQXlGO0lBQ3pGLElBQ0ksVUFBVTtRQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUMxQixDQUFDO0lBQ0QsSUFBSSxVQUFVLENBQUMsS0FBUTtRQUNyQixJQUFJLGFBQWEsR0FB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LEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0QsQ0FBQztJQUNILENBQUM7aUlBallVLGNBQWMsbURBK0ZmLG9CQUFvQjtxSEEvRm5CLGNBQWMsbWhDQTJFSSxrQkFBa0IsOEZDaElqRCxnMUJBc0JBLDRDRDZCWSxrQkFBa0I7OzJGQUVqQixjQUFjO2tCQVQxQixTQUFTOytCQUNFLG1CQUFtQixZQUVuQixnQkFBZ0IsaUJBQ1gsaUJBQWlCLENBQUMsSUFBSSxtQkFDcEIsdUJBQXVCLENBQUMsTUFBTSxjQUNuQyxJQUFJLFdBQ1AsQ0FBQyxrQkFBa0IsQ0FBQzs7MEJBZ0cxQixRQUFROzswQkFDUixNQUFNOzJCQUFDLG9CQUFvQjs7MEJBRTNCLFFBQVE7OzBCQUNSLFFBQVE7eUNBMUZQLFVBQVU7c0JBRGIsS0FBSztnQkFrQkYsUUFBUTtzQkFEWCxLQUFLO2dCQWlCRixPQUFPO3NCQURWLEtBQUs7Z0JBV0YsT0FBTztzQkFEVixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aW9uYWxpdHkgfSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XHJcbmltcG9ydCB7XHJcbiAgRE9XTl9BUlJPVyxcclxuICBFTkQsXHJcbiAgRU5URVIsXHJcbiAgSE9NRSxcclxuICBMRUZUX0FSUk9XLFxyXG4gIFBBR0VfRE9XTixcclxuICBQQUdFX1VQLFxyXG4gIFJJR0hUX0FSUk9XLFxyXG4gIFNQQUNFLFxyXG4gIFVQX0FSUk9XLFxyXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XHJcbmltcG9ydCB7XHJcbiAgQWZ0ZXJDb250ZW50SW5pdCxcclxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcclxuICBDaGFuZ2VEZXRlY3RvclJlZixcclxuICBDb21wb25lbnQsXHJcbiAgSW5qZWN0LFxyXG4gIElucHV0LFxyXG4gIE9uRGVzdHJveSxcclxuICBPcHRpb25hbCxcclxuICBWaWV3RW5jYXBzdWxhdGlvbixcclxuICBpbnB1dCxcclxuICBvdXRwdXQsXHJcbiAgdmlld0NoaWxkLFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgc3RhcnRXaXRoIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge1xyXG4gIE5neE1hdENhbGVuZGFyQm9keSxcclxuICBOZ3hNYXRDYWxlbmRhckNlbGwsXHJcbiAgTmd4TWF0Q2FsZW5kYXJDZWxsQ2xhc3NGdW5jdGlvbixcclxuICBOZ3hNYXRDYWxlbmRhclVzZXJFdmVudCxcclxufSBmcm9tICcuL2NhbGVuZGFyLWJvZHknO1xyXG5pbXBvcnQgeyBOZ3hNYXREYXRlQWRhcHRlciB9IGZyb20gJy4vY29yZS9kYXRlLWFkYXB0ZXInO1xyXG5pbXBvcnQgeyBOR1hfTUFUX0RBVEVfRk9STUFUUywgTmd4TWF0RGF0ZUZvcm1hdHMgfSBmcm9tICcuL2NvcmUvZGF0ZS1mb3JtYXRzJztcclxuaW1wb3J0IHsgTmd4RGF0ZVJhbmdlIH0gZnJvbSAnLi9kYXRlLXNlbGVjdGlvbi1tb2RlbCc7XHJcbmltcG9ydCB7IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yIH0gZnJvbSAnLi9kYXRlcGlja2VyLWVycm9ycyc7XHJcblxyXG4vKipcclxuICogQW4gaW50ZXJuYWwgY29tcG9uZW50IHVzZWQgdG8gZGlzcGxheSBhIHNpbmdsZSB5ZWFyIGluIHRoZSBkYXRlcGlja2VyLlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ25neC1tYXQteWVhci12aWV3JyxcclxuICB0ZW1wbGF0ZVVybDogJ3llYXItdmlldy5odG1sJyxcclxuICBleHBvcnRBczogJ25neE1hdFllYXJWaWV3JyxcclxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gIHN0YW5kYWxvbmU6IHRydWUsXHJcbiAgaW1wb3J0czogW05neE1hdENhbGVuZGFyQm9keV0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hNYXRZZWFyVmlldzxEPiBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XHJcbiAgcHJpdmF0ZSBfcmVyZW5kZXJTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XHJcblxyXG4gIC8qKiBGbGFnIHVzZWQgdG8gZmlsdGVyIG91dCBzcGFjZS9lbnRlciBrZXl1cCBldmVudHMgdGhhdCBvcmlnaW5hdGVkIG91dHNpZGUgb2YgdGhlIHZpZXcuICovXHJcbiAgcHJpdmF0ZSBfc2VsZWN0aW9uS2V5UHJlc3NlZDogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFRoZSBkYXRlIHRvIGRpc3BsYXkgaW4gdGhpcyB5ZWFyIHZpZXcgKGV2ZXJ5dGhpbmcgb3RoZXIgdGhhbiB0aGUgeWVhciBpcyBpZ25vcmVkKS4gKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCBhY3RpdmVEYXRlKCk6IEQge1xyXG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZURhdGU7XHJcbiAgfVxyXG4gIHNldCBhY3RpdmVEYXRlKHZhbHVlOiBEKSB7XHJcbiAgICBsZXQgb2xkQWN0aXZlRGF0ZSA9IHRoaXMuX2FjdGl2ZURhdGU7XHJcbiAgICBjb25zdCB2YWxpZERhdGUgPVxyXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKSB8fFxyXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci50b2RheSgpO1xyXG4gICAgdGhpcy5fYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmNsYW1wRGF0ZSh2YWxpZERhdGUsIHRoaXMubWluRGF0ZSwgdGhpcy5tYXhEYXRlKTtcclxuICAgIGlmICh0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKG9sZEFjdGl2ZURhdGUpICE9PSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKHRoaXMuX2FjdGl2ZURhdGUpKSB7XHJcbiAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgIH1cclxuICB9XHJcbiAgcHJpdmF0ZSBfYWN0aXZlRGF0ZTogRDtcclxuXHJcbiAgLyoqIFRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZGF0ZS4gKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCBzZWxlY3RlZCgpOiBOZ3hEYXRlUmFuZ2U8RD4gfCBEIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWQ7XHJcbiAgfVxyXG4gIHNldCBzZWxlY3RlZCh2YWx1ZTogTmd4RGF0ZVJhbmdlPEQ+IHwgRCB8IG51bGwpIHtcclxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5neERhdGVSYW5nZSkge1xyXG4gICAgICB0aGlzLl9zZWxlY3RlZCA9IHZhbHVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9zZXRTZWxlY3RlZE1vbnRoKHZhbHVlKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBfc2VsZWN0ZWQ6IE5neERhdGVSYW5nZTxEPiB8IEQgfCBudWxsO1xyXG5cclxuICAvKiogVGhlIG1pbmltdW0gc2VsZWN0YWJsZSBkYXRlLiAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IG1pbkRhdGUoKTogRCB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX21pbkRhdGU7XHJcbiAgfVxyXG4gIHNldCBtaW5EYXRlKHZhbHVlOiBEIHwgbnVsbCkge1xyXG4gICAgdGhpcy5fbWluRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xyXG4gIH1cclxuICBwcml2YXRlIF9taW5EYXRlOiBEIHwgbnVsbDtcclxuXHJcbiAgLyoqIFRoZSBtYXhpbXVtIHNlbGVjdGFibGUgZGF0ZS4gKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCBtYXhEYXRlKCk6IEQgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9tYXhEYXRlO1xyXG4gIH1cclxuICBzZXQgbWF4RGF0ZSh2YWx1ZTogRCB8IG51bGwpIHtcclxuICAgIHRoaXMuX21heERhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBfbWF4RGF0ZTogRCB8IG51bGw7XHJcblxyXG4gIC8qKiBBIGZ1bmN0aW9uIHVzZWQgdG8gZmlsdGVyIHdoaWNoIGRhdGVzIGFyZSBzZWxlY3RhYmxlLiAqL1xyXG4gIGRhdGVGaWx0ZXIgPSBpbnB1dDwoZGF0ZTogRCkgPT4gYm9vbGVhbj4oKTtcclxuXHJcbiAgLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gYWRkIGN1c3RvbSBDU1MgY2xhc3NlcyB0byBkYXRlIGNlbGxzLiAqL1xyXG4gIGRhdGVDbGFzcyA9IGlucHV0PE5neE1hdENhbGVuZGFyQ2VsbENsYXNzRnVuY3Rpb248RD4+KCk7XHJcblxyXG4gIC8qKiBFbWl0cyB3aGVuIGEgbmV3IG1vbnRoIGlzIHNlbGVjdGVkLiAqL1xyXG4gIHJlYWRvbmx5IHNlbGVjdGVkQ2hhbmdlID0gb3V0cHV0PEQ+KCk7XHJcblxyXG4gIC8qKiBFbWl0cyB0aGUgc2VsZWN0ZWQgbW9udGguIFRoaXMgZG9lc24ndCBpbXBseSBhIGNoYW5nZSBvbiB0aGUgc2VsZWN0ZWQgZGF0ZSAqL1xyXG4gIHJlYWRvbmx5IG1vbnRoU2VsZWN0ZWQgPSBvdXRwdXQ8RD4oKTtcclxuXHJcbiAgLyoqIEVtaXRzIHdoZW4gYW55IGRhdGUgaXMgYWN0aXZhdGVkLiAqL1xyXG4gIHJlYWRvbmx5IGFjdGl2ZURhdGVDaGFuZ2UgPSBvdXRwdXQ8RD4oKTtcclxuXHJcbiAgLyoqIFRoZSBib2R5IG9mIGNhbGVuZGFyIHRhYmxlICovXHJcbiAgX21hdENhbGVuZGFyQm9keSA9IHZpZXdDaGlsZChOZ3hNYXRDYWxlbmRhckJvZHkpO1xyXG5cclxuICAvKiogR3JpZCBvZiBjYWxlbmRhciBjZWxscyByZXByZXNlbnRpbmcgdGhlIG1vbnRocyBvZiB0aGUgeWVhci4gKi9cclxuICBfbW9udGhzOiBOZ3hNYXRDYWxlbmRhckNlbGxbXVtdO1xyXG5cclxuICAvKiogVGhlIGxhYmVsIGZvciB0aGlzIHllYXIgKGUuZy4gXCIyMDE3XCIpLiAqL1xyXG4gIF95ZWFyTGFiZWw6IHN0cmluZztcclxuXHJcbiAgLyoqIFRoZSBtb250aCBpbiB0aGlzIHllYXIgdGhhdCB0b2RheSBmYWxscyBvbi4gTnVsbCBpZiB0b2RheSBpcyBpbiBhIGRpZmZlcmVudCB5ZWFyLiAqL1xyXG4gIF90b2RheU1vbnRoOiBudW1iZXIgfCBudWxsO1xyXG5cclxuICAvKipcclxuICAgKiBUaGUgbW9udGggaW4gdGhpcyB5ZWFyIHRoYXQgdGhlIHNlbGVjdGVkIERhdGUgZmFsbHMgb24uXHJcbiAgICogTnVsbCBpZiB0aGUgc2VsZWN0ZWQgRGF0ZSBpcyBpbiBhIGRpZmZlcmVudCB5ZWFyLlxyXG4gICAqL1xyXG4gIF9zZWxlY3RlZE1vbnRoOiBudW1iZXIgfCBudWxsO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHJlYWRvbmx5IF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXHJcbiAgICBAT3B0aW9uYWwoKVxyXG4gICAgQEluamVjdChOR1hfTUFUX0RBVEVfRk9STUFUUylcclxuICAgIHByaXZhdGUgX2RhdGVGb3JtYXRzOiBOZ3hNYXREYXRlRm9ybWF0cyxcclxuICAgIEBPcHRpb25hbCgpIHB1YmxpYyBfZGF0ZUFkYXB0ZXI6IE5neE1hdERhdGVBZGFwdGVyPEQ+LFxyXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZGlyPzogRGlyZWN0aW9uYWxpdHksXHJcbiAgKSB7XHJcbiAgICBpZiAoIXRoaXMuX2RhdGVBZGFwdGVyKSB7XHJcbiAgICAgIHRocm93IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yKCdOZ3hNYXREYXRlQWRhcHRlcicpO1xyXG4gICAgfVxyXG4gICAgaWYgKCF0aGlzLl9kYXRlRm9ybWF0cykge1xyXG4gICAgICB0aHJvdyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcignTkdYX01BVF9EQVRFX0ZPUk1BVFMnKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIudG9kYXkoKTtcclxuICB9XHJcblxyXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgIHRoaXMuX3JlcmVuZGVyU3Vic2NyaXB0aW9uID0gdGhpcy5fZGF0ZUFkYXB0ZXIubG9jYWxlQ2hhbmdlc1xyXG4gICAgICAucGlwZShzdGFydFdpdGgobnVsbCkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5faW5pdCgpKTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5fcmVyZW5kZXJTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICB9XHJcblxyXG4gIC8qKiBIYW5kbGVzIHdoZW4gYSBuZXcgbW9udGggaXMgc2VsZWN0ZWQuICovXHJcbiAgX21vbnRoU2VsZWN0ZWQoZXZlbnQ6IE5neE1hdENhbGVuZGFyVXNlckV2ZW50PG51bWJlcj4pIHtcclxuICAgIGNvbnN0IG1vbnRoID0gZXZlbnQudmFsdWU7XHJcblxyXG4gICAgY29uc3Qgc2VsZWN0ZWRNb250aCA9IHRoaXMuX2RhdGVBZGFwdGVyLmNyZWF0ZURhdGUoXHJcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5hY3RpdmVEYXRlKSxcclxuICAgICAgbW9udGgsXHJcbiAgICAgIDEsXHJcbiAgICApO1xyXG4gICAgdGhpcy5tb250aFNlbGVjdGVkLmVtaXQoc2VsZWN0ZWRNb250aCk7XHJcblxyXG4gICAgY29uc3Qgc2VsZWN0ZWREYXRlID0gdGhpcy5fZ2V0RGF0ZUZyb21Nb250aChtb250aCk7XHJcbiAgICB0aGlzLnNlbGVjdGVkQ2hhbmdlLmVtaXQoc2VsZWN0ZWREYXRlKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2VzIHRoZSBpbmRleCBvZiBhIGNhbGVuZGFyIGJvZHkgY2VsbCB3cmFwcGVkIGluIGluIGFuIGV2ZW50IGFzIGFyZ3VtZW50LiBGb3IgdGhlIGRhdGUgdGhhdFxyXG4gICAqIGNvcnJlc3BvbmRzIHRvIHRoZSBnaXZlbiBjZWxsLCBzZXQgYGFjdGl2ZURhdGVgIHRvIHRoYXQgZGF0ZSBhbmQgZmlyZSBgYWN0aXZlRGF0ZUNoYW5nZWAgd2l0aFxyXG4gICAqIHRoYXQgZGF0ZS5cclxuICAgKlxyXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBtYXRjaCBlYWNoIGNvbXBvbmVudCdzIG1vZGVsIG9mIHRoZSBhY3RpdmUgZGF0ZSB3aXRoIHRoZSBjYWxlbmRhclxyXG4gICAqIGJvZHkgY2VsbCB0aGF0IHdhcyBmb2N1c2VkLiBJdCB1cGRhdGVzIGl0cyB2YWx1ZSBvZiBgYWN0aXZlRGF0ZWAgc3luY2hyb25vdXNseSBhbmQgdXBkYXRlcyB0aGVcclxuICAgKiBwYXJlbnQncyB2YWx1ZSBhc3luY2hyb25vdXNseSB2aWEgdGhlIGBhY3RpdmVEYXRlQ2hhbmdlYCBldmVudC4gVGhlIGNoaWxkIGNvbXBvbmVudCByZWNlaXZlcyBhblxyXG4gICAqIHVwZGF0ZWQgdmFsdWUgYXN5bmNocm9ub3VzbHkgdmlhIHRoZSBgYWN0aXZlQ2VsbGAgSW5wdXQuXHJcbiAgICovXHJcbiAgX3VwZGF0ZUFjdGl2ZURhdGUoZXZlbnQ6IE5neE1hdENhbGVuZGFyVXNlckV2ZW50PG51bWJlcj4pIHtcclxuICAgIGNvbnN0IG1vbnRoID0gZXZlbnQudmFsdWU7XHJcbiAgICBjb25zdCBvbGRBY3RpdmVEYXRlID0gdGhpcy5fYWN0aXZlRGF0ZTtcclxuXHJcbiAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9nZXREYXRlRnJvbU1vbnRoKG1vbnRoKTtcclxuXHJcbiAgICBpZiAodGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUob2xkQWN0aXZlRGF0ZSwgdGhpcy5hY3RpdmVEYXRlKSkge1xyXG4gICAgICB0aGlzLmFjdGl2ZURhdGVDaGFuZ2UuZW1pdCh0aGlzLmFjdGl2ZURhdGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIEhhbmRsZXMga2V5ZG93biBldmVudHMgb24gdGhlIGNhbGVuZGFyIGJvZHkgd2hlbiBjYWxlbmRhciBpcyBpbiB5ZWFyIHZpZXcuICovXHJcbiAgX2hhbmRsZUNhbGVuZGFyQm9keUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICAgIC8vIFRPRE8obW1hbGVyYmEpOiBXZSBjdXJyZW50bHkgYWxsb3cga2V5Ym9hcmQgbmF2aWdhdGlvbiB0byBkaXNhYmxlZCBkYXRlcywgYnV0IGp1c3QgcHJldmVudFxyXG4gICAgLy8gZGlzYWJsZWQgb25lcyBmcm9tIGJlaW5nIHNlbGVjdGVkLiBUaGlzIG1heSBub3QgYmUgaWRlYWwsIHdlIHNob3VsZCBsb29rIGludG8gd2hldGhlclxyXG4gICAgLy8gbmF2aWdhdGlvbiBzaG91bGQgc2tpcCBvdmVyIGRpc2FibGVkIGRhdGVzLCBhbmQgaWYgc28sIGhvdyB0byBpbXBsZW1lbnQgdGhhdCBlZmZpY2llbnRseS5cclxuXHJcbiAgICBjb25zdCBvbGRBY3RpdmVEYXRlID0gdGhpcy5fYWN0aXZlRGF0ZTtcclxuICAgIGNvbnN0IGlzUnRsID0gdGhpcy5faXNSdGwoKTtcclxuXHJcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcclxuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxyXG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyTW9udGhzKHRoaXMuX2FjdGl2ZURhdGUsIGlzUnRsID8gMSA6IC0xKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBSSUdIVF9BUlJPVzpcclxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyh0aGlzLl9hY3RpdmVEYXRlLCBpc1J0bCA/IC0xIDogMSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgVVBfQVJST1c6XHJcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJNb250aHModGhpcy5fYWN0aXZlRGF0ZSwgLTQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIERPV05fQVJST1c6XHJcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJNb250aHModGhpcy5fYWN0aXZlRGF0ZSwgNCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgSE9NRTpcclxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyhcclxuICAgICAgICAgIHRoaXMuX2FjdGl2ZURhdGUsXHJcbiAgICAgICAgICAtdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgodGhpcy5fYWN0aXZlRGF0ZSksXHJcbiAgICAgICAgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBFTkQ6XHJcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJNb250aHMoXHJcbiAgICAgICAgICB0aGlzLl9hY3RpdmVEYXRlLFxyXG4gICAgICAgICAgMTEgLSB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aCh0aGlzLl9hY3RpdmVEYXRlKSxcclxuICAgICAgICApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFBBR0VfVVA6XHJcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJZZWFycyhcclxuICAgICAgICAgIHRoaXMuX2FjdGl2ZURhdGUsXHJcbiAgICAgICAgICBldmVudC5hbHRLZXkgPyAtMTAgOiAtMSxcclxuICAgICAgICApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFBBR0VfRE9XTjpcclxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhclllYXJzKFxyXG4gICAgICAgICAgdGhpcy5fYWN0aXZlRGF0ZSxcclxuICAgICAgICAgIGV2ZW50LmFsdEtleSA/IDEwIDogMSxcclxuICAgICAgICApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIEVOVEVSOlxyXG4gICAgICBjYXNlIFNQQUNFOlxyXG4gICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBvbmx5IHByZXZlbnQgdGhlIGRlZmF1bHQgYWN0aW9uIGhlcmUgd2hpbGUgdGhlIHNlbGVjdGlvbiBoYXBwZW5zIGluXHJcbiAgICAgICAgLy8gYGtleXVwYCBiZWxvdy4gV2UgY2FuJ3QgZG8gdGhlIHNlbGVjdGlvbiBoZXJlLCBiZWNhdXNlIGl0IGNhbiBjYXVzZSB0aGUgY2FsZW5kYXIgdG9cclxuICAgICAgICAvLyByZW9wZW4gaWYgZm9jdXMgaXMgcmVzdG9yZWQgaW1tZWRpYXRlbHkuIFdlIGFsc28gY2FuJ3QgY2FsbCBgcHJldmVudERlZmF1bHRgIG9uIGBrZXl1cGBcclxuICAgICAgICAvLyBiZWNhdXNlIGl0J3MgdG9vIGxhdGUgKHNlZSAjMjMzMDUpLlxyXG4gICAgICAgIHRoaXMuX3NlbGVjdGlvbktleVByZXNzZWQgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIC8vIERvbid0IHByZXZlbnQgZGVmYXVsdCBvciBmb2N1cyBhY3RpdmUgY2VsbCBvbiBrZXlzIHRoYXQgd2UgZG9uJ3QgZXhwbGljaXRseSBoYW5kbGUuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLl9kYXRlQWRhcHRlci5jb21wYXJlRGF0ZShvbGRBY3RpdmVEYXRlLCB0aGlzLmFjdGl2ZURhdGUpKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZlRGF0ZUNoYW5nZS5lbWl0KHRoaXMuYWN0aXZlRGF0ZSk7XHJcbiAgICAgIHRoaXMuX2ZvY3VzQWN0aXZlQ2VsbEFmdGVyVmlld0NoZWNrZWQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcmV2ZW50IHVuZXhwZWN0ZWQgZGVmYXVsdCBhY3Rpb25zIHN1Y2ggYXMgZm9ybSBzdWJtaXNzaW9uLlxyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9XHJcblxyXG4gIC8qKiBIYW5kbGVzIGtleXVwIGV2ZW50cyBvbiB0aGUgY2FsZW5kYXIgYm9keSB3aGVuIGNhbGVuZGFyIGlzIGluIHllYXIgdmlldy4gKi9cclxuICBfaGFuZGxlQ2FsZW5kYXJCb2R5S2V5dXAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICAgIGlmIChldmVudC5rZXlDb2RlID09PSBTUEFDRSB8fCBldmVudC5rZXlDb2RlID09PSBFTlRFUikge1xyXG4gICAgICBpZiAodGhpcy5fc2VsZWN0aW9uS2V5UHJlc3NlZCkge1xyXG4gICAgICAgIHRoaXMuX21vbnRoU2VsZWN0ZWQoe1xyXG4gICAgICAgICAgdmFsdWU6IHRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKHRoaXMuX2FjdGl2ZURhdGUpLFxyXG4gICAgICAgICAgZXZlbnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX3NlbGVjdGlvbktleVByZXNzZWQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBJbml0aWFsaXplcyB0aGlzIHllYXIgdmlldy4gKi9cclxuICBfaW5pdCgpIHtcclxuICAgIHRoaXMuX3NldFNlbGVjdGVkTW9udGgodGhpcy5zZWxlY3RlZCk7XHJcbiAgICB0aGlzLl90b2RheU1vbnRoID0gdGhpcy5fZ2V0TW9udGhJbkN1cnJlbnRZZWFyKHRoaXMuX2RhdGVBZGFwdGVyLnRvZGF5KCkpO1xyXG4gICAgdGhpcy5feWVhckxhYmVsID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhck5hbWUodGhpcy5hY3RpdmVEYXRlKTtcclxuXHJcbiAgICBsZXQgbW9udGhOYW1lcyA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoTmFtZXMoJ3Nob3J0Jyk7XHJcbiAgICAvLyBGaXJzdCByb3cgb2YgbW9udGhzIG9ubHkgY29udGFpbnMgNSBlbGVtZW50cyBzbyB3ZSBjYW4gZml0IHRoZSB5ZWFyIGxhYmVsIG9uIHRoZSBzYW1lIHJvdy5cclxuICAgIHRoaXMuX21vbnRocyA9IFtcclxuICAgICAgWzAsIDEsIDIsIDNdLFxyXG4gICAgICBbNCwgNSwgNiwgN10sXHJcbiAgICAgIFs4LCA5LCAxMCwgMTFdLFxyXG4gICAgXS5tYXAoKHJvdykgPT4gcm93Lm1hcCgobW9udGgpID0+IHRoaXMuX2NyZWF0ZUNlbGxGb3JNb250aChtb250aCwgbW9udGhOYW1lc1ttb250aF0pKSk7XHJcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcclxuICB9XHJcblxyXG4gIC8qKiBGb2N1c2VzIHRoZSBhY3RpdmUgY2VsbCBhZnRlciB0aGUgbWljcm90YXNrIHF1ZXVlIGlzIGVtcHR5LiAqL1xyXG4gIF9mb2N1c0FjdGl2ZUNlbGwoKSB7XHJcbiAgICB0aGlzLl9tYXRDYWxlbmRhckJvZHkoKS5fZm9jdXNBY3RpdmVDZWxsKCk7XHJcbiAgfVxyXG5cclxuICAvKiogU2NoZWR1bGVzIHRoZSBtYXRDYWxlbmRhckJvZHkgdG8gZm9jdXMgdGhlIGFjdGl2ZSBjZWxsIGFmdGVyIGNoYW5nZSBkZXRlY3Rpb24gaGFzIHJ1biAqL1xyXG4gIF9mb2N1c0FjdGl2ZUNlbGxBZnRlclZpZXdDaGVja2VkKCkge1xyXG4gICAgdGhpcy5fbWF0Q2FsZW5kYXJCb2R5KCkuX3NjaGVkdWxlRm9jdXNBY3RpdmVDZWxsQWZ0ZXJWaWV3Q2hlY2tlZCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgbW9udGggaW4gdGhpcyB5ZWFyIHRoYXQgdGhlIGdpdmVuIERhdGUgZmFsbHMgb24uXHJcbiAgICogUmV0dXJucyBudWxsIGlmIHRoZSBnaXZlbiBEYXRlIGlzIGluIGFub3RoZXIgeWVhci5cclxuICAgKi9cclxuICBwcml2YXRlIF9nZXRNb250aEluQ3VycmVudFllYXIoZGF0ZTogRCB8IG51bGwpIHtcclxuICAgIHJldHVybiBkYXRlICYmIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIoZGF0ZSkgPT0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLmFjdGl2ZURhdGUpXHJcbiAgICAgID8gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgoZGF0ZSlcclxuICAgICAgOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGFrZXMgYSBtb250aCBhbmQgcmV0dXJucyBhIG5ldyBkYXRlIGluIHRoZSBzYW1lIGRheSBhbmQgeWVhciBhcyB0aGUgY3VycmVudGx5IGFjdGl2ZSBkYXRlLlxyXG4gICAqICBUaGUgcmV0dXJuZWQgZGF0ZSB3aWxsIGhhdmUgdGhlIHNhbWUgbW9udGggYXMgdGhlIGFyZ3VtZW50IGRhdGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfZ2V0RGF0ZUZyb21Nb250aChtb250aDogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBub3JtYWxpemVkRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmNyZWF0ZURhdGUoXHJcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5hY3RpdmVEYXRlKSxcclxuICAgICAgbW9udGgsXHJcbiAgICAgIDEsXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGRheXNJbk1vbnRoID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TnVtRGF5c0luTW9udGgobm9ybWFsaXplZERhdGUpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLl9kYXRlQWRhcHRlci5jcmVhdGVEYXRlKFxyXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKHRoaXMuYWN0aXZlRGF0ZSksXHJcbiAgICAgIG1vbnRoLFxyXG4gICAgICBNYXRoLm1pbih0aGlzLl9kYXRlQWRhcHRlci5nZXREYXRlKHRoaXMuYWN0aXZlRGF0ZSksIGRheXNJbk1vbnRoKSxcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKiogQ3JlYXRlcyBhbiBNYXRDYWxlbmRhckNlbGwgZm9yIHRoZSBnaXZlbiBtb250aC4gKi9cclxuICBwcml2YXRlIF9jcmVhdGVDZWxsRm9yTW9udGgobW9udGg6IG51bWJlciwgbW9udGhOYW1lOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IGRhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5jcmVhdGVEYXRlKHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5hY3RpdmVEYXRlKSwgbW9udGgsIDEpO1xyXG4gICAgY29uc3QgYXJpYUxhYmVsID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZm9ybWF0KGRhdGUsIHRoaXMuX2RhdGVGb3JtYXRzLmRpc3BsYXkubW9udGhZZWFyQTExeUxhYmVsKTtcclxuICAgIGNvbnN0IGNlbGxDbGFzc2VzID0gdGhpcy5kYXRlQ2xhc3MoKSA/IHRoaXMuZGF0ZUNsYXNzKCkhKGRhdGUsICd5ZWFyJykgOiB1bmRlZmluZWQ7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBOZ3hNYXRDYWxlbmRhckNlbGwoXHJcbiAgICAgIG1vbnRoLFxyXG4gICAgICBtb250aE5hbWUudG9Mb2NhbGVVcHBlckNhc2UoKSxcclxuICAgICAgYXJpYUxhYmVsLFxyXG4gICAgICB0aGlzLl9zaG91bGRFbmFibGVNb250aChtb250aCksXHJcbiAgICAgIGNlbGxDbGFzc2VzLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBnaXZlbiBtb250aCBpcyBlbmFibGVkLiAqL1xyXG4gIHByaXZhdGUgX3Nob3VsZEVuYWJsZU1vbnRoKG1vbnRoOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IGFjdGl2ZVllYXIgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKHRoaXMuYWN0aXZlRGF0ZSk7XHJcblxyXG4gICAgaWYgKFxyXG4gICAgICBtb250aCA9PT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgIG1vbnRoID09PSBudWxsIHx8XHJcbiAgICAgIHRoaXMuX2lzWWVhckFuZE1vbnRoQWZ0ZXJNYXhEYXRlKGFjdGl2ZVllYXIsIG1vbnRoKSB8fFxyXG4gICAgICB0aGlzLl9pc1llYXJBbmRNb250aEJlZm9yZU1pbkRhdGUoYWN0aXZlWWVhciwgbW9udGgpXHJcbiAgICApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5kYXRlRmlsdGVyKCkpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZmlyc3RPZk1vbnRoID0gdGhpcy5fZGF0ZUFkYXB0ZXIuY3JlYXRlRGF0ZShhY3RpdmVZZWFyLCBtb250aCwgMSk7XHJcblxyXG4gICAgLy8gSWYgYW55IGRhdGUgaW4gdGhlIG1vbnRoIGlzIGVuYWJsZWQgY291bnQgdGhlIG1vbnRoIGFzIGVuYWJsZWQuXHJcbiAgICBmb3IgKFxyXG4gICAgICBsZXQgZGF0ZSA9IGZpcnN0T2ZNb250aDtcclxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgoZGF0ZSkgPT0gbW9udGg7XHJcbiAgICAgIGRhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhckRheXMoZGF0ZSwgMSlcclxuICAgICkge1xyXG4gICAgICBpZiAodGhpcy5kYXRlRmlsdGVyKCkoZGF0ZSkpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlc3RzIHdoZXRoZXIgdGhlIGNvbWJpbmF0aW9uIG1vbnRoL3llYXIgaXMgYWZ0ZXIgdGhpcy5tYXhEYXRlLCBjb25zaWRlcmluZ1xyXG4gICAqIGp1c3QgdGhlIG1vbnRoIGFuZCB5ZWFyIG9mIHRoaXMubWF4RGF0ZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2lzWWVhckFuZE1vbnRoQWZ0ZXJNYXhEYXRlKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlcikge1xyXG4gICAgaWYgKHRoaXMubWF4RGF0ZSkge1xyXG4gICAgICBjb25zdCBtYXhZZWFyID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLm1heERhdGUpO1xyXG4gICAgICBjb25zdCBtYXhNb250aCA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKHRoaXMubWF4RGF0ZSk7XHJcblxyXG4gICAgICByZXR1cm4geWVhciA+IG1heFllYXIgfHwgKHllYXIgPT09IG1heFllYXIgJiYgbW9udGggPiBtYXhNb250aCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGVzdHMgd2hldGhlciB0aGUgY29tYmluYXRpb24gbW9udGgveWVhciBpcyBiZWZvcmUgdGhpcy5taW5EYXRlLCBjb25zaWRlcmluZ1xyXG4gICAqIGp1c3QgdGhlIG1vbnRoIGFuZCB5ZWFyIG9mIHRoaXMubWluRGF0ZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2lzWWVhckFuZE1vbnRoQmVmb3JlTWluRGF0ZSh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIpIHtcclxuICAgIGlmICh0aGlzLm1pbkRhdGUpIHtcclxuICAgICAgY29uc3QgbWluWWVhciA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5taW5EYXRlKTtcclxuICAgICAgY29uc3QgbWluTW9udGggPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aCh0aGlzLm1pbkRhdGUpO1xyXG5cclxuICAgICAgcmV0dXJuIHllYXIgPCBtaW5ZZWFyIHx8ICh5ZWFyID09PSBtaW5ZZWFyICYmIG1vbnRoIDwgbWluTW9udGgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHVzZXIgaGFzIHRoZSBSVEwgbGF5b3V0IGRpcmVjdGlvbi4gKi9cclxuICBwcml2YXRlIF9pc1J0bCgpIHtcclxuICAgIHJldHVybiB0aGlzLl9kaXIgJiYgdGhpcy5fZGlyLnZhbHVlID09PSAncnRsJztcclxuICB9XHJcblxyXG4gIC8qKiBTZXRzIHRoZSBjdXJyZW50bHktc2VsZWN0ZWQgbW9udGggYmFzZWQgb24gYSBtb2RlbCB2YWx1ZS4gKi9cclxuICBwcml2YXRlIF9zZXRTZWxlY3RlZE1vbnRoKHZhbHVlOiBOZ3hEYXRlUmFuZ2U8RD4gfCBEIHwgbnVsbCkge1xyXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTmd4RGF0ZVJhbmdlKSB7XHJcbiAgICAgIHRoaXMuX3NlbGVjdGVkTW9udGggPVxyXG4gICAgICAgIHRoaXMuX2dldE1vbnRoSW5DdXJyZW50WWVhcih2YWx1ZS5zdGFydCkgfHwgdGhpcy5fZ2V0TW9udGhJbkN1cnJlbnRZZWFyKHZhbHVlLmVuZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9zZWxlY3RlZE1vbnRoID0gdGhpcy5fZ2V0TW9udGhJbkN1cnJlbnRZZWFyKHZhbHVlKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiPHRhYmxlIGNsYXNzPVwibWF0LWNhbGVuZGFyLXRhYmxlXCIgcm9sZT1cImdyaWRcIj5cclxuICA8dGhlYWQgYXJpYS1oaWRkZW49XCJ0cnVlXCIgY2xhc3M9XCJtYXQtY2FsZW5kYXItdGFibGUtaGVhZGVyXCI+XHJcbiAgICA8dHI+XHJcbiAgICAgIDx0aCBjbGFzcz1cIm1hdC1jYWxlbmRhci10YWJsZS1oZWFkZXItZGl2aWRlclwiIGNvbHNwYW49XCI0XCI+PC90aD5cclxuICAgIDwvdHI+XHJcbiAgPC90aGVhZD5cclxuICA8dGJvZHlcclxuICAgIG5neC1tYXQtY2FsZW5kYXItYm9keVxyXG4gICAgW2xhYmVsXT1cIl95ZWFyTGFiZWxcIlxyXG4gICAgW3Jvd3NdPVwiX21vbnRoc1wiXHJcbiAgICBbdG9kYXlWYWx1ZV09XCJfdG9kYXlNb250aCFcIlxyXG4gICAgW3N0YXJ0VmFsdWVdPVwiX3NlbGVjdGVkTW9udGghXCJcclxuICAgIFtlbmRWYWx1ZV09XCJfc2VsZWN0ZWRNb250aCFcIlxyXG4gICAgW2xhYmVsTWluUmVxdWlyZWRDZWxsc109XCIyXCJcclxuICAgIFtudW1Db2xzXT1cIjRcIlxyXG4gICAgW2NlbGxBc3BlY3RSYXRpb109XCI0IC8gN1wiXHJcbiAgICBbYWN0aXZlQ2VsbF09XCJfZGF0ZUFkYXB0ZXIuZ2V0TW9udGgoYWN0aXZlRGF0ZSlcIlxyXG4gICAgKHNlbGVjdGVkVmFsdWVDaGFuZ2UpPVwiX21vbnRoU2VsZWN0ZWQoJGV2ZW50KVwiXHJcbiAgICAoYWN0aXZlRGF0ZUNoYW5nZSk9XCJfdXBkYXRlQWN0aXZlRGF0ZSgkZXZlbnQpXCJcclxuICAgIChrZXl1cCk9XCJfaGFuZGxlQ2FsZW5kYXJCb2R5S2V5dXAoJGV2ZW50KVwiXHJcbiAgICAoa2V5ZG93bik9XCJfaGFuZGxlQ2FsZW5kYXJCb2R5S2V5ZG93bigkZXZlbnQpXCI+PC90Ym9keT5cclxuPC90YWJsZT5cclxuIl19