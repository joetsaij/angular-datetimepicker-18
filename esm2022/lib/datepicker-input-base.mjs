import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOWN_ARROW, hasModifierKey } from '@angular/cdk/keycodes';
import { Directive, Inject, Input, Optional, output, } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { NGX_MAT_DATE_FORMATS } from './core/date-formats';
import { createMissingDateImplError } from './datepicker-errors';
import * as i0 from "@angular/core";
import * as i1 from "./core/date-adapter";
/**
 * An event used for datepicker input and change events. We don't always have access to a native
 * input or change event because the event may have been triggered by the user clicking on the
 * calendar popup. For consistency, we always use MatDatepickerInputEvent instead.
 */
export class NgxMatDatepickerInputEvent {
    constructor(
    /** Reference to the datepicker input component that emitted the event. */
    target, 
    /** Reference to the native input element associated with the datepicker input. */
    targetElement) {
        this.target = target;
        this.targetElement = targetElement;
        this.value = this.target.value;
    }
}
/** Base class for datepicker inputs. */
export class NgxMatDatepickerInputBase {
    /** The value of the input. */
    get value() {
        return this._model ? this._getValueFromModel(this._model.selection) : this._pendingValue;
    }
    set value(value) {
        this._assignValueProgrammatically(value);
    }
    /** Whether the datepicker-input is disabled. */
    get disabled() {
        return !!this._disabled || this._parentDisabled();
    }
    set disabled(value) {
        const newValue = coerceBooleanProperty(value);
        const element = this._elementRef.nativeElement;
        if (this._disabled !== newValue) {
            this._disabled = newValue;
            this.stateChanges.next(undefined);
        }
        // We need to null check the `blur` method, because it's undefined during SSR.
        // In Ivy static bindings are invoked earlier, before the element is attached to the DOM.
        // This can cause an error to be thrown in some browsers (IE/Edge) which assert that the
        // element has been inserted.
        if (newValue && this._isInitialized && element.blur) {
            // Normally, native input elements automatically blur if they turn disabled. This behavior
            // is problematic, because it would mean that it triggers another change detection cycle,
            // which then causes a changed after checked error if the input element was focused before.
            element.blur();
        }
    }
    /** Gets the base validator functions. */
    _getValidators() {
        return [this._parseValidator, this._minValidator, this._maxValidator, this._filterValidator];
    }
    /** Registers a date selection model with the input. */
    _registerModel(model) {
        this._model = model;
        this._valueChangesSubscription.unsubscribe();
        if (this._pendingValue) {
            this._assignValue(this._pendingValue);
        }
        this._valueChangesSubscription = this._model.selectionChanged.subscribe((event) => {
            if (this._shouldHandleChangeEvent(event)) {
                const value = this._getValueFromModel(event.selection);
                this._lastValueValid = this._isValidValue(value);
                this._cvaOnChange(value);
                this._onTouched();
                this._formatValue(value);
                this.dateInput.emit(new NgxMatDatepickerInputEvent(this, this._elementRef.nativeElement));
                this.dateChange.emit(new NgxMatDatepickerInputEvent(this, this._elementRef.nativeElement));
            }
        });
    }
    constructor(_elementRef, _dateAdapter, _dateFormats) {
        this._elementRef = _elementRef;
        this._dateAdapter = _dateAdapter;
        this._dateFormats = _dateFormats;
        /** Emits when a `change` event is fired on this `<input>`. */
        this.dateChange = output();
        /** Emits when an `input` event is fired on this `<input>`. */
        this.dateInput = output();
        /** Emits when the internal state has changed */
        this.stateChanges = new Subject();
        this._onTouched = () => { };
        this._validatorOnChange = () => { };
        this._cvaOnChange = () => { };
        this._valueChangesSubscription = Subscription.EMPTY;
        this._localeSubscription = Subscription.EMPTY;
        /** The form control validator for whether the input parses. */
        this._parseValidator = () => {
            return this._lastValueValid
                ? null
                : { matDatepickerParse: { text: this._elementRef.nativeElement.value } };
        };
        /** The form control validator for the date filter. */
        this._filterValidator = (control) => {
            const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
            return !controlValue || this._matchesFilter(controlValue)
                ? null
                : { matDatepickerFilter: true };
        };
        /** The form control validator for the min date. */
        this._minValidator = (control) => {
            const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
            const min = this._getMinDate();
            return !min || !controlValue || this._dateAdapter.compareDateWithTime(min, controlValue) <= 0
                ? null
                : { matDatetimePickerMin: { min: min, actual: controlValue } };
        };
        /** The form control validator for the max date. */
        this._maxValidator = (control) => {
            const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
            const max = this._getMaxDate();
            return !max || !controlValue || this._dateAdapter.compareDateWithTime(max, controlValue) >= 0
                ? null
                : { matDatetimePickerMax: { max: max, actual: controlValue } };
        };
        /** Whether the last value set on the input was valid. */
        this._lastValueValid = false;
        if (!this._dateAdapter) {
            throw createMissingDateImplError('NgxMatDateAdapter');
        }
        if (!this._dateFormats) {
            throw createMissingDateImplError('NGX_MAT_DATE_FORMATS');
        }
        // Update the displayed date when the locale changes.
        this._localeSubscription = _dateAdapter.localeChanges.subscribe(() => {
            this._assignValueProgrammatically(this.value);
        });
    }
    ngAfterViewInit() {
        this._isInitialized = true;
    }
    ngOnChanges(changes) {
        if (dateInputsHaveChanged(changes, this._dateAdapter)) {
            this.stateChanges.next(undefined);
        }
    }
    ngOnDestroy() {
        this._valueChangesSubscription.unsubscribe();
        this._localeSubscription.unsubscribe();
        this.stateChanges.complete();
    }
    /** @docs-private */
    registerOnValidatorChange(fn) {
        this._validatorOnChange = fn;
    }
    /** @docs-private */
    validate(c) {
        return this._validator ? this._validator(c) : null;
    }
    // Implemented as part of ControlValueAccessor.
    writeValue(value) {
        this._assignValueProgrammatically(value);
    }
    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn) {
        this._cvaOnChange = fn;
    }
    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    _onKeydown(event) {
        const ctrlShiftMetaModifiers = ['ctrlKey', 'shiftKey', 'metaKey'];
        const isAltDownArrow = hasModifierKey(event, 'altKey') &&
            event.keyCode === DOWN_ARROW &&
            ctrlShiftMetaModifiers.every((modifier) => !hasModifierKey(event, modifier));
        if (isAltDownArrow && !this._elementRef.nativeElement.readOnly) {
            this._openPopup();
            event.preventDefault();
        }
    }
    _onInput(value) {
        const lastValueWasValid = this._lastValueValid;
        let date = this._dateAdapter.parse(value, this._dateFormats.parse.dateInput);
        this._lastValueValid = this._isValidValue(date);
        date = this._dateAdapter.getValidDateOrNull(date);
        const isSameTime = this._dateAdapter.isSameTime(date, this.value);
        const isSameDate = this._dateAdapter.sameDate(date, this.value);
        const isSame = isSameDate && isSameTime;
        const hasChanged = !isSame;
        // We need to fire the CVA change event for all
        // nulls, otherwise the validators won't run.
        if (!date || hasChanged) {
            this._cvaOnChange(date);
        }
        else {
            // Call the CVA change handler for invalid values
            // since this is what marks the control as dirty.
            if (value && !this.value) {
                this._cvaOnChange(date);
            }
            if (lastValueWasValid !== this._lastValueValid) {
                this._validatorOnChange();
            }
        }
        if (hasChanged) {
            this._assignValue(date);
            this.dateInput.emit(new NgxMatDatepickerInputEvent(this, this._elementRef.nativeElement));
        }
    }
    _onChange() {
        this.dateChange.emit(new NgxMatDatepickerInputEvent(this, this._elementRef.nativeElement));
    }
    /** Handles blur events on the input. */
    _onBlur() {
        // Reformat the input only if we have a valid value.
        if (this.value) {
            this._formatValue(this.value);
        }
        this._onTouched();
    }
    /** Formats a value and sets it on the input element. */
    _formatValue(value) {
        this._elementRef.nativeElement.value =
            value != null ? this._dateAdapter.format(value, this._dateFormats.display.dateInput) : '';
    }
    /** Assigns a value to the model. */
    _assignValue(value) {
        // We may get some incoming values before the model was
        // assigned. Save the value so that we can assign it later.
        if (this._model) {
            this._assignValueToModel(value);
            this._pendingValue = null;
        }
        else {
            this._pendingValue = value;
        }
    }
    /** Whether a value is considered valid. */
    _isValidValue(value) {
        return !value || this._dateAdapter.isValid(value);
    }
    /**
     * Checks whether a parent control is disabled. This is in place so that it can be overridden
     * by inputs extending this one which can be placed inside of a group that can be disabled.
     */
    _parentDisabled() {
        return false;
    }
    /** Programmatically assigns a value to the input. */
    _assignValueProgrammatically(value) {
        value = this._dateAdapter.deserialize(value);
        this._lastValueValid = this._isValidValue(value);
        value = this._dateAdapter.getValidDateOrNull(value);
        this._assignValue(value);
        this._formatValue(value);
    }
    /** Gets whether a value matches the current date filter. */
    _matchesFilter(value) {
        const filter = this._getDateFilter();
        return !filter || filter(value);
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerInputBase, deps: [{ token: i0.ElementRef }, { token: i1.NgxMatDateAdapter, optional: true }, { token: NGX_MAT_DATE_FORMATS, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    /** @nocollapse */ static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.3", type: NgxMatDatepickerInputBase, inputs: { value: "value", disabled: "disabled" }, outputs: { dateChange: "dateChange", dateInput: "dateInput" }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerInputBase, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.NgxMatDateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NGX_MAT_DATE_FORMATS]
                }] }], propDecorators: { value: [{
                type: Input
            }], disabled: [{
                type: Input
            }] } });
