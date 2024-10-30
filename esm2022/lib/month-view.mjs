import { DOWN_ARROW, END, ENTER, ESCAPE, HOME, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, SPACE, UP_ARROW, hasModifierKey, } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, Inject, Input, Optional, ViewEncapsulation, input, output, viewChild, } from '@angular/core';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { NgxMatCalendarBody, NgxMatCalendarCell, } from './calendar-body';
import { NGX_MAT_DATE_FORMATS } from './core/date-formats';
import { NGX_MAT_DATE_RANGE_SELECTION_STRATEGY, } from './date-range-selection-strategy';
import { NgxDateRange } from './date-selection-model';
import { createMissingDateImplError } from './datepicker-errors';
import * as i0 from "@angular/core";
import * as i1 from "./core/date-adapter";
import * as i2 from "@angular/cdk/bidi";
const DAYS_PER_WEEK = 7;
/**
 * An internal component used to display a single month in the datepicker.
 * @docs-private
 */
export class NgxMatMonthView {
    /**
     * The date to display in this month view (everything other than the month and year is ignored).
     */
    get activeDate() {
        return this._activeDate;
    }
    set activeDate(value) {
        const oldActiveDate = this._activeDate;
        const validDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value)) ||
            this._dateAdapter.today();
        this._activeDate = this._dateAdapter.clampDate(validDate, this.minDate, this.maxDate);
        if (!this._hasSameMonthAndYear(oldActiveDate, this._activeDate)) {
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
        this._setRanges(this._selected);
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
    constructor(_changeDetectorRef, _dateFormats, _dateAdapter, _dir, _rangeStrategy) {
        this._changeDetectorRef = _changeDetectorRef;
        this._dateFormats = _dateFormats;
        this._dateAdapter = _dateAdapter;
        this._dir = _dir;
        this._rangeStrategy = _rangeStrategy;
        this._rerenderSubscription = Subscription.EMPTY;
        /** Function used to filter which dates are selectable. */
        this.dateFilter = input();
        /** Function that can be used to add custom CSS classes to dates. */
        this.dateClass = input();
        /** Start of the comparison range. */
        this.comparisonStart = input();
        /** End of the comparison range. */
        this.comparisonEnd = input();
        /** ARIA Accessible name of the `<input matStartDate/>` */
        this.startDateAccessibleName = input();
        /** ARIA Accessible name of the `<input matEndDate/>` */
        this.endDateAccessibleName = input();
        /** Origin of active drag, or null when dragging is not active. */
        this.activeDrag = input(null);
        /** Emits when a new date is selected. */
        this.selectedChange = output();
        /** Emits when any date is selected. */
        this._userSelection = output();
        /** Emits when the user initiates a date range drag via mouse or touch. */
        this.dragStarted = output();
        /**
         * Emits when the user completes or cancels a date range drag.
         * Emits null when the drag was canceled or the newly selected date range if completed.
         */
        this.dragEnded = output();
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
    ngOnChanges(changes) {
        const comparisonChange = changes['comparisonStart'] || changes['comparisonEnd'];
        if (comparisonChange && !comparisonChange.firstChange) {
            this._setRanges(this.selected);
        }
        if (changes['activeDrag'] && !this.activeDrag()) {
            this._clearPreview();
        }
    }
    ngOnDestroy() {
        this._rerenderSubscription.unsubscribe();
    }
    /** Handles when a new date is selected. */
    _dateSelected(event) {
        const date = event.value;
        const selectedDate = this._getDateFromDayOfMonth(date);
        let rangeStartDate;
        let rangeEndDate;
        if (this._selected instanceof NgxDateRange) {
            rangeStartDate = this._getDateInCurrentMonth(this._selected.start);
            rangeEndDate = this._getDateInCurrentMonth(this._selected.end);
        }
        else {
            rangeStartDate = rangeEndDate = this._getDateInCurrentMonth(this._selected);
        }
        if (rangeStartDate !== date || rangeEndDate !== date) {
            this.selectedChange.emit(selectedDate);
        }
        this._userSelection.emit({ value: selectedDate, event: event.event });
        this._clearPreview();
        this._changeDetectorRef.markForCheck();
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
        this.activeDate = this._getDateFromDayOfMonth(month);
        if (this._dateAdapter.compareDate(oldActiveDate, this.activeDate)) {
            this.activeDateChange.emit(this._activeDate);
        }
    }
    /** Handles keydown events on the calendar body when calendar is in month view. */
    _handleCalendarBodyKeydown(event) {
        // TODO(mmalerba): We currently allow keyboard navigation to disabled dates, but just prevent
        // disabled ones from being selected. This may not be ideal, we should look into whether
        // navigation should skip over disabled dates, and if so, how to implement that efficiently.
        const oldActiveDate = this._activeDate;
        const isRtl = this._isRtl();
        switch (event.keyCode) {
            case LEFT_ARROW:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, isRtl ? 1 : -1);
                break;
            case RIGHT_ARROW:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, isRtl ? -1 : 1);
                break;
            case UP_ARROW:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, -7);
                break;
            case DOWN_ARROW:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, 7);
                break;
            case HOME:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, 1 - this._dateAdapter.getDate(this._activeDate));
                break;
            case END:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, this._dateAdapter.getNumDaysInMonth(this._activeDate) -
                    this._dateAdapter.getDate(this._activeDate));
                break;
            case PAGE_UP:
                this.activeDate = event.altKey
                    ? this._dateAdapter.addCalendarYears(this._activeDate, -1)
                    : this._dateAdapter.addCalendarMonths(this._activeDate, -1);
                break;
            case PAGE_DOWN:
                this.activeDate = event.altKey
                    ? this._dateAdapter.addCalendarYears(this._activeDate, 1)
                    : this._dateAdapter.addCalendarMonths(this._activeDate, 1);
                break;
            case ENTER:
            case SPACE:
                this._selectionKeyPressed = true;
                if (this._canSelect(this._activeDate)) {
                    // Prevent unexpected default actions such as form submission.
                    // Note that we only prevent the default action here while the selection happens in
                    // `keyup` below. We can't do the selection here, because it can cause the calendar to
                    // reopen if focus is restored immediately. We also can't call `preventDefault` on `keyup`
                    // because it's too late (see #23305).
                    event.preventDefault();
                }
                return;
            case ESCAPE:
                // Abort the current range selection if the user presses escape mid-selection.
                if (this._previewEnd != null && !hasModifierKey(event)) {
                    this._clearPreview();
                    // If a drag is in progress, cancel the drag without changing the
                    // current selection.
                    if (this.activeDrag()) {
                        this.dragEnded.emit({ value: null, event });
                    }
                    else {
                        this.selectedChange.emit(null);
                        this._userSelection.emit({ value: null, event });
                    }
                    event.preventDefault();
                    event.stopPropagation(); // Prevents the overlay from closing.
                }
                return;
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
    /** Handles keyup events on the calendar body when calendar is in month view. */
    _handleCalendarBodyKeyup(event) {
        if (event.keyCode === SPACE || event.keyCode === ENTER) {
            if (this._selectionKeyPressed && this._canSelect(this._activeDate)) {
                this._dateSelected({
                    value: this._dateAdapter.getDate(this._activeDate),
                    event,
                });
            }
            this._selectionKeyPressed = false;
        }
    }
    /** Initializes this month view. */
    _init() {
        this._setRanges(this.selected);
        this._todayDate = this._getCellCompareValue(this._dateAdapter.today());
        this._monthLabel = this._dateFormats.display.monthLabel
            ? this._dateAdapter.format(this.activeDate, this._dateFormats.display.monthLabel)
            : this._dateAdapter
                .getMonthNames('short')[this._dateAdapter.getMonth(this.activeDate)].toLocaleUpperCase();
        let firstOfMonth = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), this._dateAdapter.getMonth(this.activeDate), 1);
        this._firstWeekOffset =
            (DAYS_PER_WEEK +
                this._dateAdapter.getDayOfWeek(firstOfMonth) -
                this._dateAdapter.getFirstDayOfWeek()) %
                DAYS_PER_WEEK;
        this._initWeekdays();
        this._createWeekCells();
        this._changeDetectorRef.markForCheck();
    }
    /** Focuses the active cell after the microtask queue is empty. */
    _focusActiveCell(movePreview) {
        this._matCalendarBody()._focusActiveCell(movePreview);
    }
    /** Focuses the active cell after change detection has run and the microtask queue is empty. */
    _focusActiveCellAfterViewChecked() {
        this._matCalendarBody()._scheduleFocusActiveCellAfterViewChecked();
    }
    /** Called when the user has activated a new cell and the preview needs to be updated. */
    _previewChanged({ event, value: cell }) {
        if (this._rangeStrategy) {
            // We can assume that this will be a range, because preview
            // events aren't fired for single date selections.
            const value = cell ? cell.rawValue : null;
            const previewRange = this._rangeStrategy.createPreview(value, this.selected, event);
            this._previewStart = this._getCellCompareValue(previewRange.start);
            this._previewEnd = this._getCellCompareValue(previewRange.end);
            if (this.activeDrag() && value) {
                const dragRange = this._rangeStrategy.createDrag?.(this.activeDrag().value, this.selected, value, event);
                if (dragRange) {
                    this._previewStart = this._getCellCompareValue(dragRange.start);
                    this._previewEnd = this._getCellCompareValue(dragRange.end);
                }
            }
            // Note that here we need to use `detectChanges`, rather than `markForCheck`, because
            // the way `_focusActiveCell` is set up at the moment makes it fire at the wrong time
            // when navigating one month back using the keyboard which will cause this handler
            // to throw a "changed after checked" error when updating the preview state.
            this._changeDetectorRef.detectChanges();
        }
    }
    /**
     * Called when the user has ended a drag. If the drag/drop was successful,
     * computes and emits the new range selection.
     */
    _dragEnded(event) {
        if (!this.activeDrag())
            return;
        if (event.value) {
            // Propagate drag effect
            const dragDropResult = this._rangeStrategy?.createDrag?.(this.activeDrag().value, this.selected, event.value, event.event);
            this.dragEnded.emit({
                value: dragDropResult ?? null,
                event: event.event,
            });
        }
        else {
            this.dragEnded.emit({ value: null, event: event.event });
        }
    }
    /**
     * Takes a day of the month and returns a new date in the same month and year as the currently
     *  active date. The returned date will have the same day of the month as the argument date.
     */
    _getDateFromDayOfMonth(dayOfMonth) {
        return this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), this._dateAdapter.getMonth(this.activeDate), dayOfMonth);
    }
    /** Initializes the weekdays. */
    _initWeekdays() {
        const firstDayOfWeek = this._dateAdapter.getFirstDayOfWeek();
        const narrowWeekdays = this._dateAdapter.getDayOfWeekNames('narrow');
        const longWeekdays = this._dateAdapter.getDayOfWeekNames('long');
        // Rotate the labels for days of the week based on the configured first day of the week.
        let weekdays = longWeekdays.map((long, i) => {
            return { long, narrow: narrowWeekdays[i] };
        });
        this._weekdays = weekdays.slice(firstDayOfWeek).concat(weekdays.slice(0, firstDayOfWeek));
    }
    /** Creates MatCalendarCells for the dates in this month. */
    _createWeekCells() {
        const daysInMonth = this._dateAdapter.getNumDaysInMonth(this.activeDate);
        const dateNames = this._dateAdapter.getDateNames();
        this._weeks = [[]];
        for (let i = 0, cell = this._firstWeekOffset; i < daysInMonth; i++, cell++) {
            if (cell == DAYS_PER_WEEK) {
                this._weeks.push([]);
                cell = 0;
            }
            const date = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), this._dateAdapter.getMonth(this.activeDate), i + 1);
            const enabled = this._shouldEnableDate(date);
            const ariaLabel = this._dateAdapter.format(date, this._dateFormats.display.dateA11yLabel);
            const cellClasses = this.dateClass() ? this.dateClass()(date, 'month') : undefined;
            this._weeks[this._weeks.length - 1].push(new NgxMatCalendarCell(i + 1, dateNames[i], ariaLabel, enabled, cellClasses, this._getCellCompareValue(date), date));
        }
    }
    /** Date filter for the month */
    _shouldEnableDate(date) {
        return (!!date &&
            (!this.minDate || this._dateAdapter.compareDate(date, this.minDate) >= 0) &&
            (!this.maxDate || this._dateAdapter.compareDate(date, this.maxDate) <= 0) &&
            (!this.dateFilter() || this.dateFilter()(date)));
    }
    /**
     * Gets the date in this month that the given Date falls on.
     * Returns null if the given Date is in another month.
     */
    _getDateInCurrentMonth(date) {
        return date && this._hasSameMonthAndYear(date, this.activeDate)
            ? this._dateAdapter.getDate(date)
            : null;
    }
    /** Checks whether the 2 dates are non-null and fall within the same month of the same year. */
    _hasSameMonthAndYear(d1, d2) {
        return !!(d1 &&
            d2 &&
            this._dateAdapter.getMonth(d1) == this._dateAdapter.getMonth(d2) &&
            this._dateAdapter.getYear(d1) == this._dateAdapter.getYear(d2));
    }
    /** Gets the value that will be used to one cell to another. */
    _getCellCompareValue(date) {
        if (date) {
            // We use the time since the Unix epoch to compare dates in this view, rather than the
            // cell values, because we need to support ranges that span across multiple months/years.
            const year = this._dateAdapter.getYear(date);
            const month = this._dateAdapter.getMonth(date);
            const day = this._dateAdapter.getDate(date);
            return new Date(year, month, day).getTime();
        }
        return null;
    }
    /** Determines whether the user has the RTL layout direction. */
    _isRtl() {
        return this._dir && this._dir.value === 'rtl';
    }
    /** Sets the current range based on a model value. */
    _setRanges(selectedValue) {
        if (selectedValue instanceof NgxDateRange) {
            this._rangeStart = this._getCellCompareValue(selectedValue.start);
            this._rangeEnd = this._getCellCompareValue(selectedValue.end);
            this._isRange = true;
        }
        else {
            this._rangeStart = this._rangeEnd = this._getCellCompareValue(selectedValue);
            this._isRange = false;
        }
        this._comparisonRangeStart = this._getCellCompareValue(this.comparisonStart());
        this._comparisonRangeEnd = this._getCellCompareValue(this.comparisonEnd());
    }
    /** Gets whether a date can be selected in the month view. */
    _canSelect(date) {
        return !this.dateFilter() || this.dateFilter()(date);
    }
    /** Clears out preview state. */
    _clearPreview() {
        this._previewStart = this._previewEnd = null;
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatMonthView, deps: [{ token: i0.ChangeDetectorRef }, { token: NGX_MAT_DATE_FORMATS, optional: true }, { token: i1.NgxMatDateAdapter, optional: true }, { token: i2.Directionality, optional: true }, { token: NGX_MAT_DATE_RANGE_SELECTION_STRATEGY, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    /** @nocollapse */ static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.3", type: NgxMatMonthView, isStandalone: true, selector: "ngx-mat-month-view", inputs: { activeDate: { classPropertyName: "activeDate", publicName: "activeDate", isSignal: false, isRequired: false, transformFunction: null }, selected: { classPropertyName: "selected", publicName: "selected", isSignal: false, isRequired: false, transformFunction: null }, minDate: { classPropertyName: "minDate", publicName: "minDate", isSignal: false, isRequired: false, transformFunction: null }, maxDate: { classPropertyName: "maxDate", publicName: "maxDate", isSignal: false, isRequired: false, transformFunction: null }, dateFilter: { classPropertyName: "dateFilter", publicName: "dateFilter", isSignal: true, isRequired: false, transformFunction: null }, dateClass: { classPropertyName: "dateClass", publicName: "dateClass", isSignal: true, isRequired: false, transformFunction: null }, comparisonStart: { classPropertyName: "comparisonStart", publicName: "comparisonStart", isSignal: true, isRequired: false, transformFunction: null }, comparisonEnd: { classPropertyName: "comparisonEnd", publicName: "comparisonEnd", isSignal: true, isRequired: false, transformFunction: null }, startDateAccessibleName: { classPropertyName: "startDateAccessibleName", publicName: "startDateAccessibleName", isSignal: true, isRequired: false, transformFunction: null }, endDateAccessibleName: { classPropertyName: "endDateAccessibleName", publicName: "endDateAccessibleName", isSignal: true, isRequired: false, transformFunction: null }, activeDrag: { classPropertyName: "activeDrag", publicName: "activeDrag", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { selectedChange: "selectedChange", _userSelection: "_userSelection", dragStarted: "dragStarted", dragEnded: "dragEnded", activeDateChange: "activeDateChange" }, viewQueries: [{ propertyName: "_matCalendarBody", first: true, predicate: NgxMatCalendarBody, descendants: true, isSignal: true }], exportAs: ["ngxMatMonthView"], usesOnChanges: true, ngImport: i0, template: "<table class=\"mat-calendar-table\" role=\"grid\">\r\n  <thead class=\"mat-calendar-table-header\">\r\n    <tr>\r\n      @for (day of _weekdays; track $index) {\r\n        <th scope=\"col\">\r\n          <span class=\"cdk-visually-hidden\">{{ day.long }}</span>\r\n          <span aria-hidden=\"true\">{{ day.narrow }}</span>\r\n        </th>\r\n      }\r\n    </tr>\r\n    <tr>\r\n      <th\r\n        aria-hidden=\"true\"\r\n        class=\"mat-calendar-table-header-divider\"\r\n        colspan=\"7\"\r\n      ></th>\r\n    </tr>\r\n  </thead>\r\n  <tbody\r\n    ngx-mat-calendar-body\r\n    [label]=\"_monthLabel\"\r\n    [rows]=\"_weeks\"\r\n    [todayValue]=\"_todayDate!\"\r\n    [startValue]=\"_rangeStart!\"\r\n    [endValue]=\"_rangeEnd!\"\r\n    [comparisonStart]=\"_comparisonRangeStart\"\r\n    [comparisonEnd]=\"_comparisonRangeEnd\"\r\n    [previewStart]=\"_previewStart\"\r\n    [previewEnd]=\"_previewEnd\"\r\n    [isRange]=\"_isRange\"\r\n    [labelMinRequiredCells]=\"3\"\r\n    [activeCell]=\"_dateAdapter.getDate(activeDate) - 1\"\r\n    [startDateAccessibleName]=\"startDateAccessibleName()\"\r\n    [endDateAccessibleName]=\"endDateAccessibleName()\"\r\n    (selectedValueChange)=\"_dateSelected($event)\"\r\n    (activeDateChange)=\"_updateActiveDate($event)\"\r\n    (previewChange)=\"_previewChanged($event)\"\r\n    (dragStarted)=\"dragStarted.emit($event)\"\r\n    (dragEnded)=\"_dragEnded($event)\"\r\n    (keyup)=\"_handleCalendarBodyKeyup($event)\"\r\n    (keydown)=\"_handleCalendarBodyKeydown($event)\"\r\n  ></tbody>\r\n</table>\r\n", dependencies: [{ kind: "component", type: NgxMatCalendarBody, selector: "[ngx-mat-calendar-body]", inputs: ["label", "rows", "todayValue", "startValue", "endValue", "labelMinRequiredCells", "numCols", "activeCell", "isRange", "cellAspectRatio", "comparisonStart", "comparisonEnd", "previewStart", "previewEnd", "startDateAccessibleName", "endDateAccessibleName"], outputs: ["selectedValueChange", "previewChange", "activeDateChange", "dragStarted", "dragEnded"], exportAs: ["matCalendarBody"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatMonthView, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-mat-month-view', exportAs: 'ngxMatMonthView', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgxMatCalendarBody], template: "<table class=\"mat-calendar-table\" role=\"grid\">\r\n  <thead class=\"mat-calendar-table-header\">\r\n    <tr>\r\n      @for (day of _weekdays; track $index) {\r\n        <th scope=\"col\">\r\n          <span class=\"cdk-visually-hidden\">{{ day.long }}</span>\r\n          <span aria-hidden=\"true\">{{ day.narrow }}</span>\r\n        </th>\r\n      }\r\n    </tr>\r\n    <tr>\r\n      <th\r\n        aria-hidden=\"true\"\r\n        class=\"mat-calendar-table-header-divider\"\r\n        colspan=\"7\"\r\n      ></th>\r\n    </tr>\r\n  </thead>\r\n  <tbody\r\n    ngx-mat-calendar-body\r\n    [label]=\"_monthLabel\"\r\n    [rows]=\"_weeks\"\r\n    [todayValue]=\"_todayDate!\"\r\n    [startValue]=\"_rangeStart!\"\r\n    [endValue]=\"_rangeEnd!\"\r\n    [comparisonStart]=\"_comparisonRangeStart\"\r\n    [comparisonEnd]=\"_comparisonRangeEnd\"\r\n    [previewStart]=\"_previewStart\"\r\n    [previewEnd]=\"_previewEnd\"\r\n    [isRange]=\"_isRange\"\r\n    [labelMinRequiredCells]=\"3\"\r\n    [activeCell]=\"_dateAdapter.getDate(activeDate) - 1\"\r\n    [startDateAccessibleName]=\"startDateAccessibleName()\"\r\n    [endDateAccessibleName]=\"endDateAccessibleName()\"\r\n    (selectedValueChange)=\"_dateSelected($event)\"\r\n    (activeDateChange)=\"_updateActiveDate($event)\"\r\n    (previewChange)=\"_previewChanged($event)\"\r\n    (dragStarted)=\"dragStarted.emit($event)\"\r\n    (dragEnded)=\"_dragEnded($event)\"\r\n    (keyup)=\"_handleCalendarBodyKeyup($event)\"\r\n    (keydown)=\"_handleCalendarBodyKeydown($event)\"\r\n  ></tbody>\r\n</table>\r\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NGX_MAT_DATE_FORMATS]
                }] }, { type: i1.NgxMatDateAdapter, decorators: [{
                    type: Optional
                }] }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [NGX_MAT_DATE_RANGE_SELECTION_STRATEGY]
                }, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9udGgtdmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2RhdGV0aW1lLXBpY2tlci9zcmMvbGliL21vbnRoLXZpZXcudHMiLCIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9kYXRldGltZS1waWNrZXIvc3JjL2xpYi9tb250aC12aWV3Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUNMLFVBQVUsRUFDVixHQUFHLEVBQ0gsS0FBSyxFQUNMLE1BQU0sRUFDTixJQUFJLEVBQ0osVUFBVSxFQUNWLFNBQVMsRUFDVCxPQUFPLEVBQ1AsV0FBVyxFQUNYLEtBQUssRUFDTCxRQUFRLEVBQ1IsY0FBYyxHQUNmLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUVMLHVCQUF1QixFQUV2QixTQUFTLEVBQ1QsTUFBTSxFQUNOLEtBQUssRUFHTCxRQUFRLEVBRVIsaUJBQWlCLEVBQ2pCLEtBQUssRUFDTCxNQUFNLEVBQ04sU0FBUyxHQUNWLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzNDLE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsa0JBQWtCLEdBR25CLE1BQU0saUJBQWlCLENBQUM7QUFFekIsT0FBTyxFQUFFLG9CQUFvQixFQUFxQixNQUFNLHFCQUFxQixDQUFDO0FBQzlFLE9BQU8sRUFDTCxxQ0FBcUMsR0FFdEMsTUFBTSxpQ0FBaUMsQ0FBQztBQUN6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdEQsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0scUJBQXFCLENBQUM7Ozs7QUFFakUsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBRXhCOzs7R0FHRztBQVVILE1BQU0sT0FBTyxlQUFlO0lBTTFCOztPQUVHO0lB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ZGsvYmlkaSc7XHJcbmltcG9ydCB7XHJcbiAgRE9XTl9BUlJPVyxcclxuICBFTkQsXHJcbiAgRU5URVIsXHJcbiAgRVNDQVBFLFxyXG4gIEhPTUUsXHJcbiAgTEVGVF9BUlJPVyxcclxuICBQQUdFX0RPV04sXHJcbiAgUEFHRV9VUCxcclxuICBSSUdIVF9BUlJPVyxcclxuICBTUEFDRSxcclxuICBVUF9BUlJPVyxcclxuICBoYXNNb2RpZmllcktleSxcclxufSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xyXG5pbXBvcnQge1xyXG4gIEFmdGVyQ29udGVudEluaXQsXHJcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXHJcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXHJcbiAgQ29tcG9uZW50LFxyXG4gIEluamVjdCxcclxuICBJbnB1dCxcclxuICBPbkNoYW5nZXMsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9wdGlvbmFsLFxyXG4gIFNpbXBsZUNoYW5nZXMsXHJcbiAgVmlld0VuY2Fwc3VsYXRpb24sXHJcbiAgaW5wdXQsXHJcbiAgb3V0cHV0LFxyXG4gIHZpZXdDaGlsZCxcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IHN0YXJ0V2l0aCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHtcclxuICBOZ3hNYXRDYWxlbmRhckJvZHksXHJcbiAgTmd4TWF0Q2FsZW5kYXJDZWxsLFxyXG4gIE5neE1hdENhbGVuZGFyQ2VsbENsYXNzRnVuY3Rpb24sXHJcbiAgTmd4TWF0Q2FsZW5kYXJVc2VyRXZlbnQsXHJcbn0gZnJvbSAnLi9jYWxlbmRhci1ib2R5JztcclxuaW1wb3J0IHsgTmd4TWF0RGF0ZUFkYXB0ZXIgfSBmcm9tICcuL2NvcmUvZGF0ZS1hZGFwdGVyJztcclxuaW1wb3J0IHsgTkdYX01BVF9EQVRFX0ZPUk1BVFMsIE5neE1hdERhdGVGb3JtYXRzIH0gZnJvbSAnLi9jb3JlL2RhdGUtZm9ybWF0cyc7XHJcbmltcG9ydCB7XHJcbiAgTkdYX01BVF9EQVRFX1JBTkdFX1NFTEVDVElPTl9TVFJBVEVHWSxcclxuICBOZ3hNYXREYXRlUmFuZ2VTZWxlY3Rpb25TdHJhdGVneSxcclxufSBmcm9tICcuL2RhdGUtcmFuZ2Utc2VsZWN0aW9uLXN0cmF0ZWd5JztcclxuaW1wb3J0IHsgTmd4RGF0ZVJhbmdlIH0gZnJvbSAnLi9kYXRlLXNlbGVjdGlvbi1tb2RlbCc7XHJcbmltcG9ydCB7IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yIH0gZnJvbSAnLi9kYXRlcGlja2VyLWVycm9ycyc7XHJcblxyXG5jb25zdCBEQVlTX1BFUl9XRUVLID0gNztcclxuXHJcbi8qKlxyXG4gKiBBbiBpbnRlcm5hbCBjb21wb25lbnQgdXNlZCB0byBkaXNwbGF5IGEgc2luZ2xlIG1vbnRoIGluIHRoZSBkYXRlcGlja2VyLlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ25neC1tYXQtbW9udGgtdmlldycsXHJcbiAgdGVtcGxhdGVVcmw6ICdtb250aC12aWV3Lmh0bWwnLFxyXG4gIGV4cG9ydEFzOiAnbmd4TWF0TW9udGhWaWV3JyxcclxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gIHN0YW5kYWxvbmU6IHRydWUsXHJcbiAgaW1wb3J0czogW05neE1hdENhbGVuZGFyQm9keV0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hNYXRNb250aFZpZXc8RD4gaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XHJcbiAgcHJpdmF0ZSBfcmVyZW5kZXJTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XHJcblxyXG4gIC8qKiBGbGFnIHVzZWQgdG8gZmlsdGVyIG91dCBzcGFjZS9lbnRlciBrZXl1cCBldmVudHMgdGhhdCBvcmlnaW5hdGVkIG91dHNpZGUgb2YgdGhlIHZpZXcuICovXHJcbiAgcHJpdmF0ZSBfc2VsZWN0aW9uS2V5UHJlc3NlZDogYm9vbGVhbjtcclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGRhdGUgdG8gZGlzcGxheSBpbiB0aGlzIG1vbnRoIHZpZXcgKGV2ZXJ5dGhpbmcgb3RoZXIgdGhhbiB0aGUgbW9udGggYW5kIHllYXIgaXMgaWdub3JlZCkuXHJcbiAgICovXHJcbiAgQElucHV0KClcclxuICBnZXQgYWN0aXZlRGF0ZSgpOiBEIHtcclxuICAgIHJldHVybiB0aGlzLl9hY3RpdmVEYXRlO1xyXG4gIH1cclxuICBzZXQgYWN0aXZlRGF0ZSh2YWx1ZTogRCkge1xyXG4gICAgY29uc3Qgb2xkQWN0aXZlRGF0ZSA9IHRoaXMuX2FjdGl2ZURhdGU7XHJcbiAgICBjb25zdCB2YWxpZERhdGUgPVxyXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKSB8fFxyXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci50b2RheSgpO1xyXG4gICAgdGhpcy5fYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmNsYW1wRGF0ZSh2YWxpZERhdGUsIHRoaXMubWluRGF0ZSwgdGhpcy5tYXhEYXRlKTtcclxuICAgIGlmICghdGhpcy5faGFzU2FtZU1vbnRoQW5kWWVhcihvbGRBY3RpdmVEYXRlLCB0aGlzLl9hY3RpdmVEYXRlKSkge1xyXG4gICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHByaXZhdGUgX2FjdGl2ZURhdGU6IEQ7XHJcblxyXG4gIC8qKiBUaGUgY3VycmVudGx5IHNlbGVjdGVkIGRhdGUuICovXHJcbiAgQElucHV0KClcclxuICBnZXQgc2VsZWN0ZWQoKTogTmd4RGF0ZVJhbmdlPEQ+IHwgRCB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkO1xyXG4gIH1cclxuICBzZXQgc2VsZWN0ZWQodmFsdWU6IE5neERhdGVSYW5nZTxEPiB8IEQgfCBudWxsKSB7XHJcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBOZ3hEYXRlUmFuZ2UpIHtcclxuICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB2YWx1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuX3NlbGVjdGVkID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fc2V0UmFuZ2VzKHRoaXMuX3NlbGVjdGVkKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBfc2VsZWN0ZWQ6IE5neERhdGVSYW5nZTxEPiB8IEQgfCBudWxsO1xyXG5cclxuICAvKiogVGhlIG1pbmltdW0gc2VsZWN0YWJsZSBkYXRlLiAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IG1pbkRhdGUoKTogRCB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX21pbkRhdGU7XHJcbiAgfVxyXG4gIHNldCBtaW5EYXRlKHZhbHVlOiBEIHwgbnVsbCkge1xyXG4gICAgdGhpcy5fbWluRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xyXG4gIH1cclxuICBwcml2YXRlIF9taW5EYXRlOiBEIHwgbnVsbDtcclxuXHJcbiAgLyoqIFRoZSBtYXhpbXVtIHNlbGVjdGFibGUgZGF0ZS4gKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCBtYXhEYXRlKCk6IEQgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9tYXhEYXRlO1xyXG4gIH1cclxuICBzZXQgbWF4RGF0ZSh2YWx1ZTogRCB8IG51bGwpIHtcclxuICAgIHRoaXMuX21heERhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBfbWF4RGF0ZTogRCB8IG51bGw7XHJcblxyXG4gIC8qKiBGdW5jdGlvbiB1c2VkIHRvIGZpbHRlciB3aGljaCBkYXRlcyBhcmUgc2VsZWN0YWJsZS4gKi9cclxuICBkYXRlRmlsdGVyID0gaW5wdXQ8KGRhdGU6IEQpID0+IGJvb2xlYW4+KCk7XHJcblxyXG4gIC8qKiBGdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGFkZCBjdXN0b20gQ1NTIGNsYXNzZXMgdG8gZGF0ZXMuICovXHJcbiAgZGF0ZUNsYXNzID0gaW5wdXQ8Tmd4TWF0Q2FsZW5kYXJDZWxsQ2xhc3NGdW5jdGlvbjxEPj4oKTtcclxuXHJcbiAgLyoqIFN0YXJ0IG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xyXG4gIGNvbXBhcmlzb25TdGFydCA9IGlucHV0PEQgfCBudWxsPigpO1xyXG5cclxuICAvKiogRW5kIG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xyXG4gIGNvbXBhcmlzb25FbmQgPSBpbnB1dDxEIHwgbnVsbD4oKTtcclxuXHJcbiAgLyoqIEFSSUEgQWNjZXNzaWJsZSBuYW1lIG9mIHRoZSBgPGlucHV0IG1hdFN0YXJ0RGF0ZS8+YCAqL1xyXG4gIHN0YXJ0RGF0ZUFjY2Vzc2libGVOYW1lID0gaW5wdXQ8c3RyaW5nIHwgbnVsbD4oKTtcclxuXHJcbiAgLyoqIEFSSUEgQWNjZXNzaWJsZSBuYW1lIG9mIHRoZSBgPGlucHV0IG1hdEVuZERhdGUvPmAgKi9cclxuICBlbmREYXRlQWNjZXNzaWJsZU5hbWUgPSBpbnB1dDxzdHJpbmcgfCBudWxsPigpO1xyXG5cclxuICAvKiogT3JpZ2luIG9mIGFjdGl2ZSBkcmFnLCBvciBudWxsIHdoZW4gZHJhZ2dpbmcgaXMgbm90IGFjdGl2ZS4gKi9cclxuICBhY3RpdmVEcmFnID0gaW5wdXQ8Tmd4TWF0Q2FsZW5kYXJVc2VyRXZlbnQ8RD4gfCBudWxsPihudWxsKTtcclxuXHJcbiAgLyoqIEVtaXRzIHdoZW4gYSBuZXcgZGF0ZSBpcyBzZWxlY3RlZC4gKi9cclxuICByZWFkb25seSBzZWxlY3RlZENoYW5nZSA9IG91dHB1dDxEIHwgbnVsbD4oKTtcclxuXHJcbiAgLyoqIEVtaXRzIHdoZW4gYW55IGRhdGUgaXMgc2VsZWN0ZWQuICovXHJcbiAgcmVhZG9ubHkgX3VzZXJTZWxlY3Rpb24gPSBvdXRwdXQ8Tmd4TWF0Q2FsZW5kYXJVc2VyRXZlbnQ8RCB8IG51bGw+PigpO1xyXG5cclxuICAvKiogRW1pdHMgd2hlbiB0aGUgdXNlciBpbml0aWF0ZXMgYSBkYXRlIHJhbmdlIGRyYWcgdmlhIG1vdXNlIG9yIHRvdWNoLiAqL1xyXG4gIHJlYWRvbmx5IGRyYWdTdGFydGVkID0gb3V0cHV0PE5neE1hdENhbGVuZGFyVXNlckV2ZW50PEQ+PigpO1xyXG5cclxuICAvKipcclxuICAgKiBFbWl0cyB3aGVuIHRoZSB1c2VyIGNvbXBsZXRlcyBvciBjYW5jZWxzIGEgZGF0ZSByYW5nZSBkcmFnLlxyXG4gICAqIEVtaXRzIG51bGwgd2hlbiB0aGUgZHJhZyB3YXMgY2FuY2VsZWQgb3IgdGhlIG5ld2x5IHNlbGVjdGVkIGRhdGUgcmFuZ2UgaWYgY29tcGxldGVkLlxyXG4gICAqL1xyXG4gIHJlYWRvbmx5IGRyYWdFbmRlZCA9IG91dHB1dDxOZ3hNYXRDYWxlbmRhclVzZXJFdmVudDxOZ3hEYXRlUmFuZ2U8RD4gfCBudWxsPj4oKTtcclxuXHJcbiAgLyoqIEVtaXRzIHdoZW4gYW55IGRhdGUgaXMgYWN0aXZhdGVkLiAqL1xyXG4gIHJlYWRvbmx5IGFjdGl2ZURhdGVDaGFuZ2UgPSBvdXRwdXQ8RD4oKTtcclxuXHJcbiAgLyoqIFRoZSBib2R5IG9mIGNhbGVuZGFyIHRhYmxlICovXHJcbiAgX21hdENhbGVuZGFyQm9keSA9IHZpZXdDaGlsZChOZ3hNYXRDYWxlbmRhckJvZHkpO1xyXG5cclxuICAvKiogVGhlIGxhYmVsIGZvciB0aGlzIG1vbnRoIChlLmcuIFwiSmFudWFyeSAyMDE3XCIpLiAqL1xyXG4gIF9tb250aExhYmVsOiBzdHJpbmc7XHJcblxyXG4gIC8qKiBHcmlkIG9mIGNhbGVuZGFyIGNlbGxzIHJlcHJlc2VudGluZyB0aGUgZGF0ZXMgb2YgdGhlIG1vbnRoLiAqL1xyXG4gIF93ZWVrczogTmd4TWF0Q2FsZW5kYXJDZWxsW11bXTtcclxuXHJcbiAgLyoqIFRoZSBudW1iZXIgb2YgYmxhbmsgY2VsbHMgaW4gdGhlIGZpcnN0IHJvdyBiZWZvcmUgdGhlIDFzdCBvZiB0aGUgbW9udGguICovXHJcbiAgX2ZpcnN0V2Vla09mZnNldDogbnVtYmVyO1xyXG5cclxuICAvKiogU3RhcnQgdmFsdWUgb2YgdGhlIGN1cnJlbnRseS1zaG93biBkYXRlIHJhbmdlLiAqL1xyXG4gIF9yYW5nZVN0YXJ0OiBudW1iZXIgfCBudWxsO1xyXG5cclxuICAvKiogRW5kIHZhbHVlIG9mIHRoZSBjdXJyZW50bHktc2hvd24gZGF0ZSByYW5nZS4gKi9cclxuICBfcmFuZ2VFbmQ6IG51bWJlciB8IG51bGw7XHJcblxyXG4gIC8qKiBTdGFydCB2YWx1ZSBvZiB0aGUgY3VycmVudGx5LXNob3duIGNvbXBhcmlzb24gZGF0ZSByYW5nZS4gKi9cclxuICBfY29tcGFyaXNvblJhbmdlU3RhcnQ6IG51bWJlciB8IG51bGw7XHJcblxyXG4gIC8qKiBFbmQgdmFsdWUgb2YgdGhlIGN1cnJlbnRseS1zaG93biBjb21wYXJpc29uIGRhdGUgcmFuZ2UuICovXHJcbiAgX2NvbXBhcmlzb25SYW5nZUVuZDogbnVtYmVyIHwgbnVsbDtcclxuXHJcbiAgLyoqIFN0YXJ0IG9mIHRoZSBwcmV2aWV3IHJhbmdlLiAqL1xyXG4gIF9wcmV2aWV3U3RhcnQ6IG51bWJlciB8IG51bGw7XHJcblxyXG4gIC8qKiBFbmQgb2YgdGhlIHByZXZpZXcgcmFuZ2UuICovXHJcbiAgX3ByZXZpZXdFbmQ6IG51bWJlciB8IG51bGw7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBzZWxlY3RpbmcgYSByYW5nZSBvZiBkYXRlcy4gKi9cclxuICBfaXNSYW5nZTogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFRoZSBkYXRlIG9mIHRoZSBtb250aCB0aGF0IHRvZGF5IGZhbGxzIG9uLiBOdWxsIGlmIHRvZGF5IGlzIGluIGFub3RoZXIgbW9udGguICovXHJcbiAgX3RvZGF5RGF0ZTogbnVtYmVyIHwgbnVsbDtcclxuXHJcbiAgLyoqIFRoZSBuYW1lcyBvZiB0aGUgd2Vla2RheXMuICovXHJcbiAgX3dlZWtkYXlzOiB7IGxvbmc6IHN0cmluZzsgbmFycm93OiBzdHJpbmcgfVtdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHJlYWRvbmx5IF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXHJcbiAgICBAT3B0aW9uYWwoKVxyXG4gICAgQEluamVjdChOR1hfTUFUX0RBVEVfRk9STUFUUylcclxuICAgIHByaXZhdGUgX2RhdGVGb3JtYXRzOiBOZ3hNYXREYXRlRm9ybWF0cyxcclxuICAgIEBPcHRpb25hbCgpIHB1YmxpYyBfZGF0ZUFkYXB0ZXI6IE5neE1hdERhdGVBZGFwdGVyPEQ+LFxyXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZGlyPzogRGlyZWN0aW9uYWxpdHksXHJcbiAgICBASW5qZWN0KE5HWF9NQVRfREFURV9SQU5HRV9TRUxFQ1RJT05fU1RSQVRFR1kpXHJcbiAgICBAT3B0aW9uYWwoKVxyXG4gICAgcHJpdmF0ZSBfcmFuZ2VTdHJhdGVneT86IE5neE1hdERhdGVSYW5nZVNlbGVjdGlvblN0cmF0ZWd5PEQ+LFxyXG4gICkge1xyXG4gICAgaWYgKCF0aGlzLl9kYXRlQWRhcHRlcikge1xyXG4gICAgICB0aHJvdyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcignTmd4TWF0RGF0ZUFkYXB0ZXInKTtcclxuICAgIH1cclxuICAgIGlmICghdGhpcy5fZGF0ZUZvcm1hdHMpIHtcclxuICAgICAgdGhyb3cgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IoJ05HWF9NQVRfREFURV9GT1JNQVRTJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLnRvZGF5KCk7XHJcbiAgfVxyXG5cclxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XHJcbiAgICB0aGlzLl9yZXJlbmRlclN1YnNjcmlwdGlvbiA9IHRoaXMuX2RhdGVBZGFwdGVyLmxvY2FsZUNoYW5nZXNcclxuICAgICAgLnBpcGUoc3RhcnRXaXRoKG51bGwpKVxyXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2luaXQoKSk7XHJcbiAgfVxyXG5cclxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XHJcbiAgICBjb25zdCBjb21wYXJpc29uQ2hhbmdlID0gY2hhbmdlc1snY29tcGFyaXNvblN0YXJ0J10gfHwgY2hhbmdlc1snY29tcGFyaXNvbkVuZCddO1xyXG5cclxuICAgIGlmIChjb21wYXJpc29uQ2hhbmdlICYmICFjb21wYXJpc29uQ2hhbmdlLmZpcnN0Q2hhbmdlKSB7XHJcbiAgICAgIHRoaXMuX3NldFJhbmdlcyh0aGlzLnNlbGVjdGVkKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY2hhbmdlc1snYWN0aXZlRHJhZyddICYmICF0aGlzLmFjdGl2ZURyYWcoKSkge1xyXG4gICAgICB0aGlzLl9jbGVhclByZXZpZXcoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5fcmVyZW5kZXJTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICB9XHJcblxyXG4gIC8qKiBIYW5kbGVzIHdoZW4gYSBuZXcgZGF0ZSBpcyBzZWxlY3RlZC4gKi9cclxuICBfZGF0ZVNlbGVjdGVkKGV2ZW50OiBOZ3hNYXRDYWxlbmRhclVzZXJFdmVudDxudW1iZXI+KSB7XHJcbiAgICBjb25zdCBkYXRlID0gZXZlbnQudmFsdWU7XHJcbiAgICBjb25zdCBzZWxlY3RlZERhdGUgPSB0aGlzLl9nZXREYXRlRnJvbURheU9mTW9udGgoZGF0ZSk7XHJcbiAgICBsZXQgcmFuZ2VTdGFydERhdGU6IG51bWJlciB8IG51bGw7XHJcbiAgICBsZXQgcmFuZ2VFbmREYXRlOiBudW1iZXIgfCBudWxsO1xyXG5cclxuICAgIGlmICh0aGlzLl9zZWxlY3RlZCBpbnN0YW5jZW9mIE5neERhdGVSYW5nZSkge1xyXG4gICAgICByYW5nZVN0YXJ0RGF0ZSA9IHRoaXMuX2dldERhdGVJbkN1cnJlbnRNb250aCh0aGlzLl9zZWxlY3RlZC5zdGFydCk7XHJcbiAgICAgIHJhbmdlRW5kRGF0ZSA9IHRoaXMuX2dldERhdGVJbkN1cnJlbnRNb250aCh0aGlzLl9zZWxlY3RlZC5lbmQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmFuZ2VTdGFydERhdGUgPSByYW5nZUVuZERhdGUgPSB0aGlzLl9nZXREYXRlSW5DdXJyZW50TW9udGgodGhpcy5fc2VsZWN0ZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyYW5nZVN0YXJ0RGF0ZSAhPT0gZGF0ZSB8fCByYW5nZUVuZERhdGUgIT09IGRhdGUpIHtcclxuICAgICAgdGhpcy5zZWxlY3RlZENoYW5nZS5lbWl0KHNlbGVjdGVkRGF0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fdXNlclNlbGVjdGlvbi5lbWl0KHsgdmFsdWU6IHNlbGVjdGVkRGF0ZSwgZXZlbnQ6IGV2ZW50LmV2ZW50IH0pO1xyXG4gICAgdGhpcy5fY2xlYXJQcmV2aWV3KCk7XHJcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2VzIHRoZSBpbmRleCBvZiBhIGNhbGVuZGFyIGJvZHkgY2VsbCB3cmFwcGVkIGluIGluIGFuIGV2ZW50IGFzIGFyZ3VtZW50LiBGb3IgdGhlIGRhdGUgdGhhdFxyXG4gICAqIGNvcnJlc3BvbmRzIHRvIHRoZSBnaXZlbiBjZWxsLCBzZXQgYGFjdGl2ZURhdGVgIHRvIHRoYXQgZGF0ZSBhbmQgZmlyZSBgYWN0aXZlRGF0ZUNoYW5nZWAgd2l0aFxyXG4gICAqIHRoYXQgZGF0ZS5cclxuICAgKlxyXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBtYXRjaCBlYWNoIGNvbXBvbmVudCdzIG1vZGVsIG9mIHRoZSBhY3RpdmUgZGF0ZSB3aXRoIHRoZSBjYWxlbmRhclxyXG4gICAqIGJvZHkgY2VsbCB0aGF0IHdhcyBmb2N1c2VkLiBJdCB1cGRhdGVzIGl0cyB2YWx1ZSBvZiBgYWN0aXZlRGF0ZWAgc3luY2hyb25vdXNseSBhbmQgdXBkYXRlcyB0aGVcclxuICAgKiBwYXJlbnQncyB2YWx1ZSBhc3luY2hyb25vdXNseSB2aWEgdGhlIGBhY3RpdmVEYXRlQ2hhbmdlYCBldmVudC4gVGhlIGNoaWxkIGNvbXBvbmVudCByZWNlaXZlcyBhblxyXG4gICAqIHVwZGF0ZWQgdmFsdWUgYXN5bmNocm9ub3VzbHkgdmlhIHRoZSBgYWN0aXZlQ2VsbGAgSW5wdXQuXHJcbiAgICovXHJcbiAgX3VwZGF0ZUFjdGl2ZURhdGUoZXZlbnQ6IE5neE1hdENhbGVuZGFyVXNlckV2ZW50PG51bWJlcj4pIHtcclxuICAgIGNvbnN0IG1vbnRoID0gZXZlbnQudmFsdWU7XHJcbiAgICBjb25zdCBvbGRBY3RpdmVEYXRlID0gdGhpcy5fYWN0aXZlRGF0ZTtcclxuICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2dldERhdGVGcm9tRGF5T2ZNb250aChtb250aCk7XHJcblxyXG4gICAgaWYgKHRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlKG9sZEFjdGl2ZURhdGUsIHRoaXMuYWN0aXZlRGF0ZSkpIHtcclxuICAgICAgdGhpcy5hY3RpdmVEYXRlQ2hhbmdlLmVtaXQodGhpcy5fYWN0aXZlRGF0ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogSGFuZGxlcyBrZXlkb3duIGV2ZW50cyBvbiB0aGUgY2FsZW5kYXIgYm9keSB3aGVuIGNhbGVuZGFyIGlzIGluIG1vbnRoIHZpZXcuICovXHJcbiAgX2hhbmRsZUNhbGVuZGFyQm9keUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICAgIC8vIFRPRE8obW1hbGVyYmEpOiBXZSBjdXJyZW50bHkgYWxsb3cga2V5Ym9hcmQgbmF2aWdhdGlvbiB0byBkaXNhYmxlZCBkYXRlcywgYnV0IGp1c3QgcHJldmVudFxyXG4gICAgLy8gZGlzYWJsZWQgb25lcyBmcm9tIGJlaW5nIHNlbGVjdGVkLiBUaGlzIG1heSBub3QgYmUgaWRlYWwsIHdlIHNob3VsZCBsb29rIGludG8gd2hldGhlclxyXG4gICAgLy8gbmF2aWdhdGlvbiBzaG91bGQgc2tpcCBvdmVyIGRpc2FibGVkIGRhdGVzLCBhbmQgaWYgc28sIGhvdyB0byBpbXBsZW1lbnQgdGhhdCBlZmZpY2llbnRseS5cclxuXHJcbiAgICBjb25zdCBvbGRBY3RpdmVEYXRlID0gdGhpcy5fYWN0aXZlRGF0ZTtcclxuICAgIGNvbnN0IGlzUnRsID0gdGhpcy5faXNSdGwoKTtcclxuXHJcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcclxuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxyXG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyRGF5cyh0aGlzLl9hY3RpdmVEYXRlLCBpc1J0bCA/IDEgOiAtMSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XHJcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJEYXlzKHRoaXMuX2FjdGl2ZURhdGUsIGlzUnRsID8gLTEgOiAxKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBVUF9BUlJPVzpcclxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhckRheXModGhpcy5fYWN0aXZlRGF0ZSwgLTcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIERPV05fQVJST1c6XHJcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJEYXlzKHRoaXMuX2FjdGl2ZURhdGUsIDcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIEhPTUU6XHJcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJEYXlzKFxyXG4gICAgICAgICAgdGhpcy5fYWN0aXZlRGF0ZSxcclxuICAgICAgICAgIDEgLSB0aGlzLl9kYXRlQWRhcHRlci5nZXREYXRlKHRoaXMuX2FjdGl2ZURhdGUpLFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgRU5EOlxyXG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyRGF5cyhcclxuICAgICAgICAgIHRoaXMuX2FjdGl2ZURhdGUsXHJcbiAgICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXROdW1EYXlzSW5Nb250aCh0aGlzLl9hY3RpdmVEYXRlKSAtXHJcbiAgICAgICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldERhdGUodGhpcy5fYWN0aXZlRGF0ZSksXHJcbiAgICAgICAgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBQQUdFX1VQOlxyXG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IGV2ZW50LmFsdEtleVxyXG4gICAgICAgICAgPyB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhclllYXJzKHRoaXMuX2FjdGl2ZURhdGUsIC0xKVxyXG4gICAgICAgICAgOiB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyh0aGlzLl9hY3RpdmVEYXRlLCAtMSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgUEFHRV9ET1dOOlxyXG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IGV2ZW50LmFsdEtleVxyXG4gICAgICAgICAgPyB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhclllYXJzKHRoaXMuX2FjdGl2ZURhdGUsIDEpXHJcbiAgICAgICAgICA6IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyTW9udGhzKHRoaXMuX2FjdGl2ZURhdGUsIDEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIEVOVEVSOlxyXG4gICAgICBjYXNlIFNQQUNFOlxyXG4gICAgICAgIHRoaXMuX3NlbGVjdGlvbktleVByZXNzZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fY2FuU2VsZWN0KHRoaXMuX2FjdGl2ZURhdGUpKSB7XHJcbiAgICAgICAgICAvLyBQcmV2ZW50IHVuZXhwZWN0ZWQgZGVmYXVsdCBhY3Rpb25zIHN1Y2ggYXMgZm9ybSBzdWJtaXNzaW9uLlxyXG4gICAgICAgICAgLy8gTm90ZSB0aGF0IHdlIG9ubHkgcHJldmVudCB0aGUgZGVmYXVsdCBhY3Rpb24gaGVyZSB3aGlsZSB0aGUgc2VsZWN0aW9uIGhhcHBlbnMgaW5cclxuICAgICAgICAgIC8vIGBrZXl1cGAgYmVsb3cuIFdlIGNhbid0IGRvIHRoZSBzZWxlY3Rpb24gaGVyZSwgYmVjYXVzZSBpdCBjYW4gY2F1c2UgdGhlIGNhbGVuZGFyIHRvXHJcbiAgICAgICAgICAvLyByZW9wZW4gaWYgZm9jdXMgaXMgcmVzdG9yZWQgaW1tZWRpYXRlbHkuIFdlIGFsc28gY2FuJ3QgY2FsbCBgcHJldmVudERlZmF1bHRgIG9uIGBrZXl1cGBcclxuICAgICAgICAgIC8vIGJlY2F1c2UgaXQncyB0b28gbGF0ZSAoc2VlICMyMzMwNSkuXHJcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGNhc2UgRVNDQVBFOlxyXG4gICAgICAgIC8vIEFib3J0IHRoZSBjdXJyZW50IHJhbmdlIHNlbGVjdGlvbiBpZiB0aGUgdXNlciBwcmVzc2VzIGVzY2FwZSBtaWQtc2VsZWN0aW9uLlxyXG4gICAgICAgIGlmICh0aGlzLl9wcmV2aWV3RW5kICE9IG51bGwgJiYgIWhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xyXG4gICAgICAgICAgdGhpcy5fY2xlYXJQcmV2aWV3KCk7XHJcbiAgICAgICAgICAvLyBJZiBhIGRyYWcgaXMgaW4gcHJvZ3Jlc3MsIGNhbmNlbCB0aGUgZHJhZyB3aXRob3V0IGNoYW5naW5nIHRoZVxyXG4gICAgICAgICAgLy8gY3VycmVudCBzZWxlY3Rpb24uXHJcbiAgICAgICAgICBpZiAodGhpcy5hY3RpdmVEcmFnKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnRW5kZWQuZW1pdCh7IHZhbHVlOiBudWxsLCBldmVudCB9KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDaGFuZ2UuZW1pdChudWxsKTtcclxuICAgICAgICAgICAgdGhpcy5fdXNlclNlbGVjdGlvbi5lbWl0KHsgdmFsdWU6IG51bGwsIGV2ZW50IH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvLyBQcmV2ZW50cyB0aGUgb3ZlcmxheSBmcm9tIGNsb3NpbmcuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICAvLyBEb24ndCBwcmV2ZW50IGRlZmF1bHQgb3IgZm9jdXMgYWN0aXZlIGNlbGwgb24ga2V5cyB0aGF0IHdlIGRvbid0IGV4cGxpY2l0bHkgaGFuZGxlLlxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUob2xkQWN0aXZlRGF0ZSwgdGhpcy5hY3RpdmVEYXRlKSkge1xyXG4gICAgICB0aGlzLmFjdGl2ZURhdGVDaGFuZ2UuZW1pdCh0aGlzLmFjdGl2ZURhdGUpO1xyXG5cclxuICAgICAgdGhpcy5fZm9jdXNBY3RpdmVDZWxsQWZ0ZXJWaWV3Q2hlY2tlZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByZXZlbnQgdW5leHBlY3RlZCBkZWZhdWx0IGFjdGlvbnMgc3VjaCBhcyBmb3JtIHN1Ym1pc3Npb24uXHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIEhhbmRsZXMga2V5dXAgZXZlbnRzIG9uIHRoZSBjYWxlbmRhciBib2R5IHdoZW4gY2FsZW5kYXIgaXMgaW4gbW9udGggdmlldy4gKi9cclxuICBfaGFuZGxlQ2FsZW5kYXJCb2R5S2V5dXAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICAgIGlmIChldmVudC5rZXlDb2RlID09PSBTUEFDRSB8fCBldmVudC5rZXlDb2RlID09PSBFTlRFUikge1xyXG4gICAgICBpZiAodGhpcy5fc2VsZWN0aW9uS2V5UHJlc3NlZCAmJiB0aGlzLl9jYW5TZWxlY3QodGhpcy5fYWN0aXZlRGF0ZSkpIHtcclxuICAgICAgICB0aGlzLl9kYXRlU2VsZWN0ZWQoe1xyXG4gICAgICAgICAgdmFsdWU6IHRoaXMuX2RhdGVBZGFwdGVyLmdldERhdGUodGhpcy5fYWN0aXZlRGF0ZSksXHJcbiAgICAgICAgICBldmVudCxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fc2VsZWN0aW9uS2V5UHJlc3NlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIEluaXRpYWxpemVzIHRoaXMgbW9udGggdmlldy4gKi9cclxuICBfaW5pdCgpIHtcclxuICAgIHRoaXMuX3NldFJhbmdlcyh0aGlzLnNlbGVjdGVkKTtcclxuICAgIHRoaXMuX3RvZGF5RGF0ZSA9IHRoaXMuX2dldENlbGxDb21wYXJlVmFsdWUodGhpcy5fZGF0ZUFkYXB0ZXIudG9kYXkoKSk7XHJcbiAgICB0aGlzLl9tb250aExhYmVsID0gdGhpcy5fZGF0ZUZvcm1hdHMuZGlzcGxheS5tb250aExhYmVsXHJcbiAgICAgID8gdGhpcy5fZGF0ZUFkYXB0ZXIuZm9ybWF0KHRoaXMuYWN0aXZlRGF0ZSwgdGhpcy5fZGF0ZUZvcm1hdHMuZGlzcGxheS5tb250aExhYmVsKVxyXG4gICAgICA6IHRoaXMuX2RhdGVBZGFwdGVyXHJcbiAgICAgICAgICAuZ2V0TW9udGhOYW1lcygnc2hvcnQnKVxyXG4gICAgICAgICAgW3RoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKHRoaXMuYWN0aXZlRGF0ZSldLnRvTG9jYWxlVXBwZXJDYXNlKCk7XHJcblxyXG4gICAgbGV0IGZpcnN0T2ZNb250aCA9IHRoaXMuX2RhdGVBZGFwdGVyLmNyZWF0ZURhdGUoXHJcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5hY3RpdmVEYXRlKSxcclxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgodGhpcy5hY3RpdmVEYXRlKSxcclxuICAgICAgMSxcclxuICAgICk7XHJcbiAgICB0aGlzLl9maXJzdFdlZWtPZmZzZXQgPVxyXG4gICAgICAoREFZU19QRVJfV0VFSyArXHJcbiAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0RGF5T2ZXZWVrKGZpcnN0T2ZNb250aCkgLVxyXG4gICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldEZpcnN0RGF5T2ZXZWVrKCkpICVcclxuICAgICAgREFZU19QRVJfV0VFSztcclxuXHJcbiAgICB0aGlzLl9pbml0V2Vla2RheXMoKTtcclxuICAgIHRoaXMuX2NyZWF0ZVdlZWtDZWxscygpO1xyXG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XHJcbiAgfVxyXG5cclxuICAvKiogRm9jdXNlcyB0aGUgYWN0aXZlIGNlbGwgYWZ0ZXIgdGhlIG1pY3JvdGFzayBxdWV1ZSBpcyBlbXB0eS4gKi9cclxuICBfZm9jdXNBY3RpdmVDZWxsKG1vdmVQcmV2aWV3PzogYm9vbGVhbikge1xyXG4gICAgdGhpcy5fbWF0Q2FsZW5kYXJCb2R5KCkuX2ZvY3VzQWN0aXZlQ2VsbChtb3ZlUHJldmlldyk7XHJcbiAgfVxyXG5cclxuICAvKiogRm9jdXNlcyB0aGUgYWN0aXZlIGNlbGwgYWZ0ZXIgY2hhbmdlIGRldGVjdGlvbiBoYXMgcnVuIGFuZCB0aGUgbWljcm90YXNrIHF1ZXVlIGlzIGVtcHR5LiAqL1xyXG4gIF9mb2N1c0FjdGl2ZUNlbGxBZnRlclZpZXdDaGVja2VkKCkge1xyXG4gICAgdGhpcy5fbWF0Q2FsZW5kYXJCb2R5KCkuX3NjaGVkdWxlRm9jdXNBY3RpdmVDZWxsQWZ0ZXJWaWV3Q2hlY2tlZCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIENhbGxlZCB3aGVuIHRoZSB1c2VyIGhhcyBhY3RpdmF0ZWQgYSBuZXcgY2VsbCBhbmQgdGhlIHByZXZpZXcgbmVlZHMgdG8gYmUgdXBkYXRlZC4gKi9cclxuICBfcHJldmlld0NoYW5nZWQoeyBldmVudCwgdmFsdWU6IGNlbGwgfTogTmd4TWF0Q2FsZW5kYXJVc2VyRXZlbnQ8Tmd4TWF0Q2FsZW5kYXJDZWxsPEQ+IHwgbnVsbD4pIHtcclxuICAgIGlmICh0aGlzLl9yYW5nZVN0cmF0ZWd5KSB7XHJcbiAgICAgIC8vIFdlIGNhbiBhc3N1bWUgdGhhdCB0aGlzIHdpbGwgYmUgYSByYW5nZSwgYmVjYXVzZSBwcmV2aWV3XHJcbiAgICAgIC8vIGV2ZW50cyBhcmVuJ3QgZmlyZWQgZm9yIHNpbmdsZSBkYXRlIHNlbGVjdGlvbnMuXHJcbiAgICAgIGNvbnN0IHZhbHVlID0gY2VsbCA/IGNlbGwucmF3VmFsdWUhIDogbnVsbDtcclxuICAgICAgY29uc3QgcHJldmlld1JhbmdlID0gdGhpcy5fcmFuZ2VTdHJhdGVneS5jcmVhdGVQcmV2aWV3KFxyXG4gICAgICAgIHZhbHVlLFxyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgYXMgTmd4RGF0ZVJhbmdlPEQ+LFxyXG4gICAgICAgIGV2ZW50LFxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLl9wcmV2aWV3U3RhcnQgPSB0aGlzLl9nZXRDZWxsQ29tcGFyZVZhbHVlKHByZXZpZXdSYW5nZS5zdGFydCk7XHJcbiAgICAgIHRoaXMuX3ByZXZpZXdFbmQgPSB0aGlzLl9nZXRDZWxsQ29tcGFyZVZhbHVlKHByZXZpZXdSYW5nZS5lbmQpO1xyXG5cclxuICAgICAgaWYgKHRoaXMuYWN0aXZlRHJhZygpISAmJiB2YWx1ZSkge1xyXG4gICAgICAgIGNvbnN0IGRyYWdSYW5nZSA9IHRoaXMuX3JhbmdlU3RyYXRlZ3kuY3JlYXRlRHJhZz8uKFxyXG4gICAgICAgICAgdGhpcy5hY3RpdmVEcmFnKCkhLnZhbHVlLFxyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZCBhcyBOZ3hEYXRlUmFuZ2U8RD4sXHJcbiAgICAgICAgICB2YWx1ZSxcclxuICAgICAgICAgIGV2ZW50LFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChkcmFnUmFuZ2UpIHtcclxuICAgICAgICAgIHRoaXMuX3ByZXZpZXdTdGFydCA9IHRoaXMuX2dldENlbGxDb21wYXJlVmFsdWUoZHJhZ1JhbmdlLnN0YXJ0KTtcclxuICAgICAgICAgIHRoaXMuX3ByZXZpZXdFbmQgPSB0aGlzLl9nZXRDZWxsQ29tcGFyZVZhbHVlKGRyYWdSYW5nZS5lbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTm90ZSB0aGF0IGhlcmUgd2UgbmVlZCB0byB1c2UgYGRldGVjdENoYW5nZXNgLCByYXRoZXIgdGhhbiBgbWFya0ZvckNoZWNrYCwgYmVjYXVzZVxyXG4gICAgICAvLyB0aGUgd2F5IGBfZm9jdXNBY3RpdmVDZWxsYCBpcyBzZXQgdXAgYXQgdGhlIG1vbWVudCBtYWtlcyBpdCBmaXJlIGF0IHRoZSB3cm9uZyB0aW1lXHJcbiAgICAgIC8vIHdoZW4gbmF2aWdhdGluZyBvbmUgbW9udGggYmFjayB1c2luZyB0aGUga2V5Ym9hcmQgd2hpY2ggd2lsbCBjYXVzZSB0aGlzIGhhbmRsZXJcclxuICAgICAgLy8gdG8gdGhyb3cgYSBcImNoYW5nZWQgYWZ0ZXIgY2hlY2tlZFwiIGVycm9yIHdoZW4gdXBkYXRpbmcgdGhlIHByZXZpZXcgc3RhdGUuXHJcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIHRoZSB1c2VyIGhhcyBlbmRlZCBhIGRyYWcuIElmIHRoZSBkcmFnL2Ryb3Agd2FzIHN1Y2Nlc3NmdWwsXHJcbiAgICogY29tcHV0ZXMgYW5kIGVtaXRzIHRoZSBuZXcgcmFuZ2Ugc2VsZWN0aW9uLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBfZHJhZ0VuZGVkKGV2ZW50OiBOZ3hNYXRDYWxlbmRhclVzZXJFdmVudDxEIHwgbnVsbD4pIHtcclxuICAgIGlmICghdGhpcy5hY3RpdmVEcmFnKCkhKSByZXR1cm47XHJcblxyXG4gICAgaWYgKGV2ZW50LnZhbHVlKSB7XHJcbiAgICAgIC8vIFByb3BhZ2F0ZSBkcmFnIGVmZmVjdFxyXG4gICAgICBjb25zdCBkcmFnRHJvcFJlc3VsdCA9IHRoaXMuX3JhbmdlU3RyYXRlZ3k/LmNyZWF0ZURyYWc/LihcclxuICAgICAgICB0aGlzLmFjdGl2ZURyYWcoKSEudmFsdWUsXHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCBhcyBOZ3hEYXRlUmFuZ2U8RD4sXHJcbiAgICAgICAgZXZlbnQudmFsdWUsXHJcbiAgICAgICAgZXZlbnQuZXZlbnQsXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLmRyYWdFbmRlZC5lbWl0KHtcclxuICAgICAgICB2YWx1ZTogZHJhZ0Ryb3BSZXN1bHQgPz8gbnVsbCxcclxuICAgICAgICBldmVudDogZXZlbnQuZXZlbnQsXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5kcmFnRW5kZWQuZW1pdCh7IHZhbHVlOiBudWxsLCBldmVudDogZXZlbnQuZXZlbnQgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUYWtlcyBhIGRheSBvZiB0aGUgbW9udGggYW5kIHJldHVybnMgYSBuZXcgZGF0ZSBpbiB0aGUgc2FtZSBtb250aCBhbmQgeWVhciBhcyB0aGUgY3VycmVudGx5XHJcbiAgICogIGFjdGl2ZSBkYXRlLiBUaGUgcmV0dXJuZWQgZGF0ZSB3aWxsIGhhdmUgdGhlIHNhbWUgZGF5IG9mIHRoZSBtb250aCBhcyB0aGUgYXJndW1lbnQgZGF0ZS5cclxuICAgKi9cclxuICBwcml2YXRlIF9nZXREYXRlRnJvbURheU9mTW9udGgoZGF5T2ZNb250aDogbnVtYmVyKTogRCB7XHJcbiAgICByZXR1cm4gdGhpcy5fZGF0ZUFkYXB0ZXIuY3JlYXRlRGF0ZShcclxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLmFjdGl2ZURhdGUpLFxyXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aCh0aGlzLmFjdGl2ZURhdGUpLFxyXG4gICAgICBkYXlPZk1vbnRoLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKiBJbml0aWFsaXplcyB0aGUgd2Vla2RheXMuICovXHJcbiAgcHJpdmF0ZSBfaW5pdFdlZWtkYXlzKCkge1xyXG4gICAgY29uc3QgZmlyc3REYXlPZldlZWsgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRGaXJzdERheU9mV2VlaygpO1xyXG4gICAgY29uc3QgbmFycm93V2Vla2RheXMgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXREYXlPZldlZWtOYW1lcygnbmFycm93Jyk7XHJcbiAgICBjb25zdCBsb25nV2Vla2RheXMgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXREYXlPZldlZWtOYW1lcygnbG9uZycpO1xyXG5cclxuICAgIC8vIFJvdGF0ZSB0aGUgbGFiZWxzIGZvciBkYXlzIG9mIHRoZSB3ZWVrIGJhc2VkIG9uIHRoZSBjb25maWd1cmVkIGZpcnN0IGRheSBvZiB0aGUgd2Vlay5cclxuICAgIGxldCB3ZWVrZGF5cyA9IGxvbmdXZWVrZGF5cy5tYXAoKGxvbmcsIGkpID0+IHtcclxuICAgICAgcmV0dXJuIHsgbG9uZywgbmFycm93OiBuYXJyb3dXZWVrZGF5c1tpXSB9O1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLl93ZWVrZGF5cyA9IHdlZWtkYXlzLnNsaWNlKGZpcnN0RGF5T2ZXZWVrKS5jb25jYXQod2Vla2RheXMuc2xpY2UoMCwgZmlyc3REYXlPZldlZWspKTtcclxuICB9XHJcblxyXG4gIC8qKiBDcmVhdGVzIE1hdENhbGVuZGFyQ2VsbHMgZm9yIHRoZSBkYXRlcyBpbiB0aGlzIG1vbnRoLiAqL1xyXG4gIHByaXZhdGUgX2NyZWF0ZVdlZWtDZWxscygpIHtcclxuICAgIGNvbnN0IGRheXNJbk1vbnRoID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TnVtRGF5c0luTW9udGgodGhpcy5hY3RpdmVEYXRlKTtcclxuICAgIGNvbnN0IGRhdGVOYW1lcyA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldERhdGVOYW1lcygpO1xyXG4gICAgdGhpcy5fd2Vla3MgPSBbW11dO1xyXG4gICAgZm9yIChsZXQgaSA9IDAsIGNlbGwgPSB0aGlzLl9maXJzdFdlZWtPZmZzZXQ7IGkgPCBkYXlzSW5Nb250aDsgaSsrLCBjZWxsKyspIHtcclxuICAgICAgaWYgKGNlbGwgPT0gREFZU19QRVJfV0VFSykge1xyXG4gICAgICAgIHRoaXMuX3dlZWtzLnB1c2goW10pO1xyXG4gICAgICAgIGNlbGwgPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5jcmVhdGVEYXRlKFxyXG4gICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5hY3RpdmVEYXRlKSxcclxuICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aCh0aGlzLmFjdGl2ZURhdGUpLFxyXG4gICAgICAgIGkgKyAxLFxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBlbmFibGVkID0gdGhpcy5fc2hvdWxkRW5hYmxlRGF0ZShkYXRlKTtcclxuICAgICAgY29uc3QgYXJpYUxhYmVsID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZm9ybWF0KGRhdGUsIHRoaXMuX2RhdGVGb3JtYXRzLmRpc3BsYXkuZGF0ZUExMXlMYWJlbCk7XHJcbiAgICAgIGNvbnN0IGNlbGxDbGFzc2VzID0gdGhpcy5kYXRlQ2xhc3MoKSA/IHRoaXMuZGF0ZUNsYXNzKCkhKGRhdGUsICdtb250aCcpIDogdW5kZWZpbmVkO1xyXG5cclxuICAgICAgdGhpcy5fd2Vla3NbdGhpcy5fd2Vla3MubGVuZ3RoIC0gMV0ucHVzaChcclxuICAgICAgICBuZXcgTmd4TWF0Q2FsZW5kYXJDZWxsPEQ+KFxyXG4gICAgICAgICAgaSArIDEsXHJcbiAgICAgICAgICBkYXRlTmFtZXNbaV0sXHJcbiAgICAgICAgICBhcmlhTGFiZWwsXHJcbiAgICAgICAgICBlbmFibGVkLFxyXG4gICAgICAgICAgY2VsbENsYXNzZXMsXHJcbiAgICAgICAgICB0aGlzLl9nZXRDZWxsQ29tcGFyZVZhbHVlKGRhdGUpISxcclxuICAgICAgICAgIGRhdGUsXHJcbiAgICAgICAgKSxcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBEYXRlIGZpbHRlciBmb3IgdGhlIG1vbnRoICovXHJcbiAgcHJpdmF0ZSBfc2hvdWxkRW5hYmxlRGF0ZShkYXRlOiBEKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAhIWRhdGUgJiZcclxuICAgICAgKCF0aGlzLm1pbkRhdGUgfHwgdGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUoZGF0ZSwgdGhpcy5taW5EYXRlKSA+PSAwKSAmJlxyXG4gICAgICAoIXRoaXMubWF4RGF0ZSB8fCB0aGlzLl9kYXRlQWRhcHRlci5jb21wYXJlRGF0ZShkYXRlLCB0aGlzLm1heERhdGUpIDw9IDApICYmXHJcbiAgICAgICghdGhpcy5kYXRlRmlsdGVyKCkgfHwgdGhpcy5kYXRlRmlsdGVyKCkoZGF0ZSkpXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgZGF0ZSBpbiB0aGlzIG1vbnRoIHRoYXQgdGhlIGdpdmVuIERhdGUgZmFsbHMgb24uXHJcbiAgICogUmV0dXJucyBudWxsIGlmIHRoZSBnaXZlbiBEYXRlIGlzIGluIGFub3RoZXIgbW9udGguXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfZ2V0RGF0ZUluQ3VycmVudE1vbnRoKGRhdGU6IEQgfCBudWxsKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gZGF0ZSAmJiB0aGlzLl9oYXNTYW1lTW9udGhBbmRZZWFyKGRhdGUsIHRoaXMuYWN0aXZlRGF0ZSlcclxuICAgICAgPyB0aGlzLl9kYXRlQWRhcHRlci5nZXREYXRlKGRhdGUpXHJcbiAgICAgIDogbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgMiBkYXRlcyBhcmUgbm9uLW51bGwgYW5kIGZhbGwgd2l0aGluIHRoZSBzYW1lIG1vbnRoIG9mIHRoZSBzYW1lIHllYXIuICovXHJcbiAgcHJpdmF0ZSBfaGFzU2FtZU1vbnRoQW5kWWVhcihkMTogRCB8IG51bGwsIGQyOiBEIHwgbnVsbCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICEhKFxyXG4gICAgICBkMSAmJlxyXG4gICAgICBkMiAmJlxyXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aChkMSkgPT0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgoZDIpICYmXHJcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIoZDEpID09IHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIoZDIpXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgdGhlIHZhbHVlIHRoYXQgd2lsbCBiZSB1c2VkIHRvIG9uZSBjZWxsIHRvIGFub3RoZXIuICovXHJcbiAgcHJpdmF0ZSBfZ2V0Q2VsbENvbXBhcmVWYWx1ZShkYXRlOiBEIHwgbnVsbCk6IG51bWJlciB8IG51bGwge1xyXG4gICAgaWYgKGRhdGUpIHtcclxuICAgICAgLy8gV2UgdXNlIHRoZSB0aW1lIHNpbmNlIHRoZSBVbml4IGVwb2NoIHRvIGNvbXBhcmUgZGF0ZXMgaW4gdGhpcyB2aWV3LCByYXRoZXIgdGhhbiB0aGVcclxuICAgICAgLy8gY2VsbCB2YWx1ZXMsIGJlY2F1c2Ugd2UgbmVlZCB0byBzdXBwb3J0IHJhbmdlcyB0aGF0IHNwYW4gYWNyb3NzIG11bHRpcGxlIG1vbnRocy95ZWFycy5cclxuICAgICAgY29uc3QgeWVhciA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIoZGF0ZSk7XHJcbiAgICAgIGNvbnN0IG1vbnRoID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgoZGF0ZSk7XHJcbiAgICAgIGNvbnN0IGRheSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldERhdGUoZGF0ZSk7XHJcbiAgICAgIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF5KS5nZXRUaW1lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvKiogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSB1c2VyIGhhcyB0aGUgUlRMIGxheW91dCBkaXJlY3Rpb24uICovXHJcbiAgcHJpdmF0ZSBfaXNSdGwoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZGlyICYmIHRoaXMuX2Rpci52YWx1ZSA9PT0gJ3J0bCc7XHJcbiAgfVxyXG5cclxuICAvKiogU2V0cyB0aGUgY3VycmVudCByYW5nZSBiYXNlZCBvbiBhIG1vZGVsIHZhbHVlLiAqL1xyXG4gIHByaXZhdGUgX3NldFJhbmdlcyhzZWxlY3RlZFZhbHVlOiBOZ3hEYXRlUmFuZ2U8RD4gfCBEIHwgbnVsbCkge1xyXG4gICAgaWYgKHNlbGVjdGVkVmFsdWUgaW5zdGFuY2VvZiBOZ3hEYXRlUmFuZ2UpIHtcclxuICAgICAgdGhpcy5fcmFuZ2VTdGFydCA9IHRoaXMuX2dldENlbGxDb21wYXJlVmFsdWUoc2VsZWN0ZWRWYWx1ZS5zdGFydCk7XHJcbiAgICAgIHRoaXMuX3JhbmdlRW5kID0gdGhpcy5fZ2V0Q2VsbENvbXBhcmVWYWx1ZShzZWxlY3RlZFZhbHVlLmVuZCk7XHJcbiAgICAgIHRoaXMuX2lzUmFuZ2UgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5fcmFuZ2VTdGFydCA9IHRoaXMuX3JhbmdlRW5kID0gdGhpcy5fZ2V0Q2VsbENvbXBhcmVWYWx1ZShzZWxlY3RlZFZhbHVlKTtcclxuICAgICAgdGhpcy5faXNSYW5nZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2NvbXBhcmlzb25SYW5nZVN0YXJ0ID0gdGhpcy5fZ2V0Q2VsbENvbXBhcmVWYWx1ZSh0aGlzLmNvbXBhcmlzb25TdGFydCgpKTtcclxuICAgIHRoaXMuX2NvbXBhcmlzb25SYW5nZUVuZCA9IHRoaXMuX2dldENlbGxDb21wYXJlVmFsdWUodGhpcy5jb21wYXJpc29uRW5kKCkpO1xyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgd2hldGhlciBhIGRhdGUgY2FuIGJlIHNlbGVjdGVkIGluIHRoZSBtb250aCB2aWV3LiAqL1xyXG4gIHByaXZhdGUgX2NhblNlbGVjdChkYXRlOiBEKSB7XHJcbiAgICByZXR1cm4gIXRoaXMuZGF0ZUZpbHRlcigpIHx8IHRoaXMuZGF0ZUZpbHRlcigpKGRhdGUpO1xyXG4gIH1cclxuXHJcbiAgLyoqIENsZWFycyBvdXQgcHJldmlldyBzdGF0ZS4gKi9cclxuICBwcml2YXRlIF9jbGVhclByZXZpZXcoKSB7XHJcbiAgICB0aGlzLl9wcmV2aWV3U3RhcnQgPSB0aGlzLl9wcmV2aWV3RW5kID0gbnVsbDtcclxuICB9XHJcbn1cclxuIiwiPHRhYmxlIGNsYXNzPVwibWF0LWNhbGVuZGFyLXRhYmxlXCIgcm9sZT1cImdyaWRcIj5cclxuICA8dGhlYWQgY2xhc3M9XCJtYXQtY2FsZW5kYXItdGFibGUtaGVhZGVyXCI+XHJcbiAgICA8dHI+XHJcbiAgICAgIEBmb3IgKGRheSBvZiBfd2Vla2RheXM7IHRyYWNrICRpbmRleCkge1xyXG4gICAgICAgIDx0aCBzY29wZT1cImNvbFwiPlxyXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJjZGstdmlzdWFsbHktaGlkZGVuXCI+e3sgZGF5LmxvbmcgfX08L3NwYW4+XHJcbiAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj57eyBkYXkubmFycm93IH19PC9zcGFuPlxyXG4gICAgICAgIDwvdGg+XHJcbiAgICAgIH1cclxuICAgIDwvdHI+XHJcbiAgICA8dHI+XHJcbiAgICAgIDx0aFxyXG4gICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXHJcbiAgICAgICAgY2xhc3M9XCJtYXQtY2FsZW5kYXItdGFibGUtaGVhZGVyLWRpdmlkZXJcIlxyXG4gICAgICAgIGNvbHNwYW49XCI3XCJcclxuICAgICAgPjwvdGg+XHJcbiAgICA8L3RyPlxyXG4gIDwvdGhlYWQ+XHJcbiAgPHRib2R5XHJcbiAgICBuZ3gtbWF0LWNhbGVuZGFyLWJvZHlcclxuICAgIFtsYWJlbF09XCJfbW9udGhMYWJlbFwiXHJcbiAgICBbcm93c109XCJfd2Vla3NcIlxyXG4gICAgW3RvZGF5VmFsdWVdPVwiX3RvZGF5RGF0ZSFcIlxyXG4gICAgW3N0YXJ0VmFsdWVdPVwiX3JhbmdlU3RhcnQhXCJcclxuICAgIFtlbmRWYWx1ZV09XCJfcmFuZ2VFbmQhXCJcclxuICAgIFtjb21wYXJpc29uU3RhcnRdPVwiX2NvbXBhcmlzb25SYW5nZVN0YXJ0XCJcclxuICAgIFtjb21wYXJpc29uRW5kXT1cIl9jb21wYXJpc29uUmFuZ2VFbmRcIlxyXG4gICAgW3ByZXZpZXdTdGFydF09XCJfcHJldmlld1N0YXJ0XCJcclxuICAgIFtwcmV2aWV3RW5kXT1cIl9wcmV2aWV3RW5kXCJcclxuICAgIFtpc1JhbmdlXT1cIl9pc1JhbmdlXCJcclxuICAgIFtsYWJlbE1pblJlcXVpcmVkQ2VsbHNdPVwiM1wiXHJcbiAgICBbYWN0aXZlQ2VsbF09XCJfZGF0ZUFkYXB0ZXIuZ2V0RGF0ZShhY3RpdmVEYXRlKSAtIDFcIlxyXG4gICAgW3N0YXJ0RGF0ZUFjY2Vzc2libGVOYW1lXT1cInN0YXJ0RGF0ZUFjY2Vzc2libGVOYW1lKClcIlxyXG4gICAgW2VuZERhdGVBY2Nlc3NpYmxlTmFtZV09XCJlbmREYXRlQWNjZXNzaWJsZU5hbWUoKVwiXHJcbiAgICAoc2VsZWN0ZWRWYWx1ZUNoYW5nZSk9XCJfZGF0ZVNlbGVjdGVkKCRldmVudClcIlxyXG4gICAgKGFjdGl2ZURhdGVDaGFuZ2UpPVwiX3VwZGF0ZUFjdGl2ZURhdGUoJGV2ZW50KVwiXHJcbiAgICAocHJldmlld0NoYW5nZSk9XCJfcHJldmlld0NoYW5nZWQoJGV2ZW50KVwiXHJcbiAgICAoZHJhZ1N0YXJ0ZWQpPVwiZHJhZ1N0YXJ0ZWQuZW1pdCgkZXZlbnQpXCJcclxuICAgIChkcmFnRW5kZWQpPVwiX2RyYWdFbmRlZCgkZXZlbnQpXCJcclxuICAgIChrZXl1cCk9XCJfaGFuZGxlQ2FsZW5kYXJCb2R5S2V5dXAoJGV2ZW50KVwiXHJcbiAgICAoa2V5ZG93bik9XCJfaGFuZGxlQ2FsZW5kYXJCb2R5S2V5ZG93bigkZXZlbnQpXCJcclxuICA+PC90Ym9keT5cclxuPC90YWJsZT5cclxuIl19