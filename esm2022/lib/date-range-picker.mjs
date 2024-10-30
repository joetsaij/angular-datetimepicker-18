import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { NGX_MAT_CALENDAR_RANGE_STRATEGY_PROVIDER } from './date-range-selection-strategy';
import { NGX_MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER } from './date-selection-model';
import { NgxMatDatepickerBase, } from './datepicker-base';
import * as i0 from "@angular/core";
// TODO(mmalerba): We use a component instead of a directive here so the user can use implicit
// template reference variables (e.g. #d vs #d="matDateRangePicker"). We can change this to a
// directive if angular adds support for `exportAs: '$implicit'` on directives.
/** Component responsible for managing the date range picker popup/dialog. */
export class NgxMatDateRangePicker extends NgxMatDatepickerBase {
    _forwardContentValues(instance) {
        super._forwardContentValues(instance);
        const input = this.datepickerInput;
        if (input) {
            instance.comparisonStart = input.comparisonStart;
            instance.comparisonEnd = input.comparisonEnd;
            instance.startDateAccessibleName = input._getStartDateAccessibleName();
            instance.endDateAccessibleName = input._getEndDateAccessibleName();
        }
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDateRangePicker, deps: null, target: i0.ɵɵFactoryTarget.Component }); }
    /** @nocollapse */ static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.0.3", type: NgxMatDateRangePicker, isStandalone: true, selector: "ngx-mat-date-range-picker", providers: [
            NGX_MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER,
            NGX_MAT_CALENDAR_RANGE_STRATEGY_PROVIDER,
            { provide: NgxMatDatepickerBase, useExisting: NgxMatDateRangePicker },
        ], exportAs: ["ngxMatDateRangePicker"], usesInheritance: true, ngImport: i0, template: '', isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDateRangePicker, decorators: [{
            type: Component,
            args: [{
                    selector: 'ngx-mat-date-range-picker',
                    template: '',
                    exportAs: 'ngxMatDateRangePicker',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    providers: [
                        NGX_MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER,
                        NGX_MAT_CALENDAR_RANGE_STRATEGY_PROVIDER,
                        { provide: NgxMatDatepickerBase, useExisting: NgxMatDateRangePicker },
                    ],
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1yYW5nZS1waWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9kYXRldGltZS1waWNrZXIvc3JjL2xpYi9kYXRlLXJhbmdlLXBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3RGLE9BQU8sRUFBRSx3Q0FBd0MsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQzNGLE9BQU8sRUFBRSwyQ0FBMkMsRUFBZ0IsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRyxPQUFPLEVBQ0wsb0JBQW9CLEdBR3JCLE1BQU0sbUJBQW1CLENBQUM7O0FBYTNCLDhGQUE4RjtBQUM5Riw2RkFBNkY7QUFDN0YsK0VBQStFO0FBQy9FLDZFQUE2RTtBQWM3RSxNQUFNLE9BQU8scUJBQXlCLFNBQVEsb0JBSTdDO0lBQ29CLHFCQUFxQixDQUFDLFFBQXFEO1FBQzVGLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV0QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBRW5DLElBQUksS0FBSyxFQUFFLENBQUM7WUFDVixRQUFRLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUM7WUFDakQsUUFBUSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDO1lBQzdDLFFBQVEsQ0FBQyx1QkFBdUIsR0FBRyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztZQUN2RSxRQUFRLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDLHlCQUF5QixFQUFFLENBQUM7UUFDckUsQ0FBQztJQUNILENBQUM7aUlBaEJVLHFCQUFxQjtxSEFBckIscUJBQXFCLHdFQVByQjtZQUNULDJDQUEyQztZQUMzQyx3Q0FBd0M7WUFDeEMsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsV0FBVyxFQUFFLHFCQUFxQixFQUFFO1NBQ3RFLHNGQVJTLEVBQUU7OzJGQVdELHFCQUFxQjtrQkFiakMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsMkJBQTJCO29CQUNyQyxRQUFRLEVBQUUsRUFBRTtvQkFDWixRQUFRLEVBQUUsdUJBQXVCO29CQUNqQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtvQkFDL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7b0JBQ3JDLFNBQVMsRUFBRTt3QkFDVCwyQ0FBMkM7d0JBQzNDLHdDQUF3Qzt3QkFDeEMsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsV0FBVyx1QkFBdUIsRUFBRTtxQkFDdEU7b0JBQ0QsVUFBVSxFQUFFLElBQUk7aUJBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCwgVmlld0VuY2Fwc3VsYXRpb24gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgTkdYX01BVF9DQUxFTkRBUl9SQU5HRV9TVFJBVEVHWV9QUk9WSURFUiB9IGZyb20gJy4vZGF0ZS1yYW5nZS1zZWxlY3Rpb24tc3RyYXRlZ3knO1xyXG5pbXBvcnQgeyBOR1hfTUFUX1JBTkdFX0RBVEVfU0VMRUNUSU9OX01PREVMX1BST1ZJREVSLCBOZ3hEYXRlUmFuZ2UgfSBmcm9tICcuL2RhdGUtc2VsZWN0aW9uLW1vZGVsJztcclxuaW1wb3J0IHtcclxuICBOZ3hNYXREYXRlcGlja2VyQmFzZSxcclxuICBOZ3hNYXREYXRlcGlja2VyQ29udGVudCxcclxuICBOZ3hNYXREYXRlcGlja2VyQ29udHJvbCxcclxufSBmcm9tICcuL2RhdGVwaWNrZXItYmFzZSc7XHJcblxyXG4vKipcclxuICogSW5wdXQgdGhhdCBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIGEgZGF0ZSByYW5nZSBwaWNrZXIuXHJcbiAqIEBkb2NzLXByaXZhdGVcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTmd4TWF0RGF0ZVJhbmdlUGlja2VySW5wdXQ8RD4gZXh0ZW5kcyBOZ3hNYXREYXRlcGlja2VyQ29udHJvbDxEPiB7XHJcbiAgX2dldEVuZERhdGVBY2Nlc3NpYmxlTmFtZSgpOiBzdHJpbmcgfCBudWxsO1xyXG4gIF9nZXRTdGFydERhdGVBY2Nlc3NpYmxlTmFtZSgpOiBzdHJpbmcgfCBudWxsO1xyXG4gIGNvbXBhcmlzb25TdGFydDogRCB8IG51bGw7XHJcbiAgY29tcGFyaXNvbkVuZDogRCB8IG51bGw7XHJcbn1cclxuXHJcbi8vIFRPRE8obW1hbGVyYmEpOiBXZSB1c2UgYSBjb21wb25lbnQgaW5zdGVhZCBvZiBhIGRpcmVjdGl2ZSBoZXJlIHNvIHRoZSB1c2VyIGNhbiB1c2UgaW1wbGljaXRcclxuLy8gdGVtcGxhdGUgcmVmZXJlbmNlIHZhcmlhYmxlcyAoZS5nLiAjZCB2cyAjZD1cIm1hdERhdGVSYW5nZVBpY2tlclwiKS4gV2UgY2FuIGNoYW5nZSB0aGlzIHRvIGFcclxuLy8gZGlyZWN0aXZlIGlmIGFuZ3VsYXIgYWRkcyBzdXBwb3J0IGZvciBgZXhwb3J0QXM6ICckaW1wbGljaXQnYCBvbiBkaXJlY3RpdmVzLlxyXG4vKiogQ29tcG9uZW50IHJlc3BvbnNpYmxlIGZvciBtYW5hZ2luZyB0aGUgZGF0ZSByYW5nZSBwaWNrZXIgcG9wdXAvZGlhbG9nLiAqL1xyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ25neC1tYXQtZGF0ZS1yYW5nZS1waWNrZXInLFxyXG4gIHRlbXBsYXRlOiAnJyxcclxuICBleHBvcnRBczogJ25neE1hdERhdGVSYW5nZVBpY2tlcicsXHJcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxuICBwcm92aWRlcnM6IFtcclxuICAgIE5HWF9NQVRfUkFOR0VfREFURV9TRUxFQ1RJT05fTU9ERUxfUFJPVklERVIsXHJcbiAgICBOR1hfTUFUX0NBTEVOREFSX1JBTkdFX1NUUkFURUdZX1BST1ZJREVSLFxyXG4gICAgeyBwcm92aWRlOiBOZ3hNYXREYXRlcGlja2VyQmFzZSwgdXNlRXhpc3Rpbmc6IE5neE1hdERhdGVSYW5nZVBpY2tlciB9LFxyXG4gIF0sXHJcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcclxufSlcclxuZXhwb3J0IGNsYXNzIE5neE1hdERhdGVSYW5nZVBpY2tlcjxEPiBleHRlbmRzIE5neE1hdERhdGVwaWNrZXJCYXNlPFxyXG4gIE5neE1hdERhdGVSYW5nZVBpY2tlcklucHV0PEQ+LFxyXG4gIE5neERhdGVSYW5nZTxEPixcclxuICBEXHJcbj4ge1xyXG4gIHByb3RlY3RlZCBvdmVycmlkZSBfZm9yd2FyZENvbnRlbnRWYWx1ZXMoaW5zdGFuY2U6IE5neE1hdERhdGVwaWNrZXJDb250ZW50PE5neERhdGVSYW5nZTxEPiwgRD4pIHtcclxuICAgIHN1cGVyLl9mb3J3YXJkQ29udGVudFZhbHVlcyhpbnN0YW5jZSk7XHJcblxyXG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLmRhdGVwaWNrZXJJbnB1dDtcclxuXHJcbiAgICBpZiAoaW5wdXQpIHtcclxuICAgICAgaW5zdGFuY2UuY29tcGFyaXNvblN0YXJ0ID0gaW5wdXQuY29tcGFyaXNvblN0YXJ0O1xyXG4gICAgICBpbnN0YW5jZS5jb21wYXJpc29uRW5kID0gaW5wdXQuY29tcGFyaXNvbkVuZDtcclxuICAgICAgaW5zdGFuY2Uuc3RhcnREYXRlQWNjZXNzaWJsZU5hbWUgPSBpbnB1dC5fZ2V0U3RhcnREYXRlQWNjZXNzaWJsZU5hbWUoKTtcclxuICAgICAgaW5zdGFuY2UuZW5kRGF0ZUFjY2Vzc2libGVOYW1lID0gaW5wdXQuX2dldEVuZERhdGVBY2Nlc3NpYmxlTmFtZSgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=