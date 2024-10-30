import { animate, keyframes, state, style, transition, trigger, } from '@angular/animations';
/**
 * Animations used by the Material datepicker.
 * @docs-private
 */
export const ngxMatDatepickerAnimations = {
    /** Transforms the height of the datepicker's calendar. */
    transformPanel: trigger('transformPanel', [
        transition('void => enter-dropdown', animate('120ms cubic-bezier(0, 0, 0.2, 1)', keyframes([
            style({ opacity: 0, transform: 'scale(1, 0.8)' }),
            style({ opacity: 1, transform: 'scale(1, 1)' }),
        ]))),
        transition('void => enter-dialog', animate('150ms cubic-bezier(0, 0, 0.2, 1)', keyframes([
            style({ opacity: 0, transform: 'scale(0.7)' }),
            style({ transform: 'none', opacity: 1 }),
        ]))),
        transition('* => void', animate('100ms linear', style({ opacity: 0 }))),
    ]),
    /** Fades in the content of the calendar. */
    fadeInCalendar: trigger('fadeInCalendar', [
        state('void', style({ opacity: 0 })),
        state('enter', style({ opacity: 1 })),
        // TODO(crisbeto): this animation should be removed since it isn't quite on spec, but we
        // need to keep it until #12440 gets in, otherwise the exit animation will look glitchy.
        transition('void => *', animate('120ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)')),
    ]),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1hbmltYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZGF0ZXRpbWUtcGlja2VyL3NyYy9saWIvZGF0ZXBpY2tlci1hbmltYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxPQUFPLEVBRVAsU0FBUyxFQUNULEtBQUssRUFDTCxLQUFLLEVBQ0wsVUFBVSxFQUNWLE9BQU8sR0FDUixNQUFNLHFCQUFxQixDQUFDO0FBRTdCOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUduQztJQUNGLDBEQUEwRDtJQUMxRCxjQUFjLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixFQUFFO1FBQ3hDLFVBQVUsQ0FDUix3QkFBd0IsRUFDeEIsT0FBTyxDQUNMLGtDQUFrQyxFQUNsQyxTQUFTLENBQUM7WUFDUixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsQ0FBQztZQUNqRCxLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsQ0FBQztTQUNoRCxDQUFDLENBQ0gsQ0FDRjtRQUNELFVBQVUsQ0FDUixzQkFBc0IsRUFDdEIsT0FBTyxDQUNMLGtDQUFrQyxFQUNsQyxTQUFTLENBQUM7WUFDUixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsQ0FBQztZQUM5QyxLQUFLLENBQUMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztTQUN6QyxDQUFDLENBQ0gsQ0FDRjtRQUNELFVBQVUsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3hFLENBQUM7SUFFRiw0Q0FBNEM7SUFDNUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtRQUN4QyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFckMsd0ZBQXdGO1FBQ3hGLHdGQUF3RjtRQUN4RixVQUFVLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0tBQ2pGLENBQUM7Q0FDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICBhbmltYXRlLFxyXG4gIEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSxcclxuICBrZXlmcmFtZXMsXHJcbiAgc3RhdGUsXHJcbiAgc3R5bGUsXHJcbiAgdHJhbnNpdGlvbixcclxuICB0cmlnZ2VyLFxyXG59IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xyXG5cclxuLyoqXHJcbiAqIEFuaW1hdGlvbnMgdXNlZCBieSB0aGUgTWF0ZXJpYWwgZGF0ZXBpY2tlci5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IG5neE1hdERhdGVwaWNrZXJBbmltYXRpb25zOiB7XHJcbiAgcmVhZG9ubHkgdHJhbnNmb3JtUGFuZWw6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YTtcclxuICByZWFkb25seSBmYWRlSW5DYWxlbmRhcjogQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhO1xyXG59ID0ge1xyXG4gIC8qKiBUcmFuc2Zvcm1zIHRoZSBoZWlnaHQgb2YgdGhlIGRhdGVwaWNrZXIncyBjYWxlbmRhci4gKi9cclxuICB0cmFuc2Zvcm1QYW5lbDogdHJpZ2dlcigndHJhbnNmb3JtUGFuZWwnLCBbXHJcbiAgICB0cmFuc2l0aW9uKFxyXG4gICAgICAndm9pZCA9PiBlbnRlci1kcm9wZG93bicsXHJcbiAgICAgIGFuaW1hdGUoXHJcbiAgICAgICAgJzEyMG1zIGN1YmljLWJlemllcigwLCAwLCAwLjIsIDEpJyxcclxuICAgICAgICBrZXlmcmFtZXMoW1xyXG4gICAgICAgICAgc3R5bGUoeyBvcGFjaXR5OiAwLCB0cmFuc2Zvcm06ICdzY2FsZSgxLCAwLjgpJyB9KSxcclxuICAgICAgICAgIHN0eWxlKHsgb3BhY2l0eTogMSwgdHJhbnNmb3JtOiAnc2NhbGUoMSwgMSknIH0pLFxyXG4gICAgICAgIF0pLFxyXG4gICAgICApLFxyXG4gICAgKSxcclxuICAgIHRyYW5zaXRpb24oXHJcbiAgICAgICd2b2lkID0+IGVudGVyLWRpYWxvZycsXHJcbiAgICAgIGFuaW1hdGUoXHJcbiAgICAgICAgJzE1MG1zIGN1YmljLWJlemllcigwLCAwLCAwLjIsIDEpJyxcclxuICAgICAgICBrZXlmcmFtZXMoW1xyXG4gICAgICAgICAgc3R5bGUoeyBvcGFjaXR5OiAwLCB0cmFuc2Zvcm06ICdzY2FsZSgwLjcpJyB9KSxcclxuICAgICAgICAgIHN0eWxlKHsgdHJhbnNmb3JtOiAnbm9uZScsIG9wYWNpdHk6IDEgfSksXHJcbiAgICAgICAgXSksXHJcbiAgICAgICksXHJcbiAgICApLFxyXG4gICAgdHJhbnNpdGlvbignKiA9PiB2b2lkJywgYW5pbWF0ZSgnMTAwbXMgbGluZWFyJywgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKSksXHJcbiAgXSksXHJcblxyXG4gIC8qKiBGYWRlcyBpbiB0aGUgY29udGVudCBvZiB0aGUgY2FsZW5kYXIuICovXHJcbiAgZmFkZUluQ2FsZW5kYXI6IHRyaWdnZXIoJ2ZhZGVJbkNhbGVuZGFyJywgW1xyXG4gICAgc3RhdGUoJ3ZvaWQnLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpLFxyXG4gICAgc3RhdGUoJ2VudGVyJywgc3R5bGUoeyBvcGFjaXR5OiAxIH0pKSxcclxuXHJcbiAgICAvLyBUT0RPKGNyaXNiZXRvKTogdGhpcyBhbmltYXRpb24gc2hvdWxkIGJlIHJlbW92ZWQgc2luY2UgaXQgaXNuJ3QgcXVpdGUgb24gc3BlYywgYnV0IHdlXHJcbiAgICAvLyBuZWVkIHRvIGtlZXAgaXQgdW50aWwgIzEyNDQwIGdldHMgaW4sIG90aGVyd2lzZSB0aGUgZXhpdCBhbmltYXRpb24gd2lsbCBsb29rIGdsaXRjaHkuXHJcbiAgICB0cmFuc2l0aW9uKCd2b2lkID0+IConLCBhbmltYXRlKCcxMjBtcyAxMDBtcyBjdWJpYy1iZXppZXIoMC41NSwgMCwgMC41NSwgMC4yKScpKSxcclxuICBdKSxcclxufTtcclxuIl19