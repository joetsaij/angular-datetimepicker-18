import { CdkTrapFocus } from '@angular/cdk/a11y';
import { coerceBooleanProperty, coerceStringArray } from '@angular/cdk/coercion';
import { DOWN_ARROW, ESCAPE, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, UP_ARROW, hasModifierKey, } from '@angular/cdk/keycodes';
import { FlexibleConnectedPositionStrategy, Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { CdkPortalOutlet, ComponentPortal, } from '@angular/cdk/portal';
import { DOCUMENT, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, EventEmitter, Inject, InjectionToken, Input, Optional, Output, ViewEncapsulation, effect, inject, input, output, viewChild, } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { mixinColor } from '@angular/material/core';
import { Subject, Subscription, merge } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { NgxMatCalendar } from './calendar';
import { NGX_MAT_DATE_RANGE_SELECTION_STRATEGY, } from './date-range-selection-strategy';
import { NgxDateRange, } from './date-selection-model';
import { ngxMatDatepickerAnimations } from './datepicker-animations';
import { createMissingDateImplError } from './datepicker-errors';
import { NgxMatTimepickerComponent } from './timepicker.component';
import { DEFAULT_STEP } from './utils/date-utils';
import * as i0 from "@angular/core";
import * as i1 from "./date-selection-model";
import * as i2 from "./core/date-adapter";
import * as i3 from "./datepicker-intl";
import * as i4 from "@angular/forms";
import * as i5 from "@angular/cdk/overlay";
import * as i6 from "@angular/cdk/bidi";
/** Used to generate a unique ID for each datepicker instance. */
let datepickerUid = 0;
/** Injection token that determines the scroll handling while the calendar is open. */
export const NGX_MAT_DATEPICKER_SCROLL_STRATEGY = new InjectionToken('ngx-mat-datepicker-scroll-strategy');
/** @docs-private */
export function NGX_MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay) {
    return () => overlay.scrollStrategies.reposition();
}
/** @docs-private */
export const NGX_MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: NGX_MAT_DATEPICKER_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: NGX_MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY,
};
// Boilerplate for applying mixins to MatDatepickerContent.
/** @docs-private */
const _NgxMatDatepickerContentBase = mixinColor(class {
    constructor(_elementRef) {
        this._elementRef = _elementRef;
    }
});
/**
 * Component used as the content for the datepicker overlay. We use this instead of using
 * MatCalendar directly as the content so we can control the initial focus. This also gives us a
 * place to put additional features of the overlay that are not part of the calendar itself in the
 * future. (e.g. confirmation buttons).
 * @docs-private
 */
export class NgxMatDatepickerContent extends _NgxMatDatepickerContentBase {
    get isViewMonth() {
        if (!this._calendar() || this._calendar().currentView == null)
            return true;
        return this._calendar().currentView == 'month';
    }
    constructor(elementRef, _changeDetectorRef, _globalModel, _dateAdapter, _rangeSelectionStrategy, intl) {
        super(elementRef);
        this._changeDetectorRef = _changeDetectorRef;
        this._globalModel = _globalModel;
        this._dateAdapter = _dateAdapter;
        this._rangeSelectionStrategy = _rangeSelectionStrategy;
        this._subscriptions = new Subscription();
        /** Reference to the internal calendar component. */
        this._calendar = viewChild.required(NgxMatCalendar);
        /** Emits when an animation has finished. */
        this._animationDone = new Subject();
        /** Whether there is an in-progress animation. */
        this._isAnimating = false;
        /** Portal with projected action buttons. */
        this._actionsPortal = null;
        this._closeButtonText = intl.closeCalendarLabel;
        effect(() => {
            const calendar = this._calendar();
            if (calendar) {
                calendar.focusActiveCell();
            }
        });
    }
    ngOnInit() {
        this._animationState = this.datepicker.touchUi ? 'enter-dialog' : 'enter-dropdown';
    }
    ngAfterViewInit() {
        this._subscriptions.add(this.datepicker.stateChanges.subscribe(() => {
            this._changeDetectorRef.markForCheck();
        }));
    }
    ngOnDestroy() {
        this._subscriptions.unsubscribe();
        this._animationDone.complete();
    }
    onTimeChanged(selectedDateWithTime) {
        const userEvent = {
            value: selectedDateWithTime,
            event: null,
        };
        this._updateUserSelectionWithCalendarUserEvent(userEvent);
    }
    _handleUserSelection(event) {
        this._updateUserSelectionWithCalendarUserEvent(event);
        // Delegate closing the overlay to the actions.
        if (this.datepicker.hideTime) {
            if ((!this._model || this._model.isComplete()) && !this._actionsPortal) {
                this.datepicker.close();
            }
        }
    }
    _updateUserSelectionWithCalendarUserEvent(event) {
        const selection = this._model.selection;
        const value = event.value;
        const isRange = selection instanceof NgxDateRange;
        // If we're selecting a range and we have a selection strategy, always pass the value through
        // there. Otherwise don't assign null values to the model, unless we're selecting a range.
        // A null value when picking a range means that the user cancelled the selection (e.g. by
        // pressing escape), whereas when selecting a single value it means that the value didn't
        // change. This isn't very intuitive, but it's here for backwards-compatibility.
        if (isRange && this._rangeSelectionStrategy) {
            const newSelection = this._rangeSelectionStrategy.selectionFinished(value, selection, event.event);
            this._model.updateSelection(newSelection, this);
        }
        else {
            const isSameTime = this._dateAdapter.isSameTime(selection, value);
            const isSameDate = this._dateAdapter.sameDate(value, selection);
            const isSame = isSameDate && isSameTime;
            if (value && (isRange || !isSame)) {
                this._model.add(value);
            }
        }
    }
    _handleUserDragDrop(event) {
        this._model.updateSelection(event.value, this);
    }
    _startExitAnimation() {
        this._animationState = 'void';
        this._changeDetectorRef.markForCheck();
    }
    _handleAnimationEvent(event) {
        this._isAnimating = event.phaseName === 'start';
        if (!this._isAnimating) {
            this._animationDone.next();
        }
    }
    _getSelected() {
        this._modelTime = this._model.selection;
        return this._model.selection;
    }
    /** Applies the current pending selection to the global model. */
    _applyPendingSelection() {
        if (this._model !== this._globalModel) {
            this._globalModel.updateSelection(this._model.selection, this);
        }
    }
    /**
     * Assigns a new portal containing the datepicker actions.
     * @param portal Portal with the actions to be assigned.
     * @param forceRerender Whether a re-render of the portal should be triggered. This isn't
     * necessary if the portal is assigned during initialization, but it may be required if it's
     * added at a later point.
     */
    _assignActions(portal, forceRerender) {
        // If we have actions, clone the model so that we have the ability to cancel the selection,
        // otherwise update the global model directly. Note that we want to assign this as soon as
        // possible, but `_actionsPortal` isn't available in the constructor so we do it in `ngOnInit`.
        this._model = portal ? this._globalModel.clone() : this._globalModel;
        this._actionsPortal = portal;
        if (forceRerender) {
            this._changeDetectorRef.detectChanges();
        }
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerContent, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i1.NgxMatDateSelectionModel }, { token: i2.NgxMatDateAdapter }, { token: NGX_MAT_DATE_RANGE_SELECTION_STRATEGY, optional: true }, { token: i3.NgxMatDatepickerIntl }], target: i0.ɵɵFactoryTarget.Component }); }
    /** @nocollapse */ static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.3", type: NgxMatDatepickerContent, isStandalone: true, selector: "ngx-mat-datepicker-content", inputs: { color: "color" }, host: { listeners: { "@transformPanel.start": "_handleAnimationEvent($event)", "@transformPanel.done": "_handleAnimationEvent($event)" }, properties: { "@transformPanel": "_animationState", "class.mat-datepicker-content-touch": "datepicker.touchUi", "class.mat-datepicker-content-touch-with-time": "!datepicker.hideTime" }, classAttribute: "mat-datepicker-content" }, viewQueries: [{ propertyName: "_calendar", first: true, predicate: NgxMatCalendar, descendants: true, isSignal: true }], exportAs: ["ngxMatDatepickerContent"], usesInheritance: true, ngImport: i0, template: "<div\r\n  cdkTrapFocus\r\n  role=\"dialog\"\r\n  [attr.aria-modal]=\"true\"\r\n  [attr.aria-labelledby]=\"_dialogLabelId ?? undefined\"\r\n  class=\"mat-datepicker-content-container\"\r\n  [class.mat-datepicker-content-container-with-custom-header]=\"\r\n    datepicker.calendarHeaderComponent()\r\n  \"\r\n  [class.mat-datepicker-content-container-with-actions]=\"_actionsPortal\"\r\n  [class.mat-datepicker-content-container-with-time]=\"!datepicker._hideTime\"\r\n>\r\n  <ngx-mat-calendar\r\n    [id]=\"datepicker.id\"\r\n    [ngClass]=\"datepicker.panelClass\"\r\n    [startAt]=\"datepicker.startAt\"\r\n    [startView]=\"datepicker.startView()\"\r\n    [minDate]=\"datepicker._getMinDate()\"\r\n    [maxDate]=\"datepicker._getMaxDate()\"\r\n    [dateFilter]=\"datepicker._getDateFilter()\"\r\n    [headerComponent]=\"datepicker.calendarHeaderComponent()\"\r\n    [selected]=\"_getSelected()\"\r\n    [dateClass]=\"datepicker.dateClass()\"\r\n    [comparisonStart]=\"comparisonStart\"\r\n    [comparisonEnd]=\"comparisonEnd\"\r\n    [@fadeInCalendar]=\"'enter'\"\r\n    [startDateAccessibleName]=\"startDateAccessibleName\"\r\n    [endDateAccessibleName]=\"endDateAccessibleName\"\r\n    (yearSelected)=\"datepicker._selectYear($event)\"\r\n    (monthSelected)=\"datepicker._selectMonth($event)\"\r\n    (viewChanged)=\"datepicker._viewChanged($event)\"\r\n    (_userSelection)=\"_handleUserSelection($event)\"\r\n    (_userDragDrop)=\"_handleUserDragDrop($event)\"\r\n  />\r\n\r\n  @if (isViewMonth) {\r\n    @if (!datepicker._hideTime) {\r\n      <div\r\n        class=\"time-container\"\r\n        [class.disable-seconds]=\"!datepicker._showSeconds\"\r\n      >\r\n        <ngx-mat-timepicker\r\n          [showSpinners]=\"datepicker._showSpinners\"\r\n          [showSeconds]=\"datepicker._showSeconds\"\r\n          [disabled]=\"datepicker._disabled || !_modelTime\"\r\n          [stepHour]=\"datepicker._stepHour\"\r\n          [stepMinute]=\"datepicker._stepMinute\"\r\n          [stepSecond]=\"datepicker._stepSecond\"\r\n          [(ngModel)]=\"_modelTime\"\r\n          [color]=\"datepicker._color\"\r\n          [enableMeridian]=\"datepicker._enableMeridian\"\r\n          [disableMinute]=\"datepicker._disableMinute\"\r\n          (ngModelChange)=\"onTimeChanged($event)\"\r\n        />\r\n      </div>\r\n    }\r\n  }\r\n\r\n  <ng-template [cdkPortalOutlet]=\"_actionsPortal\" />\r\n\r\n  <!-- Invisible close button for screen reader users. -->\r\n  <button\r\n    type=\"button\"\r\n    mat-raised-button\r\n    [color]=\"color || 'primary'\"\r\n    class=\"mat-datepicker-close-button\"\r\n    [class.cdk-visually-hidden]=\"!_closeButtonFocused\"\r\n    (focus)=\"_closeButtonFocused = true\"\r\n    (blur)=\"_closeButtonFocused = false\"\r\n    (click)=\"datepicker.close()\"\r\n  >\r\n    {{ _closeButtonText }}\r\n  </button>\r\n</div>\r\n", styles: [".mat-datepicker-content{display:block;border-radius:4px;background-color:var(--mat-datepicker-calendar-container-background-color);color:var(--mat-datepicker-calendar-container-text-color);box-shadow:var(--mat-datepicker-calendar-container-elevation-shadow);border-radius:var(--mat-datepicker-calendar-container-shape)}.mat-datepicker-content .mat-calendar{font-family:var(--mat-datepicker-calendar-text-font);font-size:var(--mat-datepicker-calendar-text-size);width:296px;height:354px}.mat-datepicker-content .mat-datepicker-content-container-with-custom-header .mat-calendar{height:auto}.mat-datepicker-content .mat-datepicker-close-button{position:absolute;top:100%;left:0;margin-top:8px}.ng-animating .mat-datepicker-content .mat-datepicker-close-button{display:none}.mat-datepicker-content-container{display:flex;flex-direction:column;justify-content:space-between}.time-container{display:flex;position:relative;padding-top:5px;justify-content:center}.time-container.disable-seconds .ngx-mat-timepicker .table{margin-left:9px}.time-container:before{content:\"\";position:absolute;top:0;left:0;right:0;height:1px;background-color:#0000001f}.mat-datepicker-content-touch{display:block;max-height:90vh;position:relative;overflow:visible}.mat-datepicker-content-touch .mat-datepicker-content-container{min-height:312px;max-height:815px;min-width:250px;max-width:750px}.mat-datepicker-content-touch .mat-calendar{width:100%;height:auto}@media all and (orientation: landscape){.mat-datepicker-content-touch .mat-datepicker-content-container{width:64vh;height:90vh}.mat-datepicker-content-touch .mat-datepicker-content-container.mat-datepicker-content-container-with-time{height:auto;max-height:none}}@media all and (orientation: portrait){.mat-datepicker-content-touch{max-height:100vh}.mat-datepicker-content-touch .mat-datepicker-content-container{width:80vw;height:100vw}.mat-datepicker-content-touch .mat-datepicker-content-container.mat-datepicker-content-container-with-time{height:auto;max-height:870px}.mat-datepicker-content-touch .mat-datepicker-content-container.mat-datepicker-content-container-with-time.mat-datepicker-content-container-with-actions{max-height:none!important}.mat-datepicker-content-touch .mat-datepicker-content-container-with-actions{height:115vw}}\n"], dependencies: [{ kind: "directive", type: CdkTrapFocus, selector: "[cdkTrapFocus]", inputs: ["cdkTrapFocus", "cdkTrapFocusAutoCapture"], exportAs: ["cdkTrapFocus"] }, { kind: "component", type: NgxMatCalendar, selector: "ngx-mat-calendar", inputs: ["headerComponent", "startAt", "startView", "selected", "minDate", "maxDate", "dateFilter", "dateClass", "comparisonStart", "comparisonEnd", "startDateAccessibleName", "endDateAccessibleName"], outputs: ["selectedChange", "yearSelected", "monthSelected", "viewChanged", "_userSelection", "_userDragDrop"], exportAs: ["ngxMatCalendar"] }, { kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "component", type: NgxMatTimepickerComponent, selector: "ngx-mat-timepicker", inputs: ["disabled", "showSpinners", "stepHour", "stepMinute", "stepSecond", "showSeconds", "disableMinute", "enableMeridian", "defaultTime", "color"], exportAs: ["ngxMatTimepicker"] }, { kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }, { kind: "component", type: MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }], animations: [
            ngxMatDatepickerAnimations.transformPanel,
            ngxMatDatepickerAnimations.fadeInCalendar,
        ], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerContent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-mat-datepicker-content', host: {
                        class: 'mat-datepicker-content',
                        '[@transformPanel]': '_animationState',
                        '(@transformPanel.start)': '_handleAnimationEvent($event)',
                        '(@transformPanel.done)': '_handleAnimationEvent($event)',
                        '[class.mat-datepicker-content-touch]': 'datepicker.touchUi',
                        '[class.mat-datepicker-content-touch-with-time]': '!datepicker.hideTime',
                    }, animations: [
                        ngxMatDatepickerAnimations.transformPanel,
                        ngxMatDatepickerAnimations.fadeInCalendar,
                    ], exportAs: 'ngxMatDatepickerContent', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, inputs: ['color'], standalone: true, imports: [
                        CdkTrapFocus,
                        NgxMatCalendar,
                        NgClass,
                        NgxMatTimepickerComponent,
                        ReactiveFormsModule,
                        FormsModule,
                        CdkPortalOutlet,
                        MatButton,
                    ], template: "<div\r\n  cdkTrapFocus\r\n  role=\"dialog\"\r\n  [attr.aria-modal]=\"true\"\r\n  [attr.aria-labelledby]=\"_dialogLabelId ?? undefined\"\r\n  class=\"mat-datepicker-content-container\"\r\n  [class.mat-datepicker-content-container-with-custom-header]=\"\r\n    datepicker.calendarHeaderComponent()\r\n  \"\r\n  [class.mat-datepicker-content-container-with-actions]=\"_actionsPortal\"\r\n  [class.mat-datepicker-content-container-with-time]=\"!datepicker._hideTime\"\r\n>\r\n  <ngx-mat-calendar\r\n    [id]=\"datepicker.id\"\r\n    [ngClass]=\"datepicker.panelClass\"\r\n    [startAt]=\"datepicker.startAt\"\r\n    [startView]=\"datepicker.startView()\"\r\n    [minDate]=\"datepicker._getMinDate()\"\r\n    [maxDate]=\"datepicker._getMaxDate()\"\r\n    [dateFilter]=\"datepicker._getDateFilter()\"\r\n    [headerComponent]=\"datepicker.calendarHeaderComponent()\"\r\n    [selected]=\"_getSelected()\"\r\n    [dateClass]=\"datepicker.dateClass()\"\r\n    [comparisonStart]=\"comparisonStart\"\r\n    [comparisonEnd]=\"comparisonEnd\"\r\n    [@fadeInCalendar]=\"'enter'\"\r\n    [startDateAccessibleName]=\"startDateAccessibleName\"\r\n    [endDateAccessibleName]=\"endDateAccessibleName\"\r\n    (yearSelected)=\"datepicker._selectYear($event)\"\r\n    (monthSelected)=\"datepicker._selectMonth($event)\"\r\n    (viewChanged)=\"datepicker._viewChanged($event)\"\r\n    (_userSelection)=\"_handleUserSelection($event)\"\r\n    (_userDragDrop)=\"_handleUserDragDrop($event)\"\r\n  />\r\n\r\n  @if (isViewMonth) {\r\n    @if (!datepicker._hideTime) {\r\n      <div\r\n        class=\"time-container\"\r\n        [class.disable-seconds]=\"!datepicker._showSeconds\"\r\n      >\r\n        <ngx-mat-timepicker\r\n          [showSpinners]=\"datepicker._showSpinners\"\r\n          [showSeconds]=\"datepicker._showSeconds\"\r\n          [disabled]=\"datepicker._disabled || !_modelTime\"\r\n          [stepHour]=\"datepicker._stepHour\"\r\n          [stepMinute]=\"datepicker._stepMinute\"\r\n          [stepSecond]=\"datepicker._stepSecond\"\r\n          [(ngModel)]=\"_modelTime\"\r\n          [color]=\"datepicker._color\"\r\n          [enableMeridian]=\"datepicker._enableMeridian\"\r\n          [disableMinute]=\"datepicker._disableMinute\"\r\n          (ngModelChange)=\"onTimeChanged($event)\"\r\n        />\r\n      </div>\r\n    }\r\n  }\r\n\r\n  <ng-template [cdkPortalOutlet]=\"_actionsPortal\" />\r\n\r\n  <!-- Invisible close button for screen reader users. -->\r\n  <button\r\n    type=\"button\"\r\n    mat-raised-button\r\n    [color]=\"color || 'primary'\"\r\n    class=\"mat-datepicker-close-button\"\r\n    [class.cdk-visually-hidden]=\"!_closeButtonFocused\"\r\n    (focus)=\"_closeButtonFocused = true\"\r\n    (blur)=\"_closeButtonFocused = false\"\r\n    (click)=\"datepicker.close()\"\r\n  >\r\n    {{ _closeButtonText }}\r\n  </button>\r\n</div>\r\n", styles: [".mat-datepicker-content{display:block;border-radius:4px;background-color:var(--mat-datepicker-calendar-container-background-color);color:var(--mat-datepicker-calendar-container-text-color);box-shadow:var(--mat-datepicker-calendar-container-elevation-shadow);border-radius:var(--mat-datepicker-calendar-container-shape)}.mat-datepicker-content .mat-calendar{font-family:var(--mat-datepicker-calendar-text-font);font-size:var(--mat-datepicker-calendar-text-size);width:296px;height:354px}.mat-datepicker-content .mat-datepicker-content-container-with-custom-header .mat-calendar{height:auto}.mat-datepicker-content .mat-datepicker-close-button{position:absolute;top:100%;left:0;margin-top:8px}.ng-animating .mat-datepicker-content .mat-datepicker-close-button{display:none}.mat-datepicker-content-container{display:flex;flex-direction:column;justify-content:space-between}.time-container{display:flex;position:relative;padding-top:5px;justify-content:center}.time-container.disable-seconds .ngx-mat-timepicker .table{margin-left:9px}.time-container:before{content:\"\";position:absolute;top:0;left:0;right:0;height:1px;background-color:#0000001f}.mat-datepicker-content-touch{display:block;max-height:90vh;position:relative;overflow:visible}.mat-datepicker-content-touch .mat-datepicker-content-container{min-height:312px;max-height:815px;min-width:250px;max-width:750px}.mat-datepicker-content-touch .mat-calendar{width:100%;height:auto}@media all and (orientation: landscape){.mat-datepicker-content-touch .mat-datepicker-content-container{width:64vh;height:90vh}.mat-datepicker-content-touch .mat-datepicker-content-container.mat-datepicker-content-container-with-time{height:auto;max-height:none}}@media all and (orientation: portrait){.mat-datepicker-content-touch{max-height:100vh}.mat-datepicker-content-touch .mat-datepicker-content-container{width:80vw;height:100vw}.mat-datepicker-content-touch .mat-datepicker-content-container.mat-datepicker-content-container-with-time{height:auto;max-height:870px}.mat-datepicker-content-touch .mat-datepicker-content-container.mat-datepicker-content-container-with-time.mat-datepicker-content-container-with-actions{max-height:none!important}.mat-datepicker-content-touch .mat-datepicker-content-container-with-actions{height:115vw}}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i1.NgxMatDateSelectionModel }, { type: i2.NgxMatDateAdapter }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NGX_MAT_DATE_RANGE_SELECTION_STRATEGY]
                }] }, { type: i3.NgxMatDatepickerIntl }] });
