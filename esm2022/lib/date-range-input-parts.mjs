import { Directionality } from '@angular/cdk/bidi';
import { BACKSPACE, LEFT_ARROW, RIGHT_ARROW } from '@angular/cdk/keycodes';
import { Directive, Inject, InjectionToken, Optional, inject, } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl, Validators, } from '@angular/forms';
import { mixinErrorState } from '@angular/material/core';
import { _computeAriaAccessibleName } from './aria-accessible-name';
import { NGX_MAT_DATE_FORMATS } from './core/date-formats';
import { NgxDateRange } from './date-selection-model';
import { NgxMatDatepickerInputBase } from './datepicker-input-base';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/core";
import * as i2 from "@angular/forms";
import * as i3 from "./core/date-adapter";
/**
 * Used to provide the date range input wrapper component
 * to the parts without circular dependencies.
 */
export const NGX_MAT_DATE_RANGE_INPUT_PARENT = new InjectionToken('NGX_MAT_DATE_RANGE_INPUT_PARENT');
/**
 * Base class for the individual inputs that can be projected inside a `mat-date-range-input`.
 */
class NgxMatDateRangeInputPartBase extends NgxMatDatepickerInputBase {
    constructor(_rangeInput, _elementRef, _defaultErrorStateMatcher, _injector, _parentForm, _parentFormGroup, dateAdapter, dateFormats) {
        super(_elementRef, dateAdapter, dateFormats);
        this._rangeInput = _rangeInput;
        this._elementRef = _elementRef;
        this._defaultErrorStateMatcher = _defaultErrorStateMatcher;
        this._injector = _injector;
        this._parentForm = _parentForm;
        this._parentFormGroup = _parentFormGroup;
        this._dir = inject(Directionality, { optional: true });
    }
    ngOnInit() {
        // We need the date input to provide itself as a `ControlValueAccessor` and a `Validator`, while
        // injecting its `NgControl` so that the error state is handled correctly. This introduces a
        // circular dependency, because both `ControlValueAccessor` and `Validator` depend on the input
        // itself. Usually we can work around it for the CVA, but there's no API to do it for the
        // validator. We work around it here by injecting the `NgControl` in `ngOnInit`, after
        // everything has been resolved.
        // tslint:disable-next-line:no-bitwise
        const ngControl = this._injector.get(NgControl, null, {
            optional: true,
            self: true,
        });
        if (ngControl) {
            this.ngControl = ngControl;
        }
    }
    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();
        }
    }
    /** Gets whether the input is empty. */
    isEmpty() {
        return this._elementRef.nativeElement.value.length === 0;
    }
    /** Gets the placeholder of the input. */
    _getPlaceholder() {
        return this._elementRef.nativeElement.placeholder;
    }
    /** Focuses the input. */
    focus() {
        this._elementRef.nativeElement.focus();
    }
    /** Gets the value that should be used when mirroring the input's size. */
    getMirrorValue() {
        const element = this._elementRef.nativeElement;
        const value = element.value;
        return value.length > 0 ? value : element.placeholder;
    }
    /** Handles `input` events on the input element. */
    _onInput(value) {
        super._onInput(value);
        this._rangeInput._handleChildValueChange();
    }
    /** Opens the datepicker associated with the input. */
    _openPopup() {
        this._rangeInput._openDatepicker();
    }
    /** Gets the minimum date from the range input. */
    _getMinDate() {
        return this._rangeInput.min;
    }
    /** Gets the maximum date from the range input. */
    _getMaxDate() {
        return this._rangeInput.max;
    }
    /** Gets the date filter function from the range input. */
    _getDateFilter() {
        return this._rangeInput.dateFilter;
    }
    _parentDisabled() {
        return this._rangeInput._groupDisabled;
    }
    _shouldHandleChangeEvent({ source, }) {
        return source !== this._rangeInput._startInput && source !== this._rangeInput._endInput;
    }
    _assignValueProgrammatically(value) {
        super._assignValueProgrammatically(value);
        const opposite = (this === this._rangeInput._startInput
            ? this._rangeInput._endInput
            : this._rangeInput._startInput);
        opposite?._validatorOnChange();
    }
    /** return the ARIA accessible name of the input element */
    _getAccessibleName() {
        return _computeAriaAccessibleName(this._elementRef.nativeElement);
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDateRangeInputPartBase, deps: [{ token: NGX_MAT_DATE_RANGE_INPUT_PARENT }, { token: i0.ElementRef }, { token: i1.ErrorStateMatcher }, { token: i0.Injector }, { token: i2.NgForm, optional: true }, { token: i2.FormGroupDirective, optional: true }, { token: i3.NgxMatDateAdapter, optional: true }, { token: NGX_MAT_DATE_FORMATS, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    /** @nocollapse */ static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.3", type: NgxMatDateRangeInputPartBase, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDateRangeInputPartBase, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NGX_MAT_DATE_RANGE_INPUT_PARENT]
                }] }, { type: i0.ElementRef }, { type: i1.ErrorStateMatcher }, { type: i0.Injector }, { type: i2.NgForm, decorators: [{
                    type: Optional
                }] }, { type: i2.FormGroupDirective, decorators: [{
                    type: Optional
                }] }, { type: i3.NgxMatDateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NGX_MAT_DATE_FORMATS]
                }] }] });
