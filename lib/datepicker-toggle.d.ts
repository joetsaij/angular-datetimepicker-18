import { BooleanInput } from '@angular/cdk/coercion';
import { AfterContentInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { NgxMatDatepickerControl, NgxMatDatepickerPanel } from './datepicker-base';
import { NgxMatDatepickerIntl } from './datepicker-intl';
import * as i0 from "@angular/core";
/** Can be used to override the icon of a `matDatepickerToggle`. */
export declare class NgxMatDatepickerToggleIcon {
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxMatDatepickerToggleIcon, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgxMatDatepickerToggleIcon, "[ngxMatDatepickerToggleIcon]", never, {}, {}, never, never, true, never>;
}
export declare class NgxMatDatepickerToggle<D> implements AfterContentInit, OnDestroy {
    _intl: NgxMatDatepickerIntl;
    private _changeDetectorRef;
    private _stateChanges;
    /** Datepicker instance that the button will toggle. */
    readonly datepicker: import("@angular/core").InputSignal<NgxMatDatepickerPanel<NgxMatDatepickerControl<any>, D, import("./date-selection-model").NgxExtractDateTypeFromSelection<D>>>;
    /** Tabindex for the toggle. */
    tabIndex: number | null;
    /** Screen-reader label for the button. */
    readonly ariaLabel: import("@angular/core").InputSignal<string>;
    /** Whether the toggle button is disabled. */
    get disabled(): boolean;
    set disabled(value: BooleanInput);
    private _disabled;
    /** Whether ripples on the toggle should be disabled. */
    disableRipple: import("@angular/core").InputSignal<boolean>;
    /** Underlying button element. */
    _button: import("@angular/core").Signal<MatButton>;
    constructor(_intl: NgxMatDatepickerIntl, _changeDetectorRef: ChangeDetectorRef, defaultTabIndex: string);
    ngOnDestroy(): void;
    ngAfterContentInit(): void;
    _open(event: Event): void;
    private _watchStateChanges;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxMatDatepickerToggle<any>, [null, null, { attribute: "tabindex"; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NgxMatDatepickerToggle<any>, "ngx-mat-datepicker-toggle", ["ngxMatDatepickerToggle"], { "datepicker": { "alias": "for"; "required": false; "isSignal": true; }; "tabIndex": { "alias": "tabIndex"; "required": false; }; "ariaLabel": { "alias": "aria-label"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; }; "disableRipple": { "alias": "disableRipple"; "required": false; "isSignal": true; }; }, {}, never, ["[ngxMatDatepickerToggleIcon]"], true, never>;
}