/** Base class for a datepicker. */
export class NgxMatDatepickerBase {
    /** The date to open the calendar to initially. */
    get startAt() {
        // If an explicit startAt is set we start there, otherwise we start at whatever the currently
        // selected value is.
        return this._startAt || (this.datepickerInput ? this.datepickerInput.getStartValue() : null);
    }
    set startAt(value) {
        this._startAt = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    /** Color palette to use on the datepicker's calendar. */
    get color() {
        return (this._color || (this.datepickerInput ? this.datepickerInput.getThemePalette() : undefined));
    }
    set color(value) {
        this._color = value;
    }
    /**
     * Whether the calendar UI is in touch mode. In touch mode the calendar opens in a dialog rather
     * than a dropdown and elements have more padding to allow for bigger touch targets.
     */
    get touchUi() {
        return this._touchUi;
    }
    set touchUi(value) {
        this._touchUi = coerceBooleanProperty(value);
    }
    get hideTime() {
        return this._hideTime;
    }
    set hideTime(value) {
        this._hideTime = coerceBooleanProperty(value);
    }
    /** Whether the datepicker pop-up should be disabled. */
    get disabled() {
        return this._disabled === undefined && this.datepickerInput
            ? this.datepickerInput.disabled
            : !!this._disabled;
    }
    set disabled(value) {
        const newValue = coerceBooleanProperty(value);
        if (newValue !== this._disabled) {
            this._disabled = newValue;
            this.stateChanges.next(undefined);
        }
    }
    /**
     * Whether to restore focus to the previously-focused element when the calendar is closed.
     * Note that automatic focus restoration is an accessibility feature and it is recommended that
     * you provide your own equivalent, if you decide to turn it off.
     */
    get restoreFocus() {
        return this._restoreFocus;
    }
    set restoreFocus(value) {
        this._restoreFocus = coerceBooleanProperty(value);
    }
    /**
     * Classes to be passed to the date picker panel.
     * Supports string and string array values, similar to `ngClass`.
     */
    get panelClass() {
        return this._panelClass;
    }
    set panelClass(value) {
        this._panelClass = coerceStringArray(value);
    }
    /** Whether the calendar is open. */
    get opened() {
        return this._opened;
    }
    set opened(value) {
        coerceBooleanProperty(value) ? this.open() : this.close();
    }
    /** Whether the timepicker'spinners is shown. */
    get showSpinners() {
        return this._showSpinners;
    }
    set showSpinners(value) {
        this._showSpinners = value;
    }
    /** Whether the second part is disabled. */
    get showSeconds() {
        return this._showSeconds;
    }
    set showSeconds(value) {
        this._showSeconds = value;
    }
    /** Step hour */
    get stepHour() {
        return this._stepHour;
    }
    set stepHour(value) {
        this._stepHour = value;
    }
    /** Step minute */
    get stepMinute() {
        return this._stepMinute;
    }
    set stepMinute(value) {
        this._stepMinute = value;
    }
    /** Step second */
    get stepSecond() {
        return this._stepSecond;
    }
    set stepSecond(value) {
        this._stepSecond = value;
    }
    /** Enable meridian */
    get enableMeridian() {
        return this._enableMeridian;
    }
    set enableMeridian(value) {
        this._enableMeridian = value;
    }
    /** disable minute */
    get disableMinute() {
        return this._disableMinute;
    }
    set disableMinute(value) {
        this._disableMinute = value;
    }
    /** Step second */
    get defaultTime() {
        return this._defaultTime;
    }
    set defaultTime(value) {
        this._defaultTime = value;
    }
    /** The minimum selectable date. */
    _getMinDate() {
        return this.datepickerInput && this.datepickerInput.min;
    }
    /** The maximum selectable date. */
    _getMaxDate() {
        return this.datepickerInput && this.datepickerInput.max;
    }
    _getDateFilter() {
        return this.datepickerInput && this.datepickerInput.dateFilter;
    }
    constructor(_overlay, _ngZone, _viewContainerRef, scrollStrategy, _dateAdapter, _dir, _model) {
        this._overlay = _overlay;
        this._ngZone = _ngZone;
        this._viewContainerRef = _viewContainerRef;
        this._dateAdapter = _dateAdapter;
        this._dir = _dir;
        this._model = _model;
        this._inputStateChanges = Subscription.EMPTY;
        this._document = inject(DOCUMENT);
        /** An input indicating the type of the custom header component for the calendar, if set. */
        this.calendarHeaderComponent = input();
        /** The view that the calendar should start in. */
        this.startView = input('month');
        this._touchUi = false;
        this._hideTime = false;
        /** Preferred position of the datepicker in the X axis. */
        this.xPosition = input('start');
        /** Preferred position of the datepicker in the Y axis. */
        this.yPosition = input('below');
        this._restoreFocus = true;
        /**
         * Emits selected year in multiyear view.
         * This doesn't imply a change on the selected date.
         */
        this.yearSelected = output();
        /**
         * Emits selected month in year view.
         * This doesn't imply a change on the selected date.
         */
        this.monthSelected = output();
        /**
         * Emits when the current view changes.
         */
        this.viewChanged = output();
        /** Function that can be used to add custom CSS classes to dates. */
        this.dateClass = input();
        /** Emits when the datepicker has been opened. */
        this.openedStream = new EventEmitter();
        /** Emits when the datepicker has been closed. */
        this.closedStream = new EventEmitter();
        this._opened = false;
        this._showSpinners = true;
        this._showSeconds = false;
        this._stepHour = DEFAULT_STEP;
        this._stepMinute = DEFAULT_STEP;
        this._stepSecond = DEFAULT_STEP;
        this._enableMeridian = false;
        /** The id for the datepicker calendar. */
        this.id = `mat-datepicker-${datepickerUid++}`;
        /** The element that was focused before the datepicker was opened. */
        this._focusedElementBeforeOpen = null;
        /** Unique class that will be added to the backdrop so that the test harnesses can look it up. */
        this._backdropHarnessClass = `${this.id}-backdrop`;
        /** Emits when the datepicker's state changes. */
        this.stateChanges = new Subject();
        if (!this._dateAdapter) {
            throw createMissingDateImplError('NgxMatDateAdapter');
        }
        this._scrollStrategy = scrollStrategy;
    }
    ngOnChanges(changes) {
        const positionChange = changes['xPosition'] || changes['yPosition'];
        if (positionChange && !positionChange.firstChange && this._overlayRef) {
            const positionStrategy = this._overlayRef.getConfig().positionStrategy;
            if (positionStrategy instanceof FlexibleConnectedPositionStrategy) {
                this._setConnectedPositions(positionStrategy);
                if (this.opened) {
                    this._overlayRef.updatePosition();
                }
            }
        }
        this.stateChanges.next(undefined);
    }
    ngOnDestroy() {
        this._destroyOverlay();
        this.close();
        this._inputStateChanges.unsubscribe();
        this.stateChanges.complete();
    }
    /** Selects the given date */
    select(date) {
        this._model.add(date);
    }
    /** Emits the selected year in multiyear view */
    _selectYear(normalizedYear) {
        this.yearSelected.emit(normalizedYear);
    }
    /** Emits selected month in year view */
    _selectMonth(normalizedMonth) {
        this.monthSelected.emit(normalizedMonth);
    }
    /** Emits changed view */
    _viewChanged(view) {
        this.viewChanged.emit(view);
    }
    /**
     * Register an input with this datepicker.
     * @param input The datepicker input to register with this datepicker.
     * @returns Selection model that the input should hook itself up to.
     */
    registerInput(input) {
        if (this.datepickerInput) {
            throw Error('A MatDatepicker can only be associated with a single input.');
        }
        this._inputStateChanges.unsubscribe();
        this.datepickerInput = input;
        this._inputStateChanges = input.stateChanges.subscribe(() => this.stateChanges.next(undefined));
        return this._model;
    }
    /**
     * Registers a portal containing action buttons with the datepicker.
     * @param portal Portal to be registered.
     */
    registerActions(portal) {
        if (this._actionsPortal) {
            throw Error('A MatDatepicker can only be associated with a single actions row.');
        }
        this._actionsPortal = portal;
        this._componentRef?.instance._assignActions(portal, true);
    }
    /**
     * Removes a portal containing action buttons from the datepicker.
     * @param portal Portal to be removed.
     */
    removeActions(portal) {
        if (portal === this._actionsPortal) {
            this._actionsPortal = null;
            this._componentRef?.instance._assignActions(null, true);
        }
    }
    /** Open the calendar. */
    open() {
        // Skip reopening if there's an in-progress animation to avoid overlapping
        // sequences which can cause "changed after checked" errors. See #25837.
        if (this._opened || this.disabled || this._componentRef?.instance._isAnimating) {
            return;
        }
        if (!this.datepickerInput) {
            throw Error('Attempted to open an MatDatepicker with no associated input.');
        }
        this._focusedElementBeforeOpen = _getFocusedElementPierceShadowDom();
        this._openOverlay();
        this._opened = true;
        this.openedStream.emit();
    }
    /** Close the calendar. */
    close() {
        // Skip reopening if there's an in-progress animation to avoid overlapping
        // sequences which can cause "changed after checked" errors. See #25837.
        if (!this._opened || this._componentRef?.instance._isAnimating) {
            return;
        }
        const canRestoreFocus = this._restoreFocus &&
            this._focusedElementBeforeOpen &&
            typeof this._focusedElementBeforeOpen.focus === 'function';
        const completeClose = () => {
            // The `_opened` could've been reset already if
            // we got two events in quick succession.
            if (this._opened) {
                this._opened = false;
                this.closedStream.emit();
            }
        };
        if (this._componentRef) {
            const { instance, location } = this._componentRef;
            instance._startExitAnimation();
            instance._animationDone.pipe(take(1)).subscribe(() => {
                const activeElement = this._document.activeElement;
                // Since we restore focus after the exit animation, we have to check that
                // the user didn't move focus themselves inside the `close` handler.
                if (canRestoreFocus &&
                    (!activeElement ||
                        activeElement === this._document.activeElement ||
                        location.nativeElement.contains(activeElement))) {
                    this._focusedElementBeforeOpen.focus();
                }
                this._focusedElementBeforeOpen = null;
                this._destroyOverlay();
            });
        }
        if (canRestoreFocus) {
            // Because IE moves focus asynchronously, we can't count on it being restored before we've
            // marked the datepicker as closed. If the event fires out of sequence and the element that
            // we're refocusing opens the datepicker on focus, the user could be stuck with not being
            // able to close the calendar at all. We work around it by making the logic, that marks
            // the datepicker as closed, async as well.
            setTimeout(completeClose);
        }
        else {
            completeClose();
        }
    }
    /** Applies the current pending selection on the overlay to the model. */
    _applyPendingSelection() {
        this._componentRef?.instance?._applyPendingSelection();
    }
    /** Forwards relevant values from the datepicker to the datepicker content inside the overlay. */
    _forwardContentValues(instance) {
        instance.datepicker = this;
        instance.color = this.color;
        instance._dialogLabelId = this.datepickerInput.getOverlayLabelId();
        instance._assignActions(this._actionsPortal, false);
    }
    /** Opens the overlay with the calendar. */
    _openOverlay() {
        this._destroyOverlay();
        const isDialog = this.touchUi;
        const portal = new ComponentPortal(NgxMatDatepickerContent, this._viewContainerRef);
        const overlayRef = (this._overlayRef = this._overlay.create(new OverlayConfig({
            positionStrategy: isDialog ? this._getDialogStrategy() : this._getDropdownStrategy(),
            hasBackdrop: true,
            backdropClass: [
                isDialog ? 'cdk-overlay-dark-backdrop' : 'mat-overlay-transparent-backdrop',
                this._backdropHarnessClass,
            ],
            direction: this._dir,
            scrollStrategy: isDialog ? this._overlay.scrollStrategies.block() : this._scrollStrategy(),
            panelClass: `mat-datepicker-${isDialog ? 'dialog' : 'popup'}`,
        })));
        this._getCloseStream(overlayRef).subscribe((event) => {
            if (event) {
                event.preventDefault();
            }
            this.close();
        });
        // The `preventDefault` call happens inside the calendar as well, however focus moves into
        // it inside a timeout which can give browsers a chance to fire off a keyboard event in-between
        // that can scroll the page (see #24969). Always block default actions of arrow keys for the
        // entire overlay so the page doesn't get scrolled by accident.
        overlayRef.keydownEvents().subscribe((event) => {
            const keyCode = event.keyCode;
            if (keyCode === UP_ARROW ||
                keyCode === DOWN_ARROW ||
                keyCode === LEFT_ARROW ||
                keyCode === RIGHT_ARROW ||
                keyCode === PAGE_UP ||
                keyCode === PAGE_DOWN) {
                event.preventDefault();
            }
        });
        this._componentRef = overlayRef.attach(portal);
        this._forwardContentValues(this._componentRef.instance);
        // Update the position once the calendar has rendered. Only relevant in dropdown mode.
        if (!isDialog) {
            this._ngZone.onStable.pipe(take(1)).subscribe(() => overlayRef.updatePosition());
        }
    }
    /** Destroys the current overlay. */
    _destroyOverlay() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = this._componentRef = null;
        }
    }
    /** Gets a position strategy that will open the calendar as a dropdown. */
    _getDialogStrategy() {
        return this._overlay.position().global().centerHorizontally().centerVertically();
    }
    /** Gets a position strategy that will open the calendar as a dropdown. */
    _getDropdownStrategy() {
        const strategy = this._overlay
            .position()
            .flexibleConnectedTo(this.datepickerInput.getConnectedOverlayOrigin())
            .withTransformOriginOn('.mat-datepicker-content')
            .withFlexibleDimensions(false)
            .withViewportMargin(8)
            .withLockedPosition();
        return this._setConnectedPositions(strategy);
    }
    /** Sets the positions of the datepicker in dropdown mode based on the current configuration. */
    _setConnectedPositions(strategy) {
        const primaryX = this.xPosition() === 'end' ? 'end' : 'start';
        const secondaryX = primaryX === 'start' ? 'end' : 'start';
        const primaryY = this.yPosition() === 'above' ? 'bottom' : 'top';
        const secondaryY = primaryY === 'top' ? 'bottom' : 'top';
        return strategy.withPositions([
            {
                originX: primaryX,
                originY: secondaryY,
                overlayX: primaryX,
                overlayY: primaryY,
            },
            {
                originX: primaryX,
                originY: primaryY,
                overlayX: primaryX,
                overlayY: secondaryY,
            },
            {
                originX: secondaryX,
                originY: secondaryY,
                overlayX: secondaryX,
                overlayY: primaryY,
            },
            {
                originX: secondaryX,
                originY: primaryY,
                overlayX: secondaryX,
                overlayY: secondaryY,
            },
        ]);
    }
    /** Gets an observable that will emit when the overlay is supposed to be closed. */
    _getCloseStream(overlayRef) {
        const ctrlShiftMetaModifiers = ['ctrlKey', 'shiftKey', 'metaKey'];
        return merge(overlayRef.backdropClick(), overlayRef.detachments(), overlayRef.keydownEvents().pipe(filter((event) => {
            // Closing on alt + up is only valid when there's an input associated with the datepicker.
            return ((event.keyCode === ESCAPE && !hasModifierKey(event)) ||
                (this.datepickerInput &&
                    hasModifierKey(event, 'altKey') &&
                    event.keyCode === UP_ARROW &&
                    ctrlShiftMetaModifiers.every((modifier) => !hasModifierKey(event, modifier))));
        })));
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerBase, deps: [{ token: i5.Overlay }, { token: i0.NgZone }, { token: i0.ViewContainerRef }, { token: NGX_MAT_DATEPICKER_SCROLL_STRATEGY }, { token: i2.NgxMatDateAdapter, optional: true }, { token: i6.Directionality, optional: true }, { token: i1.NgxMatDateSelectionModel }], target: i0.ɵɵFactoryTarget.Directive }); }
    /** @nocollapse */ static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "18.0.3", type: NgxMatDatepickerBase, inputs: { calendarHeaderComponent: { classPropertyName: "calendarHeaderComponent", publicName: "calendarHeaderComponent", isSignal: true, isRequired: false, transformFunction: null }, startAt: { classPropertyName: "startAt", publicName: "startAt", isSignal: false, isRequired: false, transformFunction: null }, startView: { classPropertyName: "startView", publicName: "startView", isSignal: true, isRequired: false, transformFunction: null }, color: { classPropertyName: "color", publicName: "color", isSignal: false, isRequired: false, transformFunction: null }, touchUi: { classPropertyName: "touchUi", publicName: "touchUi", isSignal: false, isRequired: false, transformFunction: null }, hideTime: { classPropertyName: "hideTime", publicName: "hideTime", isSignal: false, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: false, isRequired: false, transformFunction: null }, xPosition: { classPropertyName: "xPosition", publicName: "xPosition", isSignal: true, isRequired: false, transformFunction: null }, yPosition: { classPropertyName: "yPosition", publicName: "yPosition", isSignal: true, isRequired: false, transformFunction: null }, restoreFocus: { classPropertyName: "restoreFocus", publicName: "restoreFocus", isSignal: false, isRequired: false, transformFunction: null }, dateClass: { classPropertyName: "dateClass", publicName: "dateClass", isSignal: true, isRequired: false, transformFunction: null }, panelClass: { classPropertyName: "panelClass", publicName: "panelClass", isSignal: false, isRequired: false, transformFunction: null }, opened: { classPropertyName: "opened", publicName: "opened", isSignal: false, isRequired: false, transformFunction: null }, showSpinners: { classPropertyName: "showSpinners", publicName: "showSpinners", isSignal: false, isRequired: false, transformFunction: null }, showSeconds: { classPropertyName: "showSeconds", publicName: "showSeconds", isSignal: false, isRequired: false, transformFunction: null }, stepHour: { classPropertyName: "stepHour", publicName: "stepHour", isSignal: false, isRequired: false, transformFunction: null }, stepMinute: { classPropertyName: "stepMinute", publicName: "stepMinute", isSignal: false, isRequired: false, transformFunction: null }, stepSecond: { classPropertyName: "stepSecond", publicName: "stepSecond", isSignal: false, isRequired: false, transformFunction: null }, enableMeridian: { classPropertyName: "enableMeridian", publicName: "enableMeridian", isSignal: false, isRequired: false, transformFunction: null }, disableMinute: { classPropertyName: "disableMinute", publicName: "disableMinute", isSignal: false, isRequired: false, transformFunction: null }, defaultTime: { classPropertyName: "defaultTime", publicName: "defaultTime", isSignal: false, isRequired: false, transformFunction: null } }, outputs: { yearSelected: "yearSelected", monthSelected: "monthSelected", viewChanged: "viewChanged", openedStream: "opened", closedStream: "closed" }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerBase, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i5.Overlay }, { type: i0.NgZone }, { type: i0.ViewContainerRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [NGX_MAT_DATEPICKER_SCROLL_STRATEGY]
                }] }, { type: i2.NgxMatDateAdapter, decorators: [{
                    type: Optional
                }] }, { type: i6.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i1.NgxMatDateSelectionModel }], propDecorators: { startAt: [{
                type: Input
            }], color: [{
                type: Input
            }], touchUi: [{
                type: Input
            }], hideTime: [{
                type: Input
            }], disabled: [{
                type: Input
            }], restoreFocus: [{
                type: Input
            }], openedStream: [{
                type: Output,
                args: ['opened']
            }], closedStream: [{
                type: Output,
                args: ['closed']
            }], panelClass: [{
                type: Input
            }], opened: [{
                type: Input
            }], showSpinners: [{
                type: Input
            }], showSeconds: [{
                type: Input
            }], stepHour: [{
                type: Input
            }], stepMinute: [{
                type: Input
            }], stepSecond: [{
                type: Input
            }], enableMeridian: [{
                type: Input
            }], disableMinute: [{
                type: Input
            }], defaultTime: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZGF0ZXRpbWUtcGlja2VyL3NyYy9saWIvZGF0ZXBpY2tlci1iYXNlLnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZGF0ZXRpbWUtcGlja2VyL3NyYy9saWIvZGF0ZXBpY2tlci1jb250ZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFlBQVksRUFBNkIsTUFBTSxtQkFBbUIsQ0FBQztBQUU1RSxPQUFPLEVBQWdCLHFCQUFxQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDL0YsT0FBTyxFQUNMLFVBQVUsRUFDVixNQUFNLEVBQ04sVUFBVSxFQUNWLFNBQVMsRUFDVCxPQUFPLEVBQ1AsV0FBVyxFQUNYLFFBQVEsRUFDUixjQUFjLEdBQ2YsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLEVBQ0wsaUNBQWlDLEVBQ2pDLE9BQU8sRUFDUCxhQUFhLEdBR2QsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQUUsaUNBQWlDLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQ0wsZUFBZSxFQUNmLGVBQWUsR0FHaEIsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3BELE9BQU8sRUFFTCx1QkFBdUIsRUFFdkIsU0FBUyxFQUVULFNBQVMsRUFFVCxZQUFZLEVBQ1osTUFBTSxFQUNOLGNBQWMsRUFDZCxLQUFLLEVBS0wsUUFBUSxFQUNSLE1BQU0sRUFHTixpQkFBaUIsRUFDakIsTUFBTSxFQUNOLE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsR0FDVixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JELE9BQU8sRUFBMEIsVUFBVSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDNUUsT0FBTyxFQUFjLE9BQU8sRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2hFLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUMsT0FBTyxFQUFFLGNBQWMsRUFBc0IsTUFBTSxZQUFZLENBQUM7QUFHaEUsT0FBTyxFQUNMLHFDQUFxQyxHQUV0QyxNQUFNLGlDQUFpQyxDQUFDO0FBQ3pDLE9BQU8sRUFDTCxZQUFZLEdBR2IsTUFBTSx3QkFBd0IsQ0FBQztBQUNoQyxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNyRSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUdqRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7Ozs7Ozs7O0FBRWxELGlFQUFpRTtBQUNqRSxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFFdEIsc0ZBQXNGO0FBQ3RGLE1BQU0sQ0FBQyxNQUFNLGtDQUFrQyxHQUFHLElBQUksY0FBYyxDQUNsRSxvQ0FBb0MsQ0FDckMsQ0FBQztBQUVGLG9CQUFvQjtBQUNwQixNQUFNLFVBQVUsMENBQTBDLENBQUMsT0FBZ0I7SUFDekUsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDckQsQ0FBQztBQVFELG9CQUFvQjtBQUNwQixNQUFNLENBQUMsTUFBTSxtREFBbUQsR0FBRztJQUNqRSxPQUFPLEVBQUUsa0NBQWtDO0lBQzNDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQztJQUNmLFVBQVUsRUFBRSwwQ0FBMEM7Q0FDdkQsQ0FBQztBQUVGLDJEQUEyRDtBQUMzRCxvQkFBb0I7QUFDcEIsTUFBTSw0QkFBNEIsR0FBRyxVQUFVLENBQzdDO0lBQ0UsWUFBbUIsV0FBdUI7UUFBdkIsZ0JBQVcsR0FBWCxXQUFXLENBQVk7SUFBRyxDQUFDO0NBQy9DLENBQ0YsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQWlDSCxNQUFNLE9BQU8sdUJBQ1gsU0FBUSw0QkFBNEI7SUErQ3BDLElBQUksV0FBVztRQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsSUFBSSxJQUFJO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDM0UsT0FBTyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQztJQUNqRCxDQUFDO0lBSUQsWUFDRSxVQUFzQixFQUNkLGtCQUFxQyxFQUNyQyxZQUE0QyxFQUM1QyxZQUFrQyxFQUdsQyx1QkFBNEQsRUFDcEUsSUFBMEI7UUFFMUIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBUlYsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUNyQyxpQkFBWSxHQUFaLFlBQVksQ0FBZ0M7UUFDNUMsaUJBQVksR0FBWixZQUFZLENBQXNCO1FBR2xDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBcUM7UUExRDlELG1CQUFjLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUU1QyxvREFBb0Q7UUFDcEQsY0FBUyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQW9CLGNBQWMsQ0FBQyxDQUFDO1FBdUJsRSw0Q0FBNEM7UUFDbkMsbUJBQWMsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRTlDLGlEQUFpRDtRQUNqRCxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQVFyQiw0Q0FBNEM7UUFDNUMsbUJBQWMsR0FBMEIsSUFBSSxDQUFDO1FBdUIzQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBRWhELE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDVixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbEMsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDYixRQUFRLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDN0IsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELFFBQVE7UUFDTixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO0lBQ3JGLENBQUM7SUFFRCxlQUFlO1FBQ2IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDMUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsYUFBYSxDQUFDLG9CQUE4QjtRQUMxQyxNQUFNLFNBQVMsR0FBc0M7WUFDbkQsS0FBSyxFQUFFLG9CQUFvQjtZQUMzQixLQUFLLEVBQUUsSUFBSTtTQUNaLENBQUM7UUFFRixJQUFJLENBQUMseUNBQXlDLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVELG9CQUFvQixDQUFDLEtBQXdDO1FBQzNELElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV0RCwrQ0FBK0M7UUFDL0MsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN2RSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzFCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVPLHlDQUF5QyxDQUFDLEtBQXdDO1FBQ3hGLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ3hDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDMUIsTUFBTSxPQUFPLEdBQUcsU0FBUyxZQUFZLFlBQVksQ0FBQztRQUVsRCw2RkFBNkY7UUFDN0YsMEZBQTBGO1FBQzFGLHlGQUF5RjtRQUN6Rix5RkFBeUY7UUFDekYsZ0ZBQWdGO1FBQ2hGLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBQzVDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxpQkFBaUIsQ0FDakUsS0FBSyxFQUNMLFNBQXVDLEVBQ3ZDLEtBQUssQ0FBQyxLQUFLLENBQ1osQ0FBQztZQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFlBQTRCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEUsQ0FBQzthQUFNLENBQUM7WUFDTixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxTQUF5QixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxTQUF5QixDQUFDLENBQUM7WUFDaEYsTUFBTSxNQUFNLEdBQUcsVUFBVSxJQUFJLFVBQVUsQ0FBQztZQUV4QyxJQUFJLEtBQUssSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELG1CQUFtQixDQUFDLEtBQStDO1FBQ2pFLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxLQUFxQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxtQkFBbUI7UUFDakIsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7UUFDOUIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxLQUFxQjtRQUN6QyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxTQUFTLEtBQUssT0FBTyxDQUFDO1FBRWhELElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3QixDQUFDO0lBQ0gsQ0FBQztJQUVELFlBQVk7UUFDVixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBeUIsQ0FBQztRQUN4RCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBa0QsQ0FBQztJQUN4RSxDQUFDO0lBRUQsaUVBQWlFO0lBQ2pFLHNCQUFzQjtRQUNwQixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pFLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsY0FBYyxDQUFDLE1BQWtDLEVBQUUsYUFBc0I7UUFDdkUsMkZBQTJGO1FBQzNGLDBGQUEwRjtRQUMxRiwrRkFBK0Y7UUFDL0YsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDckUsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUM7UUFFN0IsSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDMUMsQ0FBQztJQUNILENBQUM7aUlBM0xVLHVCQUF1QixzSkE2RHhCLHFDQUFxQztxSEE3RHBDLHVCQUF1Qiw2Z0JBT2dCLGNBQWMsOEhDaEtsRSxnekZBMEVBLG15RURxRUksWUFBWSw0SUFDWixjQUFjLHFaQUNkLE9BQU8sb0ZBQ1AseUJBQXlCLHNQQUN6QixtQkFBbUIsc0lBQ25CLFdBQVcsdVBBQ1gsZUFBZSxpSkFDZixTQUFTLG1LQWpCQztZQUNWLDBCQUEwQixDQUFDLGNBQWM7WUFDekMsMEJBQTBCLENBQUMsY0FBYztTQUMxQzs7MkZBaUJVLHVCQUF1QjtrQkFoQ25DLFNBQVM7K0JBQ0UsNEJBQTRCLFFBR2hDO3dCQUNKLEtBQUssRUFBRSx3QkFBd0I7d0JBQy9CLG1CQUFtQixFQUFFLGlCQUFpQjt3QkFDdEMseUJBQXlCLEVBQUUsK0JBQStCO3dCQUMxRCx3QkFBd0IsRUFBRSwrQkFBK0I7d0JBQ3pELHNDQUFzQyxFQUFFLG9CQUFvQjt3QkFDNUQsZ0RBQWdELEVBQUUsc0JBQXNCO3FCQUN6RSxjQUNXO3dCQUNWLDBCQUEwQixDQUFDLGNBQWM7d0JBQ3pDLDBCQUEwQixDQUFDLGNBQWM7cUJBQzFDLFlBQ1MseUJBQXlCLGlCQUNwQixpQkFBaUIsQ0FBQyxJQUFJLG1CQUNwQix1QkFBdUIsQ0FBQyxNQUFNLFVBQ3ZDLENBQUMsT0FBTyxDQUFDLGNBQ0wsSUFBSSxXQUNQO3dCQUNQLFlBQVk7d0JBQ1osY0FBYzt3QkFDZCxPQUFPO3dCQUNQLHlCQUF5Qjt3QkFDekIsbUJBQW1CO3dCQUNuQixXQUFXO3dCQUNYLGVBQWU7d0JBQ2YsU0FBUztxQkFDVjs7MEJBOERFLFFBQVE7OzBCQUNSLE1BQU07MkJBQUMscUNBQXFDOztBQTBLakQsbUNBQW1DO0FBRW5DLE1BQU0sT0FBZ0Isb0JBQW9CO0lBY3hDLGtEQUFrRDtJQUNsRCxJQUNJLE9BQU87UUFDVCw2RkFBNkY7UUFDN0YscUJBQXFCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9GLENBQUM7SUFDRCxJQUFJLE9BQU8sQ0FBQyxLQUFlO1FBQ3pCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUFNRCx5REFBeUQ7SUFDekQsSUFDSSxLQUFLO1FBQ1AsT0FBTyxDQUNMLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FDM0YsQ0FBQztJQUNKLENBQUM7SUFDRCxJQUFJLEtBQUssQ0FBQyxLQUFtQjtRQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBR0Q7OztPQUdHO0lBQ0gsSUFDSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxJQUFJLE9BQU8sQ0FBQyxLQUFtQjtRQUM3QixJQUFJLENBQUMsUUFBUSxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFHRCxJQUNJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQUNELElBQUksUUFBUSxDQUFDLEtBQWM7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBR0Qsd0RBQXdEO0lBQ3hELElBQ0ksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLGVBQWU7WUFDekQsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUTtZQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDdkIsQ0FBQztJQUNELElBQUksUUFBUSxDQUFDLEtBQW1CO1FBQzlCLE1BQU0sUUFBUSxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTlDLElBQUksUUFBUSxLQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUMxQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwQyxDQUFDO0lBQ0gsQ0FBQztJQVNEOzs7O09BSUc7SUFDSCxJQUNJLFlBQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDNUIsQ0FBQztJQUNELElBQUksWUFBWSxDQUFDLEtBQW1CO1FBQ2xDLElBQUksQ0FBQyxhQUFhLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQTZCRDs7O09BR0c7SUFDSCxJQUNJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDMUIsQ0FBQztJQUNELElBQUksVUFBVSxDQUFDLEtBQXdCO1FBQ3JDLElBQUksQ0FBQyxXQUFXLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUdELG9DQUFvQztJQUNwQyxJQUNJLE1BQU07UUFDUixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztJQUNELElBQUksTUFBTSxDQUFDLEtBQW1CO1FBQzVCLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM1RCxDQUFDO0lBR0QsZ0RBQWdEO0lBQ2hELElBQ0ksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM1QixDQUFDO0lBQ0QsSUFBSSxZQUFZLENBQUMsS0FBYztRQUM3QixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUM3QixDQUFDO0lBR0QsMkNBQTJDO0lBQzNDLElBQ0ksV0FBVztRQUNiLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUMzQixDQUFDO0lBQ0QsSUFBSSxXQUFXLENBQUMsS0FBYztRQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztJQUM1QixDQUFDO0lBR0QsZ0JBQWdCO0lBQ2hCLElBQ0ksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBQ0QsSUFBSSxRQUFRLENBQUMsS0FBYTtRQUN4QixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN6QixDQUFDO0lBR0Qsa0JBQWtCO0lBQ2xCLElBQ0ksVUFBVTtRQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUMxQixDQUFDO0lBQ0QsSUFBSSxVQUFVLENBQUMsS0FBYTtRQUMxQixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztJQUMzQixDQUFDO0lBR0Qsa0JBQWtCO0lBQ2xCLElBQ0ksVUFBVTtRQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUMxQixDQUFDO0lBQ0QsSUFBSSxVQUFVLENBQUMsS0FBYTtRQUMxQixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztJQUMzQixDQUFDO0lBR0Qsc0JBQXNCO0lBQ3RCLElBQ0ksY0FBYztRQUNoQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDOUIsQ0FBQztJQUNELElBQUksY0FBYyxDQUFDLEtBQWM7UUFDL0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7SUFDL0IsQ0FBQztJQUdELHFCQUFxQjtJQUNyQixJQUNJLGFBQWE7UUFDZixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDN0IsQ0FBQztJQUNELElBQUksYUFBYSxDQUFDLEtBQWM7UUFDOUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7SUFDOUIsQ0FBQztJQUdELGtCQUFrQjtJQUNsQixJQUNJLFdBQVc7UUFDYixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDM0IsQ0FBQztJQUNELElBQUksV0FBVyxDQUFDLEtBQWU7UUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7SUFDNUIsQ0FBQztJQU1ELG1DQUFtQztJQUNuQyxXQUFXO1FBQ1QsT0FBTyxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDO0lBQzFELENBQUM7SUFFRCxtQ0FBbUM7SUFDbkMsV0FBVztRQUNULE9BQU8sSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQztJQUMxRCxDQUFDO0lBRUQsY0FBYztRQUNaLE9BQU8sSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQztJQUNqRSxDQUFDO0lBdUJELFlBQ1UsUUFBaUIsRUFDakIsT0FBZSxFQUNmLGlCQUFtQyxFQUNDLGNBQW1CLEVBQzNDLFlBQWtDLEVBQ2xDLElBQW9CLEVBQ2hDLE1BQXNDO1FBTnRDLGFBQVEsR0FBUixRQUFRLENBQVM7UUFDakIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFFdkIsaUJBQVksR0FBWixZQUFZLENBQXNCO1FBQ2xDLFNBQUksR0FBSixJQUFJLENBQWdCO1FBQ2hDLFdBQU0sR0FBTixNQUFNLENBQWdDO1FBMVF4Qyx1QkFBa0IsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO1FBQ3hDLGNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFckMsNEZBQTRGO1FBQzVGLDRCQUF1QixHQUFHLEtBQUssRUFBc0IsQ0FBQztRQWN0RCxrREFBa0Q7UUFDbEQsY0FBUyxHQUFHLEtBQUssQ0FBa0MsT0FBTyxDQUFDLENBQUM7UUF5QnBELGFBQVEsR0FBRyxLQUFLLENBQUM7UUFTbEIsY0FBUyxHQUFHLEtBQUssQ0FBQztRQW1CekIsMERBQTBEO1FBQ2pELGNBQVMsR0FBRyxLQUFLLENBQWlDLE9BQU8sQ0FBQyxDQUFDO1FBRXBFLDBEQUEwRDtRQUNqRCxjQUFTLEdBQUcsS0FBSyxDQUFpQyxPQUFPLENBQUMsQ0FBQztRQWM1RCxrQkFBYSxHQUFHLElBQUksQ0FBQztRQUU3Qjs7O1dBR0c7UUFDTSxpQkFBWSxHQUFHLE1BQU0sRUFBSyxDQUFDO1FBRXBDOzs7V0FHRztRQUNNLGtCQUFhLEdBQUcsTUFBTSxFQUFLLENBQUM7UUFFckM7O1dBRUc7UUFDTSxnQkFBVyxHQUFHLE1BQU0sRUFBc0IsQ0FBQztRQUVwRCxvRUFBb0U7UUFDM0QsY0FBUyxHQUFHLEtBQUssRUFBc0MsQ0FBQztRQUVqRSxpREFBaUQ7UUFDdEIsaUJBQVksR0FBRyxJQUFJLFlBQVksRUFBUSxDQUFDO1FBRW5FLGlEQUFpRDtRQUN0QixpQkFBWSxHQUFHLElBQUksWUFBWSxFQUFRLENBQUM7UUF1QjNELFlBQU8sR0FBRyxLQUFLLENBQUM7UUFVakIsa0JBQWEsR0FBRyxJQUFJLENBQUM7UUFVckIsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFVckIsY0FBUyxHQUFXLFlBQVksQ0FBQztRQVVqQyxnQkFBVyxHQUFXLFlBQVksQ0FBQztRQVVuQyxnQkFBVyxHQUFXLFlBQVksQ0FBQztRQVVuQyxvQkFBZSxHQUFZLEtBQUssQ0FBQztRQXNCeEMsMENBQTBDO1FBQzFDLE9BQUUsR0FBVyxrQkFBa0IsYUFBYSxFQUFFLEVBQUUsQ0FBQztRQXNCakQscUVBQXFFO1FBQzdELDhCQUF5QixHQUF1QixJQUFJLENBQUM7UUFFN0QsaUdBQWlHO1FBQ3pGLDBCQUFxQixHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDO1FBUXRELGlEQUFpRDtRQUN4QyxpQkFBWSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFXMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN2QixNQUFNLDBCQUEwQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVELElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBc0I7UUFDaEMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVwRSxJQUFJLGNBQWMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3RFLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztZQUV2RSxJQUFJLGdCQUFnQixZQUFZLGlDQUFpQyxFQUFFLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUU5QyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDaEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDcEMsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVELDZCQUE2QjtJQUM3QixNQUFNLENBQUMsSUFBTztRQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxnREFBZ0Q7SUFDaEQsV0FBVyxDQUFDLGNBQWlCO1FBQzNCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCx3Q0FBd0M7SUFDeEMsWUFBWSxDQUFDLGVBQWtCO1FBQzdCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCx5QkFBeUI7SUFDekIsWUFBWSxDQUFDLElBQXdCO1FBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsYUFBYSxDQUFDLEtBQVE7UUFDcEIsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDekIsTUFBTSxLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQztRQUM3RSxDQUFDO1FBQ0QsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1FBQzdCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ2hHLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNyQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsZUFBZSxDQUFDLE1BQXNCO1FBQ3BDLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3hCLE1BQU0sS0FBSyxDQUFDLG1FQUFtRSxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUNELElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDO1FBQzdCLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVEOzs7T0FHRztJQUNILGFBQWEsQ0FBQyxNQUFzQjtRQUNsQyxJQUFJLE1BQU0sS0FBSyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7WUFDM0IsSUFBSSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxRCxDQUFDO0lBQ0gsQ0FBQztJQUVELHlCQUF5QjtJQUN6QixJQUFJO1FBQ0YsMEVBQTBFO1FBQzFFLHdFQUF3RTtRQUN4RSxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUMvRSxPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDMUIsTUFBTSxLQUFLLENBQUMsOERBQThELENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBRUQsSUFBSSxDQUFDLHlCQUF5QixHQUFHLGlDQUFpQyxFQUFFLENBQUM7UUFDckUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVELDBCQUEwQjtJQUMxQixLQUFLO1FBQ0gsMEVBQTBFO1FBQzFFLHdFQUF3RTtRQUN4RSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUMvRCxPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sZUFBZSxHQUNuQixJQUFJLENBQUMsYUFBYTtZQUNsQixJQUFJLENBQUMseUJBQXlCO1lBQzlCLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssS0FBSyxVQUFVLENBQUM7UUFFN0QsTUFBTSxhQUFhLEdBQUcsR0FBRyxFQUFFO1lBQ3pCLCtDQUErQztZQUMvQyx5Q0FBeUM7WUFDekMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUNyQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzNCLENBQUM7UUFDSCxDQUFDLENBQUM7UUFFRixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN2QixNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDbEQsUUFBUSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDL0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDbkQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7Z0JBRW5ELHlFQUF5RTtnQkFDekUsb0VBQW9FO2dCQUNwRSxJQUNFLGVBQWU7b0JBQ2YsQ0FBQyxDQUFDLGFBQWE7d0JBQ2IsYUFBYSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYTt3QkFDOUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsRUFDakQsQ0FBQztvQkFDRCxJQUFJLENBQUMseUJBQTBCLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzFDLENBQUM7Z0JBRUQsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQztnQkFDdEMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksZUFBZSxFQUFFLENBQUM7WUFDcEIsMEZBQTBGO1lBQzFGLDJGQUEyRjtZQUMzRix5RkFBeUY7WUFDekYsdUZBQXVGO1lBQ3ZGLDJDQUEyQztZQUMzQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDNUIsQ0FBQzthQUFNLENBQUM7WUFDTixhQUFhLEVBQUUsQ0FBQztRQUNsQixDQUFDO0lBQ0gsQ0FBQztJQUVELHlFQUF5RTtJQUN6RSxzQkFBc0I7UUFDcEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsc0JBQXNCLEVBQUUsQ0FBQztJQUN6RCxDQUFDO0lBRUQsaUdBQWlHO0lBQ3ZGLHFCQUFxQixDQUFDLFFBQXVDO1FBQ3JFLFFBQVEsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQzNCLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUM1QixRQUFRLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNuRSxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELDJDQUEyQztJQUNuQyxZQUFZO1FBQ2xCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUV2QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzlCLE1BQU0sTUFBTSxHQUFHLElBQUksZUFBZSxDQUNoQyx1QkFBdUIsRUFDdkIsSUFBSSxDQUFDLGlCQUFpQixDQUN2QixDQUFDO1FBQ0YsTUFBTSxVQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUN6RCxJQUFJLGFBQWEsQ0FBQztZQUNoQixnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDcEYsV0FBVyxFQUFFLElBQUk7WUFDakIsYUFBYSxFQUFFO2dCQUNiLFFBQVEsQ0FBQyxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLGtDQUFrQztnQkFDM0UsSUFBSSxDQUFDLHFCQUFxQjthQUMzQjtZQUNELFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNwQixjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQzFGLFVBQVUsRUFBRSxrQkFBa0IsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtTQUM5RCxDQUFDLENBQ0gsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNuRCxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUNWLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN6QixDQUFDO1lBQ0QsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7UUFFSCwwRkFBMEY7UUFDMUYsK0ZBQStGO1FBQy9GLDRGQUE0RjtRQUM1RiwrREFBK0Q7UUFDL0QsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQzdDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7WUFFOUIsSUFDRSxPQUFPLEtBQUssUUFBUTtnQkFDcEIsT0FBTyxLQUFLLFVBQVU7Z0JBQ3RCLE9BQU8sS0FBSyxVQUFVO2dCQUN0QixPQUFPLEtBQUssV0FBVztnQkFDdkIsT0FBTyxLQUFLLE9BQU87Z0JBQ25CLE9BQU8sS0FBSyxTQUFTLEVBQ3JCLENBQUM7Z0JBQ0QsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3pCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV4RCxzRkFBc0Y7UUFDdEYsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUNuRixDQUFDO0lBQ0gsQ0FBQztJQUVELG9DQUFvQztJQUM1QixlQUFlO1FBQ3JCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUMvQyxDQUFDO0lBQ0gsQ0FBQztJQUVELDBFQUEwRTtJQUNsRSxrQkFBa0I7UUFDeEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUNuRixDQUFDO0lBRUQsMEVBQTBFO0lBQ2xFLG9CQUFvQjtRQUMxQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUTthQUMzQixRQUFRLEVBQUU7YUFDVixtQkFBbUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHlCQUF5QixFQUFFLENBQUM7YUFDckUscUJBQXFCLENBQUMseUJBQXlCLENBQUM7YUFDaEQsc0JBQXNCLENBQUMsS0FBSyxDQUFDO2FBQzdCLGtCQUFrQixDQUFDLENBQUMsQ0FBQzthQUNyQixrQkFBa0IsRUFBRSxDQUFDO1FBRXhCLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxnR0FBZ0c7SUFDeEYsc0JBQXNCLENBQUMsUUFBMkM7UUFDeEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDOUQsTUFBTSxVQUFVLEdBQUcsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDMUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDakUsTUFBTSxVQUFVLEdBQUcsUUFBUSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFekQsT0FBTyxRQUFRLENBQUMsYUFBYSxDQUFDO1lBQzVCO2dCQUNFLE9BQU8sRUFBRSxRQUFRO2dCQUNqQixPQUFPLEVBQUUsVUFBVTtnQkFDbkIsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFFBQVEsRUFBRSxRQUFRO2FBQ25CO1lBQ0Q7Z0JBQ0UsT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLE9BQU8sRUFBRSxRQUFRO2dCQUNqQixRQUFRLEVBQUUsUUFBUTtnQkFDbEIsUUFBUSxFQUFFLFVBQVU7YUFDckI7WUFDRDtnQkFDRSxPQUFPLEVBQUUsVUFBVTtnQkFDbkIsT0FBTyxFQUFFLFVBQVU7Z0JBQ25CLFFBQVEsRUFBRSxVQUFVO2dCQUNwQixRQUFRLEVBQUUsUUFBUTthQUNuQjtZQUNEO2dCQUNFLE9BQU8sRUFBRSxVQUFVO2dCQUNuQixPQUFPLEVBQUUsUUFBUTtnQkFDakIsUUFBUSxFQUFFLFVBQVU7Z0JBQ3BCLFFBQVEsRUFBRSxVQUFVO2FBQ3JCO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELG1GQUFtRjtJQUMzRSxlQUFlLENBQUMsVUFBc0I7UUFDNUMsTUFBTSxzQkFBc0IsR0FBZ0MsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQy9GLE9BQU8sS0FBSyxDQUNWLFVBQVUsQ0FBQyxhQUFhLEVBQUUsRUFDMUIsVUFBVSxDQUFDLFdBQVcsRUFBRSxFQUN4QixVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUM3QixNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNmLDBGQUEwRjtZQUMxRixPQUFPLENBQ0wsQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDcEQsQ0FBQyxJQUFJLENBQUMsZUFBZTtvQkFDbkIsY0FBYyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUM7b0JBQy9CLEtBQUssQ0FBQyxPQUFPLEtBQUssUUFBUTtvQkFDMUIsc0JBQXNCLENBQUMsS0FBSyxDQUMxQixDQUFDLFFBQW1DLEVBQUUsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FDMUUsQ0FBQyxDQUNMLENBQUM7UUFDSixDQUFDLENBQUMsQ0FDSCxDQUNGLENBQUM7SUFDSixDQUFDO2lJQWpsQm1CLG9CQUFvQiwrRkErUTlCLGtDQUFrQztxSEEvUXhCLG9CQUFvQjs7MkZBQXBCLG9CQUFvQjtrQkFEekMsU0FBUzs7MEJBZ1JMLE1BQU07MkJBQUMsa0NBQWtDOzswQkFDekMsUUFBUTs7MEJBQ1IsUUFBUTtnRkFqUVAsT0FBTztzQkFEVixLQUFLO2dCQWdCRixLQUFLO3NCQURSLEtBQUs7Z0JBZ0JGLE9BQU87c0JBRFYsS0FBSztnQkFVRixRQUFRO3NCQURYLEtBQUs7Z0JBV0YsUUFBUTtzQkFEWCxLQUFLO2dCQTRCRixZQUFZO3NCQURmLEtBQUs7Z0JBOEJxQixZQUFZO3NCQUF0QyxNQUFNO3VCQUFDLFFBQVE7Z0JBR1csWUFBWTtzQkFBdEMsTUFBTTt1QkFBQyxRQUFRO2dCQU9aLFVBQVU7c0JBRGIsS0FBSztnQkFXRixNQUFNO3NCQURULEtBQUs7Z0JBV0YsWUFBWTtzQkFEZixLQUFLO2dCQVdGLFdBQVc7c0JBRGQsS0FBSztnQkFXRixRQUFRO3NCQURYLEtBQUs7Z0JBV0YsVUFBVTtzQkFEYixLQUFLO2dCQVdGLFVBQVU7c0JBRGIsS0FBSztnQkFXRixjQUFjO3NCQURqQixLQUFLO2dCQVdGLGFBQWE7c0JBRGhCLEtBQUs7Z0JBV0YsV0FBVztzQkFEZCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQW5pbWF0aW9uRXZlbnQgfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcclxuaW1wb3J0IHsgQ2RrVHJhcEZvY3VzLCBMaXN0S2V5TWFuYWdlck1vZGlmaWVyS2V5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xyXG5pbXBvcnQgeyBEaXJlY3Rpb25hbGl0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcclxuaW1wb3J0IHsgQm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHksIGNvZXJjZVN0cmluZ0FycmF5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHtcclxuICBET1dOX0FSUk9XLFxyXG4gIEVTQ0FQRSxcclxuICBMRUZUX0FSUk9XLFxyXG4gIFBBR0VfRE9XTixcclxuICBQQUdFX1VQLFxyXG4gIFJJR0hUX0FSUk9XLFxyXG4gIFVQX0FSUk9XLFxyXG4gIGhhc01vZGlmaWVyS2V5LFxyXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XHJcbmltcG9ydCB7XHJcbiAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LFxyXG4gIE92ZXJsYXksXHJcbiAgT3ZlcmxheUNvbmZpZyxcclxuICBPdmVybGF5UmVmLFxyXG4gIFNjcm9sbFN0cmF0ZWd5LFxyXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcclxuaW1wb3J0IHsgX2dldEZvY3VzZWRFbGVtZW50UGllcmNlU2hhZG93RG9tIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcclxuaW1wb3J0IHtcclxuICBDZGtQb3J0YWxPdXRsZXQsXHJcbiAgQ29tcG9uZW50UG9ydGFsLFxyXG4gIENvbXBvbmVudFR5cGUsXHJcbiAgVGVtcGxhdGVQb3J0YWwsXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XHJcbmltcG9ydCB7IERPQ1VNRU5ULCBOZ0NsYXNzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtcclxuICBBZnRlclZpZXdJbml0LFxyXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxyXG4gIENoYW5nZURldGVjdG9yUmVmLFxyXG4gIENvbXBvbmVudCxcclxuICBDb21wb25lbnRSZWYsXHJcbiAgRGlyZWN0aXZlLFxyXG4gIEVsZW1lbnRSZWYsXHJcbiAgRXZlbnRFbWl0dGVyLFxyXG4gIEluamVjdCxcclxuICBJbmplY3Rpb25Ub2tlbixcclxuICBJbnB1dCxcclxuICBOZ1pvbmUsXHJcbiAgT25DaGFuZ2VzLFxyXG4gIE9uRGVzdHJveSxcclxuICBPbkluaXQsXHJcbiAgT3B0aW9uYWwsXHJcbiAgT3V0cHV0LFxyXG4gIFNpbXBsZUNoYW5nZXMsXHJcbiAgVmlld0NvbnRhaW5lclJlZixcclxuICBWaWV3RW5jYXBzdWxhdGlvbixcclxuICBlZmZlY3QsXHJcbiAgaW5qZWN0LFxyXG4gIGlucHV0LFxyXG4gIG91dHB1dCxcclxuICB2aWV3Q2hpbGQsXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEZvcm1zTW9kdWxlLCBSZWFjdGl2ZUZvcm1zTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xyXG5pbXBvcnQgeyBNYXRCdXR0b24gfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9idXR0b24nO1xyXG5pbXBvcnQgeyBDYW5Db2xvciwgVGhlbWVQYWxldHRlLCBtaXhpbkNvbG9yIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QsIFN1YnNjcmlwdGlvbiwgbWVyZ2UgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgZmlsdGVyLCB0YWtlIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBOZ3hNYXRDYWxlbmRhciwgTmd4TWF0Q2FsZW5kYXJWaWV3IH0gZnJvbSAnLi9jYWxlbmRhcic7XHJcbmltcG9ydCB7IE5neE1hdENhbGVuZGFyQ2VsbENsYXNzRnVuY3Rpb24sIE5neE1hdENhbGVuZGFyVXNlckV2ZW50IH0gZnJvbSAnLi9jYWxlbmRhci1ib2R5JztcclxuaW1wb3J0IHsgTmd4TWF0RGF0ZUFkYXB0ZXIgfSBmcm9tICcuL2NvcmUvZGF0ZS1hZGFwdGVyJztcclxuaW1wb3J0IHtcclxuICBOR1hfTUFUX0RBVEVfUkFOR0VfU0VMRUNUSU9OX1NUUkFURUdZLFxyXG4gIE5neE1hdERhdGVSYW5nZVNlbGVjdGlvblN0cmF0ZWd5LFxyXG59IGZyb20gJy4vZGF0ZS1yYW5nZS1zZWxlY3Rpb24tc3RyYXRlZ3knO1xyXG5pbXBvcnQge1xyXG4gIE5neERhdGVSYW5nZSxcclxuICBOZ3hFeHRyYWN0RGF0ZVR5cGVGcm9tU2VsZWN0aW9uLFxyXG4gIE5neE1hdERhdGVTZWxlY3Rpb25Nb2RlbCxcclxufSBmcm9tICcuL2RhdGUtc2VsZWN0aW9uLW1vZGVsJztcclxuaW1wb3J0IHsgbmd4TWF0RGF0ZXBpY2tlckFuaW1hdGlvbnMgfSBmcm9tICcuL2RhdGVwaWNrZXItYW5pbWF0aW9ucyc7XHJcbmltcG9ydCB7IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yIH0gZnJvbSAnLi9kYXRlcGlja2VyLWVycm9ycyc7XHJcbmltcG9ydCB7IE5neERhdGVGaWx0ZXJGbiB9IGZyb20gJy4vZGF0ZXBpY2tlci1pbnB1dC1iYXNlJztcclxuaW1wb3J0IHsgTmd4TWF0RGF0ZXBpY2tlckludGwgfSBmcm9tICcuL2RhdGVwaWNrZXItaW50bCc7XHJcbmltcG9ydCB7IE5neE1hdFRpbWVwaWNrZXJDb21wb25lbnQgfSBmcm9tICcuL3RpbWVwaWNrZXIuY29tcG9uZW50JztcclxuaW1wb3J0IHsgREVGQVVMVF9TVEVQIH0gZnJvbSAnLi91dGlscy9kYXRlLXV0aWxzJztcclxuXHJcbi8qKiBVc2VkIHRvIGdlbmVyYXRlIGEgdW5pcXVlIElEIGZvciBlYWNoIGRhdGVwaWNrZXIgaW5zdGFuY2UuICovXHJcbmxldCBkYXRlcGlja2VyVWlkID0gMDtcclxuXHJcbi8qKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBkZXRlcm1pbmVzIHRoZSBzY3JvbGwgaGFuZGxpbmcgd2hpbGUgdGhlIGNhbGVuZGFyIGlzIG9wZW4uICovXHJcbmV4cG9ydCBjb25zdCBOR1hfTUFUX0RBVEVQSUNLRVJfU0NST0xMX1NUUkFURUdZID0gbmV3IEluamVjdGlvblRva2VuPCgpID0+IFNjcm9sbFN0cmF0ZWd5PihcclxuICAnbmd4LW1hdC1kYXRlcGlja2VyLXNjcm9sbC1zdHJhdGVneScsXHJcbik7XHJcblxyXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xyXG5leHBvcnQgZnVuY3Rpb24gTkdYX01BVF9EQVRFUElDS0VSX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZKG92ZXJsYXk6IE92ZXJsYXkpOiAoKSA9PiBTY3JvbGxTdHJhdGVneSB7XHJcbiAgcmV0dXJuICgpID0+IG92ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5yZXBvc2l0aW9uKCk7XHJcbn1cclxuXHJcbi8qKiBQb3NzaWJsZSBwb3NpdGlvbnMgZm9yIHRoZSBkYXRlcGlja2VyIGRyb3Bkb3duIGFsb25nIHRoZSBYIGF4aXMuICovXHJcbmV4cG9ydCB0eXBlIE5neERhdGVwaWNrZXJEcm9wZG93blBvc2l0aW9uWCA9ICdzdGFydCcgfCAnZW5kJztcclxuXHJcbi8qKiBQb3NzaWJsZSBwb3NpdGlvbnMgZm9yIHRoZSBkYXRlcGlja2VyIGRyb3Bkb3duIGFsb25nIHRoZSBZIGF4aXMuICovXHJcbmV4cG9ydCB0eXBlIE5neERhdGVwaWNrZXJEcm9wZG93blBvc2l0aW9uWSA9ICdhYm92ZScgfCAnYmVsb3cnO1xyXG5cclxuLyoqIEBkb2NzLXByaXZhdGUgKi9cclxuZXhwb3J0IGNvbnN0IE5HWF9NQVRfREFURVBJQ0tFUl9TQ1JPTExfU1RSQVRFR1lfRkFDVE9SWV9QUk9WSURFUiA9IHtcclxuICBwcm92aWRlOiBOR1hfTUFUX0RBVEVQSUNLRVJfU0NST0xMX1NUUkFURUdZLFxyXG4gIGRlcHM6IFtPdmVybGF5XSxcclxuICB1c2VGYWN0b3J5OiBOR1hfTUFUX0RBVEVQSUNLRVJfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUlksXHJcbn07XHJcblxyXG4vLyBCb2lsZXJwbGF0ZSBmb3IgYXBwbHlpbmcgbWl4aW5zIHRvIE1hdERhdGVwaWNrZXJDb250ZW50LlxyXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xyXG5jb25zdCBfTmd4TWF0RGF0ZXBpY2tlckNvbnRlbnRCYXNlID0gbWl4aW5Db2xvcihcclxuICBjbGFzcyB7XHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHt9XHJcbiAgfSxcclxuKTtcclxuXHJcbi8qKlxyXG4gKiBDb21wb25lbnQgdXNlZCBhcyB0aGUgY29udGVudCBmb3IgdGhlIGRhdGVwaWNrZXIgb3ZlcmxheS4gV2UgdXNlIHRoaXMgaW5zdGVhZCBvZiB1c2luZ1xyXG4gKiBNYXRDYWxlbmRhciBkaXJlY3RseSBhcyB0aGUgY29udGVudCBzbyB3ZSBjYW4gY29udHJvbCB0aGUgaW5pdGlhbCBmb2N1cy4gVGhpcyBhbHNvIGdpdmVzIHVzIGFcclxuICogcGxhY2UgdG8gcHV0IGFkZGl0aW9uYWwgZmVhdHVyZXMgb2YgdGhlIG92ZXJsYXkgdGhhdCBhcmUgbm90IHBhcnQgb2YgdGhlIGNhbGVuZGFyIGl0c2VsZiBpbiB0aGVcclxuICogZnV0dXJlLiAoZS5nLiBjb25maXJtYXRpb24gYnV0dG9ucykuXHJcbiAqIEBkb2NzLXByaXZhdGVcclxuICovXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnbmd4LW1hdC1kYXRlcGlja2VyLWNvbnRlbnQnLFxyXG4gIHRlbXBsYXRlVXJsOiAnZGF0ZXBpY2tlci1jb250ZW50Lmh0bWwnLFxyXG4gIHN0eWxlVXJsczogWydkYXRlcGlja2VyLWNvbnRlbnQuc2NzcyddLFxyXG4gIGhvc3Q6IHtcclxuICAgIGNsYXNzOiAnbWF0LWRhdGVwaWNrZXItY29udGVudCcsXHJcbiAgICAnW0B0cmFuc2Zvcm1QYW5lbF0nOiAnX2FuaW1hdGlvblN0YXRlJyxcclxuICAgICcoQHRyYW5zZm9ybVBhbmVsLnN0YXJ0KSc6ICdfaGFuZGxlQW5pbWF0aW9uRXZlbnQoJGV2ZW50KScsXHJcbiAgICAnKEB0cmFuc2Zvcm1QYW5lbC5kb25lKSc6ICdfaGFuZGxlQW5pbWF0aW9uRXZlbnQoJGV2ZW50KScsXHJcbiAgICAnW2NsYXNzLm1hdC1kYXRlcGlja2VyLWNvbnRlbnQtdG91Y2hdJzogJ2RhdGVwaWNrZXIudG91Y2hVaScsXHJcbiAgICAnW2NsYXNzLm1hdC1kYXRlcGlja2VyLWNvbnRlbnQtdG91Y2gtd2l0aC10aW1lXSc6ICchZGF0ZXBpY2tlci5oaWRlVGltZScsXHJcbiAgfSxcclxuICBhbmltYXRpb25zOiBbXHJcbiAgICBuZ3hNYXREYXRlcGlja2VyQW5pbWF0aW9ucy50cmFuc2Zvcm1QYW5lbCxcclxuICAgIG5neE1hdERhdGVwaWNrZXJBbmltYXRpb25zLmZhZGVJbkNhbGVuZGFyLFxyXG4gIF0sXHJcbiAgZXhwb3J0QXM6ICduZ3hNYXREYXRlcGlja2VyQ29udGVudCcsXHJcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcclxuICBpbnB1dHM6IFsnY29sb3InXSxcclxuICBzdGFuZGFsb25lOiB0cnVlLFxyXG4gIGltcG9ydHM6IFtcclxuICAgIENka1RyYXBGb2N1cyxcclxuICAgIE5neE1hdENhbGVuZGFyLFxyXG4gICAgTmdDbGFzcyxcclxuICAgIE5neE1hdFRpbWVwaWNrZXJDb21wb25lbnQsXHJcbiAgICBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxyXG4gICAgRm9ybXNNb2R1bGUsXHJcbiAgICBDZGtQb3J0YWxPdXRsZXQsXHJcbiAgICBNYXRCdXR0b24sXHJcbiAgXSxcclxufSlcclxuZXhwb3J0IGNsYXNzIE5neE1hdERhdGVwaWNrZXJDb250ZW50PFMsIEQgPSBOZ3hFeHRyYWN0RGF0ZVR5cGVGcm9tU2VsZWN0aW9uPFM+PlxyXG4gIGV4dGVuZHMgX05neE1hdERhdGVwaWNrZXJDb250ZW50QmFzZVxyXG4gIGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3ksIENhbkNvbG9yXHJcbntcclxuICBwcml2YXRlIF9zdWJzY3JpcHRpb25zID0gbmV3IFN1YnNjcmlwdGlvbigpO1xyXG4gIHByaXZhdGUgX21vZGVsOiBOZ3hNYXREYXRlU2VsZWN0aW9uTW9kZWw8UywgRD47XHJcbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgaW50ZXJuYWwgY2FsZW5kYXIgY29tcG9uZW50LiAqL1xyXG4gIF9jYWxlbmRhciA9IHZpZXdDaGlsZC5yZXF1aXJlZDxOZ3hNYXRDYWxlbmRhcjxEPj4oTmd4TWF0Q2FsZW5kYXIpO1xyXG5cclxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBkYXRlcGlja2VyIHRoYXQgY3JlYXRlZCB0aGUgb3ZlcmxheS4gKi9cclxuICBkYXRlcGlja2VyOiBOZ3hNYXREYXRlcGlja2VyQmFzZTxhbnksIFMsIEQ+O1xyXG5cclxuICAvKiogU3RhcnQgb2YgdGhlIGNvbXBhcmlzb24gcmFuZ2UuICovXHJcbiAgY29tcGFyaXNvblN0YXJ0OiBEIHwgbnVsbDtcclxuXHJcbiAgLyoqIEVuZCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZS4gKi9cclxuICBjb21wYXJpc29uRW5kOiBEIHwgbnVsbDtcclxuXHJcbiAgLyoqIEFSSUEgQWNjZXNzaWJsZSBuYW1lIG9mIHRoZSBgPGlucHV0IG1hdFN0YXJ0RGF0ZS8+YCAqL1xyXG4gIHN0YXJ0RGF0ZUFjY2Vzc2libGVOYW1lOiBzdHJpbmcgfCBudWxsO1xyXG5cclxuICAvKiogQVJJQSBBY2Nlc3NpYmxlIG5hbWUgb2YgdGhlIGA8aW5wdXQgbWF0RW5kRGF0ZS8+YCAqL1xyXG4gIGVuZERhdGVBY2Nlc3NpYmxlTmFtZTogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgLyoqIFdoZXRoZXIgdGhlIGRhdGVwaWNrZXIgaXMgYWJvdmUgb3IgYmVsb3cgdGhlIGlucHV0LiAqL1xyXG4gIF9pc0Fib3ZlOiBib29sZWFuO1xyXG5cclxuICAvKiogQ3VycmVudCBzdGF0ZSBvZiB0aGUgYW5pbWF0aW9uLiAqL1xyXG4gIF9hbmltYXRpb25TdGF0ZTogJ2VudGVyLWRyb3Bkb3duJyB8ICdlbnRlci1kaWFsb2cnIHwgJ3ZvaWQnO1xyXG5cclxuICAvKiogRW1pdHMgd2hlbiBhbiBhbmltYXRpb24gaGFzIGZpbmlzaGVkLiAqL1xyXG4gIHJlYWRvbmx5IF9hbmltYXRpb25Eb25lID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcclxuXHJcbiAgLyoqIFdoZXRoZXIgdGhlcmUgaXMgYW4gaW4tcHJvZ3Jlc3MgYW5pbWF0aW9uLiAqL1xyXG4gIF9pc0FuaW1hdGluZyA9IGZhbHNlO1xyXG5cclxuICAvKiogVGV4dCBmb3IgdGhlIGNsb3NlIGJ1dHRvbi4gKi9cclxuICBfY2xvc2VCdXR0b25UZXh0OiBzdHJpbmc7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBjbG9zZSBidXR0b24gY3VycmVudGx5IGhhcyBmb2N1cy4gKi9cclxuICBfY2xvc2VCdXR0b25Gb2N1c2VkOiBib29sZWFuO1xyXG5cclxuICAvKiogUG9ydGFsIHdpdGggcHJvamVjdGVkIGFjdGlvbiBidXR0b25zLiAqL1xyXG4gIF9hY3Rpb25zUG9ydGFsOiBUZW1wbGF0ZVBvcnRhbCB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvKiogSWQgb2YgdGhlIGxhYmVsIGZvciB0aGUgYHJvbGU9XCJkaWFsb2dcImAgZWxlbWVudC4gKi9cclxuICBfZGlhbG9nTGFiZWxJZDogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgZ2V0IGlzVmlld01vbnRoKCk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCF0aGlzLl9jYWxlbmRhcigpIHx8IHRoaXMuX2NhbGVuZGFyKCkuY3VycmVudFZpZXcgPT0gbnVsbCkgcmV0dXJuIHRydWU7XHJcbiAgICByZXR1cm4gdGhpcy5fY2FsZW5kYXIoKS5jdXJyZW50VmlldyA9PSAnbW9udGgnO1xyXG4gIH1cclxuXHJcbiAgX21vZGVsVGltZTogRCB8IG51bGw7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgZWxlbWVudFJlZjogRWxlbWVudFJlZixcclxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcclxuICAgIHByaXZhdGUgX2dsb2JhbE1vZGVsOiBOZ3hNYXREYXRlU2VsZWN0aW9uTW9kZWw8UywgRD4sXHJcbiAgICBwcml2YXRlIF9kYXRlQWRhcHRlcjogTmd4TWF0RGF0ZUFkYXB0ZXI8RD4sXHJcbiAgICBAT3B0aW9uYWwoKVxyXG4gICAgQEluamVjdChOR1hfTUFUX0RBVEVfUkFOR0VfU0VMRUNUSU9OX1NUUkFURUdZKVxyXG4gICAgcHJpdmF0ZSBfcmFuZ2VTZWxlY3Rpb25TdHJhdGVneTogTmd4TWF0RGF0ZVJhbmdlU2VsZWN0aW9uU3RyYXRlZ3k8RD4sXHJcbiAgICBpbnRsOiBOZ3hNYXREYXRlcGlja2VySW50bCxcclxuICApIHtcclxuICAgIHN1cGVyKGVsZW1lbnRSZWYpO1xyXG4gICAgdGhpcy5fY2xvc2VCdXR0b25UZXh0ID0gaW50bC5jbG9zZUNhbGVuZGFyTGFiZWw7XHJcblxyXG4gICAgZWZmZWN0KCgpID0+IHtcclxuICAgICAgY29uc3QgY2FsZW5kYXIgPSB0aGlzLl9jYWxlbmRhcigpO1xyXG4gICAgICBpZiAoY2FsZW5kYXIpIHtcclxuICAgICAgICBjYWxlbmRhci5mb2N1c0FjdGl2ZUNlbGwoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpIHtcclxuICAgIHRoaXMuX2FuaW1hdGlvblN0YXRlID0gdGhpcy5kYXRlcGlja2VyLnRvdWNoVWkgPyAnZW50ZXItZGlhbG9nJyA6ICdlbnRlci1kcm9wZG93bic7XHJcbiAgfVxyXG5cclxuICBuZ0FmdGVyVmlld0luaXQoKSB7XHJcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcclxuICAgICAgdGhpcy5kYXRlcGlja2VyLnN0YXRlQ2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgICB9KSxcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMudW5zdWJzY3JpYmUoKTtcclxuICAgIHRoaXMuX2FuaW1hdGlvbkRvbmUuY29tcGxldGUoKTtcclxuICB9XHJcblxyXG4gIG9uVGltZUNoYW5nZWQoc2VsZWN0ZWREYXRlV2l0aFRpbWU6IEQgfCBudWxsKSB7XHJcbiAgICBjb25zdCB1c2VyRXZlbnQ6IE5neE1hdENhbGVuZGFyVXNlckV2ZW50PEQgfCBudWxsPiA9IHtcclxuICAgICAgdmFsdWU6IHNlbGVjdGVkRGF0ZVdpdGhUaW1lLFxyXG4gICAgICBldmVudDogbnVsbCxcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fdXBkYXRlVXNlclNlbGVjdGlvbldpdGhDYWxlbmRhclVzZXJFdmVudCh1c2VyRXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgX2hhbmRsZVVzZXJTZWxlY3Rpb24oZXZlbnQ6IE5neE1hdENhbGVuZGFyVXNlckV2ZW50PEQgfCBudWxsPikge1xyXG4gICAgdGhpcy5fdXBkYXRlVXNlclNlbGVjdGlvbldpdGhDYWxlbmRhclVzZXJFdmVudChldmVudCk7XHJcblxyXG4gICAgLy8gRGVsZWdhdGUgY2xvc2luZyB0aGUgb3ZlcmxheSB0byB0aGUgYWN0aW9ucy5cclxuICAgIGlmICh0aGlzLmRhdGVwaWNrZXIuaGlkZVRpbWUpIHtcclxuICAgICAgaWYgKCghdGhpcy5fbW9kZWwgfHwgdGhpcy5fbW9kZWwuaXNDb21wbGV0ZSgpKSAmJiAhdGhpcy5fYWN0aW9uc1BvcnRhbCkge1xyXG4gICAgICAgIHRoaXMuZGF0ZXBpY2tlci5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF91cGRhdGVVc2VyU2VsZWN0aW9uV2l0aENhbGVuZGFyVXNlckV2ZW50KGV2ZW50OiBOZ3hNYXRDYWxlbmRhclVzZXJFdmVudDxEIHwgbnVsbD4pIHtcclxuICAgIGNvbnN0IHNlbGVjdGlvbiA9IHRoaXMuX21vZGVsLnNlbGVjdGlvbjtcclxuICAgIGNvbnN0IHZhbHVlID0gZXZlbnQudmFsdWU7XHJcbiAgICBjb25zdCBpc1JhbmdlID0gc2VsZWN0aW9uIGluc3RhbmNlb2YgTmd4RGF0ZVJhbmdlO1xyXG5cclxuICAgIC8vIElmIHdlJ3JlIHNlbGVjdGluZyBhIHJhbmdlIGFuZCB3ZSBoYXZlIGEgc2VsZWN0aW9uIHN0cmF0ZWd5LCBhbHdheXMgcGFzcyB0aGUgdmFsdWUgdGhyb3VnaFxyXG4gICAgLy8gdGhlcmUuIE90aGVyd2lzZSBkb24ndCBhc3NpZ24gbnVsbCB2YWx1ZXMgdG8gdGhlIG1vZGVsLCB1bmxlc3Mgd2UncmUgc2VsZWN0aW5nIGEgcmFuZ2UuXHJcbiAgICAvLyBBIG51bGwgdmFsdWUgd2hlbiBwaWNraW5nIGEgcmFuZ2UgbWVhbnMgdGhhdCB0aGUgdXNlciBjYW5jZWxsZWQgdGhlIHNlbGVjdGlvbiAoZS5nLiBieVxyXG4gICAgLy8gcHJlc3NpbmcgZXNjYXBlKSwgd2hlcmVhcyB3aGVuIHNlbGVjdGluZyBhIHNpbmdsZSB2YWx1ZSBpdCBtZWFucyB0aGF0IHRoZSB2YWx1ZSBkaWRuJ3RcclxuICAgIC8vIGNoYW5nZS4gVGhpcyBpc24ndCB2ZXJ5IGludHVpdGl2ZSwgYnV0IGl0J3MgaGVyZSBmb3IgYmFja3dhcmRzLWNvbXBhdGliaWxpdHkuXHJcbiAgICBpZiAoaXNSYW5nZSAmJiB0aGlzLl9yYW5nZVNlbGVjdGlvblN0cmF0ZWd5KSB7XHJcbiAgICAgIGNvbnN0IG5ld1NlbGVjdGlvbiA9IHRoaXMuX3JhbmdlU2VsZWN0aW9uU3RyYXRlZ3kuc2VsZWN0aW9uRmluaXNoZWQoXHJcbiAgICAgICAgdmFsdWUsXHJcbiAgICAgICAgc2VsZWN0aW9uIGFzIHVua25vd24gYXMgTmd4RGF0ZVJhbmdlPEQ+LFxyXG4gICAgICAgIGV2ZW50LmV2ZW50LFxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLl9tb2RlbC51cGRhdGVTZWxlY3Rpb24obmV3U2VsZWN0aW9uIGFzIHVua25vd24gYXMgUywgdGhpcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBpc1NhbWVUaW1lID0gdGhpcy5fZGF0ZUFkYXB0ZXIuaXNTYW1lVGltZShzZWxlY3Rpb24gYXMgdW5rbm93biBhcyBELCB2YWx1ZSk7XHJcbiAgICAgIGNvbnN0IGlzU2FtZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5zYW1lRGF0ZSh2YWx1ZSwgc2VsZWN0aW9uIGFzIHVua25vd24gYXMgRCk7XHJcbiAgICAgIGNvbnN0IGlzU2FtZSA9IGlzU2FtZURhdGUgJiYgaXNTYW1lVGltZTtcclxuXHJcbiAgICAgIGlmICh2YWx1ZSAmJiAoaXNSYW5nZSB8fCAhaXNTYW1lKSkge1xyXG4gICAgICAgIHRoaXMuX21vZGVsLmFkZCh2YWx1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9oYW5kbGVVc2VyRHJhZ0Ryb3AoZXZlbnQ6IE5neE1hdENhbGVuZGFyVXNlckV2ZW50PE5neERhdGVSYW5nZTxEPj4pIHtcclxuICAgIHRoaXMuX21vZGVsLnVwZGF0ZVNlbGVjdGlvbihldmVudC52YWx1ZSBhcyB1bmtub3duIGFzIFMsIHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgX3N0YXJ0RXhpdEFuaW1hdGlvbigpIHtcclxuICAgIHRoaXMuX2FuaW1hdGlvblN0YXRlID0gJ3ZvaWQnO1xyXG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XHJcbiAgfVxyXG5cclxuICBfaGFuZGxlQW5pbWF0aW9uRXZlbnQoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KSB7XHJcbiAgICB0aGlzLl9pc0FuaW1hdGluZyA9IGV2ZW50LnBoYXNlTmFtZSA9PT0gJ3N0YXJ0JztcclxuXHJcbiAgICBpZiAoIXRoaXMuX2lzQW5pbWF0aW5nKSB7XHJcbiAgICAgIHRoaXMuX2FuaW1hdGlvbkRvbmUubmV4dCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX2dldFNlbGVjdGVkKCkge1xyXG4gICAgdGhpcy5fbW9kZWxUaW1lID0gdGhpcy5fbW9kZWwuc2VsZWN0aW9uIGFzIHVua25vd24gYXMgRDtcclxuICAgIHJldHVybiB0aGlzLl9tb2RlbC5zZWxlY3Rpb24gYXMgdW5rbm93biBhcyBEIHwgTmd4RGF0ZVJhbmdlPEQ+IHwgbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKiBBcHBsaWVzIHRoZSBjdXJyZW50IHBlbmRpbmcgc2VsZWN0aW9uIHRvIHRoZSBnbG9iYWwgbW9kZWwuICovXHJcbiAgX2FwcGx5UGVuZGluZ1NlbGVjdGlvbigpIHtcclxuICAgIGlmICh0aGlzLl9tb2RlbCAhPT0gdGhpcy5fZ2xvYmFsTW9kZWwpIHtcclxuICAgICAgdGhpcy5fZ2xvYmFsTW9kZWwudXBkYXRlU2VsZWN0aW9uKHRoaXMuX21vZGVsLnNlbGVjdGlvbiwgdGhpcyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBc3NpZ25zIGEgbmV3IHBvcnRhbCBjb250YWluaW5nIHRoZSBkYXRlcGlja2VyIGFjdGlvbnMuXHJcbiAgICogQHBhcmFtIHBvcnRhbCBQb3J0YWwgd2l0aCB0aGUgYWN0aW9ucyB0byBiZSBhc3NpZ25lZC5cclxuICAgKiBAcGFyYW0gZm9yY2VSZXJlbmRlciBXaGV0aGVyIGEgcmUtcmVuZGVyIG9mIHRoZSBwb3J0YWwgc2hvdWxkIGJlIHRyaWdnZXJlZC4gVGhpcyBpc24ndFxyXG4gICAqIG5lY2Vzc2FyeSBpZiB0aGUgcG9ydGFsIGlzIGFzc2lnbmVkIGR1cmluZyBpbml0aWFsaXphdGlvbiwgYnV0IGl0IG1heSBiZSByZXF1aXJlZCBpZiBpdCdzXHJcbiAgICogYWRkZWQgYXQgYSBsYXRlciBwb2ludC5cclxuICAgKi9cclxuICBfYXNzaWduQWN0aW9ucyhwb3J0YWw6IFRlbXBsYXRlUG9ydGFsPGFueT4gfCBudWxsLCBmb3JjZVJlcmVuZGVyOiBib29sZWFuKSB7XHJcbiAgICAvLyBJZiB3ZSBoYXZlIGFjdGlvbnMsIGNsb25lIHRoZSBtb2RlbCBzbyB0aGF0IHdlIGhhdmUgdGhlIGFiaWxpdHkgdG8gY2FuY2VsIHRoZSBzZWxlY3Rpb24sXHJcbiAgICAvLyBvdGhlcndpc2UgdXBkYXRlIHRoZSBnbG9iYWwgbW9kZWwgZGlyZWN0bHkuIE5vdGUgdGhhdCB3ZSB3YW50IHRvIGFzc2lnbiB0aGlzIGFzIHNvb24gYXNcclxuICAgIC8vIHBvc3NpYmxlLCBidXQgYF9hY3Rpb25zUG9ydGFsYCBpc24ndCBhdmFpbGFibGUgaW4gdGhlIGNvbnN0cnVjdG9yIHNvIHdlIGRvIGl0IGluIGBuZ09uSW5pdGAuXHJcbiAgICB0aGlzLl9tb2RlbCA9IHBvcnRhbCA/IHRoaXMuX2dsb2JhbE1vZGVsLmNsb25lKCkgOiB0aGlzLl9nbG9iYWxNb2RlbDtcclxuICAgIHRoaXMuX2FjdGlvbnNQb3J0YWwgPSBwb3J0YWw7XHJcblxyXG4gICAgaWYgKGZvcmNlUmVyZW5kZXIpIHtcclxuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqIEZvcm0gY29udHJvbCB0aGF0IGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggYSBkYXRlcGlja2VyLiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIE5neE1hdERhdGVwaWNrZXJDb250cm9sPEQ+IHtcclxuICBnZXRTdGFydFZhbHVlKCk6IEQgfCBudWxsO1xyXG4gIGdldFRoZW1lUGFsZXR0ZSgpOiBUaGVtZVBhbGV0dGU7XHJcbiAgbWluOiBEIHwgbnVsbDtcclxuICBtYXg6IEQgfCBudWxsO1xyXG4gIGRpc2FibGVkOiBib29sZWFuO1xyXG4gIGRhdGVGaWx0ZXI6IE5neERhdGVGaWx0ZXJGbjxEPjtcclxuICBnZXRDb25uZWN0ZWRPdmVybGF5T3JpZ2luKCk6IEVsZW1lbnRSZWY7XHJcbiAgZ2V0T3ZlcmxheUxhYmVsSWQoKTogc3RyaW5nIHwgbnVsbDtcclxuICBzdGF0ZUNoYW5nZXM6IE9ic2VydmFibGU8dm9pZD47XHJcbn1cclxuXHJcbi8qKiBBIGRhdGVwaWNrZXIgdGhhdCBjYW4gYmUgYXR0YWNoZWQgdG8gYSB7QGxpbmsgTmd4TWF0RGF0ZXBpY2tlckNvbnRyb2x9LiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIE5neE1hdERhdGVwaWNrZXJQYW5lbDxcclxuICBDIGV4dGVuZHMgTmd4TWF0RGF0ZXBpY2tlckNvbnRyb2w8RD4sXHJcbiAgUyxcclxuICBEID0gTmd4RXh0cmFjdERhdGVUeXBlRnJvbVNlbGVjdGlvbjxTPixcclxuPiB7XHJcbiAgLyoqIFN0cmVhbSB0aGF0IGVtaXRzIHdoZW5ldmVyIHRoZSBkYXRlIHBpY2tlciBpcyBjbG9zZWQuICovXHJcbiAgY2xvc2VkU3RyZWFtOiBFdmVudEVtaXR0ZXI8dm9pZD47XHJcbiAgLyoqIENvbG9yIHBhbGV0dGUgdG8gdXNlIG9uIHRoZSBkYXRlcGlja2VyJ3MgY2FsZW5kYXIuICovXHJcbiAgY29sb3I6IFRoZW1lUGFsZXR0ZTtcclxuICAvKiogVGhlIGlucHV0IGVsZW1lbnQgdGhlIGRhdGVwaWNrZXIgaXMgYXNzb2NpYXRlZCB3aXRoLiAqL1xyXG4gIGRhdGVwaWNrZXJJbnB1dDogQztcclxuICAvKiogV2hldGhlciB0aGUgZGF0ZXBpY2tlciBwb3AtdXAgc2hvdWxkIGJlIGRpc2FibGVkLiAqL1xyXG4gIGRpc2FibGVkOiBib29sZWFuO1xyXG4gIC8qKiBUaGUgaWQgZm9yIHRoZSBkYXRlcGlja2VyJ3MgY2FsZW5kYXIuICovXHJcbiAgaWQ6IHN0cmluZztcclxuICAvKiogV2hldGhlciB0aGUgZGF0ZXBpY2tlciBpcyBvcGVuLiAqL1xyXG4gIG9wZW5lZDogYm9vbGVhbjtcclxuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbmV2ZXIgdGhlIGRhdGUgcGlja2VyIGlzIG9wZW5lZC4gKi9cclxuICBvcGVuZWRTdHJlYW06IEV2ZW50RW1pdHRlcjx2b2lkPjtcclxuICAvKiogRW1pdHMgd2hlbiB0aGUgZGF0ZXBpY2tlcidzIHN0YXRlIGNoYW5nZXMuICovXHJcbiAgc3RhdGVDaGFuZ2VzOiBTdWJqZWN0PHZvaWQ+O1xyXG4gIC8qKiBPcGVucyB0aGUgZGF0ZXBpY2tlci4gKi9cclxuICBvcGVuKCk6IHZvaWQ7XHJcbiAgLyoqIFJlZ2lzdGVyIGFuIGlucHV0IHdpdGggdGhlIGRhdGVwaWNrZXIuICovXHJcbiAgcmVnaXN0ZXJJbnB1dChpbnB1dDogQyk6IE5neE1hdERhdGVTZWxlY3Rpb25Nb2RlbDxTLCBEPjtcclxufVxyXG5cclxuLyoqIEJhc2UgY2xhc3MgZm9yIGEgZGF0ZXBpY2tlci4gKi9cclxuQERpcmVjdGl2ZSgpXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZ3hNYXREYXRlcGlja2VyQmFzZTxcclxuICAgIEMgZXh0ZW5kcyBOZ3hNYXREYXRlcGlja2VyQ29udHJvbDxEPixcclxuICAgIFMsXHJcbiAgICBEID0gTmd4RXh0cmFjdERhdGVUeXBlRnJvbVNlbGVjdGlvbjxTPixcclxuICA+XHJcbiAgaW1wbGVtZW50cyBOZ3hNYXREYXRlcGlja2VyUGFuZWw8QywgUywgRD4sIE9uRGVzdHJveSwgT25DaGFuZ2VzXHJcbntcclxuICBwcml2YXRlIF9zY3JvbGxTdHJhdGVneTogKCkgPT4gU2Nyb2xsU3RyYXRlZ3k7XHJcbiAgcHJpdmF0ZSBfaW5wdXRTdGF0ZUNoYW5nZXMgPSBTdWJzY3JpcHRpb24uRU1QVFk7XHJcbiAgcHJpdmF0ZSBfZG9jdW1lbnQgPSBpbmplY3QoRE9DVU1FTlQpO1xyXG5cclxuICAvKiogQW4gaW5wdXQgaW5kaWNhdGluZyB0aGUgdHlwZSBvZiB0aGUgY3VzdG9tIGhlYWRlciBjb21wb25lbnQgZm9yIHRoZSBjYWxlbmRhciwgaWYgc2V0LiAqL1xyXG4gIGNhbGVuZGFySGVhZGVyQ29tcG9uZW50ID0gaW5wdXQ8Q29tcG9uZW50VHlwZTxhbnk+PigpO1xyXG5cclxuICAvKiogVGhlIGRhdGUgdG8gb3BlbiB0aGUgY2FsZW5kYXIgdG8gaW5pdGlhbGx5LiAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IHN0YXJ0QXQoKTogRCB8IG51bGwge1xyXG4gICAgLy8gSWYgYW4gZXhwbGljaXQgc3RhcnRBdCBpcyBzZXQgd2Ugc3RhcnQgdGhlcmUsIG90aGVyd2lzZSB3ZSBzdGFydCBhdCB3aGF0ZXZlciB0aGUgY3VycmVudGx5XHJcbiAgICAvLyBzZWxlY3RlZCB2YWx1ZSBpcy5cclxuICAgIHJldHVybiB0aGlzLl9zdGFydEF0IHx8ICh0aGlzLmRhdGVwaWNrZXJJbnB1dCA/IHRoaXMuZGF0ZXBpY2tlcklucHV0LmdldFN0YXJ0VmFsdWUoKSA6IG51bGwpO1xyXG4gIH1cclxuICBzZXQgc3RhcnRBdCh2YWx1ZTogRCB8IG51bGwpIHtcclxuICAgIHRoaXMuX3N0YXJ0QXQgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBfc3RhcnRBdDogRCB8IG51bGw7XHJcblxyXG4gIC8qKiBUaGUgdmlldyB0aGF0IHRoZSBjYWxlbmRhciBzaG91bGQgc3RhcnQgaW4uICovXHJcbiAgc3RhcnRWaWV3ID0gaW5wdXQ8J21vbnRoJyB8ICd5ZWFyJyB8ICdtdWx0aS15ZWFyJz4oJ21vbnRoJyk7XHJcblxyXG4gIC8qKiBDb2xvciBwYWxldHRlIHRvIHVzZSBvbiB0aGUgZGF0ZXBpY2tlcidzIGNhbGVuZGFyLiAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IGNvbG9yKCk6IFRoZW1lUGFsZXR0ZSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICB0aGlzLl9jb2xvciB8fCAodGhpcy5kYXRlcGlja2VySW5wdXQgPyB0aGlzLmRhdGVwaWNrZXJJbnB1dC5nZXRUaGVtZVBhbGV0dGUoKSA6IHVuZGVmaW5lZClcclxuICAgICk7XHJcbiAgfVxyXG4gIHNldCBjb2xvcih2YWx1ZTogVGhlbWVQYWxldHRlKSB7XHJcbiAgICB0aGlzLl9jb2xvciA9IHZhbHVlO1xyXG4gIH1cclxuICBfY29sb3I6IFRoZW1lUGFsZXR0ZTtcclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGUgY2FsZW5kYXIgVUkgaXMgaW4gdG91Y2ggbW9kZS4gSW4gdG91Y2ggbW9kZSB0aGUgY2FsZW5kYXIgb3BlbnMgaW4gYSBkaWFsb2cgcmF0aGVyXHJcbiAgICogdGhhbiBhIGRyb3Bkb3duIGFuZCBlbGVtZW50cyBoYXZlIG1vcmUgcGFkZGluZyB0byBhbGxvdyBmb3IgYmlnZ2VyIHRvdWNoIHRhcmdldHMuXHJcbiAgICovXHJcbiAgQElucHV0KClcclxuICBnZXQgdG91Y2hVaSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl90b3VjaFVpO1xyXG4gIH1cclxuICBzZXQgdG91Y2hVaSh2YWx1ZTogQm9vbGVhbklucHV0KSB7XHJcbiAgICB0aGlzLl90b3VjaFVpID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBfdG91Y2hVaSA9IGZhbHNlO1xyXG5cclxuICBASW5wdXQoKVxyXG4gIGdldCBoaWRlVGltZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9oaWRlVGltZTtcclxuICB9XHJcbiAgc2V0IGhpZGVUaW1lKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLl9oaWRlVGltZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XHJcbiAgfVxyXG4gIHB1YmxpYyBfaGlkZVRpbWUgPSBmYWxzZTtcclxuXHJcbiAgLyoqIFdoZXRoZXIgdGhlIGRhdGVwaWNrZXIgcG9wLXVwIHNob3VsZCBiZSBkaXNhYmxlZC4gKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZCA9PT0gdW5kZWZpbmVkICYmIHRoaXMuZGF0ZXBpY2tlcklucHV0XHJcbiAgICAgID8gdGhpcy5kYXRlcGlja2VySW5wdXQuZGlzYWJsZWRcclxuICAgICAgOiAhIXRoaXMuX2Rpc2FibGVkO1xyXG4gIH1cclxuICBzZXQgZGlzYWJsZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xyXG4gICAgY29uc3QgbmV3VmFsdWUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xyXG5cclxuICAgIGlmIChuZXdWYWx1ZSAhPT0gdGhpcy5fZGlzYWJsZWQpIHtcclxuICAgICAgdGhpcy5fZGlzYWJsZWQgPSBuZXdWYWx1ZTtcclxuICAgICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCh1bmRlZmluZWQpO1xyXG4gICAgfVxyXG4gIH1cclxuICBwdWJsaWMgX2Rpc2FibGVkOiBib29sZWFuO1xyXG5cclxuICAvKiogUHJlZmVycmVkIHBvc2l0aW9uIG9mIHRoZSBkYXRlcGlja2VyIGluIHRoZSBYIGF4aXMuICovXHJcbiAgcmVhZG9ubHkgeFBvc2l0aW9uID0gaW5wdXQ8Tmd4RGF0ZXBpY2tlckRyb3Bkb3duUG9zaXRpb25YPignc3RhcnQnKTtcclxuXHJcbiAgLyoqIFByZWZlcnJlZCBwb3NpdGlvbiBvZiB0aGUgZGF0ZXBpY2tlciBpbiB0aGUgWSBheGlzLiAqL1xyXG4gIHJlYWRvbmx5IHlQb3NpdGlvbiA9IGlucHV0PE5neERhdGVwaWNrZXJEcm9wZG93blBvc2l0aW9uWT4oJ2JlbG93Jyk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdG8gcmVzdG9yZSBmb2N1cyB0byB0aGUgcHJldmlvdXNseS1mb2N1c2VkIGVsZW1lbnQgd2hlbiB0aGUgY2FsZW5kYXIgaXMgY2xvc2VkLlxyXG4gICAqIE5vdGUgdGhhdCBhdXRvbWF0aWMgZm9jdXMgcmVzdG9yYXRpb24gaXMgYW4gYWNjZXNzaWJpbGl0eSBmZWF0dXJlIGFuZCBpdCBpcyByZWNvbW1lbmRlZCB0aGF0XHJcbiAgICogeW91IHByb3ZpZGUgeW91ciBvd24gZXF1aXZhbGVudCwgaWYgeW91IGRlY2lkZSB0byB0dXJuIGl0IG9mZi5cclxuICAgKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCByZXN0b3JlRm9jdXMoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fcmVzdG9yZUZvY3VzO1xyXG4gIH1cclxuICBzZXQgcmVzdG9yZUZvY3VzKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcclxuICAgIHRoaXMuX3Jlc3RvcmVGb2N1cyA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgX3Jlc3RvcmVGb2N1cyA9IHRydWU7XHJcblxyXG4gIC8qKlxyXG4gICAqIEVtaXRzIHNlbGVjdGVkIHllYXIgaW4gbXVsdGl5ZWFyIHZpZXcuXHJcbiAgICogVGhpcyBkb2Vzbid0IGltcGx5IGEgY2hhbmdlIG9uIHRoZSBzZWxlY3RlZCBkYXRlLlxyXG4gICAqL1xyXG4gIHJlYWRvbmx5IHllYXJTZWxlY3RlZCA9IG91dHB1dDxEPigpO1xyXG5cclxuICAvKipcclxuICAgKiBFbWl0cyBzZWxlY3RlZCBtb250aCBpbiB5ZWFyIHZpZXcuXHJcbiAgICogVGhpcyBkb2Vzbid0IGltcGx5IGEgY2hhbmdlIG9uIHRoZSBzZWxlY3RlZCBkYXRlLlxyXG4gICAqL1xyXG4gIHJlYWRvbmx5IG1vbnRoU2VsZWN0ZWQgPSBvdXRwdXQ8RD4oKTtcclxuXHJcbiAgLyoqXHJcbiAgICogRW1pdHMgd2hlbiB0aGUgY3VycmVudCB2aWV3IGNoYW5nZXMuXHJcbiAgICovXHJcbiAgcmVhZG9ubHkgdmlld0NoYW5nZWQgPSBvdXRwdXQ8Tmd4TWF0Q2FsZW5kYXJWaWV3PigpO1xyXG5cclxuICAvKiogRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBhZGQgY3VzdG9tIENTUyBjbGFzc2VzIHRvIGRhdGVzLiAqL1xyXG4gIHJlYWRvbmx5IGRhdGVDbGFzcyA9IGlucHV0PE5neE1hdENhbGVuZGFyQ2VsbENsYXNzRnVuY3Rpb248RD4+KCk7XHJcblxyXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBkYXRlcGlja2VyIGhhcyBiZWVuIG9wZW5lZC4gKi9cclxuICBAT3V0cHV0KCdvcGVuZWQnKSByZWFkb25seSBvcGVuZWRTdHJlYW0gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XHJcblxyXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBkYXRlcGlja2VyIGhhcyBiZWVuIGNsb3NlZC4gKi9cclxuICBAT3V0cHV0KCdjbG9zZWQnKSByZWFkb25seSBjbG9zZWRTdHJlYW0gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIENsYXNzZXMgdG8gYmUgcGFzc2VkIHRvIHRoZSBkYXRlIHBpY2tlciBwYW5lbC5cclxuICAgKiBTdXBwb3J0cyBzdHJpbmcgYW5kIHN0cmluZyBhcnJheSB2YWx1ZXMsIHNpbWlsYXIgdG8gYG5nQ2xhc3NgLlxyXG4gICAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IHBhbmVsQ2xhc3MoKTogc3RyaW5nIHwgc3RyaW5nW10ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3BhbmVsQ2xhc3M7XHJcbiAgfVxyXG4gIHNldCBwYW5lbENsYXNzKHZhbHVlOiBzdHJpbmcgfCBzdHJpbmdbXSkge1xyXG4gICAgdGhpcy5fcGFuZWxDbGFzcyA9IGNvZXJjZVN0cmluZ0FycmF5KHZhbHVlKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBfcGFuZWxDbGFzczogc3RyaW5nW107XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBjYWxlbmRhciBpcyBvcGVuLiAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IG9wZW5lZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9vcGVuZWQ7XHJcbiAgfVxyXG4gIHNldCBvcGVuZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xyXG4gICAgY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKSA/IHRoaXMub3BlbigpIDogdGhpcy5jbG9zZSgpO1xyXG4gIH1cclxuICBwcml2YXRlIF9vcGVuZWQgPSBmYWxzZTtcclxuXHJcbiAgLyoqIFdoZXRoZXIgdGhlIHRpbWVwaWNrZXInc3Bpbm5lcnMgaXMgc2hvd24uICovXHJcbiAgQElucHV0KClcclxuICBnZXQgc2hvd1NwaW5uZXJzKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Nob3dTcGlubmVycztcclxuICB9XHJcbiAgc2V0IHNob3dTcGlubmVycyh2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgdGhpcy5fc2hvd1NwaW5uZXJzID0gdmFsdWU7XHJcbiAgfVxyXG4gIHB1YmxpYyBfc2hvd1NwaW5uZXJzID0gdHJ1ZTtcclxuXHJcbiAgLyoqIFdoZXRoZXIgdGhlIHNlY29uZCBwYXJ0IGlzIGRpc2FibGVkLiAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IHNob3dTZWNvbmRzKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Nob3dTZWNvbmRzO1xyXG4gIH1cclxuICBzZXQgc2hvd1NlY29uZHModmFsdWU6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuX3Nob3dTZWNvbmRzID0gdmFsdWU7XHJcbiAgfVxyXG4gIHB1YmxpYyBfc2hvd1NlY29uZHMgPSBmYWxzZTtcclxuXHJcbiAgLyoqIFN0ZXAgaG91ciAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IHN0ZXBIb3VyKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3RlcEhvdXI7XHJcbiAgfVxyXG4gIHNldCBzdGVwSG91cih2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9zdGVwSG91ciA9IHZhbHVlO1xyXG4gIH1cclxuICBwdWJsaWMgX3N0ZXBIb3VyOiBudW1iZXIgPSBERUZBVUxUX1NURVA7XHJcblxyXG4gIC8qKiBTdGVwIG1pbnV0ZSAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IHN0ZXBNaW51dGUoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9zdGVwTWludXRlO1xyXG4gIH1cclxuICBzZXQgc3RlcE1pbnV0ZSh2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9zdGVwTWludXRlID0gdmFsdWU7XHJcbiAgfVxyXG4gIHB1YmxpYyBfc3RlcE1pbnV0ZTogbnVtYmVyID0gREVGQVVMVF9TVEVQO1xyXG5cclxuICAvKiogU3RlcCBzZWNvbmQgKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCBzdGVwU2Vjb25kKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3RlcFNlY29uZDtcclxuICB9XHJcbiAgc2V0IHN0ZXBTZWNvbmQodmFsdWU6IG51bWJlcikge1xyXG4gICAgdGhpcy5fc3RlcFNlY29uZCA9IHZhbHVlO1xyXG4gIH1cclxuICBwdWJsaWMgX3N0ZXBTZWNvbmQ6IG51bWJlciA9IERFRkFVTFRfU1RFUDtcclxuXHJcbiAgLyoqIEVuYWJsZSBtZXJpZGlhbiAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IGVuYWJsZU1lcmlkaWFuKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2VuYWJsZU1lcmlkaWFuO1xyXG4gIH1cclxuICBzZXQgZW5hYmxlTWVyaWRpYW4odmFsdWU6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuX2VuYWJsZU1lcmlkaWFuID0gdmFsdWU7XHJcbiAgfVxyXG4gIHB1YmxpYyBfZW5hYmxlTWVyaWRpYW46IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgLyoqIGRpc2FibGUgbWludXRlICovXHJcbiAgQElucHV0KClcclxuICBnZXQgZGlzYWJsZU1pbnV0ZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlTWludXRlO1xyXG4gIH1cclxuICBzZXQgZGlzYWJsZU1pbnV0ZSh2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgdGhpcy5fZGlzYWJsZU1pbnV0ZSA9IHZhbHVlO1xyXG4gIH1cclxuICBwdWJsaWMgX2Rpc2FibGVNaW51dGU6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBTdGVwIHNlY29uZCAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IGRlZmF1bHRUaW1lKCk6IG51bWJlcltdIHtcclxuICAgIHJldHVybiB0aGlzLl9kZWZhdWx0VGltZTtcclxuICB9XHJcbiAgc2V0IGRlZmF1bHRUaW1lKHZhbHVlOiBudW1iZXJbXSkge1xyXG4gICAgdGhpcy5fZGVmYXVsdFRpbWUgPSB2YWx1ZTtcclxuICB9XHJcbiAgcHVibGljIF9kZWZhdWx0VGltZTogbnVtYmVyW107XHJcblxyXG4gIC8qKiBUaGUgaWQgZm9yIHRoZSBkYXRlcGlja2VyIGNhbGVuZGFyLiAqL1xyXG4gIGlkOiBzdHJpbmcgPSBgbWF0LWRhdGVwaWNrZXItJHtkYXRlcGlja2VyVWlkKyt9YDtcclxuXHJcbiAgLyoqIFRoZSBtaW5pbXVtIHNlbGVjdGFibGUgZGF0ZS4gKi9cclxuICBfZ2V0TWluRGF0ZSgpOiBEIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5kYXRlcGlja2VySW5wdXQgJiYgdGhpcy5kYXRlcGlja2VySW5wdXQubWluO1xyXG4gIH1cclxuXHJcbiAgLyoqIFRoZSBtYXhpbXVtIHNlbGVjdGFibGUgZGF0ZS4gKi9cclxuICBfZ2V0TWF4RGF0ZSgpOiBEIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5kYXRlcGlja2VySW5wdXQgJiYgdGhpcy5kYXRlcGlja2VySW5wdXQubWF4O1xyXG4gIH1cclxuXHJcbiAgX2dldERhdGVGaWx0ZXIoKTogTmd4RGF0ZUZpbHRlckZuPEQ+IHtcclxuICAgIHJldHVybiB0aGlzLmRhdGVwaWNrZXJJbnB1dCAmJiB0aGlzLmRhdGVwaWNrZXJJbnB1dC5kYXRlRmlsdGVyO1xyXG4gIH1cclxuXHJcbiAgLyoqIEEgcmVmZXJlbmNlIHRvIHRoZSBvdmVybGF5IGludG8gd2hpY2ggd2UndmUgcmVuZGVyZWQgdGhlIGNhbGVuZGFyLiAqL1xyXG4gIHByaXZhdGUgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWYgfCBudWxsO1xyXG5cclxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgcmVuZGVyZWQgaW4gdGhlIG92ZXJsYXkuICovXHJcbiAgcHJpdmF0ZSBfY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8Tmd4TWF0RGF0ZXBpY2tlckNvbnRlbnQ8UywgRD4+IHwgbnVsbDtcclxuXHJcbiAgLyoqIFRoZSBlbGVtZW50IHRoYXQgd2FzIGZvY3VzZWQgYmVmb3JlIHRoZSBkYXRlcGlja2VyIHdhcyBvcGVuZWQuICovXHJcbiAgcHJpdmF0ZSBfZm9jdXNlZEVsZW1lbnRCZWZvcmVPcGVuOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvKiogVW5pcXVlIGNsYXNzIHRoYXQgd2lsbCBiZSBhZGRlZCB0byB0aGUgYmFja2Ryb3Agc28gdGhhdCB0aGUgdGVzdCBoYXJuZXNzZXMgY2FuIGxvb2sgaXQgdXAuICovXHJcbiAgcHJpdmF0ZSBfYmFja2Ryb3BIYXJuZXNzQ2xhc3MgPSBgJHt0aGlzLmlkfS1iYWNrZHJvcGA7XHJcblxyXG4gIC8qKiBDdXJyZW50bHktcmVnaXN0ZXJlZCBhY3Rpb25zIHBvcnRhbC4gKi9cclxuICBwcml2YXRlIF9hY3Rpb25zUG9ydGFsOiBUZW1wbGF0ZVBvcnRhbCB8IG51bGw7XHJcblxyXG4gIC8qKiBUaGUgaW5wdXQgZWxlbWVudCB0aGlzIGRhdGVwaWNrZXIgaXMgYXNzb2NpYXRlZCB3aXRoLiAqL1xyXG4gIGRhdGVwaWNrZXJJbnB1dDogQztcclxuXHJcbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGRhdGVwaWNrZXIncyBzdGF0ZSBjaGFuZ2VzLiAqL1xyXG4gIHJlYWRvbmx5IHN0YXRlQ2hhbmdlcyA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBfb3ZlcmxheTogT3ZlcmxheSxcclxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxyXG4gICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcclxuICAgIEBJbmplY3QoTkdYX01BVF9EQVRFUElDS0VSX1NDUk9MTF9TVFJBVEVHWSkgc2Nyb2xsU3RyYXRlZ3k6IGFueSxcclxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RhdGVBZGFwdGVyOiBOZ3hNYXREYXRlQWRhcHRlcjxEPixcclxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uYWxpdHksXHJcbiAgICBwcml2YXRlIF9tb2RlbDogTmd4TWF0RGF0ZVNlbGVjdGlvbk1vZGVsPFMsIEQ+LFxyXG4gICkge1xyXG4gICAgaWYgKCF0aGlzLl9kYXRlQWRhcHRlcikge1xyXG4gICAgICB0aHJvdyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcignTmd4TWF0RGF0ZUFkYXB0ZXInKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9zY3JvbGxTdHJhdGVneSA9IHNjcm9sbFN0cmF0ZWd5O1xyXG4gIH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xyXG4gICAgY29uc3QgcG9zaXRpb25DaGFuZ2UgPSBjaGFuZ2VzWyd4UG9zaXRpb24nXSB8fCBjaGFuZ2VzWyd5UG9zaXRpb24nXTtcclxuXHJcbiAgICBpZiAocG9zaXRpb25DaGFuZ2UgJiYgIXBvc2l0aW9uQ2hhbmdlLmZpcnN0Q2hhbmdlICYmIHRoaXMuX292ZXJsYXlSZWYpIHtcclxuICAgICAgY29uc3QgcG9zaXRpb25TdHJhdGVneSA9IHRoaXMuX292ZXJsYXlSZWYuZ2V0Q29uZmlnKCkucG9zaXRpb25TdHJhdGVneTtcclxuXHJcbiAgICAgIGlmIChwb3NpdGlvblN0cmF0ZWd5IGluc3RhbmNlb2YgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5KSB7XHJcbiAgICAgICAgdGhpcy5fc2V0Q29ubmVjdGVkUG9zaXRpb25zKHBvc2l0aW9uU3RyYXRlZ3kpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5vcGVuZWQpIHtcclxuICAgICAgICAgIHRoaXMuX292ZXJsYXlSZWYudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KHVuZGVmaW5lZCk7XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuX2Rlc3Ryb3lPdmVybGF5KCk7XHJcbiAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICB0aGlzLl9pbnB1dFN0YXRlQ2hhbmdlcy51bnN1YnNjcmliZSgpO1xyXG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMuY29tcGxldGUoKTtcclxuICB9XHJcblxyXG4gIC8qKiBTZWxlY3RzIHRoZSBnaXZlbiBkYXRlICovXHJcbiAgc2VsZWN0KGRhdGU6IEQpOiB2b2lkIHtcclxuICAgIHRoaXMuX21vZGVsLmFkZChkYXRlKTtcclxuICB9XHJcblxyXG4gIC8qKiBFbWl0cyB0aGUgc2VsZWN0ZWQgeWVhciBpbiBtdWx0aXllYXIgdmlldyAqL1xyXG4gIF9zZWxlY3RZZWFyKG5vcm1hbGl6ZWRZZWFyOiBEKTogdm9pZCB7XHJcbiAgICB0aGlzLnllYXJTZWxlY3RlZC5lbWl0KG5vcm1hbGl6ZWRZZWFyKTtcclxuICB9XHJcblxyXG4gIC8qKiBFbWl0cyBzZWxlY3RlZCBtb250aCBpbiB5ZWFyIHZpZXcgKi9cclxuICBfc2VsZWN0TW9udGgobm9ybWFsaXplZE1vbnRoOiBEKTogdm9pZCB7XHJcbiAgICB0aGlzLm1vbnRoU2VsZWN0ZWQuZW1pdChub3JtYWxpemVkTW9udGgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIEVtaXRzIGNoYW5nZWQgdmlldyAqL1xyXG4gIF92aWV3Q2hhbmdlZCh2aWV3OiBOZ3hNYXRDYWxlbmRhclZpZXcpOiB2b2lkIHtcclxuICAgIHRoaXMudmlld0NoYW5nZWQuZW1pdCh2aWV3KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlZ2lzdGVyIGFuIGlucHV0IHdpdGggdGhpcyBkYXRlcGlja2VyLlxyXG4gICAqIEBwYXJhbSBpbnB1dCBUaGUgZGF0ZXBpY2tlciBpbnB1dCB0byByZWdpc3RlciB3aXRoIHRoaXMgZGF0ZXBpY2tlci5cclxuICAgKiBAcmV0dXJucyBTZWxlY3Rpb24gbW9kZWwgdGhhdCB0aGUgaW5wdXQgc2hvdWxkIGhvb2sgaXRzZWxmIHVwIHRvLlxyXG4gICAqL1xyXG4gIHJlZ2lzdGVySW5wdXQoaW5wdXQ6IEMpOiBOZ3hNYXREYXRlU2VsZWN0aW9uTW9kZWw8UywgRD4ge1xyXG4gICAgaWYgKHRoaXMuZGF0ZXBpY2tlcklucHV0KSB7XHJcbiAgICAgIHRocm93IEVycm9yKCdBIE1hdERhdGVwaWNrZXIgY2FuIG9ubHkgYmUgYXNzb2NpYXRlZCB3aXRoIGEgc2luZ2xlIGlucHV0LicpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5faW5wdXRTdGF0ZUNoYW5nZXMudW5zdWJzY3JpYmUoKTtcclxuICAgIHRoaXMuZGF0ZXBpY2tlcklucHV0ID0gaW5wdXQ7XHJcbiAgICB0aGlzLl9pbnB1dFN0YXRlQ2hhbmdlcyA9IGlucHV0LnN0YXRlQ2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4gdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCh1bmRlZmluZWQpKTtcclxuICAgIHJldHVybiB0aGlzLl9tb2RlbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlZ2lzdGVycyBhIHBvcnRhbCBjb250YWluaW5nIGFjdGlvbiBidXR0b25zIHdpdGggdGhlIGRhdGVwaWNrZXIuXHJcbiAgICogQHBhcmFtIHBvcnRhbCBQb3J0YWwgdG8gYmUgcmVnaXN0ZXJlZC5cclxuICAgKi9cclxuICByZWdpc3RlckFjdGlvbnMocG9ydGFsOiBUZW1wbGF0ZVBvcnRhbCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuX2FjdGlvbnNQb3J0YWwpIHtcclxuICAgICAgdGhyb3cgRXJyb3IoJ0EgTWF0RGF0ZXBpY2tlciBjYW4gb25seSBiZSBhc3NvY2lhdGVkIHdpdGggYSBzaW5nbGUgYWN0aW9ucyByb3cuJyk7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9hY3Rpb25zUG9ydGFsID0gcG9ydGFsO1xyXG4gICAgdGhpcy5fY29tcG9uZW50UmVmPy5pbnN0YW5jZS5fYXNzaWduQWN0aW9ucyhwb3J0YWwsIHRydWUpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhIHBvcnRhbCBjb250YWluaW5nIGFjdGlvbiBidXR0b25zIGZyb20gdGhlIGRhdGVwaWNrZXIuXHJcbiAgICogQHBhcmFtIHBvcnRhbCBQb3J0YWwgdG8gYmUgcmVtb3ZlZC5cclxuICAgKi9cclxuICByZW1vdmVBY3Rpb25zKHBvcnRhbDogVGVtcGxhdGVQb3J0YWwpOiB2b2lkIHtcclxuICAgIGlmIChwb3J0YWwgPT09IHRoaXMuX2FjdGlvbnNQb3J0YWwpIHtcclxuICAgICAgdGhpcy5fYWN0aW9uc1BvcnRhbCA9IG51bGw7XHJcbiAgICAgIHRoaXMuX2NvbXBvbmVudFJlZj8uaW5zdGFuY2UuX2Fzc2lnbkFjdGlvbnMobnVsbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogT3BlbiB0aGUgY2FsZW5kYXIuICovXHJcbiAgb3BlbigpOiB2b2lkIHtcclxuICAgIC8vIFNraXAgcmVvcGVuaW5nIGlmIHRoZXJlJ3MgYW4gaW4tcHJvZ3Jlc3MgYW5pbWF0aW9uIHRvIGF2b2lkIG92ZXJsYXBwaW5nXHJcbiAgICAvLyBzZXF1ZW5jZXMgd2hpY2ggY2FuIGNhdXNlIFwiY2hhbmdlZCBhZnRlciBjaGVja2VkXCIgZXJyb3JzLiBTZWUgIzI1ODM3LlxyXG4gICAgaWYgKHRoaXMuX29wZW5lZCB8fCB0aGlzLmRpc2FibGVkIHx8IHRoaXMuX2NvbXBvbmVudFJlZj8uaW5zdGFuY2UuX2lzQW5pbWF0aW5nKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuZGF0ZXBpY2tlcklucHV0KSB7XHJcbiAgICAgIHRocm93IEVycm9yKCdBdHRlbXB0ZWQgdG8gb3BlbiBhbiBNYXREYXRlcGlja2VyIHdpdGggbm8gYXNzb2NpYXRlZCBpbnB1dC4nKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9mb2N1c2VkRWxlbWVudEJlZm9yZU9wZW4gPSBfZ2V0Rm9jdXNlZEVsZW1lbnRQaWVyY2VTaGFkb3dEb20oKTtcclxuICAgIHRoaXMuX29wZW5PdmVybGF5KCk7XHJcbiAgICB0aGlzLl9vcGVuZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5vcGVuZWRTdHJlYW0uZW1pdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIENsb3NlIHRoZSBjYWxlbmRhci4gKi9cclxuICBjbG9zZSgpOiB2b2lkIHtcclxuICAgIC8vIFNraXAgcmVvcGVuaW5nIGlmIHRoZXJlJ3MgYW4gaW4tcHJvZ3Jlc3MgYW5pbWF0aW9uIHRvIGF2b2lkIG92ZXJsYXBwaW5nXHJcbiAgICAvLyBzZXF1ZW5jZXMgd2hpY2ggY2FuIGNhdXNlIFwiY2hhbmdlZCBhZnRlciBjaGVja2VkXCIgZXJyb3JzLiBTZWUgIzI1ODM3LlxyXG4gICAgaWYgKCF0aGlzLl9vcGVuZWQgfHwgdGhpcy5fY29tcG9uZW50UmVmPy5pbnN0YW5jZS5faXNBbmltYXRpbmcpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNhblJlc3RvcmVGb2N1cyA9XHJcbiAgICAgIHRoaXMuX3Jlc3RvcmVGb2N1cyAmJlxyXG4gICAgICB0aGlzLl9mb2N1c2VkRWxlbWVudEJlZm9yZU9wZW4gJiZcclxuICAgICAgdHlwZW9mIHRoaXMuX2ZvY3VzZWRFbGVtZW50QmVmb3JlT3Blbi5mb2N1cyA9PT0gJ2Z1bmN0aW9uJztcclxuXHJcbiAgICBjb25zdCBjb21wbGV0ZUNsb3NlID0gKCkgPT4ge1xyXG4gICAgICAvLyBUaGUgYF9vcGVuZWRgIGNvdWxkJ3ZlIGJlZW4gcmVzZXQgYWxyZWFkeSBpZlxyXG4gICAgICAvLyB3ZSBnb3QgdHdvIGV2ZW50cyBpbiBxdWljayBzdWNjZXNzaW9uLlxyXG4gICAgICBpZiAodGhpcy5fb3BlbmVkKSB7XHJcbiAgICAgICAgdGhpcy5fb3BlbmVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jbG9zZWRTdHJlYW0uZW1pdCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGlmICh0aGlzLl9jb21wb25lbnRSZWYpIHtcclxuICAgICAgY29uc3QgeyBpbnN0YW5jZSwgbG9jYXRpb24gfSA9IHRoaXMuX2NvbXBvbmVudFJlZjtcclxuICAgICAgaW5zdGFuY2UuX3N0YXJ0RXhpdEFuaW1hdGlvbigpO1xyXG4gICAgICBpbnN0YW5jZS5fYW5pbWF0aW9uRG9uZS5waXBlKHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XHJcblxyXG4gICAgICAgIC8vIFNpbmNlIHdlIHJlc3RvcmUgZm9jdXMgYWZ0ZXIgdGhlIGV4aXQgYW5pbWF0aW9uLCB3ZSBoYXZlIHRvIGNoZWNrIHRoYXRcclxuICAgICAgICAvLyB0aGUgdXNlciBkaWRuJ3QgbW92ZSBmb2N1cyB0aGVtc2VsdmVzIGluc2lkZSB0aGUgYGNsb3NlYCBoYW5kbGVyLlxyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgIGNhblJlc3RvcmVGb2N1cyAmJlxyXG4gICAgICAgICAgKCFhY3RpdmVFbGVtZW50IHx8XHJcbiAgICAgICAgICAgIGFjdGl2ZUVsZW1lbnQgPT09IHRoaXMuX2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQgfHxcclxuICAgICAgICAgICAgbG9jYXRpb24ubmF0aXZlRWxlbWVudC5jb250YWlucyhhY3RpdmVFbGVtZW50KSlcclxuICAgICAgICApIHtcclxuICAgICAgICAgIHRoaXMuX2ZvY3VzZWRFbGVtZW50QmVmb3JlT3BlbiEuZm9jdXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2ZvY3VzZWRFbGVtZW50QmVmb3JlT3BlbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fZGVzdHJveU92ZXJsYXkoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNhblJlc3RvcmVGb2N1cykge1xyXG4gICAgICAvLyBCZWNhdXNlIElFIG1vdmVzIGZvY3VzIGFzeW5jaHJvbm91c2x5LCB3ZSBjYW4ndCBjb3VudCBvbiBpdCBiZWluZyByZXN0b3JlZCBiZWZvcmUgd2UndmVcclxuICAgICAgLy8gbWFya2VkIHRoZSBkYXRlcGlja2VyIGFzIGNsb3NlZC4gSWYgdGhlIGV2ZW50IGZpcmVzIG91dCBvZiBzZXF1ZW5jZSBhbmQgdGhlIGVsZW1lbnQgdGhhdFxyXG4gICAgICAvLyB3ZSdyZSByZWZvY3VzaW5nIG9wZW5zIHRoZSBkYXRlcGlja2VyIG9uIGZvY3VzLCB0aGUgdXNlciBjb3VsZCBiZSBzdHVjayB3aXRoIG5vdCBiZWluZ1xyXG4gICAgICAvLyBhYmxlIHRvIGNsb3NlIHRoZSBjYWxlbmRhciBhdCBhbGwuIFdlIHdvcmsgYXJvdW5kIGl0IGJ5IG1ha2luZyB0aGUgbG9naWMsIHRoYXQgbWFya3NcclxuICAgICAgLy8gdGhlIGRhdGVwaWNrZXIgYXMgY2xvc2VkLCBhc3luYyBhcyB3ZWxsLlxyXG4gICAgICBzZXRUaW1lb3V0KGNvbXBsZXRlQ2xvc2UpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29tcGxldGVDbG9zZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIEFwcGxpZXMgdGhlIGN1cnJlbnQgcGVuZGluZyBzZWxlY3Rpb24gb24gdGhlIG92ZXJsYXkgdG8gdGhlIG1vZGVsLiAqL1xyXG4gIF9hcHBseVBlbmRpbmdTZWxlY3Rpb24oKSB7XHJcbiAgICB0aGlzLl9jb21wb25lbnRSZWY/Lmluc3RhbmNlPy5fYXBwbHlQZW5kaW5nU2VsZWN0aW9uKCk7XHJcbiAgfVxyXG5cclxuICAvKiogRm9yd2FyZHMgcmVsZXZhbnQgdmFsdWVzIGZyb20gdGhlIGRhdGVwaWNrZXIgdG8gdGhlIGRhdGVwaWNrZXIgY29udGVudCBpbnNpZGUgdGhlIG92ZXJsYXkuICovXHJcbiAgcHJvdGVjdGVkIF9mb3J3YXJkQ29udGVudFZhbHVlcyhpbnN0YW5jZTogTmd4TWF0RGF0ZXBpY2tlckNvbnRlbnQ8UywgRD4pIHtcclxuICAgIGluc3RhbmNlLmRhdGVwaWNrZXIgPSB0aGlzO1xyXG4gICAgaW5zdGFuY2UuY29sb3IgPSB0aGlzLmNvbG9yO1xyXG4gICAgaW5zdGFuY2UuX2RpYWxvZ0xhYmVsSWQgPSB0aGlzLmRhdGVwaWNrZXJJbnB1dC5nZXRPdmVybGF5TGFiZWxJZCgpO1xyXG4gICAgaW5zdGFuY2UuX2Fzc2lnbkFjdGlvbnModGhpcy5fYWN0aW9uc1BvcnRhbCwgZmFsc2UpO1xyXG4gIH1cclxuXHJcbiAgLyoqIE9wZW5zIHRoZSBvdmVybGF5IHdpdGggdGhlIGNhbGVuZGFyLiAqL1xyXG4gIHByaXZhdGUgX29wZW5PdmVybGF5KCk6IHZvaWQge1xyXG4gICAgdGhpcy5fZGVzdHJveU92ZXJsYXkoKTtcclxuXHJcbiAgICBjb25zdCBpc0RpYWxvZyA9IHRoaXMudG91Y2hVaTtcclxuICAgIGNvbnN0IHBvcnRhbCA9IG5ldyBDb21wb25lbnRQb3J0YWw8Tmd4TWF0RGF0ZXBpY2tlckNvbnRlbnQ8UywgRD4+KFxyXG4gICAgICBOZ3hNYXREYXRlcGlja2VyQ29udGVudCxcclxuICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZixcclxuICAgICk7XHJcbiAgICBjb25zdCBvdmVybGF5UmVmID0gKHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5LmNyZWF0ZShcclxuICAgICAgbmV3IE92ZXJsYXlDb25maWcoe1xyXG4gICAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IGlzRGlhbG9nID8gdGhpcy5fZ2V0RGlhbG9nU3RyYXRlZ3koKSA6IHRoaXMuX2dldERyb3Bkb3duU3RyYXRlZ3koKSxcclxuICAgICAgICBoYXNCYWNrZHJvcDogdHJ1ZSxcclxuICAgICAgICBiYWNrZHJvcENsYXNzOiBbXHJcbiAgICAgICAgICBpc0RpYWxvZyA/ICdjZGstb3ZlcmxheS1kYXJrLWJhY2tkcm9wJyA6ICdtYXQtb3ZlcmxheS10cmFuc3BhcmVudC1iYWNrZHJvcCcsXHJcbiAgICAgICAgICB0aGlzLl9iYWNrZHJvcEhhcm5lc3NDbGFzcyxcclxuICAgICAgICBdLFxyXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5fZGlyLFxyXG4gICAgICAgIHNjcm9sbFN0cmF0ZWd5OiBpc0RpYWxvZyA/IHRoaXMuX292ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5ibG9jaygpIDogdGhpcy5fc2Nyb2xsU3RyYXRlZ3koKSxcclxuICAgICAgICBwYW5lbENsYXNzOiBgbWF0LWRhdGVwaWNrZXItJHtpc0RpYWxvZyA/ICdkaWFsb2cnIDogJ3BvcHVwJ31gLFxyXG4gICAgICB9KSxcclxuICAgICkpO1xyXG5cclxuICAgIHRoaXMuX2dldENsb3NlU3RyZWFtKG92ZXJsYXlSZWYpLnN1YnNjcmliZSgoZXZlbnQpID0+IHtcclxuICAgICAgaWYgKGV2ZW50KSB7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaGUgYHByZXZlbnREZWZhdWx0YCBjYWxsIGhhcHBlbnMgaW5zaWRlIHRoZSBjYWxlbmRhciBhcyB3ZWxsLCBob3dldmVyIGZvY3VzIG1vdmVzIGludG9cclxuICAgIC8vIGl0IGluc2lkZSBhIHRpbWVvdXQgd2hpY2ggY2FuIGdpdmUgYnJvd3NlcnMgYSBjaGFuY2UgdG8gZmlyZSBvZmYgYSBrZXlib2FyZCBldmVudCBpbi1iZXR3ZWVuXHJcbiAgICAvLyB0aGF0IGNhbiBzY3JvbGwgdGhlIHBhZ2UgKHNlZSAjMjQ5NjkpLiBBbHdheXMgYmxvY2sgZGVmYXVsdCBhY3Rpb25zIG9mIGFycm93IGtleXMgZm9yIHRoZVxyXG4gICAgLy8gZW50aXJlIG92ZXJsYXkgc28gdGhlIHBhZ2UgZG9lc24ndCBnZXQgc2Nyb2xsZWQgYnkgYWNjaWRlbnQuXHJcbiAgICBvdmVybGF5UmVmLmtleWRvd25FdmVudHMoKS5zdWJzY3JpYmUoKGV2ZW50KSA9PiB7XHJcbiAgICAgIGNvbnN0IGtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xyXG5cclxuICAgICAgaWYgKFxyXG4gICAgICAgIGtleUNvZGUgPT09IFVQX0FSUk9XIHx8XHJcbiAgICAgICAga2V5Q29kZSA9PT0gRE9XTl9BUlJPVyB8fFxyXG4gICAgICAgIGtleUNvZGUgPT09IExFRlRfQVJST1cgfHxcclxuICAgICAgICBrZXlDb2RlID09PSBSSUdIVF9BUlJPVyB8fFxyXG4gICAgICAgIGtleUNvZGUgPT09IFBBR0VfVVAgfHxcclxuICAgICAgICBrZXlDb2RlID09PSBQQUdFX0RPV05cclxuICAgICAgKSB7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5fY29tcG9uZW50UmVmID0gb3ZlcmxheVJlZi5hdHRhY2gocG9ydGFsKTtcclxuICAgIHRoaXMuX2ZvcndhcmRDb250ZW50VmFsdWVzKHRoaXMuX2NvbXBvbmVudFJlZi5pbnN0YW5jZSk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBwb3NpdGlvbiBvbmNlIHRoZSBjYWxlbmRhciBoYXMgcmVuZGVyZWQuIE9ubHkgcmVsZXZhbnQgaW4gZHJvcGRvd24gbW9kZS5cclxuICAgIGlmICghaXNEaWFsb2cpIHtcclxuICAgICAgdGhpcy5fbmdab25lLm9uU3RhYmxlLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKCgpID0+IG92ZXJsYXlSZWYudXBkYXRlUG9zaXRpb24oKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogRGVzdHJveXMgdGhlIGN1cnJlbnQgb3ZlcmxheS4gKi9cclxuICBwcml2YXRlIF9kZXN0cm95T3ZlcmxheSgpIHtcclxuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XHJcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLl9vdmVybGF5UmVmID0gdGhpcy5fY29tcG9uZW50UmVmID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIGEgcG9zaXRpb24gc3RyYXRlZ3kgdGhhdCB3aWxsIG9wZW4gdGhlIGNhbGVuZGFyIGFzIGEgZHJvcGRvd24uICovXHJcbiAgcHJpdmF0ZSBfZ2V0RGlhbG9nU3RyYXRlZ3koKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheS5wb3NpdGlvbigpLmdsb2JhbCgpLmNlbnRlckhvcml6b250YWxseSgpLmNlbnRlclZlcnRpY2FsbHkoKTtcclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIGEgcG9zaXRpb24gc3RyYXRlZ3kgdGhhdCB3aWxsIG9wZW4gdGhlIGNhbGVuZGFyIGFzIGEgZHJvcGRvd24uICovXHJcbiAgcHJpdmF0ZSBfZ2V0RHJvcGRvd25TdHJhdGVneSgpIHtcclxuICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5fb3ZlcmxheVxyXG4gICAgICAucG9zaXRpb24oKVxyXG4gICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLmRhdGVwaWNrZXJJbnB1dC5nZXRDb25uZWN0ZWRPdmVybGF5T3JpZ2luKCkpXHJcbiAgICAgIC53aXRoVHJhbnNmb3JtT3JpZ2luT24oJy5tYXQtZGF0ZXBpY2tlci1jb250ZW50JylcclxuICAgICAgLndpdGhGbGV4aWJsZURpbWVuc2lvbnMoZmFsc2UpXHJcbiAgICAgIC53aXRoVmlld3BvcnRNYXJnaW4oOClcclxuICAgICAgLndpdGhMb2NrZWRQb3NpdGlvbigpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLl9zZXRDb25uZWN0ZWRQb3NpdGlvbnMoc3RyYXRlZ3kpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFNldHMgdGhlIHBvc2l0aW9ucyBvZiB0aGUgZGF0ZXBpY2tlciBpbiBkcm9wZG93biBtb2RlIGJhc2VkIG9uIHRoZSBjdXJyZW50IGNvbmZpZ3VyYXRpb24uICovXHJcbiAgcHJpdmF0ZSBfc2V0Q29ubmVjdGVkUG9zaXRpb25zKHN0cmF0ZWd5OiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kpIHtcclxuICAgIGNvbnN0IHByaW1hcnlYID0gdGhpcy54UG9zaXRpb24oKSA9PT0gJ2VuZCcgPyAnZW5kJyA6ICdzdGFydCc7XHJcbiAgICBjb25zdCBzZWNvbmRhcnlYID0gcHJpbWFyeVggPT09ICdzdGFydCcgPyAnZW5kJyA6ICdzdGFydCc7XHJcbiAgICBjb25zdCBwcmltYXJ5WSA9IHRoaXMueVBvc2l0aW9uKCkgPT09ICdhYm92ZScgPyAnYm90dG9tJyA6ICd0b3AnO1xyXG4gICAgY29uc3Qgc2Vjb25kYXJ5WSA9IHByaW1hcnlZID09PSAndG9wJyA/ICdib3R0b20nIDogJ3RvcCc7XHJcblxyXG4gICAgcmV0dXJuIHN0cmF0ZWd5LndpdGhQb3NpdGlvbnMoW1xyXG4gICAgICB7XHJcbiAgICAgICAgb3JpZ2luWDogcHJpbWFyeVgsXHJcbiAgICAgICAgb3JpZ2luWTogc2Vjb25kYXJ5WSxcclxuICAgICAgICBvdmVybGF5WDogcHJpbWFyeVgsXHJcbiAgICAgICAgb3ZlcmxheVk6IHByaW1hcnlZLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgb3JpZ2luWDogcHJpbWFyeVgsXHJcbiAgICAgICAgb3JpZ2luWTogcHJpbWFyeVksXHJcbiAgICAgICAgb3ZlcmxheVg6IHByaW1hcnlYLFxyXG4gICAgICAgIG92ZXJsYXlZOiBzZWNvbmRhcnlZLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgb3JpZ2luWDogc2Vjb25kYXJ5WCxcclxuICAgICAgICBvcmlnaW5ZOiBzZWNvbmRhcnlZLFxyXG4gICAgICAgIG92ZXJsYXlYOiBzZWNvbmRhcnlYLFxyXG4gICAgICAgIG92ZXJsYXlZOiBwcmltYXJ5WSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIG9yaWdpblg6IHNlY29uZGFyeVgsXHJcbiAgICAgICAgb3JpZ2luWTogcHJpbWFyeVksXHJcbiAgICAgICAgb3ZlcmxheVg6IHNlY29uZGFyeVgsXHJcbiAgICAgICAgb3ZlcmxheVk6IHNlY29uZGFyeVksXHJcbiAgICAgIH0sXHJcbiAgICBdKTtcclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCB3aWxsIGVtaXQgd2hlbiB0aGUgb3ZlcmxheSBpcyBzdXBwb3NlZCB0byBiZSBjbG9zZWQuICovXHJcbiAgcHJpdmF0ZSBfZ2V0Q2xvc2VTdHJlYW0ob3ZlcmxheVJlZjogT3ZlcmxheVJlZikge1xyXG4gICAgY29uc3QgY3RybFNoaWZ0TWV0YU1vZGlmaWVyczogTGlzdEtleU1hbmFnZXJNb2RpZmllcktleVtdID0gWydjdHJsS2V5JywgJ3NoaWZ0S2V5JywgJ21ldGFLZXknXTtcclxuICAgIHJldHVybiBtZXJnZShcclxuICAgICAgb3ZlcmxheVJlZi5iYWNrZHJvcENsaWNrKCksXHJcbiAgICAgIG92ZXJsYXlSZWYuZGV0YWNobWVudHMoKSxcclxuICAgICAgb3ZlcmxheVJlZi5rZXlkb3duRXZlbnRzKCkucGlwZShcclxuICAgICAgICBmaWx0ZXIoKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAvLyBDbG9zaW5nIG9uIGFsdCArIHVwIGlzIG9ubHkgdmFsaWQgd2hlbiB0aGVyZSdzIGFuIGlucHV0IGFzc29jaWF0ZWQgd2l0aCB0aGUgZGF0ZXBpY2tlci5cclxuICAgICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIChldmVudC5rZXlDb2RlID09PSBFU0NBUEUgJiYgIWhhc01vZGlmaWVyS2V5KGV2ZW50KSkgfHxcclxuICAgICAgICAgICAgKHRoaXMuZGF0ZXBpY2tlcklucHV0ICYmXHJcbiAgICAgICAgICAgICAgaGFzTW9kaWZpZXJLZXkoZXZlbnQsICdhbHRLZXknKSAmJlxyXG4gICAgICAgICAgICAgIGV2ZW50LmtleUNvZGUgPT09IFVQX0FSUk9XICYmXHJcbiAgICAgICAgICAgICAgY3RybFNoaWZ0TWV0YU1vZGlmaWVycy5ldmVyeShcclxuICAgICAgICAgICAgICAgIChtb2RpZmllcjogTGlzdEtleU1hbmFnZXJNb2RpZmllcktleSkgPT4gIWhhc01vZGlmaWVyS2V5KGV2ZW50LCBtb2RpZmllciksXHJcbiAgICAgICAgICAgICAgKSlcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfSksXHJcbiAgICAgICksXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG4iLCI8ZGl2XHJcbiAgY2RrVHJhcEZvY3VzXHJcbiAgcm9sZT1cImRpYWxvZ1wiXHJcbiAgW2F0dHIuYXJpYS1tb2RhbF09XCJ0cnVlXCJcclxuICBbYXR0ci5hcmlhLWxhYmVsbGVkYnldPVwiX2RpYWxvZ0xhYmVsSWQgPz8gdW5kZWZpbmVkXCJcclxuICBjbGFzcz1cIm1hdC1kYXRlcGlja2VyLWNvbnRlbnQtY29udGFpbmVyXCJcclxuICBbY2xhc3MubWF0LWRhdGVwaWNrZXItY29udGVudC1jb250YWluZXItd2l0aC1jdXN0b20taGVhZGVyXT1cIlxyXG4gICAgZGF0ZXBpY2tlci5jYWxlbmRhckhlYWRlckNvbXBvbmVudCgpXHJcbiAgXCJcclxuICBbY2xhc3MubWF0LWRhdGVwaWNrZXItY29udGVudC1jb250YWluZXItd2l0aC1hY3Rpb25zXT1cIl9hY3Rpb25zUG9ydGFsXCJcclxuICBbY2xhc3MubWF0LWRhdGVwaWNrZXItY29udGVudC1jb250YWluZXItd2l0aC10aW1lXT1cIiFkYXRlcGlja2VyLl9oaWRlVGltZVwiXHJcbj5cclxuICA8bmd4LW1hdC1jYWxlbmRhclxyXG4gICAgW2lkXT1cImRhdGVwaWNrZXIuaWRcIlxyXG4gICAgW25nQ2xhc3NdPVwiZGF0ZXBpY2tlci5wYW5lbENsYXNzXCJcclxuICAgIFtzdGFydEF0XT1cImRhdGVwaWNrZXIuc3RhcnRBdFwiXHJcbiAgICBbc3RhcnRWaWV3XT1cImRhdGVwaWNrZXIuc3RhcnRWaWV3KClcIlxyXG4gICAgW21pbkRhdGVdPVwiZGF0ZXBpY2tlci5fZ2V0TWluRGF0ZSgpXCJcclxuICAgIFttYXhEYXRlXT1cImRhdGVwaWNrZXIuX2dldE1heERhdGUoKVwiXHJcbiAgICBbZGF0ZUZpbHRlcl09XCJkYXRlcGlja2VyLl9nZXREYXRlRmlsdGVyKClcIlxyXG4gICAgW2hlYWRlckNvbXBvbmVudF09XCJkYXRlcGlja2VyLmNhbGVuZGFySGVhZGVyQ29tcG9uZW50KClcIlxyXG4gICAgW3NlbGVjdGVkXT1cIl9nZXRTZWxlY3RlZCgpXCJcclxuICAgIFtkYXRlQ2xhc3NdPVwiZGF0ZXBpY2tlci5kYXRlQ2xhc3MoKVwiXHJcbiAgICBbY29tcGFyaXNvblN0YXJ0XT1cImNvbXBhcmlzb25TdGFydFwiXHJcbiAgICBbY29tcGFyaXNvbkVuZF09XCJjb21wYXJpc29uRW5kXCJcclxuICAgIFtAZmFkZUluQ2FsZW5kYXJdPVwiJ2VudGVyJ1wiXHJcbiAgICBbc3RhcnREYXRlQWNjZXNzaWJsZU5hbWVdPVwic3RhcnREYXRlQWNjZXNzaWJsZU5hbWVcIlxyXG4gICAgW2VuZERhdGVBY2Nlc3NpYmxlTmFtZV09XCJlbmREYXRlQWNjZXNzaWJsZU5hbWVcIlxyXG4gICAgKHllYXJTZWxlY3RlZCk9XCJkYXRlcGlja2VyLl9zZWxlY3RZZWFyKCRldmVudClcIlxyXG4gICAgKG1vbnRoU2VsZWN0ZWQpPVwiZGF0ZXBpY2tlci5fc2VsZWN0TW9udGgoJGV2ZW50KVwiXHJcbiAgICAodmlld0NoYW5nZWQpPVwiZGF0ZXBpY2tlci5fdmlld0NoYW5nZWQoJGV2ZW50KVwiXHJcbiAgICAoX3VzZXJTZWxlY3Rpb24pPVwiX2hhbmRsZVVzZXJTZWxlY3Rpb24oJGV2ZW50KVwiXHJcbiAgICAoX3VzZXJEcmFnRHJvcCk9XCJfaGFuZGxlVXNlckRyYWdEcm9wKCRldmVudClcIlxyXG4gIC8+XHJcblxyXG4gIEBpZiAoaXNWaWV3TW9udGgpIHtcclxuICAgIEBpZiAoIWRhdGVwaWNrZXIuX2hpZGVUaW1lKSB7XHJcbiAgICAgIDxkaXZcclxuICAgICAgICBjbGFzcz1cInRpbWUtY29udGFpbmVyXCJcclxuICAgICAgICBbY2xhc3MuZGlzYWJsZS1zZWNvbmRzXT1cIiFkYXRlcGlja2VyLl9zaG93U2Vjb25kc1wiXHJcbiAgICAgID5cclxuICAgICAgICA8bmd4LW1hdC10aW1lcGlja2VyXHJcbiAgICAgICAgICBbc2hvd1NwaW5uZXJzXT1cImRhdGVwaWNrZXIuX3Nob3dTcGlubmVyc1wiXHJcbiAgICAgICAgICBbc2hvd1NlY29uZHNdPVwiZGF0ZXBpY2tlci5fc2hvd1NlY29uZHNcIlxyXG4gICAgICAgICAgW2Rpc2FibGVkXT1cImRhdGVwaWNrZXIuX2Rpc2FibGVkIHx8ICFfbW9kZWxUaW1lXCJcclxuICAgICAgICAgIFtzdGVwSG91cl09XCJkYXRlcGlja2VyLl9zdGVwSG91clwiXHJcbiAgICAgICAgICBbc3RlcE1pbnV0ZV09XCJkYXRlcGlja2VyLl9zdGVwTWludXRlXCJcclxuICAgICAgICAgIFtzdGVwU2Vjb25kXT1cImRhdGVwaWNrZXIuX3N0ZXBTZWNvbmRcIlxyXG4gICAgICAgICAgWyhuZ01vZGVsKV09XCJfbW9kZWxUaW1lXCJcclxuICAgICAgICAgIFtjb2xvcl09XCJkYXRlcGlja2VyLl9jb2xvclwiXHJcbiAgICAgICAgICBbZW5hYmxlTWVyaWRpYW5dPVwiZGF0ZXBpY2tlci5fZW5hYmxlTWVyaWRpYW5cIlxyXG4gICAgICAgICAgW2Rpc2FibGVNaW51dGVdPVwiZGF0ZXBpY2tlci5fZGlzYWJsZU1pbnV0ZVwiXHJcbiAgICAgICAgICAobmdNb2RlbENoYW5nZSk9XCJvblRpbWVDaGFuZ2VkKCRldmVudClcIlxyXG4gICAgICAgIC8+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgPG5nLXRlbXBsYXRlIFtjZGtQb3J0YWxPdXRsZXRdPVwiX2FjdGlvbnNQb3J0YWxcIiAvPlxyXG5cclxuICA8IS0tIEludmlzaWJsZSBjbG9zZSBidXR0b24gZm9yIHNjcmVlbiByZWFkZXIgdXNlcnMuIC0tPlxyXG4gIDxidXR0b25cclxuICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgbWF0LXJhaXNlZC1idXR0b25cclxuICAgIFtjb2xvcl09XCJjb2xvciB8fCAncHJpbWFyeSdcIlxyXG4gICAgY2xhc3M9XCJtYXQtZGF0ZXBpY2tlci1jbG9zZS1idXR0b25cIlxyXG4gICAgW2NsYXNzLmNkay12aXN1YWxseS1oaWRkZW5dPVwiIV9jbG9zZUJ1dHRvbkZvY3VzZWRcIlxyXG4gICAgKGZvY3VzKT1cIl9jbG9zZUJ1dHRvbkZvY3VzZWQgPSB0cnVlXCJcclxuICAgIChibHVyKT1cIl9jbG9zZUJ1dHRvbkZvY3VzZWQgPSBmYWxzZVwiXHJcbiAgICAoY2xpY2spPVwiZGF0ZXBpY2tlci5jbG9zZSgpXCJcclxuICA+XHJcbiAgICB7eyBfY2xvc2VCdXR0b25UZXh0IH19XHJcbiAgPC9idXR0b24+XHJcbjwvZGl2PlxyXG4iXX0=