const _NgxMatDateRangeInputBase = mixinErrorState(NgxMatDateRangeInputPartBase);
/** Input for entering the start date in a `mat-date-range-input`. */
export class NgxMatStartDate extends _NgxMatDateRangeInputBase {
    constructor(rangeInput, elementRef, defaultErrorStateMatcher, injector, parentForm, parentFormGroup, dateAdapter, dateFormats) {
        super(rangeInput, elementRef, defaultErrorStateMatcher, injector, parentForm, parentFormGroup, dateAdapter, dateFormats);
        /** Validator that checks that the start date isn't after the end date. */
        this._startValidator = (control) => {
            const start = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
            const end = this._model ? this._model.selection.end : null;
            return !start || !end || this._dateAdapter.compareDate(start, end) <= 0
                ? null
                : { matStartDateInvalid: { end: end, actual: start } };
        };
        this._validator = Validators.compose([...super._getValidators(), this._startValidator]);
    }
    _getValueFromModel(modelValue) {
        return modelValue.start;
    }
    _shouldHandleChangeEvent(change) {
        if (!super._shouldHandleChangeEvent(change)) {
            return false;
        }
        else {
            return !change.oldValue?.start
                ? !!change.selection.start
                : !change.selection.start ||
                    !!this._dateAdapter.compareDate(change.oldValue.start, change.selection.start);
        }
    }
    _assignValueToModel(value) {
        if (this._model) {
            const range = new NgxDateRange(value, this._model.selection.end);
            this._model.updateSelection(range, this);
        }
    }
    _formatValue(value) {
        super._formatValue(value);
        // Any time the input value is reformatted we need to tell the parent.
        this._rangeInput._handleChildValueChange();
    }
    _onKeydown(event) {
        const endInput = this._rangeInput._endInput;
        const element = this._elementRef.nativeElement;
        const isLtr = this._dir?.value !== 'rtl';
        // If the user hits RIGHT (LTR) when at the end of the input (and no
        // selection), move the cursor to the start of the end input.
        if (((event.keyCode === RIGHT_ARROW && isLtr) || (event.keyCode === LEFT_ARROW && !isLtr)) &&
            element.selectionStart === element.value.length &&
            element.selectionEnd === element.value.length) {
            event.preventDefault();
            endInput._elementRef.nativeElement.setSelectionRange(0, 0);
            endInput.focus();
        }
        else {
            super._onKeydown(event);
        }
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatStartDate, deps: [{ token: NGX_MAT_DATE_RANGE_INPUT_PARENT }, { token: i0.ElementRef }, { token: i1.ErrorStateMatcher }, { token: i0.Injector }, { token: i2.NgForm, optional: true }, { token: i2.FormGroupDirective, optional: true }, { token: i3.NgxMatDateAdapter, optional: true }, { token: NGX_MAT_DATE_FORMATS, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    /** @nocollapse */ static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.3", type: NgxMatStartDate, isStandalone: true, selector: "input[ngxMatStartDate]", inputs: { errorStateMatcher: "errorStateMatcher" }, outputs: { dateChange: "dateChange", dateInput: "dateInput" }, host: { attributes: { "type": "text" }, listeners: { "input": "_onInput($event.target.value)", "change": "_onChange()", "keydown": "_onKeydown($event)", "blur": "_onBlur()" }, properties: { "disabled": "disabled", "attr.aria-haspopup": "_rangeInput.rangePicker ? \"dialog\" : null", "attr.aria-owns": "(_rangeInput.rangePicker?.opened && _rangeInput.rangePicker.id) || null", "attr.min": "_getMinDate() ? _dateAdapter.toIso8601(_getMinDate()) : null", "attr.max": "_getMaxDate() ? _dateAdapter.toIso8601(_getMaxDate()) : null" }, classAttribute: "mat-start-date mat-date-range-input-inner" }, providers: [
            { provide: NG_VALUE_ACCESSOR, useExisting: NgxMatStartDate, multi: true },
            { provide: NG_VALIDATORS, useExisting: NgxMatStartDate, multi: true },
        ], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatStartDate, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[ngxMatStartDate]',
                    host: {
                        class: 'mat-start-date mat-date-range-input-inner',
                        '[disabled]': 'disabled',
                        '(input)': '_onInput($event.target.value)',
                        '(change)': '_onChange()',
                        '(keydown)': '_onKeydown($event)',
                        '[attr.aria-haspopup]': '_rangeInput.rangePicker ? "dialog" : null',
                        '[attr.aria-owns]': '(_rangeInput.rangePicker?.opened && _rangeInput.rangePicker.id) || null',
                        '[attr.min]': '_getMinDate() ? _dateAdapter.toIso8601(_getMinDate()) : null',
                        '[attr.max]': '_getMaxDate() ? _dateAdapter.toIso8601(_getMaxDate()) : null',
                        '(blur)': '_onBlur()',
                        type: 'text',
                    },
                    providers: [
                        { provide: NG_VALUE_ACCESSOR, useExisting: NgxMatStartDate, multi: true },
                        { provide: NG_VALIDATORS, useExisting: NgxMatStartDate, multi: true },
                    ],
                    // These need to be specified explicitly, because some tooling doesn't
                    // seem to pick them up from the base class. See #20932.
                    outputs: ['dateChange', 'dateInput'],
                    inputs: ['errorStateMatcher'],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NGX_MAT_DATE_RANGE_INPUT_PARENT]
                }] }, { type: i0.ElementRef }, { type: i1.ErrorStateMatcher }, { type: i0.Injector }, { type: i2.NgForm, decorators: [{
                    type: Optional
                }] }, { type: i2.FormGroupDirective, decorators: [{
                    type: Optional
                }] }, { type: i3.NgxMatDateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NGX_MAT_DATE_FORMATS]
                }] }] });
