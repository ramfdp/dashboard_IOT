/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/attributeelement
 */
import Element from './element.js';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';
// Default attribute priority.
const DEFAULT_PRIORITY = 10;
/**
 * Attribute elements are used to represent formatting elements in the view (think – `<b>`, `<span style="font-size: 2em">`, etc.).
 * Most often they are created when downcasting model text attributes.
 *
 * Editing engine does not define a fixed HTML DTD. This is why a feature developer needs to choose between various
 * types (container element, {@link module:engine/view/attributeelement~AttributeElement attribute element},
 * {@link module:engine/view/emptyelement~EmptyElement empty element}, etc) when developing a feature.
 *
 * To create a new attribute element instance use the
 * {@link module:engine/view/downcastwriter~DowncastWriter#createAttributeElement `DowncastWriter#createAttributeElement()`} method.
 */
class AttributeElement extends Element {
    /**
     * Creates an attribute element.
     *
     * @see module:engine/view/downcastwriter~DowncastWriter#createAttributeElement
     * @see module:engine/view/element~Element
     * @protected
     * @param document The document instance to which this element belongs.
     * @param name Node name.
     * @param attrs Collection of attributes.
     * @param children A list of nodes to be inserted into created element.
     */
    constructor(document, name, attrs, children) {
        super(document, name, attrs, children);
        /**
         * Element priority. Decides in what order elements are wrapped by {@link module:engine/view/downcastwriter~DowncastWriter}.
         *
         * @internal
         * @readonly
         */
        this._priority = DEFAULT_PRIORITY;
        /**
         * Element identifier. If set, it is used by {@link module:engine/view/element~Element#isSimilar},
         * and then two elements are considered similar if, and only if they have the same `_id`.
         *
         * @internal
         * @readonly
         */
        this._id = null;
        /**
         * Keeps all the attribute elements that have the same {@link module:engine/view/attributeelement~AttributeElement#id ids}
         * and still exist in the view tree.
         *
         * This property is managed by {@link module:engine/view/downcastwriter~DowncastWriter}.
         */
        this._clonesGroup = null;
        this.getFillerOffset = getFillerOffset;
    }
    /**
     * Element priority. Decides in what order elements are wrapped by {@link module:engine/view/downcastwriter~DowncastWriter}.
     */
    get priority() {
        return this._priority;
    }
    /**
     * Element identifier. If set, it is used by {@link module:engine/view/element~Element#isSimilar},
     * and then two elements are considered similar if, and only if they have the same `id`.
     */
    get id() {
        return this._id;
    }
    /**
     * Returns all {@link module:engine/view/attributeelement~AttributeElement attribute elements} that has the
     * same {@link module:engine/view/attributeelement~AttributeElement#id id} and are in the view tree (were not removed).
     *
     * Note: If this element has been removed from the tree, returned set will not include it.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError attribute-element-get-elements-with-same-id-no-id}
     * if this element has no `id`.
     *
     * @returns Set containing all the attribute elements
     * with the same `id` that were added and not removed from the view tree.
     */
    getElementsWithSameId() {
        if (this.id === null) {
            /**
             * Cannot get elements with the same id for an attribute element without id.
             *
             * @error attribute-element-get-elements-with-same-id-no-id
             */
            throw new CKEditorError('attribute-element-get-elements-with-same-id-no-id', this);
        }
        return new Set(this._clonesGroup);
    }
    /**
     * Checks if this element is similar to other element.
     *
     * If none of elements has set {@link module:engine/view/attributeelement~AttributeElement#id}, then both elements
     * should have the same name, attributes and priority to be considered as similar. Two similar elements can contain
     * different set of children nodes.
     *
     * If at least one element has {@link module:engine/view/attributeelement~AttributeElement#id} set, then both
     * elements have to have the same {@link module:engine/view/attributeelement~AttributeElement#id} value to be
     * considered similar.
     *
     * Similarity is important for {@link module:engine/view/downcastwriter~DowncastWriter}. For example:
     *
     * * two following similar elements can be merged together into one, longer element,
     * * {@link module:engine/view/downcastwriter~DowncastWriter#unwrap} checks similarity of passed element and processed element to
     * decide whether processed element should be unwrapped,
     * * etc.
     */
    isSimilar(otherElement) {
        // If any element has an `id` set, just compare the ids.
        if (this.id !== null || otherElement.id !== null) {
            return this.id === otherElement.id;
        }
        return super.isSimilar(otherElement) && this.priority == otherElement.priority;
    }
    /**
     * Clones provided element with priority.
     *
     * @internal
     * @param deep If set to `true` clones element and all its children recursively. When set to `false`,
     * element will be cloned without any children.
     * @returns Clone of this element.
     */
    _clone(deep = false) {
        const cloned = super._clone(deep);
        // Clone priority too.
        cloned._priority = this._priority;
        // And id too.
        cloned._id = this._id;
        return cloned;
    }
}
AttributeElement.DEFAULT_PRIORITY = DEFAULT_PRIORITY;
export default AttributeElement;
// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
AttributeElement.prototype.is = function (type, name) {
    if (!name) {
        return type === 'attributeElement' || type === 'view:attributeElement' ||
            // From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
            type === 'element' || type === 'view:element' ||
            type === 'node' || type === 'view:node';
    }
    else {
        return name === this.name && (type === 'attributeElement' || type === 'view:attributeElement' ||
            // From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
            type === 'element' || type === 'view:element');
    }
};
/**
 * Returns block {@link module:engine/view/filler~Filler filler} offset or `null` if block filler is not needed.
 *
 * @returns Block filler offset or `null` if block filler is not needed.
 */
function getFillerOffset() {
    // <b>foo</b> does not need filler.
    if (nonUiChildrenCount(this)) {
        return null;
    }
    let element = this.parent;
    // <p><b></b></p> needs filler -> <p><b><br></b></p>
    while (element && element.is('attributeElement')) {
        if (nonUiChildrenCount(element) > 1) {
            return null;
        }
        element = element.parent;
    }
    if (!element || nonUiChildrenCount(element) > 1) {
        return null;
    }
    // Render block filler at the end of element (after all ui elements).
    return this.childCount;
}
/**
 * Returns total count of children that are not {@link module:engine/view/uielement~UIElement UIElements}.
 */
function nonUiChildrenCount(element) {
    return Array.from(element.getChildren()).filter(element => !element.is('uiElement')).length;
}
