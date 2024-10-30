import { TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, Directive, TemplateRef, ViewEncapsulation, viewChild, } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./datepicker-base";
/** Button that will close the datepicker and assign the current selection to the data model. */
export class NgxMatDatepickerApply {
    constructor(_datepicker) {
        this._datepicker = _datepicker;
    }
    _applySelection() {
        this._datepicker._applyPendingSelection();
        this._datepicker.close();
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerApply, deps: [{ token: i1.NgxMatDatepickerBase }], target: i0.ɵɵFactoryTarget.Directive }); }
    /** @nocollapse */ static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.3", type: NgxMatDatepickerApply, isStandalone: true, selector: "[ngxMatDatepickerApply], [ngxMatDateRangePickerApply]", host: { listeners: { "click": "_applySelection()" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerApply, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngxMatDatepickerApply], [ngxMatDateRangePickerApply]',
                    host: { '(click)': '_applySelection()' },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.NgxMatDatepickerBase }] });
/** Button that will close the datepicker and discard the current selection. */
export class NgxMatDatepickerCancel {
    constructor(_datepicker) {
        this._datepicker = _datepicker;
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerCancel, deps: [{ token: i1.NgxMatDatepickerBase }], target: i0.ɵɵFactoryTarget.Directive }); }
    /** @nocollapse */ static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.3", type: NgxMatDatepickerCancel, isStandalone: true, selector: "[ngxMatDatepickerCancel], [ngxMatDateRangePickerCancel]", host: { listeners: { "click": "_datepicker.close()" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerCancel, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngxMatDatepickerCancel], [ngxMatDateRangePickerCancel]',
                    host: { '(click)': '_datepicker.close()' },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.NgxMatDatepickerBase }] });
/**
 * Container that can be used to project a row of action buttons
 * to the bottom of a datepicker or date range picker.
 */
