/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/text
 */
import Node, { type NodeAttributes } from './node.js';
/**
 * Model text node. Type of {@link module:engine/model/node~Node node} that contains {@link module:engine/model/text~Text#data text data}.
 *
 * **Important:** see {@link module:engine/model/node~Node} to read about restrictions using `Text` and `Node` API.
 *
 * **Note:** keep in mind that `Text` instances might indirectly got removed from model tree when model is changed.
 * This happens when {@link module:engine/model/writer~Writer model writer} is used to change model and the text node is merged with
 * another text node. Then, both text nodes are removed and a new text node is inserted into the model. Because of
 * this behavior, keeping references to `Text` is not recommended. Instead, consider creating
 * {@link module:engine/model/liveposition~LivePosition live position} placed before the text node.
 */
export default class Text extends Node {
    /**
     * Text data contained in this text node.
     *
     * @internal
     */
    _data: string;
    /**
     * Creates a text node.
     *
     * **Note:** Constructor of this class shouldn't be used directly in the code.
     * Use the {@link module:engine/model/writer~Writer#createText} method instead.
     *
     * @internal
     * @param data Node's text.
     * @param attrs Node's attributes. See {@link module:utils/tomap~toMap} for a list of accepted values.
     */
    constructor(data?: string, attrs?: NodeAttributes);
    /**
     * @inheritDoc
     */
    get offsetSize(): number;
    /**
     * Returns a text data contained in the node.
     */
    get data(): string;
    /**
     * Converts `Text` instance to plain object and returns it.
     *
     * @returns`Text` instance converted to plain object.
     */
    toJSON(): unknown;
    /**
     * Creates a copy of this text node and returns it. Created text node has same text data and attributes as original text node.
     *
     * @internal
     * @returns `Text` instance created using given plain object.
     */
    _clone(): Text;
    /**
     * Creates a `Text` instance from given plain object (i.e. parsed JSON string).
     *
     * @param json Plain object to be converted to `Text`.
     * @returns `Text` instance created using given plain object.
     */
    static fromJSON(json: any): Text;
}
