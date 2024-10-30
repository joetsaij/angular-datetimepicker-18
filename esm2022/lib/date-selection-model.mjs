import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
import { NgxMatDateAdapter } from './core/date-adapter';
import * as i0 from "@angular/core";
import * as i1 from "./core/date-adapter";
/** A class representing a range of dates. */
export class NgxDateRange {
    constructor(
    /** The start date of the range. */
    start, 
    /** The end date of the range. */
    end) {
        this.start = start;
        this.end = end;
    }
}
/**
 * A selection model containing a date selection.
 * @docs-private
 */
export class NgxMatDateSelectionModel {
    constructor(
    /** The current selection. */
    selection, _adapter) {
        this.selection = selection;
        this._adapter = _adapter;
        this._selectionChanged = new Subject();
        /** Emits when the selection has changed. */
        this.selectionChanged = this._selectionChanged;
        this.selection = selection;
    }
    /**
     * Updates the current selection in the model.
     * @param value New selection that should be assigned.
     * @param source Object that triggered the selection change.
     */
    updateSelection(value, source) {
        const oldValue = this.selection;
        this.selection = value;
        this._selectionChanged.next({ selection: value, source, oldValue });
    }
    ngOnDestroy() {
        this._selectionChanged.complete();
    }
    _isValidDateInstance(date) {
        return this._adapter.isDateInstance(date) && this._adapter.isValid(date);
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDateSelectionModel, deps: "invalid", target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDateSelectionModel }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatDateSelectionModel, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined }, { type: i1.NgxMatDateAdapter }] });
/**
 * A selection model that contains a single date.
 * @docs-private
 */
export class NgxMatSingleDateSelectionModel extends NgxMatDateSelectionModel {
    constructor(adapter) {
        super(null, adapter);
    }
    /**
     * Adds a date to the current selection. In the case of a single date selection, the added date
     * simply overwrites the previous selection
     */
    add(date) {
        super.updateSelection(date, this);
    }
    /** Checks whether the current selection is valid. */
    isValid() {
        return this.selection != null && this._isValidDateInstance(this.selection);
    }
    /**
     * Checks whether the current selection is complete. In the case of a single date selection, this
     * is true if the current selection is not null.
     */
    isComplete() {
        return this.selection != null;
    }
    /** Clones the selection model. */
    clone() {
        const clone = new NgxMatSingleDateSelectionModel(this._adapter);
        clone.updateSelection(this.selection, this);
        return clone;
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatSingleDateSelectionModel, deps: [{ token: i1.NgxMatDateAdapter }], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatSingleDateSelectionModel }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatSingleDateSelectionModel, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.NgxMatDateAdapter }] });
/**
 * A selection model that contains a date range.
 * @docs-private
 */
export class NgxMatRangeDateSelectionModel extends NgxMatDateSelectionModel {
    constructor(adapter) {
        super(new NgxDateRange(null, null), adapter);
    }
    /**
     * Adds a date to the current selection. In the case of a date range selection, the added date
     * fills in the next `null` value in the range. If both the start and the end already have a date,
     * the selection is reset so that the given date is the new `start` and the `end` is null.
     */
    add(date) {
        let { start, end } = this.selection;
        if (start == null) {
            start = date;
        }
        else if (end == null) {
            end = date;
        }
        else {
            start = date;
            end = null;
        }
        super.updateSelection(new NgxDateRange(start, end), this);
    }
    /** Checks whether the current selection is valid. */
    isValid() {
        const { start, end } = this.selection;
        // Empty ranges are valid.
        if (start == null && end == null) {
            return true;
        }
        // Complete ranges are only valid if both dates are valid and the start is before the end.
        if (start != null && end != null) {
            return (this._isValidDateInstance(start) &&
                this._isValidDateInstance(end) &&
                this._adapter.compareDate(start, end) <= 0);
        }
        // Partial ranges are valid if the start/end is valid.
        return ((start == null || this._isValidDateInstance(start)) &&
            (end == null || this._isValidDateInstance(end)));
    }
    /**
     * Checks whether the current selection is complete. In the case of a date range selection, this
     * is true if the current selection has a non-null `start` and `end`.
     */
    isComplete() {
        return this.selection.start != null && this.selection.end != null;
    }
    /** Clones the selection model. */
    clone() {
        const clone = new NgxMatRangeDateSelectionModel(this._adapter);
        clone.updateSelection(this.selection, this);
        return clone;
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatRangeDateSelectionModel, deps: [{ token: i1.NgxMatDateAdapter }], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatRangeDateSelectionModel }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatRangeDateSelectionModel, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.NgxMatDateAdapter }] });
/** @docs-private */
export function NGX_MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY(parent, adapter) {
    return parent || new NgxMatSingleDateSelectionModel(adapter);
}
/**
 * Used to provide a single selection model to a component.
 * @docs-private
 */
