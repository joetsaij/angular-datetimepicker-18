import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { NgxMatDateAdapter } from './date-adapter';
import { NGX_MAT_DATE_FORMATS } from './date-formats';
import { NgxMatNativeDateAdapter } from './native-date-adapter';
import { NGX_MAT_NATIVE_DATE_FORMATS } from './native-date-formats';
import * as i0 from "@angular/core";
export class NgxNativeDateModule {
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxNativeDateModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    /** @nocollapse */ static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.3", ngImport: i0, type: NgxNativeDateModule, imports: [PlatformModule] }); }
    /** @nocollapse */ static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxNativeDateModule, providers: [{ provide: NgxMatDateAdapter, useClass: NgxMatNativeDateAdapter }], imports: [PlatformModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxNativeDateModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [PlatformModule],
                    providers: [{ provide: NgxMatDateAdapter, useClass: NgxMatNativeDateAdapter }],
                }]
        }] });
export class NgxMatNativeDateModule {
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatNativeDateModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    /** @nocollapse */ static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.3", ngImport: i0, type: NgxMatNativeDateModule, imports: [NgxNativeDateModule] }); }
    /** @nocollapse */ static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatNativeDateModule, providers: [{ provide: NGX_MAT_DATE_FORMATS, useValue: NGX_MAT_NATIVE_DATE_FORMATS }], imports: [NgxNativeDateModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.3", ngImport: i0, type: NgxMatNativeDateModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NgxNativeDateModule],
                    providers: [{ provide: NGX_MAT_DATE_FORMATS, useValue: NGX_MAT_NATIVE_DATE_FORMATS }],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlLWRhdGUubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZGF0ZXRpbWUtcGlja2VyL3NyYy9saWIvY29yZS9uYXRpdmUtZGF0ZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDbkQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDdEQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDaEUsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7O0FBTXBFLE1BQU0sT0FBTyxtQkFBbUI7aUlBQW5CLG1CQUFtQjtrSUFBbkIsbUJBQW1CLFlBSHBCLGNBQWM7a0lBR2IsbUJBQW1CLGFBRm5CLENBQUMsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixFQUFFLENBQUMsWUFEcEUsY0FBYzs7MkZBR2IsbUJBQW1CO2tCQUovQixRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQztvQkFDekIsU0FBUyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixFQUFFLENBQUM7aUJBQy9FOztBQU9ELE1BQU0sT0FBTyxzQkFBc0I7aUlBQXRCLHNCQUFzQjtrSUFBdEIsc0JBQXNCLFlBTnRCLG1CQUFtQjtrSUFNbkIsc0JBQXNCLGFBRnRCLENBQUMsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLDJCQUEyQixFQUFFLENBQUMsWUFEM0UsbUJBQW1COzsyRkFHbEIsc0JBQXNCO2tCQUpsQyxRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRSxDQUFDLG1CQUFtQixDQUFDO29CQUM5QixTQUFTLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsMkJBQTJCLEVBQUUsQ0FBQztpQkFDdEYiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQbGF0Zm9ybU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XHJcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE5neE1hdERhdGVBZGFwdGVyIH0gZnJvbSAnLi9kYXRlLWFkYXB0ZXInO1xyXG5pbXBvcnQgeyBOR1hfTUFUX0RBVEVfRk9STUFUUyB9IGZyb20gJy4vZGF0ZS1mb3JtYXRzJztcclxuaW1wb3J0IHsgTmd4TWF0TmF0aXZlRGF0ZUFkYXB0ZXIgfSBmcm9tICcuL25hdGl2ZS1kYXRlLWFkYXB0ZXInO1xyXG5pbXBvcnQgeyBOR1hfTUFUX05BVElWRV9EQVRFX0ZPUk1BVFMgfSBmcm9tICcuL25hdGl2ZS1kYXRlLWZvcm1hdHMnO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICBpbXBvcnRzOiBbUGxhdGZvcm1Nb2R1bGVdLFxyXG4gIHByb3ZpZGVyczogW3sgcHJvdmlkZTogTmd4TWF0RGF0ZUFkYXB0ZXIsIHVzZUNsYXNzOiBOZ3hNYXROYXRpdmVEYXRlQWRhcHRlciB9XSxcclxufSlcclxuZXhwb3J0IGNsYXNzIE5neE5hdGl2ZURhdGVNb2R1bGUge31cclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgaW1wb3J0czogW05neE5hdGl2ZURhdGVNb2R1bGVdLFxyXG4gIHByb3ZpZGVyczogW3sgcHJvdmlkZTogTkdYX01BVF9EQVRFX0ZPUk1BVFMsIHVzZVZhbHVlOiBOR1hfTUFUX05BVElWRV9EQVRFX0ZPUk1BVFMgfV0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hNYXROYXRpdmVEYXRlTW9kdWxlIHt9XHJcbiJdfQ==