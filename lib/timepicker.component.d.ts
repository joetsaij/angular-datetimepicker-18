import { ChangeDetectorRef, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { NgxMatDateAdapter } from './core/date-adapter';
import * as i0 from "@angular/core";
export declare class NgxMatTimepickerComponent<D> implements ControlValueAccessor, OnInit, OnChanges {
    _dateAdapter: NgxMatDateAdapter<D>;
    private cd;
    private formBuilder;
    form: FormGroup;
    readonly disabled: import("@angular/core").InputSignal<boolean>;
    readonly showSpinners: import("@angular/core").InputSignal<boolean>;
    readonly stepHour: import("@angular/core").InputSignal<number>;
    readonly stepMinute: import("@angular/core").InputSignal<number>;
    readonly stepSecond: import("@angular/core").InputSignal<number>;
    readonly showSeconds: import("@angular/core").InputSignal<boolean>;
    readonly disableMinute: import("@angular/core").InputSignal<boolean>;
    readonly enableMeridian: import("@angular/core").InputSignal<boolean>;
    readonly defaultTime: import("@angular/core").InputSignal<number[]>;
    readonly color: import("@angular/core").InputSignal<ThemePalette>;
    meridian: string;
    /** Hour */
    private get hour();
    private get minute();
    private get second();
    /** Whether or not the form is valid */
    get valid(): boolean;
    private _onChange;
    private _onTouched;
    private _disabled;
    private _model;
    private _destroyed;
    pattern: RegExp;
    constructor(_dateAdapter: NgxMatDateAdapter<D>, cd: ChangeDetectorRef, formBuilder: FormBuilder);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    /**
     * Writes a new value to the element.
     * @param obj
     */
    writeValue(val: D): void;
    /** Registers a callback function that is called when the control's value changes in the UI. */
    registerOnChange(fn: (_: any) => {}): void;
    /**
     * Set the function to be called when the control receives a touch event.
     */
    registerOnTouched(fn: () => {}): void;
    /** Enables or disables the appropriate DOM element */
    setDisabledState(isDisabled: boolean): void;
    /**
     * Format input
     * @param input
     */
    formatInput(input: HTMLInputElement): void;
    /** Toggle meridian */
    toggleMeridian(): void;
    /** Change property of time */
    change(prop: 'hour' | 'minute' | 'second', up?: boolean): void;
    /** Update controls of form by model */
    private _updateHourMinuteSecond;
    /** Update model */
    private _updateModel;
    /**
     * Get next value by property
     * @param prop
     * @param up
     */
    private _getNextValueByProp;
    /**
     * Set disable states
     */
    private _setDisableStates;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxMatTimepickerComponent<any>, [{ optional: true; }, null, null]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NgxMatTimepickerComponent<any>, "ngx-mat-timepicker", ["ngxMatTimepicker"], { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "showSpinners": { "alias": "showSpinners"; "required": false; "isSignal": true; }; "stepHour": { "alias": "stepHour"; "required": false; "isSignal": true; }; "stepMinute": { "alias": "stepMinute"; "required": false; "isSignal": true; }; "stepSecond": { "alias": "stepSecond"; "required": false; "isSignal": true; }; "showSeconds": { "alias": "showSeconds"; "required": false; "isSignal": true; }; "disableMinute": { "alias": "disableMinute"; "required": false; "isSignal": true; }; "enableMeridian": { "alias": "enableMeridian"; "required": false; "isSignal": true; }; "defaultTime": { "alias": "defaultTime"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
