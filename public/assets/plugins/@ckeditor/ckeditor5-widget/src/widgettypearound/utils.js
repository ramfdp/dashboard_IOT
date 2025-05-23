/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module widget/widgettypearound/utils
 */
import { isWidget } from '../utils.js';
/**
 * The name of the type around model selection attribute responsible for
 * displaying a fake caret next to a selected widget.
 */
export const TYPE_AROUND_SELECTION_ATTRIBUTE = 'widget-type-around';
/**
 * Checks if an element is a widget that qualifies to get the widget type around UI.
 */
export function isTypeAroundWidget(viewElement, modelElement, schema) {
    return !!viewElement && isWidget(viewElement) && !schema.isInline(modelElement);
}
/**
 * For the passed HTML element, this helper finds the closest widget type around button ancestor.
 */
export function getClosestTypeAroundDomButton(domElement) {
    return domElement.closest('.ck-widget__type-around__button');
}
/**
 * For the passed widget type around button element, this helper determines at which position
 * the paragraph would be inserted into the content if, for instance, the button was
 * clicked by the user.
 *
 * @returns The position of the button.
 */
export function getTypeAroundButtonPosition(domElement) {
    return domElement.classList.contains('ck-widget__type-around__button_before') ? 'before' : 'after';
}
/**
 * For the passed HTML element, this helper returns the closest view widget ancestor.
 */
export function getClosestWidgetViewElement(domElement, domConverter) {
    const widgetDomElement = domElement.closest('.ck-widget');
    return domConverter.mapDomToView(widgetDomElement);
}
/**
 * For the passed selection instance, it returns the position of the fake caret displayed next to a widget.
 *
 * **Note**: If the fake caret is not currently displayed, `null` is returned.
 *
 * @returns The position of the fake caret or `null` when none is present.
 */
export function getTypeAroundFakeCaretPosition(selection) {
    return selection.getAttribute(TYPE_AROUND_SELECTION_ATTRIBUTE);
}
