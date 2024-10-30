import { Directive, forwardRef, Inject, Input, Optional, } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { MAT_FORM_FIELD } from '@angular/material/form-field';
import { MAT_INPUT_VALUE_ACCESSOR } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { NGX_MAT_DATE_FORMATS } from './core/date-formats';
import { NgxMatDatepickerInputBase, } from './datepicker-input-base';
import * as i0 from "@angular/core";
import * as i1 from "./core/date-adapter";
/** @docs-private */
export const NGX_MAT_DATEPICKER_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NgxMatDatepickerInput),
    multi: true,
};
/** @docs-private */
export const NGX_MAT_DATEPICKER_VALIDATORS = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => NgxMatDatepickerInput),
    multi: true,
};
/** Directive used to connect an input to a MatDatepicker. */
export class NgxMatDatepickerInput extends NgxMatDatepickerInputBase {
    /** The datepicker that this input is associated with. */
    set ngxMatDatetimePicker(datepicker) {
        if (datepicker) {
            this._datepicker = datepicker;
            this._closedSubscription = datepicker.closedStream.subscribe(() => this._onTouched());
            this._registerModel(datepicker.registerInput(this));
        }
    }
    /** The minimum valid date. */
    get min() {
        return this._min;
    }
    set min(value) {
        const validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
        if (!this._dateAdapter.sameDate(validValue, this._min)) {
            this._min = validValue;
            this._validatorOnChange();
        }
    }
    /** The maximum valid date. */
    get max() {
        return this._max;
    }
    set max(value) {
        const validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
        if (!this._dateAdapter.sameDate(validValue, this._max)) {
            this._max = validValue;
            this._validatorOnChange();
        }
    }
    /** Function that can be used to filter out dates within the datepicker. */
    get dateFilter() {
        return this._dateFilter;
    }
    set dateFilter(value) {
        const wasMatchingValue = this._matchesFilter(this.value);
        this._dateFilter = value;
        if (this._matchesFilter(this.value) !== wasMatchingValue) {
            this._validatorOnChange();
        }
    }
    constructor(elementRef, dateAdapter, dateFormats, _formField) {
        super(elementRef, dateAdapter, dateFormats);
        this._formField = _formField;
        this._closedSubscription = Subscription.EMPTY;
        this._validator = Validators.compose(super._getValidators());
    }
    /**
     * Gets the element that the datepicker popup should be connected to.
     * @return The element to connect the popup to.
     */
    getConnectedOverlayOrigin() {
        return this._formField ? this._formField.getConnectedOverlayOrigin() : this._elementRef;
    }
    /** Gets the ID of an element that should be used a description for the calendar overlay. */
    getOverlayLabelId() {
        if (this._formField) {
            return this._formField.getLabelId();
        }
        return this._elementRef.nativeElement.getAttribute('aria-labelledby');
    }
    /** Returns the palette used by the input's form field, if any. */
    getThemePalette() {
        return this._formField ? this._formField.color : undefined;
    }
    /** Gets the value at which the calendar should start. */
    getStartValue() {
        return this.value;
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._closedSubscription.unsubscribe();
    }
    /** Opens the associated datepicker. */
    _openPopup() {
        if (this._datepicker) {
            this._datepicker.open();
        }
    }
    _getValueFromModel(modelValue) {
        return modelValue;
    }
    _assignValueToModel(value) {
        if (this._model) {
            this._model.updateSelection(value, this);
        }
    }
    /** Gets the input's minimum date. */
    _getMinDate() {
        return this._min;
    }
    /** Gets the input's maximum date. */
    _getMaxDate() {
        return this._max;
    }
    /** Gets the input's date filtering function. */
    _getDateFilter() {
        return this._dateFilter;
    }
    _shouldHandleChangeEvent(event) {
        return event.source !== this;
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerInput, deps: [{ token: i0.ElementRef }, { token: i1.NgxMatDateAdapter, optional: true }, { token: NGX_MAT_DATE_FORMATS, optional: true }, { token: MAT_FORM_FIELD, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    /** @nocollapse */ static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.3", type: NgxMatDatepickerInput, isStandalone: true, selector: "input[ngxMatDatetimePicker]", inputs: { ngxMatDatetimePicker: "ngxMatDatetimePicker", min: "min", max: "max", dateFilter: ["matDatepickerFilter", "dateFilter"] }, host: { listeners: { "input": "_onInput($event.target.value)", "change": "_onChange()", "blur": "_onBlur()", "keydown": "_onKeydown($event)" }, properties: { "attr.aria-haspopup": "_datepicker ? \"dialog\" : null", "attr.aria-owns": "(_datepicker?.opened && _datepicker.id) || null", "attr.min": "min ? _dateAdapter.toIso8601(min) : null", "attr.max": "max ? _dateAdapter.toIso8601(max) : null", "attr.data-mat-calendar": "_datepicker ? _datepicker.id : null", "disabled": "disabled" }, classAttribute: "mat-datepicker-input" }, providers: [
            NGX_MAT_DATEPICKER_VALUE_ACCESSOR,
            NGX_MAT_DATEPICKER_VALIDATORS,
            { provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: NgxMatDatepickerInput },
        ], exportAs: ["ngxMatDatepickerInput"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerInput, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[ngxMatDatetimePicker]',
                    providers: [
                        NGX_MAT_DATEPICKER_VALUE_ACCESSOR,
                        NGX_MAT_DATEPICKER_VALIDATORS,
                        { provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: NgxMatDatepickerInput },
                    ],
                    host: {
                        class: 'mat-datepicker-input',
                        '[attr.aria-haspopup]': '_datepicker ? "dialog" : null',
                        '[attr.aria-owns]': '(_datepicker?.opened && _datepicker.id) || null',
                        '[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
                        '[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
                        // Used by the test harness to tie this input to its calendar. We can't depend on
                        // `aria-owns` for this, because it's only defined while the calendar is open.
                        '[attr.data-mat-calendar]': '_datepicker ? _datepicker.id : null',
                        '[disabled]': 'disabled',
                        '(input)': '_onInput($event.target.value)',
                        '(change)': '_onChange()',
                        '(blur)': '_onBlur()',
                        '(keydown)': '_onKeydown($event)',
                    },
                    exportAs: 'ngxMatDatepickerInput',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.NgxMatDateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NGX_MAT_DATE_FORMATS]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_FORM_FIELD]
                }] }], propDecorators: { ngxMatDatetimePicker: [{
                type: Input
            }], min: [{
                type: Input
            }], max: [{
                type: Input
            }], dateFilter: [{
                type: Input,
                args: ['matDatepickerFilter']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1pbnB1dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2RhdGV0aW1lLXBpY2tlci9zcmMvbGliL2RhdGVwaWNrZXItaW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFFVCxVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFFTCxRQUFRLEdBQ1QsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsRUFBZSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUzRixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUVwQyxPQUFPLEVBQUUsb0JBQW9CLEVBQXFCLE1BQU0scUJBQXFCLENBQUM7QUFHOUUsT0FBTyxFQUdMLHlCQUF5QixHQUMxQixNQUFNLHlCQUF5QixDQUFDOzs7QUFFakMsb0JBQW9CO0FBQ3BCLE1BQU0sQ0FBQyxNQUFNLGlDQUFpQyxHQUFRO0lBQ3BELE9BQU8sRUFBRSxpQkFBaUI7SUFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztJQUNwRCxLQUFLLEVBQUUsSUFBSTtDQUNaLENBQUM7QUFFRixvQkFBb0I7QUFDcEIsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQVE7SUFDaEQsT0FBTyxFQUFFLGFBQWE7SUFDdEIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztJQUNwRCxLQUFLLEVBQUUsSUFBSTtDQUNaLENBQUM7QUFFRiw2REFBNkQ7QUEwQjdELE1BQU0sT0FBTyxxQkFDWCxTQUFRLHlCQUFzQztJQUs5Qyx5REFBeUQ7SUFDekQs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LEdBQUc7c0JBRE4sS0FBSztnQkFnQkYsR0FBRztzQkFETixLQUFLO2dCQWdCRixVQUFVO3NCQURiLEtBQUs7dUJBQUMscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICBEaXJlY3RpdmUsXHJcbiAgRWxlbWVudFJlZixcclxuICBmb3J3YXJkUmVmLFxyXG4gIEluamVjdCxcclxuICBJbnB1dCxcclxuICBPbkRlc3Ryb3ksXHJcbiAgT3B0aW9uYWwsXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE5HX1ZBTElEQVRPUlMsIE5HX1ZBTFVFX0FDQ0VTU09SLCBWYWxpZGF0b3JGbiwgVmFsaWRhdG9ycyB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcclxuaW1wb3J0IHsgVGhlbWVQYWxldHRlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XHJcbmltcG9ydCB7IE1BVF9GT1JNX0ZJRUxEIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZm9ybS1maWVsZCc7XHJcbmltcG9ydCB7IE1BVF9JTlBVVF9WQUxVRV9BQ0NFU1NPUiB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2lucHV0JztcclxuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IE5neE1hdERhdGVBZGFwdGVyIH0gZnJvbSAnLi9jb3JlL2RhdGUtYWRhcHRlcic7XHJcbmltcG9ydCB7IE5HWF9NQVRfREFURV9GT1JNQVRTLCBOZ3hNYXREYXRlRm9ybWF0cyB9IGZyb20gJy4vY29yZS9kYXRlLWZvcm1hdHMnO1xyXG5pbXBvcnQgeyBOZ3hEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2UgfSBmcm9tICcuL2RhdGUtc2VsZWN0aW9uLW1vZGVsJztcclxuaW1wb3J0IHsgTmd4TWF0RGF0ZXBpY2tlckNvbnRyb2wsIE5neE1hdERhdGVwaWNrZXJQYW5lbCB9IGZyb20gJy4vZGF0ZXBpY2tlci1iYXNlJztcclxuaW1wb3J0IHtcclxuICBfTmd4TWF0Rm9ybUZpZWxkUGFydGlhbCxcclxuICBOZ3hEYXRlRmlsdGVyRm4sXHJcbiAgTmd4TWF0RGF0ZXBpY2tlcklucHV0QmFzZSxcclxufSBmcm9tICcuL2RhdGVwaWNrZXItaW5wdXQtYmFzZSc7XHJcblxyXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xyXG5leHBvcnQgY29uc3QgTkdYX01BVF9EQVRFUElDS0VSX1ZBTFVFX0FDQ0VTU09SOiBhbnkgPSB7XHJcbiAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXHJcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmd4TWF0RGF0ZXBpY2tlcklucHV0KSxcclxuICBtdWx0aTogdHJ1ZSxcclxufTtcclxuXHJcbi8qKiBAZG9jcy1wcml2YXRlICovXHJcbmV4cG9ydCBjb25zdCBOR1hfTUFUX0RBVEVQSUNLRVJfVkFMSURBVE9SUzogYW55ID0ge1xyXG4gIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXHJcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmd4TWF0RGF0ZXBpY2tlcklucHV0KSxcclxuICBtdWx0aTogdHJ1ZSxcclxufTtcclxuXHJcbi8qKiBEaXJlY3RpdmUgdXNlZCB0byBjb25uZWN0IGFuIGlucHV0IHRvIGEgTWF0RGF0ZXBpY2tlci4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdpbnB1dFtuZ3hNYXREYXRldGltZVBpY2tlcl0nLFxyXG4gIHByb3ZpZGVyczogW1xyXG4gICAgTkdYX01BVF9EQVRFUElDS0VSX1ZBTFVFX0FDQ0VTU09SLFxyXG4gICAgTkdYX01BVF9EQVRFUElDS0VSX1ZBTElEQVRPUlMsXHJcbiAgICB7IHByb3ZpZGU6IE1BVF9JTlBVVF9WQUxVRV9BQ0NFU1NPUiwgdXNlRXhpc3Rpbmc6IE5neE1hdERhdGVwaWNrZXJJbnB1dCB9LFxyXG4gIF0sXHJcbiAgaG9zdDoge1xyXG4gICAgY2xhc3M6ICdtYXQtZGF0ZXBpY2tlci1pbnB1dCcsXHJcbiAgICAnW2F0dHIuYXJpYS1oYXNwb3B1cF0nOiAnX2RhdGVwaWNrZXIgPyBcImRpYWxvZ1wiIDogbnVsbCcsXHJcbiAgICAnW2F0dHIuYXJpYS1vd25zXSc6ICcoX2RhdGVwaWNrZXI/Lm9wZW5lZCAmJiBfZGF0ZXBpY2tlci5pZCkgfHwgbnVsbCcsXHJcbiAgICAnW2F0dHIubWluXSc6ICdtaW4gPyBfZGF0ZUFkYXB0ZXIudG9Jc284NjAxKG1pbikgOiBudWxsJyxcclxuICAgICdbYXR0ci5tYXhdJzogJ21heCA/IF9kYXRlQWRhcHRlci50b0lzbzg2MDEobWF4KSA6IG51bGwnLFxyXG4gICAgLy8gVXNlZCBieSB0aGUgdGVzdCBoYXJuZXNzIHRvIHRpZSB0aGlzIGlucHV0IHRvIGl0cyBjYWxlbmRhci4gV2UgY2FuJ3QgZGVwZW5kIG9uXHJcbiAgICAvLyBgYXJpYS1vd25zYCBmb3IgdGhpcywgYmVjYXVzZSBpdCdzIG9ubHkgZGVmaW5lZCB3aGlsZSB0aGUgY2FsZW5kYXIgaXMgb3Blbi5cclxuICAgICdbYXR0ci5kYXRhLW1hdC1jYWxlbmRhcl0nOiAnX2RhdGVwaWNrZXIgPyBfZGF0ZXBpY2tlci5pZCA6IG51bGwnLFxyXG4gICAgJ1tkaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxyXG4gICAgJyhpbnB1dCknOiAnX29uSW5wdXQoJGV2ZW50LnRhcmdldC52YWx1ZSknLFxyXG4gICAgJyhjaGFuZ2UpJzogJ19vbkNoYW5nZSgpJyxcclxuICAgICcoYmx1ciknOiAnX29uQmx1cigpJyxcclxuICAgICcoa2V5ZG93biknOiAnX29uS2V5ZG93bigkZXZlbnQpJyxcclxuICB9LFxyXG4gIGV4cG9ydEFzOiAnbmd4TWF0RGF0ZXBpY2tlcklucHV0JyxcclxuICBzdGFuZGFsb25lOiB0cnVlLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgTmd4TWF0RGF0ZXBpY2tlcklucHV0PEQ+XHJcbiAgZXh0ZW5kcyBOZ3hNYXREYXRlcGlja2VySW5wdXRCYXNlPEQgfCBudWxsLCBEPlxyXG4gIGltcGxlbWVudHMgTmd4TWF0RGF0ZXBpY2tlckNvbnRyb2w8RCB8IG51bGw+LCBPbkRlc3Ryb3lcclxue1xyXG4gIHByaXZhdGUgX2Nsb3NlZFN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcclxuXHJcbiAgLyoqIFRoZSBkYXRlcGlja2VyIHRoYXQgdGhpcyBpbnB1dCBpcyBhc3NvY2lhdGVkIHdpdGguICovXHJcbiAgQElucHV0KClcclxuICBzZXQgbmd4TWF0RGF0ZXRpbWVQaWNrZXIoXHJcbiAgICBkYXRlcGlja2VyOiBOZ3hNYXREYXRlcGlja2VyUGFuZWw8Tmd4TWF0RGF0ZXBpY2tlckNvbnRyb2w8RD4sIEQgfCBudWxsLCBEPixcclxuICApIHtcclxuICAgIGlmIChkYXRlcGlja2VyKSB7XHJcbiAgICAgIHRoaXMuX2RhdGVwaWNrZXIgPSBkYXRlcGlja2VyO1xyXG4gICAgICB0aGlzLl9jbG9zZWRTdWJzY3JpcHRpb24gPSBkYXRlcGlja2VyLmNsb3NlZFN0cmVhbS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fb25Ub3VjaGVkKCkpO1xyXG4gICAgICB0aGlzLl9yZWdpc3Rlck1vZGVsKGRhdGVwaWNrZXIucmVnaXN0ZXJJbnB1dCh0aGlzKSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIF9kYXRlcGlja2VyOiBOZ3hNYXREYXRlcGlja2VyUGFuZWw8Tmd4TWF0RGF0ZXBpY2tlckNvbnRyb2w8RD4sIEQgfCBudWxsLCBEPjtcclxuXHJcbiAgLyoqIFRoZSBtaW5pbXVtIHZhbGlkIGRhdGUuICovXHJcbiAgQElucHV0KClcclxuICBnZXQgbWluKCk6IEQgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9taW47XHJcbiAgfVxyXG4gIHNldCBtaW4odmFsdWU6IEQgfCBudWxsKSB7XHJcbiAgICBjb25zdCB2YWxpZFZhbHVlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XHJcblxyXG4gICAgaWYgKCF0aGlzLl9kYXRlQWRhcHRlci5zYW1lRGF0ZSh2YWxpZFZhbHVlLCB0aGlzLl9taW4pKSB7XHJcbiAgICAgIHRoaXMuX21pbiA9IHZhbGlkVmFsdWU7XHJcbiAgICAgIHRoaXMuX3ZhbGlkYXRvck9uQ2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHByaXZhdGUgX21pbjogRCB8IG51bGw7XHJcblxyXG4gIC8qKiBUaGUgbWF4aW11bSB2YWxpZCBkYXRlLiAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IG1heCgpOiBEIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fbWF4O1xyXG4gIH1cclxuICBzZXQgbWF4KHZhbHVlOiBEIHwgbnVsbCkge1xyXG4gICAgY29uc3QgdmFsaWRWYWx1ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xyXG5cclxuICAgIGlmICghdGhpcy5fZGF0ZUFkYXB0ZXIuc2FtZURhdGUodmFsaWRWYWx1ZSwgdGhpcy5fbWF4KSkge1xyXG4gICAgICB0aGlzLl9tYXggPSB2YWxpZFZhbHVlO1xyXG4gICAgICB0aGlzLl92YWxpZGF0b3JPbkNoYW5nZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuICBwcml2YXRlIF9tYXg6IEQgfCBudWxsO1xyXG5cclxuICAvKiogRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBmaWx0ZXIgb3V0IGRhdGVzIHdpdGhpbiB0aGUgZGF0ZXBpY2tlci4gKi9cclxuICBASW5wdXQoJ21hdERhdGVwaWNrZXJGaWx0ZXInKVxyXG4gIGdldCBkYXRlRmlsdGVyKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2RhdGVGaWx0ZXI7XHJcbiAgfVxyXG4gIHNldCBkYXRlRmlsdGVyKHZhbHVlOiBOZ3hEYXRlRmlsdGVyRm48RCB8IG51bGw+KSB7XHJcbiAgICBjb25zdCB3YXNNYXRjaGluZ1ZhbHVlID0gdGhpcy5fbWF0Y2hlc0ZpbHRlcih0aGlzLnZhbHVlKTtcclxuICAgIHRoaXMuX2RhdGVGaWx0ZXIgPSB2YWx1ZTtcclxuXHJcbiAgICBpZiAodGhpcy5fbWF0Y2hlc0ZpbHRlcih0aGlzLnZhbHVlKSAhPT0gd2FzTWF0Y2hpbmdWYWx1ZSkge1xyXG4gICAgICB0aGlzLl92YWxpZGF0b3JPbkNoYW5nZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuICBwcml2YXRlIF9kYXRlRmlsdGVyOiBOZ3hEYXRlRmlsdGVyRm48RCB8IG51bGw+O1xyXG5cclxuICAvKiogVGhlIGNvbWJpbmVkIGZvcm0gY29udHJvbCB2YWxpZGF0b3IgZm9yIHRoaXMgaW5wdXQuICovXHJcbiAgcHJvdGVjdGVkIF92YWxpZGF0b3I6IFZhbGlkYXRvckZuIHwgbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxJbnB1dEVsZW1lbnQ+LFxyXG4gICAgQE9wdGlvbmFsKCkgZGF0ZUFkYXB0ZXI6IE5neE1hdERhdGVBZGFwdGVyPEQ+LFxyXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChOR1hfTUFUX0RBVEVfRk9STUFUUykgZGF0ZUZvcm1hdHM6IE5neE1hdERhdGVGb3JtYXRzLFxyXG4gICAgQE9wdGlvbmFsKClcclxuICAgIEBJbmplY3QoTUFUX0ZPUk1fRklFTEQpXHJcbiAgICBwcml2YXRlIF9mb3JtRmllbGQ/OiBfTmd4TWF0Rm9ybUZpZWxkUGFydGlhbCxcclxuICApIHtcclxuICAgIHN1cGVyKGVsZW1lbnRSZWYsIGRhdGVBZGFwdGVyLCBkYXRlRm9ybWF0cyk7XHJcbiAgICB0aGlzLl92YWxpZGF0b3IgPSBWYWxpZGF0b3JzLmNvbXBvc2Uoc3VwZXIuX2dldFZhbGlkYXRvcnMoKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBlbGVtZW50IHRoYXQgdGhlIGRhdGVwaWNrZXIgcG9wdXAgc2hvdWxkIGJlIGNvbm5lY3RlZCB0by5cclxuICAgKiBAcmV0dXJuIFRoZSBlbGVtZW50IHRvIGNvbm5lY3QgdGhlIHBvcHVwIHRvLlxyXG4gICAqL1xyXG4gIGdldENvbm5lY3RlZE92ZXJsYXlPcmlnaW4oKTogRWxlbWVudFJlZiB7XHJcbiAgICByZXR1cm4gdGhpcy5fZm9ybUZpZWxkID8gdGhpcy5fZm9ybUZpZWxkLmdldENvbm5lY3RlZE92ZXJsYXlPcmlnaW4oKSA6IHRoaXMuX2VsZW1lbnRSZWY7XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyB0aGUgSUQgb2YgYW4gZWxlbWVudCB0aGF0IHNob3VsZCBiZSB1c2VkIGEgZGVzY3JpcHRpb24gZm9yIHRoZSBjYWxlbmRhciBvdmVybGF5LiAqL1xyXG4gIGdldE92ZXJsYXlMYWJlbElkKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgaWYgKHRoaXMuX2Zvcm1GaWVsZCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fZm9ybUZpZWxkLmdldExhYmVsSWQoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5Jyk7XHJcbiAgfVxyXG5cclxuICAvKiogUmV0dXJucyB0aGUgcGFsZXR0ZSB1c2VkIGJ5IHRoZSBpbnB1dCdzIGZvcm0gZmllbGQsIGlmIGFueS4gKi9cclxuICBnZXRUaGVtZVBhbGV0dGUoKTogVGhlbWVQYWxldHRlIHtcclxuICAgIHJldHVybiB0aGlzLl9mb3JtRmllbGQgPyB0aGlzLl9mb3JtRmllbGQuY29sb3IgOiB1bmRlZmluZWQ7XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyB0aGUgdmFsdWUgYXQgd2hpY2ggdGhlIGNhbGVuZGFyIHNob3VsZCBzdGFydC4gKi9cclxuICBnZXRTdGFydFZhbHVlKCk6IEQgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgb3ZlcnJpZGUgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xyXG4gICAgdGhpcy5fY2xvc2VkU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgfVxyXG5cclxuICAvKiogT3BlbnMgdGhlIGFzc29jaWF0ZWQgZGF0ZXBpY2tlci4gKi9cclxuICBwcm90ZWN0ZWQgX29wZW5Qb3B1cCgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLl9kYXRlcGlja2VyKSB7XHJcbiAgICAgIHRoaXMuX2RhdGVwaWNrZXIub3BlbigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIF9nZXRWYWx1ZUZyb21Nb2RlbChtb2RlbFZhbHVlOiBEIHwgbnVsbCk6IEQgfCBudWxsIHtcclxuICAgIHJldHVybiBtb2RlbFZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIF9hc3NpZ25WYWx1ZVRvTW9kZWwodmFsdWU6IEQgfCBudWxsKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5fbW9kZWwpIHtcclxuICAgICAgdGhpcy5fbW9kZWwudXBkYXRlU2VsZWN0aW9uKHZhbHVlLCB0aGlzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIHRoZSBpbnB1dCdzIG1pbmltdW0gZGF0ZS4gKi9cclxuICBfZ2V0TWluRGF0ZSgpIHtcclxuICAgIHJldHVybiB0aGlzLl9taW47XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyB0aGUgaW5wdXQncyBtYXhpbXVtIGRhdGUuICovXHJcbiAgX2dldE1heERhdGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fbWF4O1xyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgdGhlIGlucHV0J3MgZGF0ZSBmaWx0ZXJpbmcgZnVuY3Rpb24uICovXHJcbiAgcHJvdGVjdGVkIF9nZXREYXRlRmlsdGVyKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2RhdGVGaWx0ZXI7XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgX3Nob3VsZEhhbmRsZUNoYW5nZUV2ZW50KGV2ZW50OiBOZ3hEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2U8RD4pIHtcclxuICAgIHJldHVybiBldmVudC5zb3VyY2UgIT09IHRoaXM7XHJcbiAgfVxyXG59XHJcbiJdfQ==