export class NgxMatDatepickerActions {
    constructor(_datepicker, _viewContainerRef) {
        this._datepicker = _datepicker;
        this._viewContainerRef = _viewContainerRef;
        this._template = viewChild(TemplateRef);
    }
    ngAfterViewInit() {
        this._portal = new TemplatePortal(this._template(), this._viewContainerRef);
        this._datepicker.registerActions(this._portal);
    }
    ngOnDestroy() {
        this._datepicker.removeActions(this._portal);
        // Needs to be null checked since we initialize it in `ngAfterViewInit`.
        if (this._portal && this._portal.isAttached) {
            this._portal?.detach();
        }
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerActions, deps: [{ token: i1.NgxMatDatepickerBase }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Component }); }
    /** @nocollapse */ static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.2.0", version: "18.0.3", type: NgxMatDatepickerActions, isStandalone: true, selector: "ngx-mat-datepicker-actions, ngx-mat-date-range-picker-actions", viewQueries: [{ propertyName: "_template", first: true, predicate: TemplateRef, descendants: true, isSignal: true }], ngImport: i0, template: `
    <ng-template>
      <div class="mat-datepicker-actions">
        <ng-content></ng-content>
      </div>
    </ng-template>
  `, isInline: true, styles: [".mat-datepicker-actions{display:flex;justify-content:flex-end;align-items:center;padding:8px}.mat-datepicker-actions .mat-mdc-button-base+.mat-mdc-button-base{margin-left:8px}[dir=rtl] .mat-datepicker-actions .mat-mdc-button-base+.mat-mdc-button-base{margin-left:0;margin-right:8px}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatepickerActions, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-mat-datepicker-actions, ngx-mat-date-range-picker-actions', template: `
    <ng-template>
      <div class="mat-datepicker-actions">
        <ng-content></ng-content>
      </div>
    </ng-template>
  `, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, standalone: true, styles: [".mat-datepicker-actions{display:flex;justify-content:flex-end;align-items:center;padding:8px}.mat-datepicker-actions .mat-mdc-button-base+.mat-mdc-button-base{margin-left:8px}[dir=rtl] .mat-datepicker-actions .mat-mdc-button-base+.mat-mdc-button-base{margin-left:0;margin-right:8px}\n"] }]
        }], ctorParameters: () => [{ type: i1.NgxMatDatepickerBase }, { type: i0.ViewContainerRef }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1hY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZGF0ZXRpbWUtcGlja2VyL3NyYy9saWIvZGF0ZXBpY2tlci1hY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBRUwsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFDVCxTQUFTLEVBRVQsV0FBVyxFQUVYLGlCQUFpQixFQUNqQixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7OztBQUd2QixnR0FBZ0c7QUFNaEcsTUFBTSxPQUFPLHFCQUFxQjtJQUNoQyxZQUNrQixXQUF3RTtRQUF4RSxnQkFBVyxHQUFYLFdBQVcsQ0FBNkQ7SUFDdkYsQ0FBQztJQUVKLGVBQWU7UUFDYixJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQixDQUFDO2lJQVJVLHFCQUFxQjtxSEFBckIscUJBQXFCOzsyRkFBckIscUJBQXFCO2tCQUxqQyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSx1REFBdUQ7b0JBQ2pFLElBQUksRUFBRSxFQUFFLFNBQVMsRUFBRSxtQkFBbUIsRUFBRTtvQkFDeEMsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOztBQVlELCtFQUErRTtBQU0vRSxNQUFNLE9BQU8sc0JBQXNCO0lBQ2pDLFlBQ2tCLFdBQXdFO1FBQXhFLGdCQUFXLEdBQVgsV0FBVyxDQUE2RDtJQUN2RixDQUFDO2lJQUhPLHNCQUFzQjtxSEFBdEIsc0JBQXNCOzsyRkFBdEIsc0JBQXNCO2tCQUxsQyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSx5REFBeUQ7b0JBQ25FLElBQUksRUFBRSxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRTtvQkFDMUMsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOztBQU9EOzs7R0FHRztBQWVILE1BQU0sT0FBTyx1QkFBdUI7SUFJbEMsWUFDVSxXQUF3RSxFQUN4RSxpQkFBbUM7UUFEbkMsZ0JBQVcsR0FBWCxXQUFXLENBQTZEO1FBQ3hFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFMN0MsY0FBUyxHQUFHLFNBQVMsQ0FBdUIsV0FBVyxDQUFDLENBQUM7SUFNdEQsQ0FBQztJQUVKLGVBQWU7UUFDYixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFN0Msd0VBQXdFO1FBQ3hFLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDekIsQ0FBQztJQUNILENBQUM7aUlBckJVLHVCQUF1QjtxSEFBdkIsdUJBQXVCLG9LQUNVLFdBQVcsZ0VBWjdDOzs7Ozs7R0FNVDs7MkZBS1UsdUJBQXVCO2tCQWRuQyxTQUFTOytCQUNFLCtEQUErRCxZQUUvRDs7Ozs7O0dBTVQsbUJBQ2dCLHVCQUF1QixDQUFDLE1BQU0saUJBQ2hDLGlCQUFpQixDQUFDLElBQUksY0FDekIsSUFBSSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRlbXBsYXRlUG9ydGFsIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XHJcbmltcG9ydCB7XHJcbiAgQWZ0ZXJWaWV3SW5pdCxcclxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcclxuICBDb21wb25lbnQsXHJcbiAgRGlyZWN0aXZlLFxyXG4gIE9uRGVzdHJveSxcclxuICBUZW1wbGF0ZVJlZixcclxuICBWaWV3Q29udGFpbmVyUmVmLFxyXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxyXG4gIHZpZXdDaGlsZCxcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgTmd4TWF0RGF0ZXBpY2tlckJhc2UsIE5neE1hdERhdGVwaWNrZXJDb250cm9sIH0gZnJvbSAnLi9kYXRlcGlja2VyLWJhc2UnO1xyXG5cclxuLyoqIEJ1dHRvbiB0aGF0IHdpbGwgY2xvc2UgdGhlIGRhdGVwaWNrZXIgYW5kIGFzc2lnbiB0aGUgY3VycmVudCBzZWxlY3Rpb24gdG8gdGhlIGRhdGEgbW9kZWwuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW25neE1hdERhdGVwaWNrZXJBcHBseV0sIFtuZ3hNYXREYXRlUmFuZ2VQaWNrZXJBcHBseV0nLFxyXG4gIGhvc3Q6IHsgJyhjbGljayknOiAnX2FwcGx5U2VsZWN0aW9uKCknIH0sXHJcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcclxufSlcclxuZXhwb3J0IGNsYXNzIE5neE1hdERhdGVwaWNrZXJBcHBseSB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgX2RhdGVwaWNrZXI6IE5neE1hdERhdGVwaWNrZXJCYXNlPE5neE1hdERhdGVwaWNrZXJDb250cm9sPGFueT4sIHVua25vd24+LFxyXG4gICkge31cclxuXHJcbiAgX2FwcGx5U2VsZWN0aW9uKCkge1xyXG4gICAgdGhpcy5fZGF0ZXBpY2tlci5fYXBwbHlQZW5kaW5nU2VsZWN0aW9uKCk7XHJcbiAgICB0aGlzLl9kYXRlcGlja2VyLmNsb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQnV0dG9uIHRoYXQgd2lsbCBjbG9zZSB0aGUgZGF0ZXBpY2tlciBhbmQgZGlzY2FyZCB0aGUgY3VycmVudCBzZWxlY3Rpb24uICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW25neE1hdERhdGVwaWNrZXJDYW5jZWxdLCBbbmd4TWF0RGF0ZVJhbmdlUGlja2VyQ2FuY2VsXScsXHJcbiAgaG9zdDogeyAnKGNsaWNrKSc6ICdfZGF0ZXBpY2tlci5jbG9zZSgpJyB9LFxyXG4gIHN0YW5kYWxvbmU6IHRydWUsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hNYXREYXRlcGlja2VyQ2FuY2VsIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHB1YmxpYyByZWFkb25seSBfZGF0ZXBpY2tlcjogTmd4TWF0RGF0ZXBpY2tlckJhc2U8Tmd4TWF0RGF0ZXBpY2tlckNvbnRyb2w8YW55PiwgdW5rbm93bj4sXHJcbiAgKSB7fVxyXG59XHJcblxyXG4vKipcclxuICogQ29udGFpbmVyIHRoYXQgY2FuIGJlIHVzZWQgdG8gcHJvamVjdCBhIHJvdyBvZiBhY3Rpb24gYnV0dG9uc1xyXG4gKiB0byB0aGUgYm90dG9tIG9mIGEgZGF0ZXBpY2tlciBvciBkYXRlIHJhbmdlIHBpY2tlci5cclxuICovXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnbmd4LW1hdC1kYXRlcGlja2VyLWFjdGlvbnMsIG5neC1tYXQtZGF0ZS1yYW5nZS1waWNrZXItYWN0aW9ucycsXHJcbiAgc3R5bGVVcmxzOiBbJ2RhdGVwaWNrZXItYWN0aW9ucy5zY3NzJ10sXHJcbiAgdGVtcGxhdGU6IGBcclxuICAgIDxuZy10ZW1wbGF0ZT5cclxuICAgICAgPGRpdiBjbGFzcz1cIm1hdC1kYXRlcGlja2VyLWFjdGlvbnNcIj5cclxuICAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9uZy10ZW1wbGF0ZT5cclxuICBgLFxyXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXHJcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcclxufSlcclxuZXhwb3J0IGNsYXNzIE5neE1hdERhdGVwaWNrZXJBY3Rpb25zIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcclxuICBfdGVtcGxhdGUgPSB2aWV3Q2hpbGQ8VGVtcGxhdGVSZWY8dW5rbm93bj4+KFRlbXBsYXRlUmVmKTtcclxuICBwcml2YXRlIF9wb3J0YWw6IFRlbXBsYXRlUG9ydGFsO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgX2RhdGVwaWNrZXI6IE5neE1hdERhdGVwaWNrZXJCYXNlPE5neE1hdERhdGVwaWNrZXJDb250cm9sPGFueT4sIHVua25vd24+LFxyXG4gICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcclxuICApIHt9XHJcblxyXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcclxuICAgIHRoaXMuX3BvcnRhbCA9IG5ldyBUZW1wbGF0ZVBvcnRhbCh0aGlzLl90ZW1wbGF0ZSgpLCB0aGlzLl92aWV3Q29udGFpbmVyUmVmKTtcclxuICAgIHRoaXMuX2RhdGVwaWNrZXIucmVnaXN0ZXJBY3Rpb25zKHRoaXMuX3BvcnRhbCk7XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuX2RhdGVwaWNrZXIucmVtb3ZlQWN0aW9ucyh0aGlzLl9wb3J0YWwpO1xyXG5cclxuICAgIC8vIE5lZWRzIHRvIGJlIG51bGwgY2hlY2tlZCBzaW5jZSB3ZSBpbml0aWFsaXplIGl0IGluIGBuZ0FmdGVyVmlld0luaXRgLlxyXG4gICAgaWYgKHRoaXMuX3BvcnRhbCAmJiB0aGlzLl9wb3J0YWwuaXNBdHRhY2hlZCkge1xyXG4gICAgICB0aGlzLl9wb3J0YWw/LmRldGFjaCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=