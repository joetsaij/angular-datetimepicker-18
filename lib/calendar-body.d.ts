import { AfterViewChecked, ElementRef, NgZone, OnDestroy } from '@angular/core';
import * as i0 from "@angular/core";
/** Extra CSS classes that can be associated with a calendar cell. */
export type NgxMatCalendarCellCssClasses = string | string[] | Set<string> | {
    [key: string]: any;
};
/** Function that can generate the extra classes that should be added to a calendar cell. */
export type NgxMatCalendarCellClassFunction<D> = (date: D, view: 'month' | 'year' | 'multi-year') => NgxMatCalendarCellCssClasses;
/**
 * An internal class that represents the data corresponding to a single calendar cell.
 * @docs-private
 */
export declare class NgxMatCalendarCell<D = any> {
    value: number;
    displayValue: string;
    ariaLabel: string;
    enabled: boolean;
    cssClasses: NgxMatCalendarCellCssClasses;
    compareValue: number;
    rawValue?: D;
    constructor(value: number, displayValue: string, ariaLabel: string, enabled: boolean, cssClasses?: NgxMatCalendarCellCssClasses, compareValue?: number, rawValue?: D);
}
/** Event emitted when a date inside the calendar is triggered as a result of a user action. */
export interface NgxMatCalendarUserEvent<D> {
    value: D;
    event: Event;
}
export declare class NgxMatCalendarBody<D = any> implements OnDestroy, AfterViewChecked {
    private _elementRef;
    private _ngZone;
    private _platform;
    /**
     * Used to skip the next focus event when rendering the preview range.
     * We need a flag like this, because some browsers fire focus events asynchronously.
     */
    private _skipNextFocus;
    /**
     * Used to focus the active cell after change detection has run.
     */
    private _focusActiveCellAfterViewChecked;
    /** The label for the table. (e.g. "Jan 2017"). */
    label: import("@angular/core").InputSignal<string>;
    /** The cells to display in the table. */
    rows: import("@angular/core").InputSignal<NgxMatCalendarCell<any>[][]>;
    /** The value in the table that corresponds to today. */
    todayValue: import("@angular/core").InputSignal<number>;
    /** Start value of the selected date range. */
    startValue: import("@angular/core").InputSignal<number>;
    /** End value of the selected date range. */
    endValue: import("@angular/core").InputSignal<number>;
    /** The minimum number of free cells needed to fit the label in the first row. */
    labelMinRequiredCells: import("@angular/core").InputSignal<number>;
    /** The number of columns in the table. */
    numCols: import("@angular/core").InputSignal<number>;
    /** The cell number of the active cell in the table. */
    activeCell: import("@angular/core").InputSignal<number>;
    ngAfterViewChecked(): void;
    /** Whether a range is being selected. */
    isRange: import("@angular/core").InputSignal<boolean>;
    /**
     * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
     * maintained even as the table resizes.
     */
    cellAspectRatio: import("@angular/core").InputSignal<number>;
    /** Start of the comparison range. */
    comparisonStart: import("@angular/core").InputSignal<number>;
    /** End of the comparison range. */
    comparisonEnd: import("@angular/core").InputSignal<number>;
    /** Start of the preview range. */
    previewStart: import("@angular/core").InputSignal<number>;
    /** End of the preview range. */
    previewEnd: import("@angular/core").InputSignal<number>;
    /** ARIA Accessible name of the `<input matStartDate/>` */
    startDateAccessibleName: import("@angular/core").InputSignal<string>;
    /** ARIA Accessible name of the `<input matEndDate/>` */
    endDateAccessibleName: import("@angular/core").InputSignal<string>;
    /** Emits when a new value is selected. */
    readonly selectedValueChange: import("@angular/core").OutputEmitterRef<NgxMatCalendarUserEvent<number>>;
    /** Emits when the preview has changed as a result of a user action. */
    readonly previewChange: import("@angular/core").OutputEmitterRef<NgxMatCalendarUserEvent<NgxMatCalendarCell<any>>>;
    readonly activeDateChange: import("@angular/core").OutputEmitterRef<NgxMatCalendarUserEvent<number>>;
    /** Emits the date at the possible start of a drag event. */
    readonly dragStarted: import("@angular/core").OutputEmitterRef<NgxMatCalendarUserEvent<D>>;
    /** Emits the date at the conclusion of a drag, or null if mouse was not released on a date. */
    readonly dragEnded: import("@angular/core").OutputEmitterRef<NgxMatCalendarUserEvent<D>>;
    /** The number of blank cells to put at the beginning for the first row. */
    _firstRowOffset: import("@angular/core").Signal<number>;
    /** Padding for the individual date cells. */
    _cellPadding: import("@angular/core").Signal<string>;
    /** Width of an individual cell. */
    _cellWidth: import("@angular/core").Signal<string>;
    private _didDragSinceMouseDown;
    constructor(_elementRef: ElementRef<HTMLElement>, _ngZone: NgZone);
    /** Called when a cell is clicked. */
    _cellClicked(cell: NgxMatCalendarCell, event: MouseEvent): void;
    _emitActiveDateChange(cell: NgxMatCalendarCell, event: FocusEvent): void;
    /** Returns whether a cell should be marked as selected. */
    _isSelected(value: number): boolean;
    ngOnDestroy(): void;
    /** Returns whether a cell is active. */
    _isActiveCell(rowIndex: number, colIndex: number): boolean;
    _focusActiveCell(movePreview?: boolean): void;
    /** Focuses the active cell after change detection has run and the microtask queue is empty. */
    _scheduleFocusActiveCellAfterViewChecked(): void;
    /** Gets whether a value is the start of the main range. */
    _isRangeStart(value: number): boolean;
    /** Gets whether a value is the end of the main range. */
    _isRangeEnd(value: number): boolean;
    /** Gets whether a value is within the currently-selected range. */
    _isInRange(value: number): boolean;
    /** Gets whether a value is the start of the comparison range. */
    _isComparisonStart(value: number): boolean;
    /** Whether the cell is a start bridge cell between the main and comparison ranges. */
    _isComparisonBridgeStart(value: number, rowIndex: number, colIndex: number): boolean;
    /** Whether the cell is an end bridge cell between the main and comparison ranges. */
    _isComparisonBridgeEnd(value: number, rowIndex: number, colIndex: number): boolean;
    /** Gets whether a value is the end of the comparison range. */
    _isComparisonEnd(value: number): boolean;
    /** Gets whether a value is within the current comparison range. */
    _isInComparisonRange(value: number): boolean;
    _isComparisonIdentical(value: number): boolean;
    /** Gets whether a value is the start of the preview range. */
    _isPreviewStart(value: number): boolean;
    /** Gets whether a value is the end of the preview range. */
    _isPreviewEnd(value: number): boolean;
    /** Gets whether a value is inside the preview range. */
    _isInPreview(value: number): boolean;
    /** Gets ids of aria descriptions for the start and end of a date range. */
    _getDescribedby(value: number): string | null;
    /**
     * Event handler for when the user enters an element
     * inside the calendar body (e.g. by hovering in or focus).
     */
    private _enterHandler;
    private _touchmoveHandler;
    /**
     * Event handler for when the user's pointer leaves an element
     * inside the calendar body (e.g. by hovering out or blurring).
     */
    private _leaveHandler;
    /**
     * Triggered on mousedown or touchstart on a date cell.
     * Respsonsible for starting a drag sequence.
     */
    private _mousedownHandler;
    /** Triggered on mouseup anywhere. Respsonsible for ending a drag sequence. */
    private _mouseupHandler;
    /** Triggered on touchend anywhere. Respsonsible for ending a drag sequence. */
    private _touchendHandler;
    /** Finds the MatCalendarCell that corresponds to a DOM node. */
    private _getCellFromElement;
    private _id;
    _startDateLabelId: string;
    _endDateLabelId: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxMatCalendarBody<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NgxMatCalendarBody<any>, "[ngx-mat-calendar-body]", ["matCalendarBody"], { "label": { "alias": "label"; "required": false; "isSignal": true; }; "rows": { "alias": "rows"; "required": false; "isSignal": true; }; "todayValue": { "alias": "todayValue"; "required": false; "isSignal": true; }; "startValue": { "alias": "startValue"; "required": false; "isSignal": true; }; "endValue": { "alias": "endValue"; "required": false; "isSignal": true; }; "labelMinRequiredCells": { "alias": "labelMinRequiredCells"; "required": false; "isSignal": true; }; "numCols": { "alias": "numCols"; "required": false; "isSignal": true; }; "activeCell": { "alias": "activeCell"; "required": false; "isSignal": true; }; "isRange": { "alias": "isRange"; "required": false; "isSignal": true; }; "cellAspectRatio": { "alias": "cellAspectRatio"; "required": false; "isSignal": true; }; "comparisonStart": { "alias": "comparisonStart"; "required": false; "isSignal": true; }; "comparisonEnd": { "alias": "comparisonEnd"; "required": false; "isSignal": true; }; "previewStart": { "alias": "previewStart"; "required": false; "isSignal": true; }; "previewEnd": { "alias": "previewEnd"; "required": false; "isSignal": true; }; "startDateAccessibleName": { "alias": "startDateAccessibleName"; "required": false; "isSignal": true; }; "endDateAccessibleName": { "alias": "endDateAccessibleName"; "required": false; "isSignal": true; }; }, { "selectedValueChange": "selectedValueChange"; "previewChange": "previewChange"; "activeDateChange": "activeDateChange"; "dragStarted": "dragStarted"; "dragEnded": "dragEnded"; }, never, never, true, never>;
}
