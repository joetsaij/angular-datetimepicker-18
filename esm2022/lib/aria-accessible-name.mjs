// This file contains the `_computeAriaAccessibleName` function, which computes what the *expected*
// ARIA accessible name would be for a given element. Implements a subset of ARIA specification
// [Accessible Name and Description Computation 1.2](https://www.w3.org/TR/accname-1.2/).
//
// Specification accname-1.2 can be summarized by returning the result of the first method
// available.
//
//  1. `aria-labelledby` attribute
//     ```
//       <!-- example using aria-labelledby-->
//       <label id='label-id'>Start Date</label>
//       <input aria-labelledby='label-id'/>
//     ```
//  2. `aria-label` attribute (e.g. `<input aria-label="Departure"/>`)
//  3. Label with `for`/`id`
//     ```
//       <!-- example using for/id -->
//       <label for="current-node">Label</label>
//       <input id="current-node"/>
//     ```
//  4. `placeholder` attribute (e.g. `<input placeholder="06/03/1990"/>`)
//  5. `title` attribute (e.g. `<input title="Check-In"/>`)
//  6. text content
//     ```
//       <!-- example using text content -->
//       <label for="current-node"><span>Departure</span> Date</label>
//       <input id="current-node"/>
//     ```
/**
 * Computes the *expected* ARIA accessible name for argument element based on [accname-1.2
 * specification](https://www.w3.org/TR/accname-1.2/). Implements a subset of accname-1.2,
 * and should only be used for the Datepicker's specific use case.
 *
 * Intended use:
 * This is not a general use implementation. Only implements the parts of accname-1.2 that are
 * required for the Datepicker's specific use case. This function is not intended for any other
 * use.
 *
 * Limitations:
 *  - Only covers the needs of `matStartDate` and `matEndDate`. Does not support other use cases.
 *  - See NOTES's in implementation for specific details on what parts of the accname-1.2
 *  specification are not implemented.
 *
 *  @param element {HTMLInputElement} native &lt;input/&gt; element of `matStartDate` or
 *  `matEndDate` component. Corresponds to the 'Root Element' from accname-1.2
 *
 *  @return expected ARIA accessible name of argument &lt;input/&gt;
 */
export function _computeAriaAccessibleName(element) {
    return _computeAriaAccessibleNameInternal(element, true);
}
/**
 * Determine if argument node is an Element based on `nodeType` property. This function is safe to
 * use with server-side rendering.
 */
function ssrSafeIsElement(node) {
    return node.nodeType === Node.ELEMENT_NODE;
}
/**
 * Determine if argument node is an HTMLInputElement based on `nodeName` property. This funciton is
 * safe to use with server-side rendering.
 */
function ssrSafeIsHTMLInputElement(node) {
    return node.nodeName === 'INPUT';
}
/**
 * Determine if argument node is an HTMLTextAreaElement based on `nodeName` property. This
 * funciton is safe to use with server-side rendering.
 */
function ssrSafeIsHTMLTextAreaElement(node) {
    return node.nodeName === 'TEXTAREA';
}
/**
 * Calculate the expected ARIA accessible name for given DOM Node. Given DOM Node may be either the
 * "Root node" passed to `_computeAriaAccessibleName` or "Current node" as result of recursion.
 *
 * @return the accessible name of argument DOM Node
 *
 * @param currentNode node to determine accessible name of
 * @param isDirectlyReferenced true if `currentNode` is the root node to calculate ARIA accessible
 * name of. False if it is a result of recursion.
 */
