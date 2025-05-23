/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Returns a model range that covers all consecutive nodes with the same `attributeName` and its `value`
 * that intersect the given `position`.
 *
 * It can be used e.g. to get the entire range on which the `linkHref` attribute needs to be changed when having a
 * selection inside a link.
 *
 * @param position The start position.
 * @param attributeName The attribute name.
 * @param value The attribute value.
 * @param model The model instance.
 * @returns The link range.
 */
export default function findAttributeRange(position, attributeName, value, model) {
    return model.createRange(findAttributeRangeBound(position, attributeName, value, true, model), findAttributeRangeBound(position, attributeName, value, false, model));
}
/**
 * Walks forward or backward (depends on the `lookBack` flag), node by node, as long as they have the same attribute value
 * and returns a position just before or after (depends on the `lookBack` flag) the last matched node.
 *
 * @param position The start position.
 * @param attributeName The attribute name.
 * @param value The attribute value.
 * @param lookBack Whether the walk direction is forward (`false`) or backward (`true`).
 * @returns The position just before the last matched node.
 */
export function findAttributeRangeBound(position, attributeName, value, lookBack, model) {
    // Get node before or after position (depends on `lookBack` flag).
    // When position is inside text node then start searching from text node.
    let node = position.textNode || (lookBack ? position.nodeBefore : position.nodeAfter);
    let lastNode = null;
    while (node && node.getAttribute(attributeName) == value) {
        lastNode = node;
        node = lookBack ? node.previousSibling : node.nextSibling;
    }
    return lastNode ? model.createPositionAt(lastNode, lookBack ? 'before' : 'after') : position;
}
