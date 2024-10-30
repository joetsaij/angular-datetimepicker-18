import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { NGX_MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER } from './date-selection-model';
import { NGX_MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER, NgxMatDatepickerBase, } from './datepicker-base';
import * as i0 from "@angular/core";
// TODO(mmalerba): We use a component instead of a directive here so the user can use implicit
// template reference variables (e.g. #d vs #d="matDatepicker"). We can change this to a directive
// if angular adds support for `exportAs: '$implicit'` on directives.
/** Component responsible for managing the datepicker popup/dialog. */
export class NgxMatDatetimepicker extends NgxMatDatepickerBase {
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatetimepicker, deps: null, target: i0.ɵɵFactoryTarget.Component }); }
    /** @nocollapse */ static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.0.3", type: NgxMatDatetimepicker, isStandalone: true, selector: "ngx-mat-datetime-picker", providers: [
            NGX_MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER,
            NGX_MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER,
            { provide: NgxMatDatepickerBase, useExisting: NgxMatDatetimepicker },
        ], exportAs: ["ngxMatDatetimePicker"], usesInheritance: true, ngImport: i0, template: '', isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDatetimepicker, decorators: [{
            type: Component,
            args: [{
                    selector: 'ngx-mat-datetime-picker',
                    template: '',
                    exportAs: 'ngxMatDatetimePicker',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    providers: [
                        NGX_MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER,
                        NGX_MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER,
                        { provide: NgxMatDatepickerBase, useExisting: NgxMatDatetimepicker },
                    ],
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2RhdGV0aW1lLXBpY2tlci9zcmMvbGliL2RhdGVwaWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHVCQUF1QixFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN0RixPQUFPLEVBQUUsNENBQTRDLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN0RixPQUFPLEVBQ0wsbURBQW1ELEVBQ25ELG9CQUFvQixHQUVyQixNQUFNLG1CQUFtQixDQUFDOztBQUUzQiw4RkFBOEY7QUFDOUYsa0dBQWtHO0FBQ2xHLHFFQUFxRTtBQUNyRSxzRUFBc0U7QUFjdEUsTUFBTSxPQUFPLG9CQUF3QixTQUFRLG9CQUk1QztpSUFKWSxvQkFBb0I7cUhBQXBCLG9CQUFvQixzRUFQcEI7WUFDVCw0Q0FBNEM7WUFDNUMsbURBQW1EO1lBQ25ELEVBQUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFdBQVcsRUFBRSxvQkFBb0IsRUFBRTtTQUNyRSxxRkFSUyxFQUFFOzsyRkFXRCxvQkFBb0I7a0JBYmhDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHlCQUF5QjtvQkFDbkMsUUFBUSxFQUFFLEVBQUU7b0JBQ1osUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07b0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO29CQUNyQyxTQUFTLEVBQUU7d0JBQ1QsNENBQTRDO3dCQUM1QyxtREFBbUQ7d0JBQ25ELEVBQUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFdBQVcsc0JBQXNCLEVBQUU7cUJBQ3JFO29CQUNELFVBQVUsRUFBRSxJQUFJO2lCQUNqQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBDb21wb25lbnQsIFZpZXdFbmNhcHN1bGF0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE5HWF9NQVRfU0lOR0xFX0RBVEVfU0VMRUNUSU9OX01PREVMX1BST1ZJREVSIH0gZnJvbSAnLi9kYXRlLXNlbGVjdGlvbi1tb2RlbCc7XHJcbmltcG9ydCB7XHJcbiAgTkdYX01BVF9EQVRFUElDS0VSX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZX1BST1ZJREVSLFxyXG4gIE5neE1hdERhdGVwaWNrZXJCYXNlLFxyXG4gIE5neE1hdERhdGVwaWNrZXJDb250cm9sLFxyXG59IGZyb20gJy4vZGF0ZXBpY2tlci1iYXNlJztcclxuXHJcbi8vIFRPRE8obW1hbGVyYmEpOiBXZSB1c2UgYSBjb21wb25lbnQgaW5zdGVhZCBvZiBhIGRpcmVjdGl2ZSBoZXJlIHNvIHRoZSB1c2VyIGNhbiB1c2UgaW1wbGljaXRcclxuLy8gdGVtcGxhdGUgcmVmZXJlbmNlIHZhcmlhYmxlcyAoZS5nLiAjZCB2cyAjZD1cIm1hdERhdGVwaWNrZXJcIikuIFdlIGNhbiBjaGFuZ2UgdGhpcyB0byBhIGRpcmVjdGl2ZVxyXG4vLyBpZiBhbmd1bGFyIGFkZHMgc3VwcG9ydCBmb3IgYGV4cG9ydEFzOiAnJGltcGxpY2l0J2Agb24gZGlyZWN0aXZlcy5cclxuLyoqIENvbXBvbmVudCByZXNwb25zaWJsZSBmb3IgbWFuYWdpbmcgdGhlIGRhdGVwaWNrZXIgcG9wdXAvZGlhbG9nLiAqL1xyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ25neC1tYXQtZGF0ZXRpbWUtcGlja2VyJyxcclxuICB0ZW1wbGF0ZTogJycsXHJcbiAgZXhwb3J0QXM6ICduZ3hNYXREYXRldGltZVBpY2tlcicsXHJcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxuICBwcm92aWRlcnM6IFtcclxuICAgIE5HWF9NQVRfU0lOR0xFX0RBVEVfU0VMRUNUSU9OX01PREVMX1BST1ZJREVSLFxyXG4gICAgTkdYX01BVF9EQVRFUElDS0VSX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZX1BST1ZJREVSLFxyXG4gICAgeyBwcm92aWRlOiBOZ3hNYXREYXRlcGlja2VyQmFzZSwgdXNlRXhpc3Rpbmc6IE5neE1hdERhdGV0aW1lcGlja2VyIH0sXHJcbiAgXSxcclxuICBzdGFuZGFsb25lOiB0cnVlLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgTmd4TWF0RGF0ZXRpbWVwaWNrZXI8RD4gZXh0ZW5kcyBOZ3hNYXREYXRlcGlja2VyQmFzZTxcclxuICBOZ3hNYXREYXRlcGlja2VyQ29udHJvbDxEPixcclxuICBEIHwgbnVsbCxcclxuICBEXHJcbj4ge31cclxuIl19