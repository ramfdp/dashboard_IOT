/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Returns attributes that should be preserved on the enter keystroke.
 *
 * Filtering is realized based on `copyOnEnter` attribute property. Read more about attribute properties
 * {@link module:engine/model/schema~Schema#setAttributeProperties here}.
 *
 * @param schema Model's schema.
 * @param allAttributes Attributes to filter.
 */
export function* getCopyOnEnterAttributes(schema, allAttributes) {
    for (const attribute of allAttributes) {
        if (attribute && schema.getAttributeProperties(attribute[0]).copyOnEnter) {
            yield attribute;
        }
    }
}