export const NGX_MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER = {
    provide: NgxMatDateSelectionModel,
    deps: [[new Optional(), new SkipSelf(), NgxMatDateSelectionModel], NgxMatDateAdapter],
    useFactory: NGX_MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY,
};
/** @docs-private */
export function NGX_MAT_RANGE_DATE_SELECTION_MODEL_FACTORY(parent, adapter) {
    return parent || new NgxMatRangeDateSelectionModel(adapter);
}
/**
 * Used to provide a range selection model to a component.
 * @docs-private
 */
export const NGX_MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER = {
    provide: NgxMatDateSelectionModel,
    deps: [[new Optional(), new SkipSelf(), NgxMatDateSelectionModel], NgxMatDateAdapter],
    useFactory: NGX_MAT_RANGE_DATE_SELECTION_MODEL_FACTORY,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1zZWxlY3Rpb24tbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9kYXRldGltZS1waWNrZXIvc3JjL2xpYi9kYXRlLXNlbGVjdGlvbi1tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQW1CLFVBQVUsRUFBYSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNGLE9BQU8sRUFBYyxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDM0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUJBQXFCLENBQUM7OztBQUV4RCw2Q0FBNkM7QUFDN0MsTUFBTSxPQUFPLFlBQVk7SUFRdkI7SUFDRSxtQ0FBbUM7SUFDMUIsS0FBZTtJQUN4QixpQ0FBaUM7SUFDeEIsR0FBYTtRQUZiLFVBQUssR0FBTCxLQUFLLENBQVU7UUFFZixRQUFHLEdBQUgsR0FBRyxDQUFVO0lBQ3JCLENBQUM7Q0FDTDtBQXdCRDs7O0dBR0c7QUFFSCxNQUFNLE9BQWdCLHdCQUF3QjtJQVE1QztJQUNFLDZCQUE2QjtJQUNwQixTQUFZLEVBQ1gsUUFBOEI7UUFEL0IsY0FBUyxHQUFULFNBQVMsQ0FBRztRQUNYLGFBQVEsR0FBUixRQUFRLENBQXNCO1FBUnpCLHNCQUFpQixHQUFHLElBQUksT0FBTyxFQUFrQyxDQUFDO1FBRW5GLDRDQUE0QztRQUM1QyxxQkFBZ0IsR0FBK0MsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBT3BGLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsZUFBZSxDQUFDLEtBQVEsRUFBRSxNQUFlO1FBQ3ZDLE1BQU0sUUFBUSxHQUFJLElBQXlCLENBQUMsU0FBUyxDQUFDO1FBQ3JELElBQXlCLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUM3QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFD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LElBQUksUUFBUSxFQUFFLEVBQUUsd0JBQXdCLENBQUMsRUFBRSxpQkFBaUIsQ0FBQztJQUNyRixVQUFVLEVBQUUsMkNBQTJDO0NBQ3hELENBQUM7QUFFRixvQkFBb0I7QUFDcEIsTUFBTSxVQUFVLDBDQUEwQyxDQUN4RCxNQUErQyxFQUMvQyxPQUFtQztJQUVuQyxPQUFPLE1BQU0sSUFBSSxJQUFJLDZCQUE2QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlELENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSwyQ0FBMkMsR0FBb0I7SUFDMUUsT0FBTyxFQUFFLHdCQUF3QjtJQUNqQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFLEVBQUUsSUFBSSxRQUFRLEVBQUUsRUFBRSx3QkFBd0IsQ0FBQyxFQUFFLGlCQUFpQixDQUFDO0lBQ3JGLFVBQVUsRUFBRSwwQ0FBMEM7Q0FDdkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZhY3RvcnlQcm92aWRlciwgSW5qZWN0YWJsZSwgT25EZXN0cm95LCBPcHRpb25hbCwgU2tpcFNlbGYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBOZ3hNYXREYXRlQWRhcHRlciB9IGZyb20gJy4vY29yZS9kYXRlLWFkYXB0ZXInO1xyXG5cclxuLyoqIEEgY2xhc3MgcmVwcmVzZW50aW5nIGEgcmFuZ2Ugb2YgZGF0ZXMuICovXHJcbmV4cG9ydCBjbGFzcyBOZ3hEYXRlUmFuZ2U8RD4ge1xyXG4gIC8qKlxyXG4gICAqIEVuc3VyZXMgdGhhdCBvYmplY3RzIHdpdGggYSBgc3RhcnRgIGFuZCBgZW5kYCBwcm9wZXJ0eSBjYW4ndCBiZSBhc3NpZ25lZCB0byBhIHZhcmlhYmxlIHRoYXRcclxuICAgKiBleHBlY3RzIGEgYERhdGVSYW5nZWBcclxuICAgKi9cclxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdW51c2VkLXZhcmlhYmxlXHJcbiAgcHJpdmF0ZSBfZGlzYWJsZVN0cnVjdHVyYWxFcXVpdmFsZW5jeTogbmV2ZXI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgLyoqIFRoZSBzdGFydCBkYXRlIG9mIHRoZSByYW5nZS4gKi9cclxuICAgIHJlYWRvbmx5IHN0YXJ0OiBEIHwgbnVsbCxcclxuICAgIC8qKiBUaGUgZW5kIGRhdGUgb2YgdGhlIHJhbmdlLiAqL1xyXG4gICAgcmVhZG9ubHkgZW5kOiBEIHwgbnVsbCxcclxuICApIHt9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25kaXRpb25hbGx5IHBpY2tzIHRoZSBkYXRlIHR5cGUsIGlmIGEgRGF0ZVJhbmdlIGlzIHBhc3NlZCBpbi5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IHR5cGUgTmd4RXh0cmFjdERhdGVUeXBlRnJvbVNlbGVjdGlvbjxUPiA9XHJcbiAgVCBleHRlbmRzIE5neERhdGVSYW5nZTxpbmZlciBEPiA/IEQgOiBOb25OdWxsYWJsZTxUPjtcclxuXHJcbi8qKlxyXG4gKiBFdmVudCBlbWl0dGVkIGJ5IHRoZSBkYXRlIHNlbGVjdGlvbiBtb2RlbCB3aGVuIGl0cyBzZWxlY3Rpb24gY2hhbmdlcy5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBOZ3hEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2U8Uz4ge1xyXG4gIC8qKiBOZXcgdmFsdWUgZm9yIHRoZSBzZWxlY3Rpb24uICovXHJcbiAgc2VsZWN0aW9uOiBTO1xyXG5cclxuICAvKiogT2JqZWN0IHRoYXQgdHJpZ2dlcmVkIHRoZSBjaGFuZ2UuICovXHJcbiAgc291cmNlOiB1bmtub3duO1xyXG5cclxuICAvKiogUHJldmlvdXMgdmFsdWUgKi9cclxuICBvbGRWYWx1ZT86IFM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIHNlbGVjdGlvbiBtb2RlbCBjb250YWluaW5nIGEgZGF0ZSBzZWxlY3Rpb24uXHJcbiAqIEBkb2NzLXByaXZhdGVcclxuICovXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5neE1hdERhdGVTZWxlY3Rpb25Nb2RlbDxTLCBEID0gTmd4RXh0cmFjdERhdGVUeXBlRnJvbVNlbGVjdGlvbjxTPj5cclxuICBpbXBsZW1lbnRzIE9uRGVzdHJveVxyXG57XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfc2VsZWN0aW9uQ2hhbmdlZCA9IG5ldyBTdWJqZWN0PE5neERhdGVTZWxlY3Rpb25Nb2RlbENoYW5nZTxTPj4oKTtcclxuXHJcbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHNlbGVjdGlvbiBoYXMgY2hhbmdlZC4gKi9cclxuICBzZWxlY3Rpb25DaGFuZ2VkOiBPYnNlcnZhYmxlPE5neERhdGVTZWxlY3Rpb25Nb2RlbENoYW5nZTxTPj4gPSB0aGlzLl9zZWxlY3Rpb25DaGFuZ2VkO1xyXG5cclxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoXHJcbiAgICAvKiogVGhlIGN1cnJlbnQgc2VsZWN0aW9uLiAqL1xyXG4gICAgcmVhZG9ubHkgc2VsZWN0aW9uOiBTLFxyXG4gICAgcHJvdGVjdGVkIF9hZGFwdGVyOiBOZ3hNYXREYXRlQWRhcHRlcjxEPixcclxuICApIHtcclxuICAgIHRoaXMuc2VsZWN0aW9uID0gc2VsZWN0aW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgY3VycmVudCBzZWxlY3Rpb24gaW4gdGhlIG1vZGVsLlxyXG4gICAqIEBwYXJhbSB2YWx1ZSBOZXcgc2VsZWN0aW9uIHRoYXQgc2hvdWxkIGJlIGFzc2lnbmVkLlxyXG4gICAqIEBwYXJhbSBzb3VyY2UgT2JqZWN0IHRoYXQgdHJpZ2dlcmVkIHRoZSBzZWxlY3Rpb24gY2hhbmdlLlxyXG4gICAqL1xyXG4gIHVwZGF0ZVNlbGVjdGlvbih2YWx1ZTogUywgc291cmNlOiB1bmtub3duKSB7XHJcbiAgICBjb25zdCBvbGRWYWx1ZSA9ICh0aGlzIGFzIHsgc2VsZWN0aW9uOiBTIH0pLnNlbGVjdGlvbjtcclxuICAgICh0aGlzIGFzIHsgc2VsZWN0aW9uOiBTIH0pLnNlbGVjdGlvbiA9IHZhbHVlO1xyXG4gICAgdGhpcy5fc2VsZWN0aW9uQ2hhbmdlZC5uZXh0KHsgc2VsZWN0aW9uOiB2YWx1ZSwgc291cmNlLCBvbGRWYWx1ZSB9KTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5fc2VsZWN0aW9uQ2hhbmdlZC5jb21wbGV0ZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIF9pc1ZhbGlkRGF0ZUluc3RhbmNlKGRhdGU6IEQpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9hZGFwdGVyLmlzRGF0ZUluc3RhbmNlKGRhdGUpICYmIHRoaXMuX2FkYXB0ZXIuaXNWYWxpZChkYXRlKTtcclxuICB9XHJcblxyXG4gIC8qKiBBZGRzIGEgZGF0ZSB0byB0aGUgY3VycmVudCBzZWxlY3Rpb24uICovXHJcbiAgYWJzdHJhY3QgYWRkKGRhdGU6IEQgfCBudWxsKTogdm9pZDtcclxuXHJcbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBpcyB2YWxpZC4gKi9cclxuICBhYnN0cmFjdCBpc1ZhbGlkKCk6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBzZWxlY3Rpb24gaXMgY29tcGxldGUuICovXHJcbiAgYWJzdHJhY3QgaXNDb21wbGV0ZSgpOiBib29sZWFuO1xyXG5cclxuICAvKiogQ2xvbmVzIHRoZSBzZWxlY3Rpb24gbW9kZWwuICovXHJcbiAgYWJzdHJhY3QgY2xvbmUoKTogTmd4TWF0RGF0ZVNlbGVjdGlvbk1vZGVsPFMsIEQ+O1xyXG59XHJcblxyXG4vKipcclxuICogQSBzZWxlY3Rpb24gbW9kZWwgdGhhdCBjb250YWlucyBhIHNpbmdsZSBkYXRlLlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBOZ3hNYXRTaW5nbGVEYXRlU2VsZWN0aW9uTW9kZWw8RD4gZXh0ZW5kcyBOZ3hNYXREYXRlU2VsZWN0aW9uTW9kZWw8RCB8IG51bGwsIEQ+IHtcclxuICBjb25zdHJ1Y3RvcihhZGFwdGVyOiBOZ3hNYXREYXRlQWRhcHRlcjxEPikge1xyXG4gICAgc3VwZXIobnVsbCwgYWRhcHRlcik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgZGF0ZSB0byB0aGUgY3VycmVudCBzZWxlY3Rpb24uIEluIHRoZSBjYXNlIG9mIGEgc2luZ2xlIGRhdGUgc2VsZWN0aW9uLCB0aGUgYWRkZWQgZGF0ZVxyXG4gICAqIHNpbXBseSBvdmVyd3JpdGVzIHRoZSBwcmV2aW91cyBzZWxlY3Rpb25cclxuICAgKi9cclxuICBhZGQoZGF0ZTogRCB8IG51bGwpIHtcclxuICAgIHN1cGVyLnVwZGF0ZVNlbGVjdGlvbihkYXRlLCB0aGlzKTtcclxuICB9XHJcblxyXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBzZWxlY3Rpb24gaXMgdmFsaWQuICovXHJcbiAgaXNWYWxpZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbiAhPSBudWxsICYmIHRoaXMuX2lzVmFsaWREYXRlSW5zdGFuY2UodGhpcy5zZWxlY3Rpb24pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGlzIGNvbXBsZXRlLiBJbiB0aGUgY2FzZSBvZiBhIHNpbmdsZSBkYXRlIHNlbGVjdGlvbiwgdGhpc1xyXG4gICAqIGlzIHRydWUgaWYgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGlzIG5vdCBudWxsLlxyXG4gICAqL1xyXG4gIGlzQ29tcGxldGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24gIT0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKiBDbG9uZXMgdGhlIHNlbGVjdGlvbiBtb2RlbC4gKi9cclxuICBjbG9uZSgpIHtcclxuICAgIGNvbnN0IGNsb25lID0gbmV3IE5neE1hdFNpbmdsZURhdGVTZWxlY3Rpb25Nb2RlbDxEPih0aGlzLl9hZGFwdGVyKTtcclxuICAgIGNsb25lLnVwZGF0ZVNlbGVjdGlvbih0aGlzLnNlbGVjdGlvbiwgdGhpcyk7XHJcbiAgICByZXR1cm4gY2xvbmU7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQSBzZWxlY3Rpb24gbW9kZWwgdGhhdCBjb250YWlucyBhIGRhdGUgcmFuZ2UuXHJcbiAqIEBkb2NzLXByaXZhdGVcclxuICovXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIE5neE1hdFJhbmdlRGF0ZVNlbGVjdGlvbk1vZGVsPEQ+IGV4dGVuZHMgTmd4TWF0RGF0ZVNlbGVjdGlvbk1vZGVsPE5neERhdGVSYW5nZTxEPiwgRD4ge1xyXG4gIGNvbnN0cnVjdG9yKGFkYXB0ZXI6IE5neE1hdERhdGVBZGFwdGVyPEQ+KSB7XHJcbiAgICBzdXBlcihuZXcgTmd4RGF0ZVJhbmdlPEQ+KG51bGwsIG51bGwpLCBhZGFwdGVyKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBkYXRlIHRvIHRoZSBjdXJyZW50IHNlbGVjdGlvbi4gSW4gdGhlIGNhc2Ugb2YgYSBkYXRlIHJhbmdlIHNlbGVjdGlvbiwgdGhlIGFkZGVkIGRhdGVcclxuICAgKiBmaWxscyBpbiB0aGUgbmV4dCBgbnVsbGAgdmFsdWUgaW4gdGhlIHJhbmdlLiBJZiBib3RoIHRoZSBzdGFydCBhbmQgdGhlIGVuZCBhbHJlYWR5IGhhdmUgYSBkYXRlLFxyXG4gICAqIHRoZSBzZWxlY3Rpb24gaXMgcmVzZXQgc28gdGhhdCB0aGUgZ2l2ZW4gZGF0ZSBpcyB0aGUgbmV3IGBzdGFydGAgYW5kIHRoZSBgZW5kYCBpcyBudWxsLlxyXG4gICAqL1xyXG4gIGFkZChkYXRlOiBEIHwgbnVsbCk6IHZvaWQge1xyXG4gICAgbGV0IHsgc3RhcnQsIGVuZCB9ID0gdGhpcy5zZWxlY3Rpb247XHJcblxyXG4gICAgaWYgKHN0YXJ0ID09IG51bGwpIHtcclxuICAgICAgc3RhcnQgPSBkYXRlO1xyXG4gICAgfSBlbHNlIGlmIChlbmQgPT0gbnVsbCkge1xyXG4gICAgICBlbmQgPSBkYXRlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3RhcnQgPSBkYXRlO1xyXG4gICAgICBlbmQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyLnVwZGF0ZVNlbGVjdGlvbihuZXcgTmd4RGF0ZVJhbmdlPEQ+KHN0YXJ0LCBlbmQpLCB0aGlzKTtcclxuICB9XHJcblxyXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBzZWxlY3Rpb24gaXMgdmFsaWQuICovXHJcbiAgaXNWYWxpZCgpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHsgc3RhcnQsIGVuZCB9ID0gdGhpcy5zZWxlY3Rpb247XHJcblxyXG4gICAgLy8gRW1wdHkgcmFuZ2VzIGFyZSB2YWxpZC5cclxuICAgIGlmIChzdGFydCA9PSBudWxsICYmIGVuZCA9PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENvbXBsZXRlIHJhbmdlcyBhcmUgb25seSB2YWxpZCBpZiBib3RoIGRhdGVzIGFyZSB2YWxpZCBhbmQgdGhlIHN0YXJ0IGlzIGJlZm9yZSB0aGUgZW5kLlxyXG4gICAgaWYgKHN0YXJ0ICE9IG51bGwgJiYgZW5kICE9IG51bGwpIHtcclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICB0aGlzLl9pc1ZhbGlkRGF0ZUluc3RhbmNlKHN0YXJ0KSAmJlxyXG4gICAgICAgIHRoaXMuX2lzVmFsaWREYXRlSW5zdGFuY2UoZW5kKSAmJlxyXG4gICAgICAgIHRoaXMuX2FkYXB0ZXIuY29tcGFyZURhdGUoc3RhcnQsIGVuZCkgPD0gMFxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFBhcnRpYWwgcmFuZ2VzIGFyZSB2YWxpZCBpZiB0aGUgc3RhcnQvZW5kIGlzIHZhbGlkLlxyXG4gICAgcmV0dXJuIChcclxuICAgICAgKHN0YXJ0ID09IG51bGwgfHwgdGhpcy5faXNWYWxpZERhdGVJbnN0YW5jZShzdGFydCkpICYmXHJcbiAgICAgIChlbmQgPT0gbnVsbCB8fCB0aGlzLl9pc1ZhbGlkRGF0ZUluc3RhbmNlKGVuZCkpXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGlzIGNvbXBsZXRlLiBJbiB0aGUgY2FzZSBvZiBhIGRhdGUgcmFuZ2Ugc2VsZWN0aW9uLCB0aGlzXHJcbiAgICogaXMgdHJ1ZSBpZiB0aGUgY3VycmVudCBzZWxlY3Rpb24gaGFzIGEgbm9uLW51bGwgYHN0YXJ0YCBhbmQgYGVuZGAuXHJcbiAgICovXHJcbiAgaXNDb21wbGV0ZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5zdGFydCAhPSBudWxsICYmIHRoaXMuc2VsZWN0aW9uLmVuZCAhPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqIENsb25lcyB0aGUgc2VsZWN0aW9uIG1vZGVsLiAqL1xyXG4gIGNsb25lKCkge1xyXG4gICAgY29uc3QgY2xvbmUgPSBuZXcgTmd4TWF0UmFuZ2VEYXRlU2VsZWN0aW9uTW9kZWw8RD4odGhpcy5fYWRhcHRlcik7XHJcbiAgICBjbG9uZS51cGRhdGVTZWxlY3Rpb24odGhpcy5zZWxlY3Rpb24sIHRoaXMpO1xyXG4gICAgcmV0dXJuIGNsb25lO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBkb2NzLXByaXZhdGUgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIE5HWF9NQVRfU0lOR0xFX0RBVEVfU0VMRUNUSU9OX01PREVMX0ZBQ1RPUlkoXHJcbiAgcGFyZW50OiBOZ3hNYXRTaW5nbGVEYXRlU2VsZWN0aW9uTW9kZWw8dW5rbm93bj4sXHJcbiAgYWRhcHRlcjogTmd4TWF0RGF0ZUFkYXB0ZXI8dW5rbm93bj4sXHJcbikge1xyXG4gIHJldHVybiBwYXJlbnQgfHwgbmV3IE5neE1hdFNpbmdsZURhdGVTZWxlY3Rpb25Nb2RlbChhZGFwdGVyKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVzZWQgdG8gcHJvdmlkZSBhIHNpbmdsZSBzZWxlY3Rpb24gbW9kZWwgdG8gYSBjb21wb25lbnQuXHJcbiAqIEBkb2NzLXByaXZhdGVcclxuICovXHJcbmV4cG9ydCBjb25zdCBOR1hfTUFUX1NJTkdMRV9EQVRFX1NFTEVDVElPTl9NT0RFTF9QUk9WSURFUjogRmFjdG9yeVByb3ZpZGVyID0ge1xyXG4gIHByb3ZpZGU6IE5neE1hdERhdGVTZWxlY3Rpb25Nb2RlbCxcclxuICBkZXBzOiBbW25ldyBPcHRpb25hbCgpLCBuZXcgU2tpcFNlbGYoKSwgTmd4TWF0RGF0ZVNlbGVjdGlvbk1vZGVsXSwgTmd4TWF0RGF0ZUFkYXB0ZXJdLFxyXG4gIHVzZUZhY3Rvcnk6IE5HWF9NQVRfU0lOR0xFX0RBVEVfU0VMRUNUSU9OX01PREVMX0ZBQ1RPUlksXHJcbn07XHJcblxyXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xyXG5leHBvcnQgZnVuY3Rpb24gTkdYX01BVF9SQU5HRV9EQVRFX1NFTEVDVElPTl9NT0RFTF9GQUNUT1JZKFxyXG4gIHBhcmVudDogTmd4TWF0U2luZ2xlRGF0ZVNlbGVjdGlvbk1vZGVsPHVua25vd24+LFxyXG4gIGFkYXB0ZXI6IE5neE1hdERhdGVBZGFwdGVyPHVua25vd24+LFxyXG4pIHtcclxuICByZXR1cm4gcGFyZW50IHx8IG5ldyBOZ3hNYXRSYW5nZURhdGVTZWxlY3Rpb25Nb2RlbChhZGFwdGVyKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVzZWQgdG8gcHJvdmlkZSBhIHJhbmdlIHNlbGVjdGlvbiBtb2RlbCB0byBhIGNvbXBvbmVudC5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IE5HWF9NQVRfUkFOR0VfREFURV9TRUxFQ1RJT05fTU9ERUxfUFJPVklERVI6IEZhY3RvcnlQcm92aWRlciA9IHtcclxuICBwcm92aWRlOiBOZ3hNYXREYXRlU2VsZWN0aW9uTW9kZWwsXHJcbiAgZGVwczogW1tuZXcgT3B0aW9uYWwoKSwgbmV3IFNraXBTZWxmKCksIE5neE1hdERhdGVTZWxlY3Rpb25Nb2RlbF0sIE5neE1hdERhdGVBZGFwdGVyXSxcclxuICB1c2VGYWN0b3J5OiBOR1hfTUFUX1JBTkdFX0RBVEVfU0VMRUNUSU9OX01PREVMX0ZBQ1RPUlksXHJcbn07XHJcbiJdfQ==