function _computeAriaAccessibleNameInternal(currentNode, isDirectlyReferenced) {
    // NOTE: this differs from accname-1.2 specification.
    //  - Does not implement Step 1. of accname-1.2: '''If `currentNode`'s role prohibits naming,
    //    return the empty string ("")'''.
    //  - Does not implement Step 2.A. of accname-1.2: '''if current node is hidden and not directly
    //    referenced by aria-labelledby... return the empty string.'''
    // acc-name-1.2 Step 2.B.: aria-labelledby
    if (ssrSafeIsElement(currentNode) && isDirectlyReferenced) {
        const labelledbyIds = currentNode.getAttribute?.('aria-labelledby')?.split(/\s+/g) || [];
        const validIdRefs = labelledbyIds.reduce((validIds, id) => {
            const elem = document.getElementById(id);
            if (elem) {
                validIds.push(elem);
            }
            return validIds;
        }, []);
        if (validIdRefs.length) {
            return validIdRefs
                .map((idRef) => {
                return _computeAriaAccessibleNameInternal(idRef, false);
            })
                .join(' ');
        }
    }
    // acc-name-1.2 Step 2.C.: aria-label
    if (ssrSafeIsElement(currentNode)) {
        const ariaLabel = currentNode.getAttribute('aria-label')?.trim();
        if (ariaLabel) {
            return ariaLabel;
        }
    }
    // acc-name-1.2 Step 2.D. attribute or element that defines a text alternative
    //
    // NOTE: this differs from accname-1.2 specification.
    // Only implements Step 2.D. for `<label>`,`<input/>`, and `<textarea/>` element. Does not
    // implement other elements that have an attribute or element that defines a text alternative.
    if (ssrSafeIsHTMLInputElement(currentNode) || ssrSafeIsHTMLTextAreaElement(currentNode)) {
        // use label with a `for` attribute referencing the current node
        if (currentNode.labels?.length) {
            return Array.from(currentNode.labels)
                .map((x) => _computeAriaAccessibleNameInternal(x, false))
                .join(' ');
        }
        // use placeholder if available
        const placeholder = currentNode.getAttribute('placeholder')?.trim();
        if (placeholder) {
            return placeholder;
        }
        // use title if available
        const title = currentNode.getAttribute('title')?.trim();
        if (title) {
            return title;
        }
    }
    // NOTE: this differs from accname-1.2 specification.
    //  - does not implement acc-name-1.2 Step 2.E.: '''if the current node is a control embedded
    //     within the label... then include the embedded control as part of the text alternative in
    //     the following manner...'''. Step 2E applies to embedded controls such as textbox, listbox,
    //     range, etc.
    //  - does not implement acc-name-1.2 step 2.F.: check that '''role allows name from content''',
    //    which applies to `currentNode` and its children.
    //  - does not implement acc-name-1.2 Step 2.F.ii.: '''Check for CSS generated textual content'''
    //    (e.g. :before and :after).
    //  - does not implement acc-name-1.2 Step 2.I.: '''if the current node has a Tooltip attribute,
    //    return its value'''
    // Return text content with whitespace collapsed into a single space character. Accomplish
    // acc-name-1.2 steps 2F, 2G, and 2H.
    return (currentNode.textContent || '').replace(/\s+/g, ' ').trim();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJpYS1hY2Nlc3NpYmxlLW5hbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9kYXRldGltZS1waWNrZXIvc3JjL2xpYi9hcmlhLWFjY2Vzc2libGUtbmFtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxtR0FBbUc7QUFDbkcsK0ZBQStGO0FBQy9GLHlGQUF5RjtBQUN6RixFQUFFO0FBQ0YsMEZBQTBGO0FBQzFGLGFBQWE7QUFDYixFQUFFO0FBQ0Ysa0NBQWtDO0FBQ2xDLFVBQVU7QUFDViw4Q0FBOEM7QUFDOUMsZ0RBQWdEO0FBQ2hELDRDQUE0QztBQUM1QyxVQUFVO0FBQ1Ysc0VBQXNFO0FBQ3RFLDRCQUE0QjtBQUM1QixVQUFVO0FBQ1Ysc0NBQXNDO0FBQ3RDLGdEQUFnRDtBQUNoRCxtQ0FBbUM7QUFDbkMsVUFBVTtBQUNWLHlFQUF5RTtBQUN6RSwyREFBMkQ7QUFDM0QsbUJBQW1CO0FBQ25CLFVBQVU7QUFDViw0Q0FBNEM7QUFDNUMsc0VBQXNFO0FBQ3RFLG1DQUFtQztBQUNuQyxVQUFVO0FBRVY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxNQUFNLFVBQVUsMEJBQTBCLENBQ3hDLE9BQStDO0lBRS9DLE9BQU8sa0NBQWtDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGdCQUFnQixDQUFDLElBQVU7SUFDbEMsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDN0MsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMseUJBQXlCLENBQUMsSUFBVTtJQUMzQyxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssT0FBTyxDQUFDO0FBQ25DLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLDRCQUE0QixDQUFDLElBQVU7SUFDOUMsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLFVBQVUsQ0FB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Q0FBQyxXQUFXLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNyRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhpcyBmaWxlIGNvbnRhaW5zIHRoZSBgX2NvbXB1dGVBcmlhQWNjZXNzaWJsZU5hbWVgIGZ1bmN0aW9uLCB3aGljaCBjb21wdXRlcyB3aGF0IHRoZSAqZXhwZWN0ZWQqXHJcbi8vIEFSSUEgYWNjZXNzaWJsZSBuYW1lIHdvdWxkIGJlIGZvciBhIGdpdmVuIGVsZW1lbnQuIEltcGxlbWVudHMgYSBzdWJzZXQgb2YgQVJJQSBzcGVjaWZpY2F0aW9uXHJcbi8vIFtBY2Nlc3NpYmxlIE5hbWUgYW5kIERlc2NyaXB0aW9uIENvbXB1dGF0aW9uIDEuMl0oaHR0cHM6Ly93d3cudzMub3JnL1RSL2FjY25hbWUtMS4yLykuXHJcbi8vXHJcbi8vIFNwZWNpZmljYXRpb24gYWNjbmFtZS0xLjIgY2FuIGJlIHN1bW1hcml6ZWQgYnkgcmV0dXJuaW5nIHRoZSByZXN1bHQgb2YgdGhlIGZpcnN0IG1ldGhvZFxyXG4vLyBhdmFpbGFibGUuXHJcbi8vXHJcbi8vICAxLiBgYXJpYS1sYWJlbGxlZGJ5YCBhdHRyaWJ1dGVcclxuLy8gICAgIGBgYFxyXG4vLyAgICAgICA8IS0tIGV4YW1wbGUgdXNpbmcgYXJpYS1sYWJlbGxlZGJ5LS0+XHJcbi8vICAgICAgIDxsYWJlbCBpZD0nbGFiZWwtaWQnPlN0YXJ0IERhdGU8L2xhYmVsPlxyXG4vLyAgICAgICA8aW5wdXQgYXJpYS1sYWJlbGxlZGJ5PSdsYWJlbC1pZCcvPlxyXG4vLyAgICAgYGBgXHJcbi8vICAyLiBgYXJpYS1sYWJlbGAgYXR0cmlidXRlIChlLmcuIGA8aW5wdXQgYXJpYS1sYWJlbD1cIkRlcGFydHVyZVwiLz5gKVxyXG4vLyAgMy4gTGFiZWwgd2l0aCBgZm9yYC9gaWRgXHJcbi8vICAgICBgYGBcclxuLy8gICAgICAgPCEtLSBleGFtcGxlIHVzaW5nIGZvci9pZCAtLT5cclxuLy8gICAgICAgPGxhYmVsIGZvcj1cImN1cnJlbnQtbm9kZVwiPkxhYmVsPC9sYWJlbD5cclxuLy8gICAgICAgPGlucHV0IGlkPVwiY3VycmVudC1ub2RlXCIvPlxyXG4vLyAgICAgYGBgXHJcbi8vICA0LiBgcGxhY2Vob2xkZXJgIGF0dHJpYnV0ZSAoZS5nLiBgPGlucHV0IHBsYWNlaG9sZGVyPVwiMDYvMDMvMTk5MFwiLz5gKVxyXG4vLyAgNS4gYHRpdGxlYCBhdHRyaWJ1dGUgKGUuZy4gYDxpbnB1dCB0aXRsZT1cIkNoZWNrLUluXCIvPmApXHJcbi8vICA2LiB0ZXh0IGNvbnRlbnRcclxuLy8gICAgIGBgYFxyXG4vLyAgICAgICA8IS0tIGV4YW1wbGUgdXNpbmcgdGV4dCBjb250ZW50IC0tPlxyXG4vLyAgICAgICA8bGFiZWwgZm9yPVwiY3VycmVudC1ub2RlXCI+PHNwYW4+RGVwYXJ0dXJlPC9zcGFuPiBEYXRlPC9sYWJlbD5cclxuLy8gICAgICAgPGlucHV0IGlkPVwiY3VycmVudC1ub2RlXCIvPlxyXG4vLyAgICAgYGBgXHJcblxyXG4vKipcclxuICogQ29tcHV0ZXMgdGhlICpleHBlY3RlZCogQVJJQSBhY2Nlc3NpYmxlIG5hbWUgZm9yIGFyZ3VtZW50IGVsZW1lbnQgYmFzZWQgb24gW2FjY25hbWUtMS4yXHJcbiAqIHNwZWNpZmljYXRpb25dKGh0dHBzOi8vd3d3LnczLm9yZy9UUi9hY2NuYW1lLTEuMi8pLiBJbXBsZW1lbnRzIGEgc3Vic2V0IG9mIGFjY25hbWUtMS4yLFxyXG4gKiBhbmQgc2hvdWxkIG9ubHkgYmUgdXNlZCBmb3IgdGhlIERhdGVwaWNrZXIncyBzcGVjaWZpYyB1c2UgY2FzZS5cclxuICpcclxuICogSW50ZW5kZWQgdXNlOlxyXG4gKiBUaGlzIGlzIG5vdCBhIGdlbmVyYWwgdXNlIGltcGxlbWVudGF0aW9uLiBPbmx5IGltcGxlbWVudHMgdGhlIHBhcnRzIG9mIGFjY25hbWUtMS4yIHRoYXQgYXJlXHJcbiAqIHJlcXVpcmVkIGZvciB0aGUgRGF0ZXBpY2tlcidzIHNwZWNpZmljIHVzZSBjYXNlLiBUaGlzIGZ1bmN0aW9uIGlzIG5vdCBpbnRlbmRlZCBmb3IgYW55IG90aGVyXHJcbiAqIHVzZS5cclxuICpcclxuICogTGltaXRhdGlvbnM6XHJcbiAqICAtIE9ubHkgY292ZXJzIHRoZSBuZWVkcyBvZiBgbWF0U3RhcnREYXRlYCBhbmQgYG1hdEVuZERhdGVgLiBEb2VzIG5vdCBzdXBwb3J0IG90aGVyIHVzZSBjYXNlcy5cclxuICogIC0gU2VlIE5PVEVTJ3MgaW4gaW1wbGVtZW50YXRpb24gZm9yIHNwZWNpZmljIGRldGFpbHMgb24gd2hhdCBwYXJ0cyBvZiB0aGUgYWNjbmFtZS0xLjJcclxuICogIHNwZWNpZmljYXRpb24gYXJlIG5vdCBpbXBsZW1lbnRlZC5cclxuICpcclxuICogIEBwYXJhbSBlbGVtZW50IHtIVE1MSW5wdXRFbGVtZW50fSBuYXRpdmUgJmx0O2lucHV0LyZndDsgZWxlbWVudCBvZiBgbWF0U3RhcnREYXRlYCBvclxyXG4gKiAgYG1hdEVuZERhdGVgIGNvbXBvbmVudC4gQ29ycmVzcG9uZHMgdG8gdGhlICdSb290IEVsZW1lbnQnIGZyb20gYWNjbmFtZS0xLjJcclxuICpcclxuICogIEByZXR1cm4gZXhwZWN0ZWQgQVJJQSBhY2Nlc3NpYmxlIG5hbWUgb2YgYXJndW1lbnQgJmx0O2lucHV0LyZndDtcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfY29tcHV0ZUFyaWFBY2Nlc3NpYmxlTmFtZShcclxuICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50IHwgSFRNTFRleHRBcmVhRWxlbWVudCxcclxuKTogc3RyaW5nIHtcclxuICByZXR1cm4gX2NvbXB1dGVBcmlhQWNjZXNzaWJsZU5hbWVJbnRlcm5hbChlbGVtZW50LCB0cnVlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERldGVybWluZSBpZiBhcmd1bWVudCBub2RlIGlzIGFuIEVsZW1lbnQgYmFzZWQgb24gYG5vZGVUeXBlYCBwcm9wZXJ0eS4gVGhpcyBmdW5jdGlvbiBpcyBzYWZlIHRvXHJcbiAqIHVzZSB3aXRoIHNlcnZlci1zaWRlIHJlbmRlcmluZy5cclxuICovXHJcbmZ1bmN0aW9uIHNzclNhZmVJc0VsZW1lbnQobm9kZTogTm9kZSk6IG5vZGUgaXMgRWxlbWVudCB7XHJcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFO1xyXG59XHJcblxyXG4vKipcclxuICogRGV0ZXJtaW5lIGlmIGFyZ3VtZW50IG5vZGUgaXMgYW4gSFRNTElucHV0RWxlbWVudCBiYXNlZCBvbiBgbm9kZU5hbWVgIHByb3BlcnR5LiBUaGlzIGZ1bmNpdG9uIGlzXHJcbiAqIHNhZmUgdG8gdXNlIHdpdGggc2VydmVyLXNpZGUgcmVuZGVyaW5nLlxyXG4gKi9cclxuZnVuY3Rpb24gc3NyU2FmZUlzSFRNTElucHV0RWxlbWVudChub2RlOiBOb2RlKTogbm9kZSBpcyBIVE1MSW5wdXRFbGVtZW50IHtcclxuICByZXR1cm4gbm9kZS5ub2RlTmFtZSA9PT0gJ0lOUFVUJztcclxufVxyXG5cclxuLyoqXHJcbiAqIERldGVybWluZSBpZiBhcmd1bWVudCBub2RlIGlzIGFuIEhUTUxUZXh0QXJlYUVsZW1lbnQgYmFzZWQgb24gYG5vZGVOYW1lYCBwcm9wZXJ0eS4gVGhpc1xyXG4gKiBmdW5jaXRvbiBpcyBzYWZlIHRvIHVzZSB3aXRoIHNlcnZlci1zaWRlIHJlbmRlcmluZy5cclxuICovXHJcbmZ1bmN0aW9uIHNzclNhZmVJc0hUTUxUZXh0QXJlYUVsZW1lbnQobm9kZTogTm9kZSk6IG5vZGUgaXMgSFRNTFRleHRBcmVhRWxlbWVudCB7XHJcbiAgcmV0dXJuIG5vZGUubm9kZU5hbWUgPT09ICdURVhUQVJFQSc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGUgdGhlIGV4cGVjdGVkIEFSSUEgYWNjZXNzaWJsZSBuYW1lIGZvciBnaXZlbiBET00gTm9kZS4gR2l2ZW4gRE9NIE5vZGUgbWF5IGJlIGVpdGhlciB0aGVcclxuICogXCJSb290IG5vZGVcIiBwYXNzZWQgdG8gYF9jb21wdXRlQXJpYUFjY2Vzc2libGVOYW1lYCBvciBcIkN1cnJlbnQgbm9kZVwiIGFzIHJlc3VsdCBvZiByZWN1cnNpb24uXHJcbiAqXHJcbiAqIEByZXR1cm4gdGhlIGFjY2Vzc2libGUgbmFtZSBvZiBhcmd1bWVudCBET00gTm9kZVxyXG4gKlxyXG4gKiBAcGFyYW0gY3VycmVudE5vZGUgbm9kZSB0byBkZXRlcm1pbmUgYWNjZXNzaWJsZSBuYW1lIG9mXHJcbiAqIEBwYXJhbSBpc0RpcmVjdGx5UmVmZXJlbmNlZCB0cnVlIGlmIGBjdXJyZW50Tm9kZWAgaXMgdGhlIHJvb3Qgbm9kZSB0byBjYWxjdWxhdGUgQVJJQSBhY2Nlc3NpYmxlXHJcbiAqIG5hbWUgb2YuIEZhbHNlIGlmIGl0IGlzIGEgcmVzdWx0IG9mIHJlY3Vyc2lvbi5cclxuICovXHJcbmZ1bmN0aW9uIF9jb21wdXRlQXJpYUFjY2Vzc2libGVOYW1lSW50ZXJuYWwoXHJcbiAgY3VycmVudE5vZGU6IE5vZGUsXHJcbiAgaXNEaXJlY3RseVJlZmVyZW5jZWQ6IGJvb2xlYW4sXHJcbik6IHN0cmluZyB7XHJcbiAgLy8gTk9URTogdGhpcyBkaWZmZXJzIGZyb20gYWNjbmFtZS0xLjIgc3BlY2lmaWNhdGlvbi5cclxuICAvLyAgLSBEb2VzIG5vdCBpbXBsZW1lbnQgU3RlcCAxLiBvZiBhY2NuYW1lLTEuMjogJycnSWYgYGN1cnJlbnROb2RlYCdzIHJvbGUgcHJvaGliaXRzIG5hbWluZyxcclxuICAvLyAgICByZXR1cm4gdGhlIGVtcHR5IHN0cmluZyAoXCJcIiknJycuXHJcbiAgLy8gIC0gRG9lcyBub3QgaW1wbGVtZW50IFN0ZXAgMi5BLiBvZiBhY2NuYW1lLTEuMjogJycnaWYgY3VycmVudCBub2RlIGlzIGhpZGRlbiBhbmQgbm90IGRpcmVjdGx5XHJcbiAgLy8gICAgcmVmZXJlbmNlZCBieSBhcmlhLWxhYmVsbGVkYnkuLi4gcmV0dXJuIHRoZSBlbXB0eSBzdHJpbmcuJycnXHJcblxyXG4gIC8vIGFjYy1uYW1lLTEuMiBTdGVwIDIuQi46IGFyaWEtbGFiZWxsZWRieVxyXG4gIGlmIChzc3JTYWZlSXNFbGVtZW50KGN1cnJlbnROb2RlKSAmJiBpc0RpcmVjdGx5UmVmZXJlbmNlZCkge1xyXG4gICAgY29uc3QgbGFiZWxsZWRieUlkczogc3RyaW5nW10gPVxyXG4gICAgICBjdXJyZW50Tm9kZS5nZXRBdHRyaWJ1dGU/LignYXJpYS1sYWJlbGxlZGJ5Jyk/LnNwbGl0KC9cXHMrL2cpIHx8IFtdO1xyXG4gICAgY29uc3QgdmFsaWRJZFJlZnM6IEhUTUxFbGVtZW50W10gPSBsYWJlbGxlZGJ5SWRzLnJlZHVjZSgodmFsaWRJZHMsIGlkKSA9PiB7XHJcbiAgICAgIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XHJcbiAgICAgIGlmIChlbGVtKSB7XHJcbiAgICAgICAgdmFsaWRJZHMucHVzaChlbGVtKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdmFsaWRJZHM7XHJcbiAgICB9LCBbXSBhcyBIVE1MRWxlbWVudFtdKTtcclxuXHJcbiAgICBpZiAodmFsaWRJZFJlZnMubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiB2YWxpZElkUmVmc1xyXG4gICAgICAgIC5tYXAoKGlkUmVmKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gX2NvbXB1dGVBcmlhQWNjZXNzaWJsZU5hbWVJbnRlcm5hbChpZFJlZiwgZmFsc2UpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmpvaW4oJyAnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIGFjYy1uYW1lLTEuMiBTdGVwIDIuQy46IGFyaWEtbGFiZWxcclxuICBpZiAoc3NyU2FmZUlzRWxlbWVudChjdXJyZW50Tm9kZSkpIHtcclxuICAgIGNvbnN0IGFyaWFMYWJlbCA9IGN1cnJlbnROb2RlLmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcpPy50cmltKCk7XHJcblxyXG4gICAgaWYgKGFyaWFMYWJlbCkge1xyXG4gICAgICByZXR1cm4gYXJpYUxhYmVsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gYWNjLW5hbWUtMS4yIFN0ZXAgMi5ELiBhdHRyaWJ1dGUgb3IgZWxlbWVudCB0aGF0IGRlZmluZXMgYSB0ZXh0IGFsdGVybmF0aXZlXHJcbiAgLy9cclxuICAvLyBOT1RFOiB0aGlzIGRpZmZlcnMgZnJvbSBhY2NuYW1lLTEuMiBzcGVjaWZpY2F0aW9uLlxyXG4gIC8vIE9ubHkgaW1wbGVtZW50cyBTdGVwIDIuRC4gZm9yIGA8bGFiZWw+YCxgPGlucHV0Lz5gLCBhbmQgYDx0ZXh0YXJlYS8+YCBlbGVtZW50LiBEb2VzIG5vdFxyXG4gIC8vIGltcGxlbWVudCBvdGhlciBlbGVtZW50cyB0aGF0IGhhdmUgYW4gYXR0cmlidXRlIG9yIGVsZW1lbnQgdGhhdCBkZWZpbmVzIGEgdGV4dCBhbHRlcm5hdGl2ZS5cclxuICBpZiAoc3NyU2FmZUlzSFRNTElucHV0RWxlbWVudChjdXJyZW50Tm9kZSkgfHwgc3NyU2FmZUlzSFRNTFRleHRBcmVhRWxlbWVudChjdXJyZW50Tm9kZSkpIHtcclxuICAgIC8vIHVzZSBsYWJlbCB3aXRoIGEgYGZvcmAgYXR0cmlidXRlIHJlZmVyZW5jaW5nIHRoZSBjdXJyZW50IG5vZGVcclxuICAgIGlmIChjdXJyZW50Tm9kZS5sYWJlbHM/Lmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShjdXJyZW50Tm9kZS5sYWJlbHMpXHJcbiAgICAgICAgLm1hcCgoeCkgPT4gX2NvbXB1dGVBcmlhQWNjZXNzaWJsZU5hbWVJbnRlcm5hbCh4LCBmYWxzZSkpXHJcbiAgICAgICAgLmpvaW4oJyAnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB1c2UgcGxhY2Vob2xkZXIgaWYgYXZhaWxhYmxlXHJcbiAgICBjb25zdCBwbGFjZWhvbGRlciA9IGN1cnJlbnROb2RlLmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKT8udHJpbSgpO1xyXG4gICAgaWYgKHBsYWNlaG9sZGVyKSB7XHJcbiAgICAgIHJldHVybiBwbGFjZWhvbGRlcjtcclxuICAgIH1cclxuXHJcbiAgICAvLyB1c2UgdGl0bGUgaWYgYXZhaWxhYmxlXHJcbiAgICBjb25zdCB0aXRsZSA9IGN1cnJlbnROb2RlLmdldEF0dHJpYnV0ZSgndGl0bGUnKT8udHJpbSgpO1xyXG4gICAgaWYgKHRpdGxlKSB7XHJcbiAgICAgIHJldHVybiB0aXRsZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIE5PVEU6IHRoaXMgZGlmZmVycyBmcm9tIGFjY25hbWUtMS4yIHNwZWNpZmljYXRpb24uXHJcbiAgLy8gIC0gZG9lcyBub3QgaW1wbGVtZW50IGFjYy1uYW1lLTEuMiBTdGVwIDIuRS46ICcnJ2lmIHRoZSBjdXJyZW50IG5vZGUgaXMgYSBjb250cm9sIGVtYmVkZGVkXHJcbiAgLy8gICAgIHdpdGhpbiB0aGUgbGFiZWwuLi4gdGhlbiBpbmNsdWRlIHRoZSBlbWJlZGRlZCBjb250cm9sIGFzIHBhcnQgb2YgdGhlIHRleHQgYWx0ZXJuYXRpdmUgaW5cclxuICAvLyAgICAgdGhlIGZvbGxvd2luZyBtYW5uZXIuLi4nJycuIFN0ZXAgMkUgYXBwbGllcyB0byBlbWJlZGRlZCBjb250cm9scyBzdWNoIGFzIHRleHRib3gsIGxpc3Rib3gsXHJcbiAgLy8gICAgIHJhbmdlLCBldGMuXHJcbiAgLy8gIC0gZG9lcyBub3QgaW1wbGVtZW50IGFjYy1uYW1lLTEuMiBzdGVwIDIuRi46IGNoZWNrIHRoYXQgJycncm9sZSBhbGxvd3MgbmFtZSBmcm9tIGNvbnRlbnQnJycsXHJcbiAgLy8gICAgd2hpY2ggYXBwbGllcyB0byBgY3VycmVudE5vZGVgIGFuZCBpdHMgY2hpbGRyZW4uXHJcbiAgLy8gIC0gZG9lcyBub3QgaW1wbGVtZW50IGFjYy1uYW1lLTEuMiBTdGVwIDIuRi5paS46ICcnJ0NoZWNrIGZvciBDU1MgZ2VuZXJhdGVkIHRleHR1YWwgY29udGVudCcnJ1xyXG4gIC8vICAgIChlLmcuIDpiZWZvcmUgYW5kIDphZnRlcikuXHJcbiAgLy8gIC0gZG9lcyBub3QgaW1wbGVtZW50IGFjYy1uYW1lLTEuMiBTdGVwIDIuSS46ICcnJ2lmIHRoZSBjdXJyZW50IG5vZGUgaGFzIGEgVG9vbHRpcCBhdHRyaWJ1dGUsXHJcbiAgLy8gICAgcmV0dXJuIGl0cyB2YWx1ZScnJ1xyXG5cclxuICAvLyBSZXR1cm4gdGV4dCBjb250ZW50IHdpdGggd2hpdGVzcGFjZSBjb2xsYXBzZWQgaW50byBhIHNpbmdsZSBzcGFjZSBjaGFyYWN0ZXIuIEFjY29tcGxpc2hcclxuICAvLyBhY2MtbmFtZS0xLjIgc3RlcHMgMkYsIDJHLCBhbmQgMkguXHJcbiAgcmV0dXJuIChjdXJyZW50Tm9kZS50ZXh0Q29udGVudCB8fCAnJykucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKTtcclxufVxyXG4iXX0=