/** Input for entering the end date in a `mat-date-range-input`. */
export class NgxMatEndDate extends _NgxMatDateRangeInputBase {
    constructor(rangeInput, elementRef, defaultErrorStateMatcher, injector, parentForm, parentFormGroup, dateAdapter, dateFormats) {
        super(rangeInput, elementRef, defaultErrorStateMatcher, injector, parentForm, parentFormGroup, dateAdapter, dateFormats);
        /** Validator that checks that the end date isn't before the start date. */
        this._endValidator = (control) => {
            const end = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
            const start = this._model ? this._model.selection.start : null;
            return !end || !start || this._dateAdapter.compareDate(end, start) >= 0
                ? null
                : { matEndDateInvalid: { start: start, actual: end } };
        };
        this._validator = Validators.compose([...super._getValidators(), this._endValidator]);
    }
    _getValueFromModel(modelValue) {
        return modelValue.end;
    }
    _shouldHandleChangeEvent(change) {
        if (!super._shouldHandleChangeEvent(change)) {
            return false;
        }
        else {
            return !change.oldValue?.end
                ? !!change.selection.end
                : !change.selection.end ||
                    !!this._dateAdapter.compareDate(change.oldValue.end, change.selection.end);
        }
    }
    _assignValueToModel(value) {
        if (this._model) {
            const range = new NgxDateRange(this._model.selection.start, value);
            this._model.updateSelection(range, this);
        }
    }
    _onKeydown(event) {
        const startInput = this._rangeInput._startInput;
        const element = this._elementRef.nativeElement;
        const isLtr = this._dir?.value !== 'rtl';
        // If the user is pressing backspace on an empty end input, move focus back to the start.
        if (event.keyCode === BACKSPACE && !element.value) {
            startInput.focus();
        }
        // If the user hits LEFT (LTR) when at the start of the input (and no
        // selection), move the cursor to the end of the start input.
        else if (((event.keyCode === LEFT_ARROW && isLtr) || (event.keyCode === RIGHT_ARROW && !isLtr)) &&
            element.selectionStart === 0 &&
            element.selectionEnd === 0) {
            event.preventDefault();
            const endPosition = startInput._elementRef.nativeElement.value.length;
            startInput._elementRef.nativeElement.setSelectionRange(endPosition, endPosition);
            startInput.focus();
        }
        else {
            super._onKeydown(event);
        }
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatEndDate, deps: [{ token: NGX_MAT_DATE_RANGE_INPUT_PARENT }, { token: i0.ElementRef }, { token: i1.ErrorStateMatcher }, { token: i0.Injector }, { token: i2.NgForm, optional: true }, { token: i2.FormGroupDirective, optional: true }, { token: i3.NgxMatDateAdapter, optional: true }, { token: NGX_MAT_DATE_FORMATS, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    /** @nocollapse */ static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.3", type: NgxMatEndDate, isStandalone: true, selector: "input[ngxMatEndDate]", inputs: { errorStateMatcher: "errorStateMatcher" }, outputs: { dateChange: "dateChange", dateInput: "dateInput" }, host: { attributes: { "type": "text" }, listeners: { "input": "_onInput($event.target.value)", "change": "_onChange()", "keydown": "_onKeydown($event)", "blur": "_onBlur()" }, properties: { "disabled": "disabled", "attr.aria-haspopup": "_rangeInput.rangePicker ? \"dialog\" : null", "attr.aria-owns": "(_rangeInput.rangePicker?.opened && _rangeInput.rangePicker.id) || null", "attr.min": "_getMinDate() ? _dateAdapter.toIso8601(_getMinDate()) : null", "attr.max": "_getMaxDate() ? _dateAdapter.toIso8601(_getMaxDate()) : null" }, classAttribute: "mat-end-date mat-date-range-input-inner" }, providers: [
            { provide: NG_VALUE_ACCESSOR, useExisting: NgxMatEndDate, multi: true },
            { provide: NG_VALIDATORS, useExisting: NgxMatEndDate, multi: true },
        ], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatEndDate, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[ngxMatEndDate]',
                    host: {
                        class: 'mat-end-date mat-date-range-input-inner',
                        '[disabled]': 'disabled',
                        '(input)': '_onInput($event.target.value)',
                        '(change)': '_onChange()',
                        '(keydown)': '_onKeydown($event)',
                        '[attr.aria-haspopup]': '_rangeInput.rangePicker ? "dialog" : null',
                        '[attr.aria-owns]': '(_rangeInput.rangePicker?.opened && _rangeInput.rangePicker.id) || null',
                        '[attr.min]': '_getMinDate() ? _dateAdapter.toIso8601(_getMinDate()) : null',
                        '[attr.max]': '_getMaxDate() ? _dateAdapter.toIso8601(_getMaxDate()) : null',
                        '(blur)': '_onBlur()',
                        type: 'text',
                    },
                    providers: [
                        { provide: NG_VALUE_ACCESSOR, useExisting: NgxMatEndDate, multi: true },
                        { provide: NG_VALIDATORS, useExisting: NgxMatEndDate, multi: true },
                    ],
                    // These need to be specified explicitly, because some tooling doesn't
                    // seem to pick them up from the base class. See #20932.
                    outputs: ['dateChange', 'dateInput'],
                    inputs: ['errorStateMatcher'],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NGX_MAT_DATE_RANGE_INPUT_PARENT]
                }] }, { type: i0.ElementRef }, { type: i1.ErrorStateMatcher }, { type: i0.Injector }, { type: i2.NgForm, decorators: [{
                    type: Optional
                }] }, { type: i2.FormGroupDirective, decorators: [{
                    type: Optional
                }] }, { type: i3.NgxMatDateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NGX_MAT_DATE_FORMATS]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1yYW5nZS1pbnB1dC1wYXJ0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2RhdGV0aW1lLXBpY2tlci9zcmMvbGliL2RhdGUtcmFuZ2UtaW5wdXQtcGFydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzNFLE9BQU8sRUFDTCxTQUFTLEVBR1QsTUFBTSxFQUNOLGNBQWMsRUFHZCxRQUFRLEVBQ1IsTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFHTCxhQUFhLEVBQ2IsaUJBQWlCLEVBQ2pCLFNBQVMsRUFJVCxVQUFVLEdBQ1gsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQTBDLGVBQWUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2pHLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRXBFLE9BQU8sRUFBRSxvQkFBb0IsRUFBcUIsTUFBTSxxQkFBcUIsQ0FBQztBQUM5RSxPQUFPLEVBQUUsWUFBWSxFQUErQixNQUFNLHdCQUF3QixDQUFDO0FBQ25GLE9BQU8sRUFBbUIseUJBQXlCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQzs7Ozs7QUFtQnJGOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLCtCQUErQixHQUFHLElBQUksY0FBYyxDQUUvRCxpQ0FBaUMsQ0FBQyxDQUFDO0FBRXJDOztHQUVHO0FBQ0gsTUFDZSw0QkFDYixTQUFRLHlCQUEwQztJQWtCbEQsWUFFUyxXQUEwQyxFQUNqQyxXQUF5QyxFQUNsRCx5QkFBNEMsRUFDM0MsU0FBbUIsRUFDUixXQUFtQixFQUNuQixnQkFBb0MsRUFDM0MsV0FBaUMsRUFDSCxXQUE4QjtRQUV4RSxLQUFLLENB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Q1IsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3Rpb25hbGl0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcclxuaW1wb3J0IHsgQkFDS1NQQUNFLCBMRUZUX0FSUk9XLCBSSUdIVF9BUlJPVyB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XHJcbmltcG9ydCB7XHJcbiAgRGlyZWN0aXZlLFxyXG4gIERvQ2hlY2ssXHJcbiAgRWxlbWVudFJlZixcclxuICBJbmplY3QsXHJcbiAgSW5qZWN0aW9uVG9rZW4sXHJcbiAgSW5qZWN0b3IsXHJcbiAgT25Jbml0LFxyXG4gIE9wdGlvbmFsLFxyXG4gIGluamVjdCxcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtcclxuICBBYnN0cmFjdENvbnRyb2wsXHJcbiAgRm9ybUdyb3VwRGlyZWN0aXZlLFxyXG4gIE5HX1ZBTElEQVRPUlMsXHJcbiAgTkdfVkFMVUVfQUNDRVNTT1IsXHJcbiAgTmdDb250cm9sLFxyXG4gIE5nRm9ybSxcclxuICBWYWxpZGF0aW9uRXJyb3JzLFxyXG4gIFZhbGlkYXRvckZuLFxyXG4gIFZhbGlkYXRvcnMsXHJcbn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xyXG5pbXBvcnQgeyBDYW5VcGRhdGVFcnJvclN0YXRlLCBFcnJvclN0YXRlTWF0Y2hlciwgbWl4aW5FcnJvclN0YXRlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XHJcbmltcG9ydCB7IF9jb21wdXRlQXJpYUFjY2Vzc2libGVOYW1lIH0gZnJvbSAnLi9hcmlhLWFjY2Vzc2libGUtbmFtZSc7XHJcbmltcG9ydCB7IE5neE1hdERhdGVBZGFwdGVyIH0gZnJvbSAnLi9jb3JlL2RhdGUtYWRhcHRlcic7XHJcbmltcG9ydCB7IE5HWF9NQVRfREFURV9GT1JNQVRTLCBOZ3hNYXREYXRlRm9ybWF0cyB9IGZyb20gJy4vY29yZS9kYXRlLWZvcm1hdHMnO1xyXG5pbXBvcnQgeyBOZ3hEYXRlUmFuZ2UsIE5neERhdGVTZWxlY3Rpb25Nb2RlbENoYW5nZSB9IGZyb20gJy4vZGF0ZS1zZWxlY3Rpb24tbW9kZWwnO1xyXG5pbXBvcnQgeyBOZ3hEYXRlRmlsdGVyRm4sIE5neE1hdERhdGVwaWNrZXJJbnB1dEJhc2UgfSBmcm9tICcuL2RhdGVwaWNrZXItaW5wdXQtYmFzZSc7XHJcblxyXG4vKiogUGFyZW50IGNvbXBvbmVudCB0aGF0IHNob3VsZCBiZSB3cmFwcGVkIGFyb3VuZCBgTWF0U3RhcnREYXRlYCBhbmQgYE1hdEVuZERhdGVgLiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIE5neE1hdERhdGVSYW5nZUlucHV0UGFyZW50PEQ+IHtcclxuICBpZDogc3RyaW5nO1xyXG4gIG1pbjogRCB8IG51bGw7XHJcbiAgbWF4OiBEIHwgbnVsbDtcclxuICBkYXRlRmlsdGVyOiBOZ3hEYXRlRmlsdGVyRm48RD47XHJcbiAgcmFuZ2VQaWNrZXI6IHtcclxuICAgIG9wZW5lZDogYm9vbGVhbjtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgfTtcclxuICBfc3RhcnRJbnB1dDogTmd4TWF0RGF0ZVJhbmdlSW5wdXRQYXJ0QmFzZTxEPjtcclxuICBfZW5kSW5wdXQ6IE5neE1hdERhdGVSYW5nZUlucHV0UGFydEJhc2U8RD47XHJcbiAgX2dyb3VwRGlzYWJsZWQ6IGJvb2xlYW47XHJcbiAgX2hhbmRsZUNoaWxkVmFsdWVDaGFuZ2UoKTogdm9pZDtcclxuICBfb3BlbkRhdGVwaWNrZXIoKTogdm9pZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVzZWQgdG8gcHJvdmlkZSB0aGUgZGF0ZSByYW5nZSBpbnB1dCB3cmFwcGVyIGNvbXBvbmVudFxyXG4gKiB0byB0aGUgcGFydHMgd2l0aG91dCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgTkdYX01BVF9EQVRFX1JBTkdFX0lOUFVUX1BBUkVOVCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxcclxuICBOZ3hNYXREYXRlUmFuZ2VJbnB1dFBhcmVudDx1bmtub3duPlxyXG4+KCdOR1hfTUFUX0RBVEVfUkFOR0VfSU5QVVRfUEFSRU5UJyk7XHJcblxyXG4vKipcclxuICogQmFzZSBjbGFzcyBmb3IgdGhlIGluZGl2aWR1YWwgaW5wdXRzIHRoYXQgY2FuIGJlIHByb2plY3RlZCBpbnNpZGUgYSBgbWF0LWRhdGUtcmFuZ2UtaW5wdXRgLlxyXG4gKi9cclxuQERpcmVjdGl2ZSgpXHJcbmFic3RyYWN0IGNsYXNzIE5neE1hdERhdGVSYW5nZUlucHV0UGFydEJhc2U8RD5cclxuICBleHRlbmRzIE5neE1hdERhdGVwaWNrZXJJbnB1dEJhc2U8Tmd4RGF0ZVJhbmdlPEQ+PlxyXG4gIGltcGxlbWVudHMgT25Jbml0LCBEb0NoZWNrXHJcbntcclxuICAvKipcclxuICAgKiBGb3JtIGNvbnRyb2wgYm91bmQgdG8gdGhpcyBpbnB1dCBwYXJ0LlxyXG4gICAqIEBkb2NzLXByaXZhdGVcclxuICAgKi9cclxuICBuZ0NvbnRyb2w6IE5nQ29udHJvbDtcclxuXHJcbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cclxuICBhYnN0cmFjdCB1cGRhdGVFcnJvclN0YXRlKCk6IHZvaWQ7XHJcblxyXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBvdmVycmlkZSBfdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiB8IG51bGw7XHJcbiAgcHJvdGVjdGVkIGFic3RyYWN0IG92ZXJyaWRlIF9hc3NpZ25WYWx1ZVRvTW9kZWwodmFsdWU6IEQgfCBudWxsKTogdm9pZDtcclxuICBwcm90ZWN0ZWQgYWJzdHJhY3Qgb3ZlcnJpZGUgX2dldFZhbHVlRnJvbU1vZGVsKG1vZGVsVmFsdWU6IE5neERhdGVSYW5nZTxEPik6IEQgfCBudWxsO1xyXG5cclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2RpciA9IGluamVjdChEaXJlY3Rpb25hbGl0eSwgeyBvcHRpb25hbDogdHJ1ZSB9KTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBASW5qZWN0KE5HWF9NQVRfREFURV9SQU5HRV9JTlBVVF9QQVJFTlQpXHJcbiAgICBwdWJsaWMgX3JhbmdlSW5wdXQ6IE5neE1hdERhdGVSYW5nZUlucHV0UGFyZW50PEQ+LFxyXG4gICAgcHVibGljIG92ZXJyaWRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxJbnB1dEVsZW1lbnQ+LFxyXG4gICAgcHVibGljIF9kZWZhdWx0RXJyb3JTdGF0ZU1hdGNoZXI6IEVycm9yU3RhdGVNYXRjaGVyLFxyXG4gICAgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yLFxyXG4gICAgQE9wdGlvbmFsKCkgcHVibGljIF9wYXJlbnRGb3JtOiBOZ0Zvcm0sXHJcbiAgICBAT3B0aW9uYWwoKSBwdWJsaWMgX3BhcmVudEZvcm1Hcm91cDogRm9ybUdyb3VwRGlyZWN0aXZlLFxyXG4gICAgQE9wdGlvbmFsKCkgZGF0ZUFkYXB0ZXI6IE5neE1hdERhdGVBZGFwdGVyPEQ+LFxyXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChOR1hfTUFUX0RBVEVfRk9STUFUUykgZGF0ZUZvcm1hdHM6IE5neE1hdERhdGVGb3JtYXRzLFxyXG4gICkge1xyXG4gICAgc3VwZXIoX2VsZW1lbnRSZWYsIGRhdGVBZGFwdGVyLCBkYXRlRm9ybWF0cyk7XHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpIHtcclxuICAgIC8vIFdlIG5lZWQgdGhlIGRhdGUgaW5wdXQgdG8gcHJvdmlkZSBpdHNlbGYgYXMgYSBgQ29udHJvbFZhbHVlQWNjZXNzb3JgIGFuZCBhIGBWYWxpZGF0b3JgLCB3aGlsZVxyXG4gICAgLy8gaW5qZWN0aW5nIGl0cyBgTmdDb250cm9sYCBzbyB0aGF0IHRoZSBlcnJvciBzdGF0ZSBpcyBoYW5kbGVkIGNvcnJlY3RseS4gVGhpcyBpbnRyb2R1Y2VzIGFcclxuICAgIC8vIGNpcmN1bGFyIGRlcGVuZGVuY3ksIGJlY2F1c2UgYm90aCBgQ29udHJvbFZhbHVlQWNjZXNzb3JgIGFuZCBgVmFsaWRhdG9yYCBkZXBlbmQgb24gdGhlIGlucHV0XHJcbiAgICAvLyBpdHNlbGYuIFVzdWFsbHkgd2UgY2FuIHdvcmsgYXJvdW5kIGl0IGZvciB0aGUgQ1ZBLCBidXQgdGhlcmUncyBubyBBUEkgdG8gZG8gaXQgZm9yIHRoZVxyXG4gICAgLy8gdmFsaWRhdG9yLiBXZSB3b3JrIGFyb3VuZCBpdCBoZXJlIGJ5IGluamVjdGluZyB0aGUgYE5nQ29udHJvbGAgaW4gYG5nT25Jbml0YCwgYWZ0ZXJcclxuICAgIC8vIGV2ZXJ5dGhpbmcgaGFzIGJlZW4gcmVzb2x2ZWQuXHJcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYml0d2lzZVxyXG4gICAgY29uc3QgbmdDb250cm9sID0gdGhpcy5faW5qZWN0b3IuZ2V0KE5nQ29udHJvbCwgbnVsbCwge1xyXG4gICAgICBvcHRpb25hbDogdHJ1ZSxcclxuICAgICAgc2VsZjogdHJ1ZSxcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChuZ0NvbnRyb2wpIHtcclxuICAgICAgdGhpcy5uZ0NvbnRyb2wgPSBuZ0NvbnRyb2w7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ0RvQ2hlY2soKSB7XHJcbiAgICBpZiAodGhpcy5uZ0NvbnRyb2wpIHtcclxuICAgICAgLy8gV2UgbmVlZCB0byByZS1ldmFsdWF0ZSB0aGlzIG9uIGV2ZXJ5IGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUsIGJlY2F1c2UgdGhlcmUgYXJlIHNvbWVcclxuICAgICAgLy8gZXJyb3IgdHJpZ2dlcnMgdGhhdCB3ZSBjYW4ndCBzdWJzY3JpYmUgdG8gKGUuZy4gcGFyZW50IGZvcm0gc3VibWlzc2lvbnMpLiBUaGlzIG1lYW5zXHJcbiAgICAgIC8vIHRoYXQgd2hhdGV2ZXIgbG9naWMgaXMgaW4gaGVyZSBoYXMgdG8gYmUgc3VwZXIgbGVhbiBvciB3ZSByaXNrIGRlc3Ryb3lpbmcgdGhlIHBlcmZvcm1hbmNlLlxyXG4gICAgICB0aGlzLnVwZGF0ZUVycm9yU3RhdGUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGlucHV0IGlzIGVtcHR5LiAqL1xyXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnZhbHVlLmxlbmd0aCA9PT0gMDtcclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIHRoZSBwbGFjZWhvbGRlciBvZiB0aGUgaW5wdXQuICovXHJcbiAgX2dldFBsYWNlaG9sZGVyKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5wbGFjZWhvbGRlcjtcclxuICB9XHJcblxyXG4gIC8qKiBGb2N1c2VzIHRoZSBpbnB1dC4gKi9cclxuICBmb2N1cygpOiB2b2lkIHtcclxuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpO1xyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgdGhlIHZhbHVlIHRoYXQgc2hvdWxkIGJlIHVzZWQgd2hlbiBtaXJyb3JpbmcgdGhlIGlucHV0J3Mgc2l6ZS4gKi9cclxuICBnZXRNaXJyb3JWYWx1ZSgpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcclxuICAgIGNvbnN0IHZhbHVlID0gZWxlbWVudC52YWx1ZTtcclxuICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPiAwID8gdmFsdWUgOiBlbGVtZW50LnBsYWNlaG9sZGVyO1xyXG4gIH1cclxuXHJcbiAgLyoqIEhhbmRsZXMgYGlucHV0YCBldmVudHMgb24gdGhlIGlucHV0IGVsZW1lbnQuICovXHJcbiAgb3ZlcnJpZGUgX29uSW5wdXQodmFsdWU6IHN0cmluZykge1xyXG4gICAgc3VwZXIuX29uSW5wdXQodmFsdWUpO1xyXG4gICAgdGhpcy5fcmFuZ2VJbnB1dC5faGFuZGxlQ2hpbGRWYWx1ZUNoYW5nZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIE9wZW5zIHRoZSBkYXRlcGlja2VyIGFzc29jaWF0ZWQgd2l0aCB0aGUgaW5wdXQuICovXHJcbiAgcHJvdGVjdGVkIF9vcGVuUG9wdXAoKTogdm9pZCB7XHJcbiAgICB0aGlzLl9yYW5nZUlucHV0Ll9vcGVuRGF0ZXBpY2tlcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgdGhlIG1pbmltdW0gZGF0ZSBmcm9tIHRoZSByYW5nZSBpbnB1dC4gKi9cclxuICBfZ2V0TWluRGF0ZSgpIHtcclxuICAgIHJldHVybiB0aGlzLl9yYW5nZUlucHV0Lm1pbjtcclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIHRoZSBtYXhpbXVtIGRhdGUgZnJvbSB0aGUgcmFuZ2UgaW5wdXQuICovXHJcbiAgX2dldE1heERhdGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcmFuZ2VJbnB1dC5tYXg7XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyB0aGUgZGF0ZSBmaWx0ZXIgZnVuY3Rpb24gZnJvbSB0aGUgcmFuZ2UgaW5wdXQuICovXHJcbiAgcHJvdGVjdGVkIF9nZXREYXRlRmlsdGVyKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3JhbmdlSW5wdXQuZGF0ZUZpbHRlcjtcclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBvdmVycmlkZSBfcGFyZW50RGlzYWJsZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcmFuZ2VJbnB1dC5fZ3JvdXBEaXNhYmxlZDtcclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBfc2hvdWxkSGFuZGxlQ2hhbmdlRXZlbnQoe1xyXG4gICAgc291cmNlLFxyXG4gIH06IE5neERhdGVTZWxlY3Rpb25Nb2RlbENoYW5nZTxOZ3hEYXRlUmFuZ2U8RD4+KTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gc291cmNlICE9PSB0aGlzLl9yYW5nZUlucHV0Ll9zdGFydElucHV0ICYmIHNvdXJjZSAhPT0gdGhpcy5fcmFuZ2VJbnB1dC5fZW5kSW5wdXQ7XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX2Fzc2lnblZhbHVlUHJvZ3JhbW1hdGljYWxseSh2YWx1ZTogRCB8IG51bGwpIHtcclxuICAgIHN1cGVyLl9hc3NpZ25WYWx1ZVByb2dyYW1tYXRpY2FsbHkodmFsdWUpO1xyXG4gICAgY29uc3Qgb3Bwb3NpdGUgPSAoXHJcbiAgICAgIHRoaXMgPT09IHRoaXMuX3JhbmdlSW5wdXQuX3N0YXJ0SW5wdXRcclxuICAgICAgICA/IHRoaXMuX3JhbmdlSW5wdXQuX2VuZElucHV0XHJcbiAgICAgICAgOiB0aGlzLl9yYW5nZUlucHV0Ll9zdGFydElucHV0XHJcbiAgICApIGFzIE5neE1hdERhdGVSYW5nZUlucHV0UGFydEJhc2U8RD4gfCB1bmRlZmluZWQ7XHJcbiAgICBvcHBvc2l0ZT8uX3ZhbGlkYXRvck9uQ2hhbmdlKCk7XHJcbiAgfVxyXG5cclxuICAvKiogcmV0dXJuIHRoZSBBUklBIGFjY2Vzc2libGUgbmFtZSBvZiB0aGUgaW5wdXQgZWxlbWVudCAqL1xyXG4gIF9nZXRBY2Nlc3NpYmxlTmFtZSgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIF9jb21wdXRlQXJpYUFjY2Vzc2libGVOYW1lKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCk7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBfTmd4TWF0RGF0ZVJhbmdlSW5wdXRCYXNlID0gbWl4aW5FcnJvclN0YXRlKE5neE1hdERhdGVSYW5nZUlucHV0UGFydEJhc2UpO1xyXG5cclxuLyoqIElucHV0IGZvciBlbnRlcmluZyB0aGUgc3RhcnQgZGF0ZSBpbiBhIGBtYXQtZGF0ZS1yYW5nZS1pbnB1dGAuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnaW5wdXRbbmd4TWF0U3RhcnREYXRlXScsXHJcbiAgaG9zdDoge1xyXG4gICAgY2xhc3M6ICdtYXQtc3RhcnQtZGF0ZSBtYXQtZGF0ZS1yYW5nZS1pbnB1dC1pbm5lcicsXHJcbiAgICAnW2Rpc2FibGVkXSc6ICdkaXNhYmxlZCcsXHJcbiAgICAnKGlucHV0KSc6ICdfb25JbnB1dCgkZXZlbnQudGFyZ2V0LnZhbHVlKScsXHJcbiAgICAnKGNoYW5nZSknOiAnX29uQ2hhbmdlKCknLFxyXG4gICAgJyhrZXlkb3duKSc6ICdfb25LZXlkb3duKCRldmVudCknLFxyXG4gICAgJ1thdHRyLmFyaWEtaGFzcG9wdXBdJzogJ19yYW5nZUlucHV0LnJhbmdlUGlja2VyID8gXCJkaWFsb2dcIiA6IG51bGwnLFxyXG4gICAgJ1thdHRyLmFyaWEtb3duc10nOiAnKF9yYW5nZUlucHV0LnJhbmdlUGlja2VyPy5vcGVuZWQgJiYgX3JhbmdlSW5wdXQucmFuZ2VQaWNrZXIuaWQpIHx8IG51bGwnLFxyXG4gICAgJ1thdHRyLm1pbl0nOiAnX2dldE1pbkRhdGUoKSA/IF9kYXRlQWRhcHRlci50b0lzbzg2MDEoX2dldE1pbkRhdGUoKSkgOiBudWxsJyxcclxuICAgICdbYXR0ci5tYXhdJzogJ19nZXRNYXhEYXRlKCkgPyBfZGF0ZUFkYXB0ZXIudG9Jc284NjAxKF9nZXRNYXhEYXRlKCkpIDogbnVsbCcsXHJcbiAgICAnKGJsdXIpJzogJ19vbkJsdXIoKScsXHJcbiAgICB0eXBlOiAndGV4dCcsXHJcbiAgfSxcclxuICBwcm92aWRlcnM6IFtcclxuICAgIHsgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsIHVzZUV4aXN0aW5nOiBOZ3hNYXRTdGFydERhdGUsIG11bHRpOiB0cnVlIH0sXHJcbiAgICB7IHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsIHVzZUV4aXN0aW5nOiBOZ3hNYXRTdGFydERhdGUsIG11bHRpOiB0cnVlIH0sXHJcbiAgXSxcclxuICAvLyBUaGVzZSBuZWVkIHRvIGJlIHNwZWNpZmllZCBleHBsaWNpdGx5LCBiZWNhdXNlIHNvbWUgdG9vbGluZyBkb2Vzbid0XHJcbiAgLy8gc2VlbSB0byBwaWNrIHRoZW0gdXAgZnJvbSB0aGUgYmFzZSBjbGFzcy4gU2VlICMyMDkzMi5cclxuICBvdXRwdXRzOiBbJ2RhdGVDaGFuZ2UnLCAnZGF0ZUlucHV0J10sXHJcbiAgaW5wdXRzOiBbJ2Vycm9yU3RhdGVNYXRjaGVyJ10sXHJcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcclxufSlcclxuZXhwb3J0IGNsYXNzIE5neE1hdFN0YXJ0RGF0ZTxEPlxyXG4gIGV4dGVuZHMgX05neE1hdERhdGVSYW5nZUlucHV0QmFzZTxEPlxyXG4gIGltcGxlbWVudHMgQ2FuVXBkYXRlRXJyb3JTdGF0ZVxyXG57XHJcbiAgLyoqIFZhbGlkYXRvciB0aGF0IGNoZWNrcyB0aGF0IHRoZSBzdGFydCBkYXRlIGlzbid0IGFmdGVyIHRoZSBlbmQgZGF0ZS4gKi9cclxuICBwcml2YXRlIF9zdGFydFZhbGlkYXRvcjogVmFsaWRhdG9yRm4gPSAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwgPT4ge1xyXG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwoXHJcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKGNvbnRyb2wudmFsdWUpLFxyXG4gICAgKTtcclxuICAgIGNvbnN0IGVuZCA9IHRoaXMuX21vZGVsID8gdGhpcy5fbW9kZWwuc2VsZWN0aW9uLmVuZCA6IG51bGw7XHJcbiAgICByZXR1cm4gIXN0YXJ0IHx8ICFlbmQgfHwgdGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUoc3RhcnQsIGVuZCkgPD0gMFxyXG4gICAgICA/IG51bGxcclxuICAgICAgOiB7IG1hdFN0YXJ0RGF0ZUludmFsaWQ6IHsgZW5kOiBlbmQsIGFjdHVhbDogc3RhcnQgfSB9O1xyXG4gIH07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgQEluamVjdChOR1hfTUFUX0RBVEVfUkFOR0VfSU5QVVRfUEFSRU5UKVxyXG4gICAgcmFuZ2VJbnB1dDogTmd4TWF0RGF0ZVJhbmdlSW5wdXRQYXJlbnQ8RD4sXHJcbiAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxJbnB1dEVsZW1lbnQ+LFxyXG4gICAgZGVmYXVsdEVycm9yU3RhdGVNYXRjaGVyOiBFcnJvclN0YXRlTWF0Y2hlcixcclxuICAgIGluamVjdG9yOiBJbmplY3RvcixcclxuICAgIEBPcHRpb25hbCgpIHBhcmVudEZvcm06IE5nRm9ybSxcclxuICAgIEBPcHRpb25hbCgpIHBhcmVudEZvcm1Hcm91cDogRm9ybUdyb3VwRGlyZWN0aXZlLFxyXG4gICAgQE9wdGlvbmFsKCkgZGF0ZUFkYXB0ZXI6IE5neE1hdERhdGVBZGFwdGVyPEQ+LFxyXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChOR1hfTUFUX0RBVEVfRk9STUFUUykgZGF0ZUZvcm1hdHM6IE5neE1hdERhdGVGb3JtYXRzLFxyXG4gICkge1xyXG4gICAgc3VwZXIoXHJcbiAgICAgIHJhbmdlSW5wdXQsXHJcbiAgICAgIGVsZW1lbnRSZWYsXHJcbiAgICAgIGRlZmF1bHRFcnJvclN0YXRlTWF0Y2hlcixcclxuICAgICAgaW5qZWN0b3IsXHJcbiAgICAgIHBhcmVudEZvcm0sXHJcbiAgICAgIHBhcmVudEZvcm1Hcm91cCxcclxuICAgICAgZGF0ZUFkYXB0ZXIsXHJcbiAgICAgIGRhdGVGb3JtYXRzLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBfdmFsaWRhdG9yID0gVmFsaWRhdG9ycy5jb21wb3NlKFsuLi5zdXBlci5fZ2V0VmFsaWRhdG9ycygpLCB0aGlzLl9zdGFydFZhbGlkYXRvcl0pO1xyXG5cclxuICBwcm90ZWN0ZWQgX2dldFZhbHVlRnJvbU1vZGVsKG1vZGVsVmFsdWU6IE5neERhdGVSYW5nZTxEPikge1xyXG4gICAgcmV0dXJuIG1vZGVsVmFsdWUuc3RhcnQ7XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX3Nob3VsZEhhbmRsZUNoYW5nZUV2ZW50KFxyXG4gICAgY2hhbmdlOiBOZ3hEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2U8Tmd4RGF0ZVJhbmdlPEQ+PixcclxuICApOiBib29sZWFuIHtcclxuICAgIGlmICghc3VwZXIuX3Nob3VsZEhhbmRsZUNoYW5nZUV2ZW50KGNoYW5nZSkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuICFjaGFuZ2Uub2xkVmFsdWU/LnN0YXJ0XHJcbiAgICAgICAgPyAhIWNoYW5nZS5zZWxlY3Rpb24uc3RhcnRcclxuICAgICAgICA6ICFjaGFuZ2Uuc2VsZWN0aW9uLnN0YXJ0IHx8XHJcbiAgICAgICAgICAgICEhdGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUoY2hhbmdlLm9sZFZhbHVlLnN0YXJ0LCBjaGFuZ2Uuc2VsZWN0aW9uLnN0YXJ0KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBfYXNzaWduVmFsdWVUb01vZGVsKHZhbHVlOiBEIHwgbnVsbCkge1xyXG4gICAgaWYgKHRoaXMuX21vZGVsKSB7XHJcbiAgICAgIGNvbnN0IHJhbmdlID0gbmV3IE5neERhdGVSYW5nZSh2YWx1ZSwgdGhpcy5fbW9kZWwuc2VsZWN0aW9uLmVuZCk7XHJcbiAgICAgIHRoaXMuX21vZGVsLnVwZGF0ZVNlbGVjdGlvbihyYW5nZSwgdGhpcyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX2Zvcm1hdFZhbHVlKHZhbHVlOiBEIHwgbnVsbCkge1xyXG4gICAgc3VwZXIuX2Zvcm1hdFZhbHVlKHZhbHVlKTtcclxuXHJcbiAgICAvLyBBbnkgdGltZSB0aGUgaW5wdXQgdmFsdWUgaXMgcmVmb3JtYXR0ZWQgd2UgbmVlZCB0byB0ZWxsIHRoZSBwYXJlbnQuXHJcbiAgICB0aGlzLl9yYW5nZUlucHV0Ll9oYW5kbGVDaGlsZFZhbHVlQ2hhbmdlKCk7XHJcbiAgfVxyXG5cclxuICBvdmVycmlkZSBfb25LZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XHJcbiAgICBjb25zdCBlbmRJbnB1dCA9IHRoaXMuX3JhbmdlSW5wdXQuX2VuZElucHV0O1xyXG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcclxuICAgIGNvbnN0IGlzTHRyID0gdGhpcy5fZGlyPy52YWx1ZSAhPT0gJ3J0bCc7XHJcblxyXG4gICAgLy8gSWYgdGhlIHVzZXIgaGl0cyBSSUdIVCAoTFRSKSB3aGVuIGF0IHRoZSBlbmQgb2YgdGhlIGlucHV0IChhbmQgbm9cclxuICAgIC8vIHNlbGVjdGlvbiksIG1vdmUgdGhlIGN1cnNvciB0byB0aGUgc3RhcnQgb2YgdGhlIGVuZCBpbnB1dC5cclxuICAgIGlmIChcclxuICAgICAgKChldmVudC5rZXlDb2RlID09PSBSSUdIVF9BUlJPVyAmJiBpc0x0cikgfHwgKGV2ZW50LmtleUNvZGUgPT09IExFRlRfQVJST1cgJiYgIWlzTHRyKSkgJiZcclxuICAgICAgZWxlbWVudC5zZWxlY3Rpb25TdGFydCA9PT0gZWxlbWVudC52YWx1ZS5sZW5ndGggJiZcclxuICAgICAgZWxlbWVudC5zZWxlY3Rpb25FbmQgPT09IGVsZW1lbnQudmFsdWUubGVuZ3RoXHJcbiAgICApIHtcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZW5kSW5wdXQuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSgwLCAwKTtcclxuICAgICAgZW5kSW5wdXQuZm9jdXMoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHN1cGVyLl9vbktleWRvd24oZXZlbnQpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqIElucHV0IGZvciBlbnRlcmluZyB0aGUgZW5kIGRhdGUgaW4gYSBgbWF0LWRhdGUtcmFuZ2UtaW5wdXRgLiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ2lucHV0W25neE1hdEVuZERhdGVdJyxcclxuICBob3N0OiB7XHJcbiAgICBjbGFzczogJ21hdC1lbmQtZGF0ZSBtYXQtZGF0ZS1yYW5nZS1pbnB1dC1pbm5lcicsXHJcbiAgICAnW2Rpc2FibGVkXSc6ICdkaXNhYmxlZCcsXHJcbiAgICAnKGlucHV0KSc6ICdfb25JbnB1dCgkZXZlbnQudGFyZ2V0LnZhbHVlKScsXHJcbiAgICAnKGNoYW5nZSknOiAnX29uQ2hhbmdlKCknLFxyXG4gICAgJyhrZXlkb3duKSc6ICdfb25LZXlkb3duKCRldmVudCknLFxyXG4gICAgJ1thdHRyLmFyaWEtaGFzcG9wdXBdJzogJ19yYW5nZUlucHV0LnJhbmdlUGlja2VyID8gXCJkaWFsb2dcIiA6IG51bGwnLFxyXG4gICAgJ1thdHRyLmFyaWEtb3duc10nOiAnKF9yYW5nZUlucHV0LnJhbmdlUGlja2VyPy5vcGVuZWQgJiYgX3JhbmdlSW5wdXQucmFuZ2VQaWNrZXIuaWQpIHx8IG51bGwnLFxyXG4gICAgJ1thdHRyLm1pbl0nOiAnX2dldE1pbkRhdGUoKSA/IF9kYXRlQWRhcHRlci50b0lzbzg2MDEoX2dldE1pbkRhdGUoKSkgOiBudWxsJyxcclxuICAgICdbYXR0ci5tYXhdJzogJ19nZXRNYXhEYXRlKCkgPyBfZGF0ZUFkYXB0ZXIudG9Jc284NjAxKF9nZXRNYXhEYXRlKCkpIDogbnVsbCcsXHJcbiAgICAnKGJsdXIpJzogJ19vbkJsdXIoKScsXHJcbiAgICB0eXBlOiAndGV4dCcsXHJcbiAgfSxcclxuICBwcm92aWRlcnM6IFtcclxuICAgIHsgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsIHVzZUV4aXN0aW5nOiBOZ3hNYXRFbmREYXRlLCBtdWx0aTogdHJ1ZSB9LFxyXG4gICAgeyBwcm92aWRlOiBOR19WQUxJREFUT1JTLCB1c2VFeGlzdGluZzogTmd4TWF0RW5kRGF0ZSwgbXVsdGk6IHRydWUgfSxcclxuICBdLFxyXG4gIC8vIFRoZXNlIG5lZWQgdG8gYmUgc3BlY2lmaWVkIGV4cGxpY2l0bHksIGJlY2F1c2Ugc29tZSB0b29saW5nIGRvZXNuJ3RcclxuICAvLyBzZWVtIHRvIHBpY2sgdGhlbSB1cCBmcm9tIHRoZSBiYXNlIGNsYXNzLiBTZWUgIzIwOTMyLlxyXG4gIG91dHB1dHM6IFsnZGF0ZUNoYW5nZScsICdkYXRlSW5wdXQnXSxcclxuICBpbnB1dHM6IFsnZXJyb3JTdGF0ZU1hdGNoZXInXSxcclxuICBzdGFuZGFsb25lOiB0cnVlLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgTmd4TWF0RW5kRGF0ZTxEPiBleHRlbmRzIF9OZ3hNYXREYXRlUmFuZ2VJbnB1dEJhc2U8RD4gaW1wbGVtZW50cyBDYW5VcGRhdGVFcnJvclN0YXRlIHtcclxuICAvKiogVmFsaWRhdG9yIHRoYXQgY2hlY2tzIHRoYXQgdGhlIGVuZCBkYXRlIGlzbid0IGJlZm9yZSB0aGUgc3RhcnQgZGF0ZS4gKi9cclxuICBwcml2YXRlIF9lbmRWYWxpZGF0b3I6IFZhbGlkYXRvckZuID0gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcclxuICAgIGNvbnN0IGVuZCA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShjb250cm9sLnZhbHVlKSk7XHJcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuX21vZGVsID8gdGhpcy5fbW9kZWwuc2VsZWN0aW9uLnN0YXJ0IDogbnVsbDtcclxuICAgIHJldHVybiAhZW5kIHx8ICFzdGFydCB8fCB0aGlzLl9kYXRlQWRhcHRlci5jb21wYXJlRGF0ZShlbmQsIHN0YXJ0KSA+PSAwXHJcbiAgICAgID8gbnVsbFxyXG4gICAgICA6IHsgbWF0RW5kRGF0ZUludmFsaWQ6IHsgc3RhcnQ6IHN0YXJ0LCBhY3R1YWw6IGVuZCB9IH07XHJcbiAgfTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBASW5qZWN0KE5HWF9NQVRfREFURV9SQU5HRV9JTlBVVF9QQVJFTlQpXHJcbiAgICByYW5nZUlucHV0OiBOZ3hNYXREYXRlUmFuZ2VJbnB1dFBhcmVudDxEPixcclxuICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTElucHV0RWxlbWVudD4sXHJcbiAgICBkZWZhdWx0RXJyb3JTdGF0ZU1hdGNoZXI6IEVycm9yU3RhdGVNYXRjaGVyLFxyXG4gICAgaW5qZWN0b3I6IEluamVjdG9yLFxyXG4gICAgQE9wdGlvbmFsKCkgcGFyZW50Rm9ybTogTmdGb3JtLFxyXG4gICAgQE9wdGlvbmFsKCkgcGFyZW50Rm9ybUdyb3VwOiBGb3JtR3JvdXBEaXJlY3RpdmUsXHJcbiAgICBAT3B0aW9uYWwoKSBkYXRlQWRhcHRlcjogTmd4TWF0RGF0ZUFkYXB0ZXI8RD4sXHJcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE5HWF9NQVRfREFURV9GT1JNQVRTKSBkYXRlRm9ybWF0czogTmd4TWF0RGF0ZUZvcm1hdHMsXHJcbiAgKSB7XHJcbiAgICBzdXBlcihcclxuICAgICAgcmFuZ2VJbnB1dCxcclxuICAgICAgZWxlbWVudFJlZixcclxuICAgICAgZGVmYXVsdEVycm9yU3RhdGVNYXRjaGVyLFxyXG4gICAgICBpbmplY3RvcixcclxuICAgICAgcGFyZW50Rm9ybSxcclxuICAgICAgcGFyZW50Rm9ybUdyb3VwLFxyXG4gICAgICBkYXRlQWRhcHRlcixcclxuICAgICAgZGF0ZUZvcm1hdHMsXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIF92YWxpZGF0b3IgPSBWYWxpZGF0b3JzLmNvbXBvc2UoWy4uLnN1cGVyLl9nZXRWYWxpZGF0b3JzKCksIHRoaXMuX2VuZFZhbGlkYXRvcl0pO1xyXG5cclxuICBwcm90ZWN0ZWQgX2dldFZhbHVlRnJvbU1vZGVsKG1vZGVsVmFsdWU6IE5neERhdGVSYW5nZTxEPikge1xyXG4gICAgcmV0dXJuIG1vZGVsVmFsdWUuZW5kO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIF9zaG91bGRIYW5kbGVDaGFuZ2VFdmVudChcclxuICAgIGNoYW5nZTogTmd4RGF0ZVNlbGVjdGlvbk1vZGVsQ2hhbmdlPE5neERhdGVSYW5nZTxEPj4sXHJcbiAgKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIXN1cGVyLl9zaG91bGRIYW5kbGVDaGFuZ2VFdmVudChjaGFuZ2UpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiAhY2hhbmdlLm9sZFZhbHVlPy5lbmRcclxuICAgICAgICA/ICEhY2hhbmdlLnNlbGVjdGlvbi5lbmRcclxuICAgICAgICA6ICFjaGFuZ2Uuc2VsZWN0aW9uLmVuZCB8fFxyXG4gICAgICAgICAgICAhIXRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlKGNoYW5nZS5vbGRWYWx1ZS5lbmQsIGNoYW5nZS5zZWxlY3Rpb24uZW5kKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBfYXNzaWduVmFsdWVUb01vZGVsKHZhbHVlOiBEIHwgbnVsbCkge1xyXG4gICAgaWYgKHRoaXMuX21vZGVsKSB7XHJcbiAgICAgIGNvbnN0IHJhbmdlID0gbmV3IE5neERhdGVSYW5nZSh0aGlzLl9tb2RlbC5zZWxlY3Rpb24uc3RhcnQsIHZhbHVlKTtcclxuICAgICAgdGhpcy5fbW9kZWwudXBkYXRlU2VsZWN0aW9uKHJhbmdlLCB0aGlzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG92ZXJyaWRlIF9vbktleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcclxuICAgIGNvbnN0IHN0YXJ0SW5wdXQgPSB0aGlzLl9yYW5nZUlucHV0Ll9zdGFydElucHV0O1xyXG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcclxuICAgIGNvbnN0IGlzTHRyID0gdGhpcy5fZGlyPy52YWx1ZSAhPT0gJ3J0bCc7XHJcblxyXG4gICAgLy8gSWYgdGhlIHVzZXIgaXMgcHJlc3NpbmcgYmFja3NwYWNlIG9uIGFuIGVtcHR5IGVuZCBpbnB1dCwgbW92ZSBmb2N1cyBiYWNrIHRvIHRoZSBzdGFydC5cclxuICAgIGlmIChldmVudC5rZXlDb2RlID09PSBCQUNLU1BBQ0UgJiYgIWVsZW1lbnQudmFsdWUpIHtcclxuICAgICAgc3RhcnRJbnB1dC5mb2N1cygpO1xyXG4gICAgfVxyXG4gICAgLy8gSWYgdGhlIHVzZXIgaGl0cyBMRUZUIChMVFIpIHdoZW4gYXQgdGhlIHN0YXJ0IG9mIHRoZSBpbnB1dCAoYW5kIG5vXHJcbiAgICAvLyBzZWxlY3Rpb24pLCBtb3ZlIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgc3RhcnQgaW5wdXQuXHJcbiAgICBlbHNlIGlmIChcclxuICAgICAgKChldmVudC5rZXlDb2RlID09PSBMRUZUX0FSUk9XICYmIGlzTHRyKSB8fCAoZXZlbnQua2V5Q29kZSA9PT0gUklHSFRfQVJST1cgJiYgIWlzTHRyKSkgJiZcclxuICAgICAgZWxlbWVudC5zZWxlY3Rpb25TdGFydCA9PT0gMCAmJlxyXG4gICAgICBlbGVtZW50LnNlbGVjdGlvbkVuZCA9PT0gMFxyXG4gICAgKSB7XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGNvbnN0IGVuZFBvc2l0aW9uID0gc3RhcnRJbnB1dC5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnZhbHVlLmxlbmd0aDtcclxuICAgICAgc3RhcnRJbnB1dC5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKGVuZFBvc2l0aW9uLCBlbmRQb3NpdGlvbik7XHJcbiAgICAgIHN0YXJ0SW5wdXQuZm9jdXMoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHN1cGVyLl9vbktleWRvd24oZXZlbnQpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=