import { ComponentType, Portal } from '@angular/cdk/portal';
import { AfterContentInit, AfterViewChecked, ChangeDetectorRef, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { NgxMatCalendarCellClassFunction, NgxMatCalendarUserEvent } from './calendar-body';
import { NgxMatDateAdapter } from './core/date-adapter';
import { NgxMatDateFormats } from './core/date-formats';
import { NgxDateRange } from './date-selection-model';
import { NgxMatDatepickerIntl } from './datepicker-intl';
import { NgxMatMonthView } from './month-view';
import { NgxMatMultiYearView } from './multi-year-view';
import { NgxMatYearView } from './year-view';
import * as i0 from "@angular/core";
/**
 * Possible views for the calendar.
 * @docs-private
 */
export type NgxMatCalendarView = 'month' | 'year' | 'multi-year';
/** Default header for MatCalendar */
export declare class NgxMatCalendarHeader<D> {
    private _intl;
    calendar: NgxMatCalendar<D>;
    private _dateAdapter;
    private _dateFormats;
    constructor(_intl: NgxMatDatepickerIntl, calendar: NgxMatCalendar<D>, _dateAdapter: NgxMatDateAdapter<D>, _dateFormats: NgxMatDateFormats, changeDetectorRef: ChangeDetectorRef);
    /** The display text for the current calendar view. */
    get periodButtonText(): string;
    /** The aria description for the current calendar view. */
    get periodButtonDescription(): string;
    /** The `aria-label` for changing the calendar view. */
    get periodButtonLabel(): string;
    /** The label for the previous button. */
    get prevButtonLabel(): string;
    /** The label for the next button. */
    get nextButtonLabel(): string;
    /** Handles user clicks on the period label. */
    currentPeriodClicked(): void;
    /** Handles user clicks on the previous button. */
    previousClicked(): void;
    /** Handles user clicks on the next button. */
    nextClicked(): void;
    /** Whether the previous period button is enabled. */
    previousEnabled(): boolean;
    /** Whether the next period button is enabled. */
    nextEnabled(): boolean;
    /** Whether the two dates represent the same view in the current view mode (month or year). */
    private _isSameView;
    /**
     * Format two individual labels for the minimum year and maximum year available in the multi-year
     * calendar view. Returns an array of two strings where the first string is the formatted label
     * for the minimum year, and the second string is the formatted label for the maximum year.
     */
    private _formatMinAndMaxYearLabels;
    private _id;
    _periodButtonLabelId: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxMatCalendarHeader<any>, [null, null, { optional: true; }, { optional: true; }, null]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NgxMatCalendarHeader<any>, "ngx-mat-calendar-header", ["ngxMatCalendarHeader"], {}, {}, never, ["*"], true, never>;
}
/** A calendar that is used as part of the datepicker. */
export declare class NgxMatCalendar<D> implements AfterContentInit, AfterViewChecked, OnDestroy, OnChanges {
    private _dateAdapter;
    private _dateFormats;
    private _changeDetectorRef;
    /** An input indicating the type of the header component, if set. */
    headerComponent: import("@angular/core").InputSignal<ComponentType<any>>;
    /** A portal containing the header component type for this calendar. */
    _calendarHeaderPortal: Portal<any>;
    private _intlChanges;
    /**
     * Used for scheduling that focus should be moved to the active cell on the next tick.
     * We need to schedule it, rather than do it immediately, because we have to wait
     * for Angular to re-evaluate the view children.
     */
    private _moveFocusOnNextTick;
    /** A date representing the period (month or year) to start the calendar in. */
    get startAt(): D | null;
    set startAt(value: D | null);
    private _startAt;
    /** Whether the calendar should be started in month or year view. */
    startView: import("@angular/core").InputSignal<NgxMatCalendarView>;
    /** The currently selected date. */
    get selected(): NgxDateRange<D> | D | null;
    set selected(value: NgxDateRange<D> | D | null);
    private _selected;
    /** The minimum selectable date. */
    get minDate(): D | null;
    set minDate(value: D | null);
    private _minDate;
    /** The maximum selectable date. */
    get maxDate(): D | null;
    set maxDate(value: D | null);
    private _maxDate;
    /** Function used to filter which dates are selectable. */
    dateFilter: import("@angular/core").InputSignal<(date: D) => boolean>;
    /** Function that can be used to add custom CSS classes to dates. */
    dateClass: import("@angular/core").InputSignal<NgxMatCalendarCellClassFunction<D>>;
    /** Start of the comparison range. */
    comparisonStart: import("@angular/core").InputSignal<D>;
    /** End of the comparison range. */
    comparisonEnd: import("@angular/core").InputSignal<D>;
    /** ARIA Accessible name of the `<input matStartDate/>` */
    startDateAccessibleName: import("@angular/core").InputSignal<string>;
    /** ARIA Accessible name of the `<input matEndDate/>` */
    endDateAccessibleName: import("@angular/core").InputSignal<string>;
    /** Emits when the currently selected date changes. */
    readonly selectedChange: import("@angular/core").OutputEmitterRef<D>;
    /**
     * Emits the year chosen in multiyear view.
     * This doesn't imply a change on the selected date.
     */
    readonly yearSelected: import("@angular/core").OutputEmitterRef<D>;
    /**
     * Emits the month chosen in year view.
     * This doesn't imply a change on the selected date.
     */
    readonly monthSelected: import("@angular/core").OutputEmitterRef<D>;
    /**
     * Emits when the current view changes.
     */
    readonly viewChanged: import("@angular/core").OutputEmitterRef<NgxMatCalendarView>;
    /** Emits when any date is selected. */
    readonly _userSelection: import("@angular/core").OutputEmitterRef<NgxMatCalendarUserEvent<D>>;
    /** Emits a new date range value when the user completes a drag drop operation. */
    readonly _userDragDrop: import("@angular/core").OutputEmitterRef<NgxMatCalendarUserEvent<NgxDateRange<D>>>;
    /** Reference to the current month view component. */
    monthView: import("@angular/core").Signal<NgxMatMonthView<D>>;
    /** Reference to the current year view component. */
    yearView: import("@angular/core").Signal<NgxMatYearView<D>>;
    /** Reference to the current multi-year view component. */
    multiYearView: import("@angular/core").Signal<NgxMatMultiYearView<D>>;
    /**
     * The current active date. This determines which time period is shown and which date is
     * highlighted when using keyboard navigation.
     */
    get activeDate(): D;
    set activeDate(value: D);
    private _clampedActiveDate;
    /** Whether the calendar is in month view. */
    get currentView(): NgxMatCalendarView;
    set currentView(value: NgxMatCalendarView);
    private _currentView;
    /** Origin of active drag, or null when dragging is not active. */
    protected _activeDrag: NgxMatCalendarUserEvent<D> | null;
    /**
     * Emits whenever there is a state change that the header may need to respond to.
     */
    readonly stateChanges: Subject<void>;
    constructor(_intl: NgxMatDatepickerIntl, _dateAdapter: NgxMatDateAdapter<D>, _dateFormats: NgxMatDateFormats, _changeDetectorRef: ChangeDetectorRef);
    ngAfterContentInit(): void;
    ngAfterViewChecked(): void;
    ngOnDestroy(): void;
    ngOnChanges(changes: SimpleChanges): void;
    /** Focuses the active date. */
    focusActiveCell(): void;
    /** Updates today's date after an update of the active date */
    updateTodaysDate(): void;
    /** Handles date selection in the month view. */
    _dateSelected(event: NgxMatCalendarUserEvent<D | null>): void;
    /** Handles year selection in the multiyear view. */
    _yearSelectedInMultiYearView(normalizedYear: D): void;
    /** Handles month selection in the year view. */
    _monthSelectedInYearView(normalizedMonth: D): void;
    /** Handles year/month selection in the multi-year/year views. */
    _goToDateInView(date: D, view: 'month' | 'year' | 'multi-year'): void;
    /** Called when the user starts dragging to change a date range. */
    _dragStarted(event: NgxMatCalendarUserEvent<D>): void;
    /**
     * Called when a drag completes. It may end in cancelation or in the selection
     * of a new range.
     */
    _dragEnded(event: NgxMatCalendarUserEvent<NgxDateRange<D> | null>): void;
    /** Returns the component instance that corresponds to the current calendar view. */
    private _getCurrentViewComponent;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxMatCalendar<any>, [null, { optional: true; }, { optional: true; }, null]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NgxMatCalendar<any>, "ngx-mat-calendar", ["ngxMatCalendar"], { "headerComponent": { "alias": "headerComponent"; "required": false; "isSignal": true; }; "startAt": { "alias": "startAt"; "required": false; }; "startView": { "alias": "startView"; "required": false; "isSignal": true; }; "selected": { "alias": "selected"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "dateFilter": { "alias": "dateFilter"; "required": false; "isSignal": true; }; "dateClass": { "alias": "dateClass"; "required": false; "isSignal": true; }; "comparisonStart": { "alias": "comparisonStart"; "required": false; "isSignal": true; }; "comparisonEnd": { "alias": "comparisonEnd"; "required": false; "isSignal": true; }; "startDateAccessibleName": { "alias": "startDateAccessibleName"; "required": false; "isSignal": true; }; "endDateAccessibleName": { "alias": "endDateAccessibleName"; "required": false; "isSignal": true; }; }, { "selectedChange": "selectedChange"; "yearSelected": "yearSelected"; "monthSelected": "monthSelected"; "viewChanged": "viewChanged"; "_userSelection": "_userSelection"; "_userDragDrop": "_userDragDrop"; }, never, never, true, never>;
}
