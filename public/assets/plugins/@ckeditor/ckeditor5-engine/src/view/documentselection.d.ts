/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/documentselection
 */
import TypeCheckable from './typecheckable.js';
import Selection, { type PlaceOrOffset, type Selectable, type SelectionOptions, type ViewSelectionChangeEvent } from './selection.js';
import type EditableElement from './editableelement.js';
import type Element from './element.js';
import type Node from './node.js';
import type Item from './item.js';
import type { default as Position, PositionOffset } from './position.js';
import type Range from './range.js';
declare const DocumentSelection_base: import("@ckeditor/ckeditor5-utils").Mixed<typeof TypeCheckable, import("@ckeditor/ckeditor5-utils").Emitter>;
/**
 * Class representing the document selection in the view.
 *
 * Its instance is available in {@link module:engine/view/document~Document#selection `Document#selection`}.
 *
 * It is similar to {@link module:engine/view/selection~Selection} but
 * it has a read-only API and can be modified only by the writer available in
 * the {@link module:engine/view/view~View#change `View#change()`} block
 * (so via {@link module:engine/view/downcastwriter~DowncastWriter#setSelection `DowncastWriter#setSelection()`}).
 */
export default class DocumentSelection extends /* #__PURE__ */ DocumentSelection_base {
    /**
     * Selection is used internally (`DocumentSelection` is a proxy to that selection).
     */
    private readonly _selection;
    /**
     * Creates new DocumentSelection instance.
     *
     * ```ts
     * // Creates collapsed selection at the position of given item and offset.
     * const paragraph = writer.createContainerElement( 'paragraph' );
     * const selection = new DocumentSelection( paragraph, offset );
     *
     * // Creates a range inside an {@link module:engine/view/element~Element element} which starts before the
     * // first child of that element and ends after the last child of that element.
     * const selection = new DocumentSelection( paragraph, 'in' );
     *
     * // Creates a range on an {@link module:engine/view/item~Item item} which starts before the item and ends
     * // just after the item.
     * const selection = new DocumentSelection( paragraph, 'on' );
     * ```
     *
     * `Selection`'s constructor allow passing additional options (`backward`, `fake` and `label`) as the last argument.
     *
     * ```ts
     * // Creates backward selection.
     * const selection = new DocumentSelection( element, 'in', { backward: true } );
     * ```
     *
     * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
     * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
     * represented in other way, for example by applying proper CSS class.
     *
     * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
     * (and be  properly handled by screen readers).
     *
     * ```ts
     * // Creates fake selection with label.
     * const selection = new DocumentSelection( element, 'in', { fake: true, label: 'foo' } );
     * ```
     *
     * See also: {@link #constructor:SELECTABLE `constructor( selectable, options )`}.
     *
     * @label NODE_OFFSET
     */
    constructor(selectable: Node, placeOrOffset: PlaceOrOffset, options?: SelectionOptions);
    /**
     * Creates new DocumentSelection instance.
     *
     * ```ts
     * // Creates empty selection without ranges.
     * const selection = new DocumentSelection();
     *
     * // Creates selection at the given range.
     * const range = writer.createRange( start, end );
     * const selection = new DocumentSelection( range );
     *
     * // Creates selection at the given ranges
     * const ranges = [ writer.createRange( start1, end2 ), writer.createRange( start2, end2 ) ];
     * const selection = new DocumentSelection( ranges );
     *
     * // Creates selection from the other selection.
     * const otherSelection = writer.createSelection();
     * const selection = new DocumentSelection( otherSelection );
     *
     * // Creates selection at the given position.
     * const position = writer.createPositionAt( root, offset );
     * const selection = new DocumentSelection( position );
     * ```
     *
     * `Selection`'s constructor allow passing additional options (`backward`, `fake` and `label`) as the last argument.
     *
     * ```ts
     * // Creates backward selection.
     * const selection = new DocumentSelection( range, { backward: true } );
     * ```
     *
     * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
     * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
     * represented in other way, for example by applying proper CSS class.
     *
     * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
     * (and be  properly handled by screen readers).
     *
     * ```ts
     * // Creates fake selection with label.
     * const selection = new DocumentSelection( range, { fake: true, label: 'foo' } );
     * ```
     *
     * See also: {@link #constructor:NODE_OFFSET `constructor( node, placeOrOffset, options )`}.
     *
     * @label SELECTABLE
     */
    constructor(selectable?: Exclude<Selectable, Node>, options?: SelectionOptions);
    /**
     * Returns true if selection instance is marked as `fake`.
     *
     * @see #_setTo
     */
    get isFake(): boolean;
    /**
     * Returns fake selection label.
     *
     * @see #_setTo
     */
    get fakeSelectionLabel(): string;
    /**
     * Selection anchor. Anchor may be described as a position where the selection starts. Together with
     * {@link #focus focus} they define the direction of selection, which is important
     * when expanding/shrinking selection. Anchor is always the start or end of the most recent added range.
     * It may be a bit unintuitive when there are multiple ranges in selection.
     *
     * @see #focus
     */
    get anchor(): Position | null;
    /**
     * Selection focus. Focus is a position where the selection ends.
     *
     * @see #anchor
     */
    get focus(): Position | null;
    /**
     * Returns whether the selection is collapsed. Selection is collapsed when there is exactly one range which is
     * collapsed.
     */
    get isCollapsed(): boolean;
    /**
     * Returns number of ranges in selection.
     */
    get rangeCount(): number;
    /**
     * Specifies whether the {@link #focus} precedes {@link #anchor}.
     */
    get isBackward(): boolean;
    /**
     * {@link module:engine/view/editableelement~EditableElement EditableElement} instance that contains this selection, or `null`
     * if the selection is not inside an editable element.
     */
    get editableElement(): EditableElement | null;
    /**
     * Used for the compatibility with the {@link module:engine/view/selection~Selection#isEqual} method.
     *
     * @internal
     */
    get _ranges(): Array<Range>;
    /**
     * Returns an iterable that contains copies of all ranges added to the selection.
     */
    getRanges(): IterableIterator<Range>;
    /**
     * Returns copy of the first range in the selection. First range is the one which
     * {@link module:engine/view/range~Range#start start} position {@link module:engine/view/position~Position#isBefore is before} start
     * position of all other ranges (not to confuse with the first range added to the selection).
     * Returns `null` if no ranges are added to selection.
     */
    getFirstRange(): Range | null;
    /**
     * Returns copy of the last range in the selection. Last range is the one which {@link module:engine/view/range~Range#end end}
     * position {@link module:engine/view/position~Position#isAfter is after} end position of all other ranges (not to confuse
     * with the last range added to the selection). Returns `null` if no ranges are added to selection.
     */
    getLastRange(): Range | null;
    /**
     * Returns copy of the first position in the selection. First position is the position that
     * {@link module:engine/view/position~Position#isBefore is before} any other position in the selection ranges.
     * Returns `null` if no ranges are added to selection.
     */
    getFirstPosition(): Position | null;
    /**
     * Returns copy of the last position in the selection. Last position is the position that
     * {@link module:engine/view/position~Position#isAfter is after} any other position in the selection ranges.
     * Returns `null` if no ranges are added to selection.
     */
    getLastPosition(): Position | null;
    /**
     * Returns the selected element. {@link module:engine/view/element~Element Element} is considered as selected if there is only
     * one range in the selection, and that range contains exactly one element.
     * Returns `null` if there is no selected element.
     */
    getSelectedElement(): Element | null;
    /**
     * Checks whether, this selection is equal to given selection. Selections are equal if they have same directions,
     * same number of ranges and all ranges from one selection equal to a range from other selection.
     *
     * @param otherSelection Selection to compare with.
     * @returns `true` if selections are equal, `false` otherwise.
     */
    isEqual(otherSelection: Selection | DocumentSelection): boolean;
    /**
     * Checks whether this selection is similar to given selection. Selections are similar if they have same directions, same
     * number of ranges, and all {@link module:engine/view/range~Range#getTrimmed trimmed} ranges from one selection are
     * equal to any trimmed range from other selection.
     *
     * @param otherSelection Selection to compare with.
     * @returns `true` if selections are similar, `false` otherwise.
     */
    isSimilar(otherSelection: Selection | DocumentSelection): boolean;
    /**
     * Sets this selection's ranges and direction to the specified location based on the given
     * {@link module:engine/view/selection~Selectable selectable}.
     *
     * ```ts
     * // Sets selection to the given range.
     * const range = writer.createRange( start, end );
     * documentSelection._setTo( range );
     *
     * // Sets selection to given ranges.
     * const ranges = [ writer.createRange( start1, end2 ), writer.createRange( start2, end2 ) ];
     * documentSelection._setTo( range );
     *
     * // Sets selection to the other selection.
     * const otherSelection = writer.createSelection();
     * documentSelection._setTo( otherSelection );
     *
     * // Sets collapsed selection at the given position.
     * const position = writer.createPositionAt( root, offset );
     * documentSelection._setTo( position );
     *
     * // Sets collapsed selection at the position of given item and offset.
     * documentSelection._setTo( paragraph, offset );
     * ```
     *
     * Creates a range inside an {@link module:engine/view/element~Element element} which starts before the first child of
     * that element and ends after the last child of that element.
     *
     * ```ts
     * documentSelection._setTo( paragraph, 'in' );
     * ```
     *
     * Creates a range on an {@link module:engine/view/item~Item item} which starts before the item and ends just after the item.
     *
     * ```ts
     * documentSelection._setTo( paragraph, 'on' );
     *
     * // Clears selection. Removes all ranges.
     * documentSelection._setTo( null );
     * ```
     *
     * `Selection#_setTo()` method allow passing additional options (`backward`, `fake` and `label`) as the last argument.
     *
     * ```ts
     * // Sets selection as backward.
     * documentSelection._setTo( range, { backward: true } );
     * ```
     *
     * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
     * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
     * represented in other way, for example by applying proper CSS class.
     *
     * Additionally fake's selection label can be provided. It will be used to des cribe fake selection in DOM
     * (and be  properly handled by screen readers).
     *
     * ```ts
     * // Creates fake selection with label.
     * documentSelection._setTo( range, { fake: true, label: 'foo' } );
     * ```
     *
     * @internal
     * @fires change
     */
    _setTo(...args: Parameters<Selection['setTo']>): void;
    /**
     * Moves {@link #focus} to the specified location.
     *
     * The location can be specified in the same form as {@link module:engine/view/view~View#createPositionAt view.createPositionAt()}
     * parameters.
     *
     * @internal
     * @fires change
     * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/view/item~Item view item}.
     */
    _setFocus(itemOrPosition: Item | Position, offset?: PositionOffset): void;
}
/**
 * Fired whenever selection ranges are changed through {@link ~DocumentSelection Selection API}.
 *
 * @eventName ~DocumentSelection#change
 */
export type ViewDocumentSelectionChangeEvent = ViewSelectionChangeEvent;
export {};