/**
 * Checks whether the `SimpleChanges` object from an `ngOnChanges`
 * callback has any changes, accounting for date objects.
 */
export function dateInputsHaveChanged(changes, adapter) {
    const keys = Object.keys(changes);
    for (let key of keys) {
        const { previousValue, currentValue } = changes[key];
        if (adapter.isDateInstance(previousValue) && adapter.isDateInstance(currentValue)) {
            if (!adapter.sameDate(previousValue, currentValue)) {
                return true;
            }
        }
        else {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1pbnB1dC1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZGF0ZXRpbWUtcGlja2VyL3NyYy9saWIvZGF0ZXBpY2tlci1pbnB1dC1iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBZ0IscUJBQXFCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUM1RSxPQUFPLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ25FLE9BQU8sRUFFTCxTQUFTLEVBRVQsTUFBTSxFQUNOLEtBQUssRUFHTCxRQUFRLEVBRVIsTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBU3ZCLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRTdDLE9BQU8sRUFBRSxvQkFBb0IsRUFBcUIsTUFBTSxxQkFBcUIsQ0FBQztBQU05RSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7O0FBRWpFOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sMEJBQTBCO0lBSXJDO0lBQ0UsMEVBQTBFO0lBQ25FLE1BQXVDO0lBQzlDLGtGQUFrRjtJQUMzRSxhQUEwQjtRQUYxQixXQUFNLEdBQU4sTUFBTSxDQUFpQztRQUV2QyxrQkFBYSxHQUFiLGFBQWEsQ0FBYTtRQUVqQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pDLENBQUM7Q0FDRjtBQW1CRCx3Q0FBd0M7QUFFeEMsTUFBTSxPQUFnQix5QkFBeUI7SUFNN0MsOEJBQThCO0lBQzlCLElBQ0ksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFh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RSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVyRCxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO1lBQ2xGLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUMsRUFBRSxDQUFDO2dCQUNuRCxPQUFPLElBQUksQ0FBQztZQUNkLENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMaXN0S2V5TWFuYWdlck1vZGlmaWVyS2V5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xyXG5pbXBvcnQgeyBCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XHJcbmltcG9ydCB7IERPV05fQVJST1csIGhhc01vZGlmaWVyS2V5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcclxuaW1wb3J0IHtcclxuICBBZnRlclZpZXdJbml0LFxyXG4gIERpcmVjdGl2ZSxcclxuICBFbGVtZW50UmVmLFxyXG4gIEluamVjdCxcclxuICBJbnB1dCxcclxuICBPbkNoYW5nZXMsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9wdGlvbmFsLFxyXG4gIFNpbXBsZUNoYW5nZXMsXHJcbiAgb3V0cHV0LFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge1xyXG4gIEFic3RyYWN0Q29udHJvbCxcclxuICBDb250cm9sVmFsdWVBY2Nlc3NvcixcclxuICBWYWxpZGF0aW9uRXJyb3JzLFxyXG4gIFZhbGlkYXRvcixcclxuICBWYWxpZGF0b3JGbixcclxufSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcbmltcG9ydCB7IFRoZW1lUGFsZXR0ZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xyXG5pbXBvcnQgeyBTdWJqZWN0LCBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgTmd4TWF0RGF0ZUFkYXB0ZXIgfSBmcm9tICcuL2NvcmUvZGF0ZS1hZGFwdGVyJztcclxuaW1wb3J0IHsgTkdYX01BVF9EQVRFX0ZPUk1BVFMsIE5neE1hdERhdGVGb3JtYXRzIH0gZnJvbSAnLi9jb3JlL2RhdGUtZm9ybWF0cyc7XHJcbmltcG9ydCB7XHJcbiAgTmd4RGF0ZVNlbGVjdGlvbk1vZGVsQ2hhbmdlLFxyXG4gIE5neEV4dHJhY3REYXRlVHlwZUZyb21TZWxlY3Rpb24sXHJcbiAgTmd4TWF0RGF0ZVNlbGVjdGlvbk1vZGVsLFxyXG59IGZyb20gJy4vZGF0ZS1zZWxlY3Rpb24tbW9kZWwnO1xyXG5pbXBvcnQgeyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvciB9IGZyb20gJy4vZGF0ZXBpY2tlci1lcnJvcnMnO1xyXG5cclxuLyoqXHJcbiAqIEFuIGV2ZW50IHVzZWQgZm9yIGRhdGVwaWNrZXIgaW5wdXQgYW5kIGNoYW5nZSBldmVudHMuIFdlIGRvbid0IGFsd2F5cyBoYXZlIGFjY2VzcyB0byBhIG5hdGl2ZVxyXG4gKiBpbnB1dCBvciBjaGFuZ2UgZXZlbnQgYmVjYXVzZSB0aGUgZXZlbnQgbWF5IGhhdmUgYmVlbiB0cmlnZ2VyZWQgYnkgdGhlIHVzZXIgY2xpY2tpbmcgb24gdGhlXHJcbiAqIGNhbGVuZGFyIHBvcHVwLiBGb3IgY29uc2lzdGVuY3ksIHdlIGFsd2F5cyB1c2UgTWF0RGF0ZXBpY2tlcklucHV0RXZlbnQgaW5zdGVhZC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBOZ3hNYXREYXRlcGlja2VySW5wdXRFdmVudDxELCBTID0gdW5rbm93bj4ge1xyXG4gIC8qKiBUaGUgbmV3IHZhbHVlIGZvciB0aGUgdGFyZ2V0IGRhdGVwaWNrZXIgaW5wdXQuICovXHJcbiAgdmFsdWU6IEQgfCBudWxsO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGRhdGVwaWNrZXIgaW5wdXQgY29tcG9uZW50IHRoYXQgZW1pdHRlZCB0aGUgZXZlbnQuICovXHJcbiAgICBwdWJsaWMgdGFyZ2V0OiBOZ3hNYXREYXRlcGlja2VySW5wdXRCYXNlPFMsIEQ+LFxyXG4gICAgLyoqIFJlZmVyZW5jZSB0byB0aGUgbmF0aXZlIGlucHV0IGVsZW1lbnQgYXNzb2NpYXRlZCB3aXRoIHRoZSBkYXRlcGlja2VyIGlucHV0LiAqL1xyXG4gICAgcHVibGljIHRhcmdldEVsZW1lbnQ6IEhUTUxFbGVtZW50LFxyXG4gICkge1xyXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMudGFyZ2V0LnZhbHVlO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmlsdGVyIG91dCBkYXRlcyBmcm9tIGEgY2FsZW5kYXIuICovXHJcbmV4cG9ydCB0eXBlIE5neERhdGVGaWx0ZXJGbjxEPiA9IChkYXRlOiBEIHwgbnVsbCkgPT4gYm9vbGVhbjtcclxuXHJcbi8qKlxyXG4gKiBQYXJ0aWFsIHJlcHJlc2VudGF0aW9uIG9mIGBNYXRGb3JtRmllbGRgIHRoYXQgaXMgdXNlZCBmb3IgYmFja3dhcmRzLWNvbXBhdGliaWxpdHlcclxuICogYmV0d2VlbiB0aGUgbGVnYWN5IGFuZCBub24tbGVnYWN5IHZhcmlhbnRzLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBfTmd4TWF0Rm9ybUZpZWxkUGFydGlhbCB7XHJcbiAgZ2V0Q29ubmVjdGVkT3ZlcmxheU9yaWdpbigpOiBFbGVtZW50UmVmO1xyXG4gIGdldExhYmVsSWQoKTogc3RyaW5nIHwgbnVsbDtcclxuICBjb2xvcjogVGhlbWVQYWxldHRlO1xyXG4gIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmO1xyXG4gIF9zaG91bGRMYWJlbEZsb2F0KCk6IGJvb2xlYW47XHJcbiAgX2hhc0Zsb2F0aW5nTGFiZWwoKTogYm9vbGVhbjtcclxuICBfbGFiZWxJZDogc3RyaW5nO1xyXG59XHJcblxyXG4vKiogQmFzZSBjbGFzcyBmb3IgZGF0ZXBpY2tlciBpbnB1dHMuICovXHJcbkBEaXJlY3RpdmUoKVxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTmd4TWF0RGF0ZXBpY2tlcklucHV0QmFzZTxTLCBEID0gTmd4RXh0cmFjdERhdGVUeXBlRnJvbVNlbGVjdGlvbjxTPj5cclxuICBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBBZnRlclZpZXdJbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgVmFsaWRhdG9yXHJcbntcclxuICAvKiogV2hldGhlciB0aGUgY29tcG9uZW50IGhhcyBiZWVuIGluaXRpYWxpemVkLiAqL1xyXG4gIHByaXZhdGUgX2lzSW5pdGlhbGl6ZWQ6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBUaGUgdmFsdWUgb2YgdGhlIGlucHV0LiAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IHZhbHVlKCk6IEQgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9tb2RlbCA/IHRoaXMuX2dldFZhbHVlRnJvbU1vZGVsKHRoaXMuX21vZGVsLnNlbGVjdGlvbikgOiB0aGlzLl9wZW5kaW5nVmFsdWU7XHJcbiAgfVxyXG4gIHNldCB2YWx1ZSh2YWx1ZTogYW55KSB7XHJcbiAgICB0aGlzLl9hc3NpZ25WYWx1ZVByb2dyYW1tYXRpY2FsbHkodmFsdWUpO1xyXG4gIH1cclxuICBwcm90ZWN0ZWQgX21vZGVsOiBOZ3hNYXREYXRlU2VsZWN0aW9uTW9kZWw8UywgRD4gfCB1bmRlZmluZWQ7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBkYXRlcGlja2VyLWlucHV0IGlzIGRpc2FibGVkLiAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICEhdGhpcy5fZGlzYWJsZWQgfHwgdGhpcy5fcGFyZW50RGlzYWJsZWQoKTtcclxuICB9XHJcbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcclxuICAgIGNvbnN0IG5ld1ZhbHVlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcclxuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XHJcblxyXG4gICAgaWYgKHRoaXMuX2Rpc2FibGVkICE9PSBuZXdWYWx1ZSkge1xyXG4gICAgICB0aGlzLl9kaXNhYmxlZCA9IG5ld1ZhbHVlO1xyXG4gICAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KHVuZGVmaW5lZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2UgbmVlZCB0byBudWxsIGNoZWNrIHRoZSBgYmx1cmAgbWV0aG9kLCBiZWNhdXNlIGl0J3MgdW5kZWZpbmVkIGR1cmluZyBTU1IuXHJcbiAgICAvLyBJbiBJdnkgc3RhdGljIGJpbmRpbmdzIGFyZSBpbnZva2VkIGVhcmxpZXIsIGJlZm9yZSB0aGUgZWxlbWVudCBpcyBhdHRhY2hlZCB0byB0aGUgRE9NLlxyXG4gICAgLy8gVGhpcyBjYW4gY2F1c2UgYW4gZXJyb3IgdG8gYmUgdGhyb3duIGluIHNvbWUgYnJvd3NlcnMgKElFL0VkZ2UpIHdoaWNoIGFzc2VydCB0aGF0IHRoZVxyXG4gICAgLy8gZWxlbWVudCBoYXMgYmVlbiBpbnNlcnRlZC5cclxuICAgIGlmIChuZXdWYWx1ZSAmJiB0aGlzLl9pc0luaXRpYWxpemVkICYmIGVsZW1lbnQuYmx1cikge1xyXG4gICAgICAvLyBOb3JtYWxseSwgbmF0aXZlIGlucHV0IGVsZW1lbnRzIGF1dG9tYXRpY2FsbHkgYmx1ciBpZiB0aGV5IHR1cm4gZGlzYWJsZWQuIFRoaXMgYmVoYXZpb3JcclxuICAgICAgLy8gaXMgcHJvYmxlbWF0aWMsIGJlY2F1c2UgaXQgd291bGQgbWVhbiB0aGF0IGl0IHRyaWdnZXJzIGFub3RoZXIgY2hhbmdlIGRldGVjdGlvbiBjeWNsZSxcclxuICAgICAgLy8gd2hpY2ggdGhlbiBjYXVzZXMgYSBjaGFuZ2VkIGFmdGVyIGNoZWNrZWQgZXJyb3IgaWYgdGhlIGlucHV0IGVsZW1lbnQgd2FzIGZvY3VzZWQgYmVmb3JlLlxyXG4gICAgICBlbGVtZW50LmJsdXIoKTtcclxuICAgIH1cclxuICB9XHJcbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBFbWl0cyB3aGVuIGEgYGNoYW5nZWAgZXZlbnQgaXMgZmlyZWQgb24gdGhpcyBgPGlucHV0PmAuICovXHJcbiAgcmVhZG9ubHkgZGF0ZUNoYW5nZSA9IG91dHB1dDxOZ3hNYXREYXRlcGlja2VySW5wdXRFdmVudDxELCBTPj4oKTtcclxuXHJcbiAgLyoqIEVtaXRzIHdoZW4gYW4gYGlucHV0YCBldmVudCBpcyBmaXJlZCBvbiB0aGlzIGA8aW5wdXQ+YC4gKi9cclxuICByZWFkb25seSBkYXRlSW5wdXQgPSBvdXRwdXQ8Tmd4TWF0RGF0ZXBpY2tlcklucHV0RXZlbnQ8RCwgUz4+KCk7XHJcblxyXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBpbnRlcm5hbCBzdGF0ZSBoYXMgY2hhbmdlZCAqL1xyXG4gIHJlYWRvbmx5IHN0YXRlQ2hhbmdlcyA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XHJcblxyXG4gIF9vblRvdWNoZWQgPSAoKSA9PiB7fTtcclxuICBfdmFsaWRhdG9yT25DaGFuZ2UgPSAoKSA9PiB7fTtcclxuXHJcbiAgcHJpdmF0ZSBfY3ZhT25DaGFuZ2U6ICh2YWx1ZTogYW55KSA9PiB2b2lkID0gKCkgPT4ge307XHJcbiAgcHJpdmF0ZSBfdmFsdWVDaGFuZ2VzU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xyXG4gIHByaXZhdGUgX2xvY2FsZVN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcclxuXHJcbiAgLyoqXHJcbiAgICogU2luY2UgdGhlIHZhbHVlIGlzIGtlcHQgb24gdGhlIG1vZGVsIHdoaWNoIGlzIGFzc2lnbmVkIGluIGFuIElucHV0LFxyXG4gICAqIHdlIG1pZ2h0IGdldCBhIHZhbHVlIGJlZm9yZSB3ZSBoYXZlIGEgbW9kZWwuIFRoaXMgcHJvcGVydHkga2VlcHMgdHJhY2tcclxuICAgKiBvZiB0aGUgdmFsdWUgdW50aWwgd2UgaGF2ZSBzb21ld2hlcmUgdG8gYXNzaWduIGl0LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX3BlbmRpbmdWYWx1ZTogRCB8IG51bGw7XHJcblxyXG4gIC8qKiBUaGUgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3Igd2hldGhlciB0aGUgaW5wdXQgcGFyc2VzLiAqL1xyXG4gIHByaXZhdGUgX3BhcnNlVmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9ICgpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCA9PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fbGFzdFZhbHVlVmFsaWRcclxuICAgICAgPyBudWxsXHJcbiAgICAgIDogeyBtYXREYXRlcGlja2VyUGFyc2U6IHsgdGV4dDogdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnZhbHVlIH0gfTtcclxuICB9O1xyXG5cclxuICAvKiogVGhlIGZvcm0gY29udHJvbCB2YWxpZGF0b3IgZm9yIHRoZSBkYXRlIGZpbHRlci4gKi9cclxuICBwcml2YXRlIF9maWx0ZXJWYWxpZGF0b3I6IFZhbGlkYXRvckZuID0gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcclxuICAgIGNvbnN0IGNvbnRyb2xWYWx1ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbChcclxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUoY29udHJvbC52YWx1ZSksXHJcbiAgICApO1xyXG4gICAgcmV0dXJuICFjb250cm9sVmFsdWUgfHwgdGhpcy5fbWF0Y2hlc0ZpbHRlcihjb250cm9sVmFsdWUpXHJcbiAgICAgID8gbnVsbFxyXG4gICAgICA6IHsgbWF0RGF0ZXBpY2tlckZpbHRlcjogdHJ1ZSB9O1xyXG4gIH07XHJcblxyXG4gIC8qKiBUaGUgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3IgdGhlIG1pbiBkYXRlLiAqL1xyXG4gIHByaXZhdGUgX21pblZhbGlkYXRvcjogVmFsaWRhdG9yRm4gPSAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwgPT4ge1xyXG4gICAgY29uc3QgY29udHJvbFZhbHVlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKFxyXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShjb250cm9sLnZhbHVlKSxcclxuICAgICk7XHJcbiAgICBjb25zdCBtaW4gPSB0aGlzLl9nZXRNaW5EYXRlKCk7XHJcbiAgICByZXR1cm4gIW1pbiB8fCAhY29udHJvbFZhbHVlIHx8IHRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlV2l0aFRpbWUobWluLCBjb250cm9sVmFsdWUpIDw9IDBcclxuICAgICAgPyBudWxsXHJcbiAgICAgIDogeyBtYXREYXRldGltZVBpY2tlck1pbjogeyBtaW46IG1pbiwgYWN0dWFsOiBjb250cm9sVmFsdWUgfSB9O1xyXG4gIH07XHJcblxyXG4gIC8qKiBUaGUgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3IgdGhlIG1heCBkYXRlLiAqL1xyXG4gIHByaXZhdGUgX21heFZhbGlkYXRvcjogVmFsaWRhdG9yRm4gPSAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwgPT4ge1xyXG4gICAgY29uc3QgY29udHJvbFZhbHVlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKFxyXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShjb250cm9sLnZhbHVlKSxcclxuICAgICk7XHJcbiAgICBjb25zdCBtYXggPSB0aGlzLl9nZXRNYXhEYXRlKCk7XHJcbiAgICByZXR1cm4gIW1heCB8fCAhY29udHJvbFZhbHVlIHx8IHRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlV2l0aFRpbWUobWF4LCBjb250cm9sVmFsdWUpID49IDBcclxuICAgICAgPyBudWxsXHJcbiAgICAgIDogeyBtYXREYXRldGltZVBpY2tlck1heDogeyBtYXg6IG1heCwgYWN0dWFsOiBjb250cm9sVmFsdWUgfSB9O1xyXG4gIH07XHJcblxyXG4gIC8qKiBHZXRzIHRoZSBiYXNlIHZhbGlkYXRvciBmdW5jdGlvbnMuICovXHJcbiAgcHJvdGVjdGVkIF9nZXRWYWxpZGF0b3JzKCk6IFZhbGlkYXRvckZuW10ge1xyXG4gICAgcmV0dXJuIFt0aGlzLl9wYXJzZVZhbGlkYXRvciwgdGhpcy5fbWluVmFsaWRhdG9yLCB0aGlzLl9tYXhWYWxpZGF0b3IsIHRoaXMuX2ZpbHRlclZhbGlkYXRvcl07XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyB0aGUgbWluaW11bSBkYXRlIGZvciB0aGUgaW5wdXQuIFVzZWQgZm9yIHZhbGlkYXRpb24uICovXHJcbiAgYWJzdHJhY3QgX2dldE1pbkRhdGUoKTogRCB8IG51bGw7XHJcblxyXG4gIC8qKiBHZXRzIHRoZSBtYXhpbXVtIGRhdGUgZm9yIHRoZSBpbnB1dC4gVXNlZCBmb3IgdmFsaWRhdGlvbi4gKi9cclxuICBhYnN0cmFjdCBfZ2V0TWF4RGF0ZSgpOiBEIHwgbnVsbDtcclxuXHJcbiAgLyoqIEdldHMgdGhlIGRhdGUgZmlsdGVyIGZ1bmN0aW9uLiBVc2VkIGZvciB2YWxpZGF0aW9uLiAqL1xyXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfZ2V0RGF0ZUZpbHRlcigpOiBOZ3hEYXRlRmlsdGVyRm48RD4gfCB1bmRlZmluZWQ7XHJcblxyXG4gIC8qKiBSZWdpc3RlcnMgYSBkYXRlIHNlbGVjdGlvbiBtb2RlbCB3aXRoIHRoZSBpbnB1dC4gKi9cclxuICBfcmVnaXN0ZXJNb2RlbChtb2RlbDogTmd4TWF0RGF0ZVNlbGVjdGlvbk1vZGVsPFMsIEQ+KTogdm9pZCB7XHJcbiAgICB0aGlzLl9tb2RlbCA9IG1vZGVsO1xyXG4gICAgdGhpcy5fdmFsdWVDaGFuZ2VzU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcblxyXG4gICAgaWYgKHRoaXMuX3BlbmRpbmdWYWx1ZSkge1xyXG4gICAgICB0aGlzLl9hc3NpZ25WYWx1ZSh0aGlzLl9wZW5kaW5nVmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3ZhbHVlQ2hhbmdlc1N1YnNjcmlwdGlvbiA9IHRoaXMuX21vZGVsLnNlbGVjdGlvbkNoYW5nZWQuc3Vic2NyaWJlKChldmVudCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5fc2hvdWxkSGFuZGxlQ2hhbmdlRXZlbnQoZXZlbnQpKSB7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9nZXRWYWx1ZUZyb21Nb2RlbChldmVudC5zZWxlY3Rpb24pO1xyXG4gICAgICAgIHRoaXMuX2xhc3RWYWx1ZVZhbGlkID0gdGhpcy5faXNWYWxpZFZhbHVlKHZhbHVlKTtcclxuICAgICAgICB0aGlzLl9jdmFPbkNoYW5nZSh2YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5fb25Ub3VjaGVkKCk7XHJcbiAgICAgICAgdGhpcy5fZm9ybWF0VmFsdWUodmFsdWUpO1xyXG4gICAgICAgIHRoaXMuZGF0ZUlucHV0LmVtaXQobmV3IE5neE1hdERhdGVwaWNrZXJJbnB1dEV2ZW50KHRoaXMsIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkpO1xyXG4gICAgICAgIHRoaXMuZGF0ZUNoYW5nZS5lbWl0KG5ldyBOZ3hNYXREYXRlcGlja2VySW5wdXRFdmVudCh0aGlzLCB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKiogT3BlbnMgdGhlIHBvcHVwIGFzc29jaWF0ZWQgd2l0aCB0aGUgaW5wdXQuICovXHJcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9vcGVuUG9wdXAoKTogdm9pZDtcclxuXHJcbiAgLyoqIEFzc2lnbnMgYSB2YWx1ZSB0byB0aGUgaW5wdXQncyBtb2RlbC4gKi9cclxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2Fzc2lnblZhbHVlVG9Nb2RlbChtb2RlbDogRCB8IG51bGwpOiB2b2lkO1xyXG5cclxuICAvKiogQ29udmVydHMgYSB2YWx1ZSBmcm9tIHRoZSBtb2RlbCBpbnRvIGEgbmF0aXZlIHZhbHVlIGZvciB0aGUgaW5wdXQuICovXHJcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9nZXRWYWx1ZUZyb21Nb2RlbChtb2RlbFZhbHVlOiBTKTogRCB8IG51bGw7XHJcblxyXG4gIC8qKiBDb21iaW5lZCBmb3JtIGNvbnRyb2wgdmFsaWRhdG9yIGZvciB0aGlzIGlucHV0LiAqL1xyXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiB8IG51bGw7XHJcblxyXG4gIC8qKiBQcmVkaWNhdGUgdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGlucHV0IHNob3VsZCBoYW5kbGUgYSBwYXJ0aWN1bGFyIGNoYW5nZSBldmVudC4gKi9cclxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX3Nob3VsZEhhbmRsZUNoYW5nZUV2ZW50KGV2ZW50OiBOZ3hEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2U8Uz4pOiBib29sZWFuO1xyXG5cclxuICAvKiogV2hldGhlciB0aGUgbGFzdCB2YWx1ZSBzZXQgb24gdGhlIGlucHV0IHdhcyB2YWxpZC4gKi9cclxuICBwcm90ZWN0ZWQgX2xhc3RWYWx1ZVZhbGlkID0gZmFsc2U7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJvdGVjdGVkIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxJbnB1dEVsZW1lbnQ+LFxyXG4gICAgQE9wdGlvbmFsKCkgcHVibGljIF9kYXRlQWRhcHRlcjogTmd4TWF0RGF0ZUFkYXB0ZXI8RD4sXHJcbiAgICBAT3B0aW9uYWwoKVxyXG4gICAgQEluamVjdChOR1hfTUFUX0RBVEVfRk9STUFUUylcclxuICAgIHByaXZhdGUgX2RhdGVGb3JtYXRzOiBOZ3hNYXREYXRlRm9ybWF0cyxcclxuICApIHtcclxuICAgIGlmICghdGhpcy5fZGF0ZUFkYXB0ZXIpIHtcclxuICAgICAgdGhyb3cgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IoJ05neE1hdERhdGVBZGFwdGVyJyk7XHJcbiAgICB9XHJcbiAgICBpZiAoIXRoaXMuX2RhdGVGb3JtYXRzKSB7XHJcbiAgICAgIHRocm93IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yKCdOR1hfTUFUX0RBVEVfRk9STUFUUycpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheWVkIGRhdGUgd2hlbiB0aGUgbG9jYWxlIGNoYW5nZXMuXHJcbiAgICB0aGlzLl9sb2NhbGVTdWJzY3JpcHRpb24gPSBfZGF0ZUFkYXB0ZXIubG9jYWxlQ2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICB0aGlzLl9hc3NpZ25WYWx1ZVByb2dyYW1tYXRpY2FsbHkodGhpcy52YWx1ZSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcclxuICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xyXG4gICAgaWYgKGRhdGVJbnB1dHNIYXZlQ2hhbmdlZChjaGFuZ2VzLCB0aGlzLl9kYXRlQWRhcHRlcikpIHtcclxuICAgICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCh1bmRlZmluZWQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICB0aGlzLl92YWx1ZUNoYW5nZXNTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgIHRoaXMuX2xvY2FsZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMuY29tcGxldGUoKTtcclxuICB9XHJcblxyXG4gIC8qKiBAZG9jcy1wcml2YXRlICovXHJcbiAgcmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgdGhpcy5fdmFsaWRhdG9yT25DaGFuZ2UgPSBmbjtcclxuICB9XHJcblxyXG4gIC8qKiBAZG9jcy1wcml2YXRlICovXHJcbiAgdmFsaWRhdGUoYzogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRvciA/IHRoaXMuX3ZhbGlkYXRvcihjKSA6IG51bGw7XHJcbiAgfVxyXG5cclxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxyXG4gIHdyaXRlVmFsdWUodmFsdWU6IEQpOiB2b2lkIHtcclxuICAgIHRoaXMuX2Fzc2lnblZhbHVlUHJvZ3JhbW1hdGljYWxseSh2YWx1ZSk7XHJcbiAgfVxyXG5cclxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxyXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICh2YWx1ZTogYW55KSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICB0aGlzLl9jdmFPbkNoYW5nZSA9IGZuO1xyXG4gIH1cclxuXHJcbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cclxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgdGhpcy5fb25Ub3VjaGVkID0gZm47XHJcbiAgfVxyXG5cclxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxyXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XHJcbiAgfVxyXG5cclxuICBfb25LZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XHJcbiAgICBjb25zdCBjdHJsU2hpZnRNZXRhTW9kaWZpZXJzOiBMaXN0S2V5TWFuYWdlck1vZGlmaWVyS2V5W10gPSBbJ2N0cmxLZXknLCAnc2hpZnRLZXknLCAnbWV0YUtleSddO1xyXG4gICAgY29uc3QgaXNBbHREb3duQXJyb3cgPVxyXG4gICAgICBoYXNNb2RpZmllcktleShldmVudCwgJ2FsdEtleScpICYmXHJcbiAgICAgIGV2ZW50LmtleUNvZGUgPT09IERPV05fQVJST1cgJiZcclxuICAgICAgY3RybFNoaWZ0TWV0YU1vZGlmaWVycy5ldmVyeShcclxuICAgICAgICAobW9kaWZpZXI6IExpc3RLZXlNYW5hZ2VyTW9kaWZpZXJLZXkpID0+ICFoYXNNb2RpZmllcktleShldmVudCwgbW9kaWZpZXIpLFxyXG4gICAgICApO1xyXG5cclxuICAgIGlmIChpc0FsdERvd25BcnJvdyAmJiAhdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnJlYWRPbmx5KSB7XHJcbiAgICAgIHRoaXMuX29wZW5Qb3B1cCgpO1xyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX29uSW5wdXQodmFsdWU6IHN0cmluZykge1xyXG4gICAgY29uc3QgbGFzdFZhbHVlV2FzVmFsaWQgPSB0aGlzLl9sYXN0VmFsdWVWYWxpZDtcclxuICAgIGxldCBkYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIucGFyc2UodmFsdWUsIHRoaXMuX2RhdGVGb3JtYXRzLnBhcnNlLmRhdGVJbnB1dCk7XHJcbiAgICB0aGlzLl9sYXN0VmFsdWVWYWxpZCA9IHRoaXMuX2lzVmFsaWRWYWx1ZShkYXRlKTtcclxuICAgIGRhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwoZGF0ZSk7XHJcblxyXG4gICAgY29uc3QgaXNTYW1lVGltZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmlzU2FtZVRpbWUoZGF0ZSwgdGhpcy52YWx1ZSk7XHJcbiAgICBjb25zdCBpc1NhbWVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuc2FtZURhdGUoZGF0ZSwgdGhpcy52YWx1ZSk7XHJcbiAgICBjb25zdCBpc1NhbWUgPSBpc1NhbWVEYXRlICYmIGlzU2FtZVRpbWU7XHJcblxyXG4gICAgY29uc3QgaGFzQ2hhbmdlZCA9ICFpc1NhbWU7XHJcblxyXG4gICAgLy8gV2UgbmVlZCB0byBmaXJlIHRoZSBDVkEgY2hhbmdlIGV2ZW50IGZvciBhbGxcclxuICAgIC8vIG51bGxzLCBvdGhlcndpc2UgdGhlIHZhbGlkYXRvcnMgd29uJ3QgcnVuLlxyXG4gICAgaWYgKCFkYXRlIHx8IGhhc0NoYW5nZWQpIHtcclxuICAgICAgdGhpcy5fY3ZhT25DaGFuZ2UoZGF0ZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBDYWxsIHRoZSBDVkEgY2hhbmdlIGhhbmRsZXIgZm9yIGludmFsaWQgdmFsdWVzXHJcbiAgICAgIC8vIHNpbmNlIHRoaXMgaXMgd2hhdCBtYXJrcyB0aGUgY29udHJvbCBhcyBkaXJ0eS5cclxuICAgICAgaWYgKHZhbHVlICYmICF0aGlzLnZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fY3ZhT25DaGFuZ2UoZGF0ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChsYXN0VmFsdWVXYXNWYWxpZCAhPT0gdGhpcy5fbGFzdFZhbHVlVmFsaWQpIHtcclxuICAgICAgICB0aGlzLl92YWxpZGF0b3JPbkNoYW5nZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGhhc0NoYW5nZWQpIHtcclxuICAgICAgdGhpcy5fYXNzaWduVmFsdWUoZGF0ZSk7XHJcbiAgICAgIHRoaXMuZGF0ZUlucHV0LmVtaXQobmV3IE5neE1hdERhdGVwaWNrZXJJbnB1dEV2ZW50KHRoaXMsIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX29uQ2hhbmdlKCkge1xyXG4gICAgdGhpcy5kYXRlQ2hhbmdlLmVtaXQobmV3IE5neE1hdERhdGVwaWNrZXJJbnB1dEV2ZW50KHRoaXMsIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkpO1xyXG4gIH1cclxuXHJcbiAgLyoqIEhhbmRsZXMgYmx1ciBldmVudHMgb24gdGhlIGlucHV0LiAqL1xyXG4gIF9vbkJsdXIoKSB7XHJcbiAgICAvLyBSZWZvcm1hdCB0aGUgaW5wdXQgb25seSBpZiB3ZSBoYXZlIGEgdmFsaWQgdmFsdWUuXHJcbiAgICBpZiAodGhpcy52YWx1ZSkge1xyXG4gICAgICB0aGlzLl9mb3JtYXRWYWx1ZSh0aGlzLnZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9vblRvdWNoZWQoKTtcclxuICB9XHJcblxyXG4gIC8qKiBGb3JtYXRzIGEgdmFsdWUgYW5kIHNldHMgaXQgb24gdGhlIGlucHV0IGVsZW1lbnQuICovXHJcbiAgcHJvdGVjdGVkIF9mb3JtYXRWYWx1ZSh2YWx1ZTogRCB8IG51bGwpIHtcclxuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC52YWx1ZSA9XHJcbiAgICAgIHZhbHVlICE9IG51bGwgPyB0aGlzLl9kYXRlQWRhcHRlci5mb3JtYXQodmFsdWUsIHRoaXMuX2RhdGVGb3JtYXRzLmRpc3BsYXkuZGF0ZUlucHV0KSA6ICcnO1xyXG4gIH1cclxuXHJcbiAgLyoqIEFzc2lnbnMgYSB2YWx1ZSB0byB0aGUgbW9kZWwuICovXHJcbiAgcHJpdmF0ZSBfYXNzaWduVmFsdWUodmFsdWU6IEQgfCBudWxsKSB7XHJcbiAgICAvLyBXZSBtYXkgZ2V0IHNvbWUgaW5jb21pbmcgdmFsdWVzIGJlZm9yZSB0aGUgbW9kZWwgd2FzXHJcbiAgICAvLyBhc3NpZ25lZC4gU2F2ZSB0aGUgdmFsdWUgc28gdGhhdCB3ZSBjYW4gYXNzaWduIGl0IGxhdGVyLlxyXG4gICAgaWYgKHRoaXMuX21vZGVsKSB7XHJcbiAgICAgIHRoaXMuX2Fzc2lnblZhbHVlVG9Nb2RlbCh2YWx1ZSk7XHJcbiAgICAgIHRoaXMuX3BlbmRpbmdWYWx1ZSA9IG51bGw7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBXaGV0aGVyIGEgdmFsdWUgaXMgY29uc2lkZXJlZCB2YWxpZC4gKi9cclxuICBwcml2YXRlIF9pc1ZhbGlkVmFsdWUodmFsdWU6IEQgfCBudWxsKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gIXZhbHVlIHx8IHRoaXMuX2RhdGVBZGFwdGVyLmlzVmFsaWQodmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHdoZXRoZXIgYSBwYXJlbnQgY29udHJvbCBpcyBkaXNhYmxlZC4gVGhpcyBpcyBpbiBwbGFjZSBzbyB0aGF0IGl0IGNhbiBiZSBvdmVycmlkZGVuXHJcbiAgICogYnkgaW5wdXRzIGV4dGVuZGluZyB0aGlzIG9uZSB3aGljaCBjYW4gYmUgcGxhY2VkIGluc2lkZSBvZiBhIGdyb3VwIHRoYXQgY2FuIGJlIGRpc2FibGVkLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBfcGFyZW50RGlzYWJsZWQoKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKiogUHJvZ3JhbW1hdGljYWxseSBhc3NpZ25zIGEgdmFsdWUgdG8gdGhlIGlucHV0LiAqL1xyXG4gIHByb3RlY3RlZCBfYXNzaWduVmFsdWVQcm9ncmFtbWF0aWNhbGx5KHZhbHVlOiBEIHwgbnVsbCkge1xyXG4gICAgdmFsdWUgPSB0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSk7XHJcbiAgICB0aGlzLl9sYXN0VmFsdWVWYWxpZCA9IHRoaXMuX2lzVmFsaWRWYWx1ZSh2YWx1ZSk7XHJcbiAgICB2YWx1ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh2YWx1ZSk7XHJcbiAgICB0aGlzLl9hc3NpZ25WYWx1ZSh2YWx1ZSk7XHJcbiAgICB0aGlzLl9mb3JtYXRWYWx1ZSh2YWx1ZSk7XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyB3aGV0aGVyIGEgdmFsdWUgbWF0Y2hlcyB0aGUgY3VycmVudCBkYXRlIGZpbHRlci4gKi9cclxuICBfbWF0Y2hlc0ZpbHRlcih2YWx1ZTogRCB8IG51bGwpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGZpbHRlciA9IHRoaXMuX2dldERhdGVGaWx0ZXIoKTtcclxuICAgIHJldHVybiAhZmlsdGVyIHx8IGZpbHRlcih2YWx1ZSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGBTaW1wbGVDaGFuZ2VzYCBvYmplY3QgZnJvbSBhbiBgbmdPbkNoYW5nZXNgXHJcbiAqIGNhbGxiYWNrIGhhcyBhbnkgY2hhbmdlcywgYWNjb3VudGluZyBmb3IgZGF0ZSBvYmplY3RzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRhdGVJbnB1dHNIYXZlQ2hhbmdlZChcclxuICBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLFxyXG4gIGFkYXB0ZXI6IE5neE1hdERhdGVBZGFwdGVyPHVua25vd24+LFxyXG4pOiBib29sZWFuIHtcclxuICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoY2hhbmdlcyk7XHJcblxyXG4gIGZvciAobGV0IGtleSBvZiBrZXlzKSB7XHJcbiAgICBjb25zdCB7IHByZXZpb3VzVmFsdWUsIGN1cnJlbnRWYWx1ZSB9ID0gY2hhbmdlc1trZXldO1xyXG5cclxuICAgIGlmIChhZGFwdGVyLmlzRGF0ZUluc3RhbmNlKHByZXZpb3VzVmFsdWUpICYmIGFkYXB0ZXIuaXNEYXRlSW5zdGFuY2UoY3VycmVudFZhbHVlKSkge1xyXG4gICAgICBpZiAoIWFkYXB0ZXIuc2FtZURhdGUocHJldmlvdXNWYWx1ZSwgY3VycmVudFZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG4iXX0=