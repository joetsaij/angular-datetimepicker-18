import { Injectable, InjectionToken, Optional, SkipSelf } from '@angular/core';
import { NgxMatDateAdapter } from './core/date-adapter';
import { NgxDateRange } from './date-selection-model';
import * as i0 from "@angular/core";
import * as i1 from "./core/date-adapter";
/** Injection token used to customize the date range selection behavior. */
export const NGX_MAT_DATE_RANGE_SELECTION_STRATEGY = new InjectionToken('NGX_MAT_DATE_RANGE_SELECTION_STRATEGY');
/** Provides the default date range selection behavior. */
export class DefaultNgxMatCalendarRangeStrategy {
    constructor(_dateAdapter) {
        this._dateAdapter = _dateAdapter;
    }
    selectionFinished(date, currentRange) {
        let { start, end } = currentRange;
        if (start == null) {
            start = date;
        }
        else if (end == null && date && this._dateAdapter.compareDate(date, start) >= 0) {
            end = date;
        }
        else {
            start = date;
            end = null;
        }
        return new NgxDateRange(start, end);
    }
    createPreview(activeDate, currentRange) {
        let start = null;
        let end = null;
        if (currentRange.start && !currentRange.end && activeDate) {
            start = currentRange.start;
            end = activeDate;
        }
        return new NgxDateRange(start, end);
    }
    createDrag(dragOrigin, originalRange, newDate) {
        let start = originalRange.start;
        let end = originalRange.end;
        if (!start || !end) {
            // Can't drag from an incomplete range.
            return null;
        }
        const adapter = this._dateAdapter;
        const isRange = adapter.compareDate(start, end) !== 0;
        const diffYears = adapter.getYear(newDate) - adapter.getYear(dragOrigin);
        const diffMonths = adapter.getMonth(newDate) - adapter.getMonth(dragOrigin);
        const diffDays = adapter.getDate(newDate) - adapter.getDate(dragOrigin);
        if (isRange && adapter.sameDate(dragOrigin, originalRange.start)) {
            start = newDate;
            if (adapter.compareDate(newDate, end) > 0) {
                end = adapter.addCalendarYears(end, diffYears);
                end = adapter.addCalendarMonths(end, diffMonths);
                end = adapter.addCalendarDays(end, diffDays);
            }
        }
        else if (isRange && adapter.sameDate(dragOrigin, originalRange.end)) {
            end = newDate;
            if (adapter.compareDate(newDate, start) < 0) {
                start = adapter.addCalendarYears(start, diffYears);
                start = adapter.addCalendarMonths(start, diffMonths);
                start = adapter.addCalendarDays(start, diffDays);
            }
        }
        else {
            start = adapter.addCalendarYears(start, diffYears);
            start = adapter.addCalendarMonths(start, diffMonths);
            start = adapter.addCalendarDays(start, diffDays);
            end = adapter.addCalendarYears(end, diffYears);
            end = adapter.addCalendarMonths(end, diffMonths);
            end = adapter.addCalendarDays(end, diffDays);
        }
        return new NgxDateRange(start, end);
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: DefaultNgxMatCalendarRangeStrategy, deps: [{ token: i1.NgxMatDateAdapter }], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: DefaultNgxMatCalendarRangeStrategy }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: DefaultNgxMatCalendarRangeStrategy, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.NgxMatDateAdapter }] });
/** @docs-private */
export function NGX_MAT_CALENDAR_RANGE_STRATEGY_PROVIDER_FACTORY(parent, adapter) {
    return parent || new DefaultNgxMatCalendarRangeStrategy(adapter);
}
export const NGX_MAT_CALENDAR_RANGE_STRATEGY_PROVIDER = {
    provide: NGX_MAT_DATE_RANGE_SELECTION_STRATEGY,
    deps: [
        [new Optional(), new SkipSelf(), NGX_MAT_DATE_RANGE_SELECTION_STRATEGY],
        NgxMatDateAdapter,
    ],
    useFactory: NGX_MAT_CALENDAR_RANGE_STRATEGY_PROVIDER_FACTORY,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1yYW5nZS1zZWxlY3Rpb24tc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9kYXRldGltZS1waWNrZXIvc3JjL2xpYi9kYXRlLXJhbmdlLXNlbGVjdGlvbi1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQW1CLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNoRyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7OztBQUV0RCwyRUFBMkU7QUFDM0UsTUFBTSxDQUFDLE1BQU0scUNBQXFDLEdBQUcsSUFBSSxjQUFjLENBRXJFLHVDQUF1QyxDQUFDLENBQUM7QUEyQzNDLDBEQUEwRDtBQUUxRCxNQUFNLE9BQU8sa0NBQWtDO0lBQzdDLFlBQW9CLFlBQWtDO1FBQWxDLGlCQUFZLEdBQVosWUFBWSxDQUFzQjtJQUFHLENBQUM7SUFFMUQsaUJBQWlCLENBQUMsSUFBTyxFQUFFLFlBQTZCO1FBQ3RELElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsWUFBWSxDQUFDO1FBRWxDLElBQUksS0FBSyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ2xCLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDZixDQUFDO2FBQU0sSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbEYsR0FBRyxHQUFHLElBQUksQ0FBQztRQUNiLENBQUM7YUFBTSxDQUFDO1lBQ04sS0FBSyxHQUFHLElBQUksQ0FBQztZQUNiLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQs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Q0FBQztZQUNuRCxLQUFLLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNyRCxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDakQsR0FBRyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDL0MsR0FBRyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDakQsR0FBRyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFRCxPQUFPLElBQUksWUFBWSxDQUFJLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN6QyxDQUFDO2lJQXRFVSxrQ0FBa0M7cUlBQWxDLGtDQUFrQzs7MkZBQWxDLGtDQUFrQztrQkFEOUMsVUFBVTs7QUEwRVgsb0JBQW9CO0FBQ3BCLE1BQU0sVUFBVSxnREFBZ0QsQ0FDOUQsTUFBaUQsRUFDakQsT0FBbUM7SUFFbkMsT0FBTyxNQUFNLElBQUksSUFBSSxrQ0FBa0MsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sd0NBQXdDLEdBQW9CO0lBQ3ZFLE9BQU8sRUFBRSxxQ0FBcUM7SUFDOUMsSUFBSSxFQUFFO1FBQ0osQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLElBQUksUUFBUSxFQUFFLEVBQUUscUNBQXFDLENBQUM7UUFDdkUsaUJBQWlCO0tBQ2xCO0lBQ0QsVUFBVSxFQUFFLGdEQUFnRDtDQUM3RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmFjdG9yeVByb3ZpZGVyLCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgT3B0aW9uYWwsIFNraXBTZWxmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE5neE1hdERhdGVBZGFwdGVyIH0gZnJvbSAnLi9jb3JlL2RhdGUtYWRhcHRlcic7XHJcbmltcG9ydCB7IE5neERhdGVSYW5nZSB9IGZyb20gJy4vZGF0ZS1zZWxlY3Rpb24tbW9kZWwnO1xyXG5cclxuLyoqIEluamVjdGlvbiB0b2tlbiB1c2VkIHRvIGN1c3RvbWl6ZSB0aGUgZGF0ZSByYW5nZSBzZWxlY3Rpb24gYmVoYXZpb3IuICovXHJcbmV4cG9ydCBjb25zdCBOR1hfTUFUX0RBVEVfUkFOR0VfU0VMRUNUSU9OX1NUUkFURUdZID0gbmV3IEluamVjdGlvblRva2VuPFxyXG4gIE5neE1hdERhdGVSYW5nZVNlbGVjdGlvblN0cmF0ZWd5PGFueT5cclxuPignTkdYX01BVF9EQVRFX1JBTkdFX1NFTEVDVElPTl9TVFJBVEVHWScpO1xyXG5cclxuLyoqIE9iamVjdCB0aGF0IGNhbiBiZSBwcm92aWRlZCBpbiBvcmRlciB0byBjdXN0b21pemUgdGhlIGRhdGUgcmFuZ2Ugc2VsZWN0aW9uIGJlaGF2aW9yLiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIE5neE1hdERhdGVSYW5nZVNlbGVjdGlvblN0cmF0ZWd5PEQ+IHtcclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdXNlciBoYXMgZmluaXNoZWQgc2VsZWN0aW5nIGEgdmFsdWUuXHJcbiAgICogQHBhcmFtIGRhdGUgRGF0ZSB0aGF0IHdhcyBzZWxlY3RlZC4gV2lsbCBiZSBudWxsIGlmIHRoZSB1c2VyIGNsZWFyZWQgdGhlIHNlbGVjdGlvbi5cclxuICAgKiBAcGFyYW0gY3VycmVudFJhbmdlIFJhbmdlIHRoYXQgaXMgY3VycmVudGx5IHNob3cgaW4gdGhlIGNhbGVuZGFyLlxyXG4gICAqIEBwYXJhbSBldmVudCBET00gZXZlbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIHNlbGVjdGlvbi4gQ3VycmVudGx5IG9ubHkgY29ycmVzcG9uZHMgdG8gYSBgY2xpY2tgXHJcbiAgICogICAgZXZlbnQsIGJ1dCBpdCBtYXkgZ2V0IGV4cGFuZGVkIGluIHRoZSBmdXR1cmUuXHJcbiAgICovXHJcbiAgc2VsZWN0aW9uRmluaXNoZWQoZGF0ZTogRCB8IG51bGwsIGN1cnJlbnRSYW5nZTogTmd4RGF0ZVJhbmdlPEQ+LCBldmVudDogRXZlbnQpOiBOZ3hEYXRlUmFuZ2U8RD47XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIHRoZSB1c2VyIGhhcyBhY3RpdmF0ZWQgYSBuZXcgZGF0ZSAoZS5nLiBieSBob3ZlcmluZyBvdmVyXHJcbiAgICogaXQgb3IgbW92aW5nIGZvY3VzKSBhbmQgdGhlIGNhbGVuZGFyIHRyaWVzIHRvIGRpc3BsYXkgYSBkYXRlIHJhbmdlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGFjdGl2ZURhdGUgRGF0ZSB0aGF0IHRoZSB1c2VyIGhhcyBhY3RpdmF0ZWQuIFdpbGwgYmUgbnVsbCBpZiB0aGUgdXNlciBtb3ZlZFxyXG4gICAqICAgIGZvY3VzIHRvIGFuIGVsZW1lbnQgdGhhdCdzIG5vIGEgY2FsZW5kYXIgY2VsbC5cclxuICAgKiBAcGFyYW0gY3VycmVudFJhbmdlIFJhbmdlIHRoYXQgaXMgY3VycmVudGx5IHNob3duIGluIHRoZSBjYWxlbmRhci5cclxuICAgKiBAcGFyYW0gZXZlbnQgRE9NIGV2ZW50IHRoYXQgY2F1c2VkIHRoZSBwcmV2aWV3IHRvIGJlIGNoYW5nZWQuIFdpbGwgYmUgZWl0aGVyIGFcclxuICAgKiAgICBgbW91c2VlbnRlcmAvYG1vdXNlbGVhdmVgIG9yIGBmb2N1c2AvYGJsdXJgIGRlcGVuZGluZyBvbiBob3cgdGhlIHVzZXIgaXMgbmF2aWdhdGluZy5cclxuICAgKi9cclxuICBjcmVhdGVQcmV2aWV3KGFjdGl2ZURhdGU6IEQgfCBudWxsLCBjdXJyZW50UmFuZ2U6IE5neERhdGVSYW5nZTxEPiwgZXZlbnQ6IEV2ZW50KTogTmd4RGF0ZVJhbmdlPEQ+O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdXNlciBoYXMgZHJhZ2dlZCBhIGRhdGUgaW4gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCByYW5nZSB0byBhbm90aGVyXHJcbiAgICogZGF0ZS4gUmV0dXJucyB0aGUgZGF0ZSB1cGRhdGVkIHJhbmdlIHRoYXQgc2hvdWxkIHJlc3VsdCBmcm9tIHRoaXMgaW50ZXJhY3Rpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZGF0ZU9yaWdpbiBUaGUgZGF0ZSB0aGUgdXNlciBzdGFydGVkIGRyYWdnaW5nIGZyb20uXHJcbiAgICogQHBhcmFtIG9yaWdpbmFsUmFuZ2UgVGhlIG9yaWdpbmFsbHkgc2VsZWN0ZWQgZGF0ZSByYW5nZS5cclxuICAgKiBAcGFyYW0gbmV3RGF0ZSBUaGUgY3VycmVudGx5IHRhcmdldGVkIGRhdGUgaW4gdGhlIGRyYWcgb3BlcmF0aW9uLlxyXG4gICAqIEBwYXJhbSBldmVudCBET00gZXZlbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIHVwZGF0ZWQgZHJhZyBzdGF0ZS4gV2lsbCBiZVxyXG4gICAqICAgICBgbW91c2VlbnRlcmAvYG1vdXNldXBgIG9yIGB0b3VjaG1vdmVgL2B0b3VjaGVuZGAgZGVwZW5kaW5nIG9uIHRoZSBkZXZpY2UgdHlwZS5cclxuICAgKi9cclxuICBjcmVhdGVEcmFnPyhcclxuICAgIGRyYWdPcmlnaW46IEQsXHJcbiAgICBvcmlnaW5hbFJhbmdlOiBOZ3hEYXRlUmFuZ2U8RD4sXHJcbiAgICBuZXdEYXRlOiBELFxyXG4gICAgZXZlbnQ6IEV2ZW50LFxyXG4gICk6IE5neERhdGVSYW5nZTxEPiB8IG51bGw7XHJcbn1cclxuXHJcbi8qKiBQcm92aWRlcyB0aGUgZGVmYXVsdCBkYXRlIHJhbmdlIHNlbGVjdGlvbiBiZWhhdmlvci4gKi9cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgRGVmYXVsdE5neE1hdENhbGVuZGFyUmFuZ2VTdHJhdGVneTxEPiBpbXBsZW1lbnRzIE5neE1hdERhdGVSYW5nZVNlbGVjdGlvblN0cmF0ZWd5PEQ+IHtcclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kYXRlQWRhcHRlcjogTmd4TWF0RGF0ZUFkYXB0ZXI8RD4pIHt9XHJcblxyXG4gIHNlbGVjdGlvbkZpbmlzaGVkKGRhdGU6IEQsIGN1cnJlbnRSYW5nZTogTmd4RGF0ZVJhbmdlPEQ+KSB7XHJcbiAgICBsZXQgeyBzdGFydCwgZW5kIH0gPSBjdXJyZW50UmFuZ2U7XHJcblxyXG4gICAgaWYgKHN0YXJ0ID09IG51bGwpIHtcclxuICAgICAgc3RhcnQgPSBkYXRlO1xyXG4gICAgfSBlbHNlIGlmIChlbmQgPT0gbnVsbCAmJiBkYXRlICYmIHRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlKGRhdGUsIHN0YXJ0KSA+PSAwKSB7XHJcbiAgICAgIGVuZCA9IGRhdGU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdGFydCA9IGRhdGU7XHJcbiAgICAgIGVuZCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBOZ3hEYXRlUmFuZ2U8RD4oc3RhcnQsIGVuZCk7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVQcmV2aWV3KGFjdGl2ZURhdGU6IEQgfCBudWxsLCBjdXJyZW50UmFuZ2U6IE5neERhdGVSYW5nZTxEPikge1xyXG4gICAgbGV0IHN0YXJ0OiBEIHwgbnVsbCA9IG51bGw7XHJcbiAgICBsZXQgZW5kOiBEIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgaWYgKGN1cnJlbnRSYW5nZS5zdGFydCAmJiAhY3VycmVudFJhbmdlLmVuZCAmJiBhY3RpdmVEYXRlKSB7XHJcbiAgICAgIHN0YXJ0ID0gY3VycmVudFJhbmdlLnN0YXJ0O1xyXG4gICAgICBlbmQgPSBhY3RpdmVEYXRlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgTmd4RGF0ZVJhbmdlPEQ+KHN0YXJ0LCBlbmQpO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlRHJhZyhkcmFnT3JpZ2luOiBELCBvcmlnaW5hbFJhbmdlOiBOZ3hEYXRlUmFuZ2U8RD4sIG5ld0RhdGU6IEQpIHtcclxuICAgIGxldCBzdGFydCA9IG9yaWdpbmFsUmFuZ2Uuc3RhcnQ7XHJcbiAgICBsZXQgZW5kID0gb3JpZ2luYWxSYW5nZS5lbmQ7XHJcblxyXG4gICAgaWYgKCFzdGFydCB8fCAhZW5kKSB7XHJcbiAgICAgIC8vIENhbid0IGRyYWcgZnJvbSBhbiBpbmNvbXBsZXRlIHJhbmdlLlxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhZGFwdGVyID0gdGhpcy5fZGF0ZUFkYXB0ZXI7XHJcblxyXG4gICAgY29uc3QgaXNSYW5nZSA9IGFkYXB0ZXIuY29tcGFyZURhdGUoc3RhcnQsIGVuZCkgIT09IDA7XHJcbiAgICBjb25zdCBkaWZmWWVhcnMgPSBhZGFwdGVyLmdldFllYXIobmV3RGF0ZSkgLSBhZGFwdGVyLmdldFllYXIoZHJhZ09yaWdpbik7XHJcbiAgICBjb25zdCBkaWZmTW9udGhzID0gYWRhcHRlci5nZXRNb250aChuZXdEYXRlKSAtIGFkYXB0ZXIuZ2V0TW9udGgoZHJhZ09yaWdpbik7XHJcbiAgICBjb25zdCBkaWZmRGF5cyA9IGFkYXB0ZXIuZ2V0RGF0ZShuZXdEYXRlKSAtIGFkYXB0ZXIuZ2V0RGF0ZShkcmFnT3JpZ2luKTtcclxuXHJcbiAgICBpZiAoaXNSYW5nZSAmJiBhZGFwdGVyLnNhbWVEYXRlKGRyYWdPcmlnaW4sIG9yaWdpbmFsUmFuZ2Uuc3RhcnQpKSB7XHJcbiAgICAgIHN0YXJ0ID0gbmV3RGF0ZTtcclxuICAgICAgaWYgKGFkYXB0ZXIuY29tcGFyZURhdGUobmV3RGF0ZSwgZW5kKSA+IDApIHtcclxuICAgICAgICBlbmQgPSBhZGFwdGVyLmFkZENhbGVuZGFyWWVhcnMoZW5kLCBkaWZmWWVhcnMpO1xyXG4gICAgICAgIGVuZCA9IGFkYXB0ZXIuYWRkQ2FsZW5kYXJNb250aHMoZW5kLCBkaWZmTW9udGhzKTtcclxuICAgICAgICBlbmQgPSBhZGFwdGVyLmFkZENhbGVuZGFyRGF5cyhlbmQsIGRpZmZEYXlzKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChpc1JhbmdlICYmIGFkYXB0ZXIuc2FtZURhdGUoZHJhZ09yaWdpbiwgb3JpZ2luYWxSYW5nZS5lbmQpKSB7XHJcbiAgICAgIGVuZCA9IG5ld0RhdGU7XHJcbiAgICAgIGlmIChhZGFwdGVyLmNvbXBhcmVEYXRlKG5ld0RhdGUsIHN0YXJ0KSA8IDApIHtcclxuICAgICAgICBzdGFydCA9IGFkYXB0ZXIuYWRkQ2FsZW5kYXJZZWFycyhzdGFydCwgZGlmZlllYXJzKTtcclxuICAgICAgICBzdGFydCA9IGFkYXB0ZXIuYWRkQ2FsZW5kYXJNb250aHMoc3RhcnQsIGRpZmZNb250aHMpO1xyXG4gICAgICAgIHN0YXJ0ID0gYWRhcHRlci5hZGRDYWxlbmRhckRheXMoc3RhcnQsIGRpZmZEYXlzKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3RhcnQgPSBhZGFwdGVyLmFkZENhbGVuZGFyWWVhcnMoc3RhcnQsIGRpZmZZZWFycyk7XHJcbiAgICAgIHN0YXJ0ID0gYWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyhzdGFydCwgZGlmZk1vbnRocyk7XHJcbiAgICAgIHN0YXJ0ID0gYWRhcHRlci5hZGRDYWxlbmRhckRheXMoc3RhcnQsIGRpZmZEYXlzKTtcclxuICAgICAgZW5kID0gYWRhcHRlci5hZGRDYWxlbmRhclllYXJzKGVuZCwgZGlmZlllYXJzKTtcclxuICAgICAgZW5kID0gYWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyhlbmQsIGRpZmZNb250aHMpO1xyXG4gICAgICBlbmQgPSBhZGFwdGVyLmFkZENhbGVuZGFyRGF5cyhlbmQsIGRpZmZEYXlzKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IE5neERhdGVSYW5nZTxEPihzdGFydCwgZW5kKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAZG9jcy1wcml2YXRlICovXHJcbmV4cG9ydCBmdW5jdGlvbiBOR1hfTUFUX0NBTEVOREFSX1JBTkdFX1NUUkFURUdZX1BST1ZJREVSX0ZBQ1RPUlkoXHJcbiAgcGFyZW50OiBOZ3hNYXREYXRlUmFuZ2VTZWxlY3Rpb25TdHJhdGVneTx1bmtub3duPixcclxuICBhZGFwdGVyOiBOZ3hNYXREYXRlQWRhcHRlcjx1bmtub3duPixcclxuKSB7XHJcbiAgcmV0dXJuIHBhcmVudCB8fCBuZXcgRGVmYXVsdE5neE1hdENhbGVuZGFyUmFuZ2VTdHJhdGVneShhZGFwdGVyKTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IE5HWF9NQVRfQ0FMRU5EQVJfUkFOR0VfU1RSQVRFR1lfUFJPVklERVI6IEZhY3RvcnlQcm92aWRlciA9IHtcclxuICBwcm92aWRlOiBOR1hfTUFUX0RBVEVfUkFOR0VfU0VMRUNUSU9OX1NUUkFURUdZLFxyXG4gIGRlcHM6IFtcclxuICAgIFtuZXcgT3B0aW9uYWwoKSwgbmV3IFNraXBTZWxmKCksIE5HWF9NQVRfREFURV9SQU5HRV9TRUxFQ1RJT05fU1RSQVRFR1ldLFxyXG4gICAgTmd4TWF0RGF0ZUFkYXB0ZXIsXHJcbiAgXSxcclxuICB1c2VGYWN0b3J5OiBOR1hfTUFUX0NBTEVOREFSX1JBTkdFX1NUUkFURUdZX1BST1ZJREVSX0ZBQ1RPUlksXHJcbn07XHJcbiJdfQ==