/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type View from './view.js';
/**
 * Set of utilities related to handling block and inline fillers.
 *
 * Browsers do not allow to put caret in elements which does not have height. Because of it, we need to fill all
 * empty elements which should be selectable with elements or characters called "fillers". Unfortunately there is no one
 * universal filler, this is why two types are uses:
 *
 * * Block filler is an element which fill block elements, like `<p>`. CKEditor uses `<br>` as a block filler during the editing,
 * as browsers do natively. So instead of an empty `<p>` there will be `<p><br></p>`. The advantage of block filler is that
 * it is transparent for the selection, so when the caret is before the `<br>` and user presses right arrow he will be
 * moved to the next paragraph, not after the `<br>`. The disadvantage is that it breaks a block, so it can not be used
 * in the middle of a line of text. The {@link module:engine/view/filler~BR_FILLER `<br>` filler} can be replaced with any other
 * character in the data output, for instance {@link module:engine/view/filler~NBSP_FILLER non-breaking space} or
 * {@link module:engine/view/filler~MARKED_NBSP_FILLER marked non-breaking space}.
 *
 * * Inline filler is a filler which does not break a line of text, so it can be used inside the text, for instance in the empty
 * `<b>` surrendered by text: `foo<b></b>bar`, if we want to put the caret there. CKEditor uses a sequence of the zero-width
 * spaces as an {@link module:engine/view/filler~INLINE_FILLER inline filler} having the predetermined
 * {@link module:engine/view/filler~INLINE_FILLER_LENGTH length}. A sequence is used, instead of a single character to
 * avoid treating random zero-width spaces as the inline filler. Disadvantage of the inline filler is that it is not
 * transparent for the selection. The arrow key moves the caret between zero-width spaces characters, so the additional
 * code is needed to handle the caret.
 *
 * Both inline and block fillers are handled by the {@link module:engine/view/renderer~Renderer renderer} and are not present in the
 * view.
 *
 * @module engine/view/filler
 */
/**
 * Non-breaking space filler creator. This function creates the `&nbsp;` text node.
 * It defines how the filler is created.
 *
 * @see module:engine/view/filler~MARKED_NBSP_FILLER
 * @see module:engine/view/filler~BR_FILLER
 */
export declare const NBSP_FILLER: (domDocument: Document) => Text;
/**
 * Marked non-breaking space filler creator. This function creates the `<span data-cke-filler="true">&nbsp;</span>` element.
 * It defines how the filler is created.
 *
 * @see module:engine/view/filler~NBSP_FILLER
 * @see module:engine/view/filler~BR_FILLER
 */
export declare const MARKED_NBSP_FILLER: (domDocument: Document) => HTMLSpanElement;
/**
 * `<br>` filler creator. This function creates the `<br data-cke-filler="true">` element.
 * It defines how the filler is created.
 *
 * @see module:engine/view/filler~NBSP_FILLER
 * @see module:engine/view/filler~MARKED_NBSP_FILLER
 */
export declare const BR_FILLER: (domDocument: Document) => HTMLBRElement;
/**
 * Length of the {@link module:engine/view/filler~INLINE_FILLER INLINE_FILLER}.
 */
export declare const INLINE_FILLER_LENGTH = 7;
/**
 * Inline filler which is a sequence of the word joiners.
 */
export declare const INLINE_FILLER: string;
/**
 * Checks if the node is a text node which starts with the {@link module:engine/view/filler~INLINE_FILLER inline filler}.
 *
 * ```ts
 * startsWithFiller( document.createTextNode( INLINE_FILLER ) ); // true
 * startsWithFiller( document.createTextNode( INLINE_FILLER + 'foo' ) ); // true
 * startsWithFiller( document.createTextNode( 'foo' ) ); // false
 * startsWithFiller( document.createElement( 'p' ) ); // false
 * ```
 *
 * @param domNode DOM node.
 * @returns True if the text node starts with the {@link module:engine/view/filler~INLINE_FILLER inline filler}.
 */
export declare function startsWithFiller(domNode: Node | string): boolean;
/**
 * Checks if the text node contains only the {@link module:engine/view/filler~INLINE_FILLER inline filler}.
 *
 * ```ts
 * isInlineFiller( document.createTextNode( INLINE_FILLER ) ); // true
 * isInlineFiller( document.createTextNode( INLINE_FILLER + 'foo' ) ); // false
 * ```
 *
 * @param domText DOM text node.
 * @returns True if the text node contains only the {@link module:engine/view/filler~INLINE_FILLER inline filler}.
 */
export declare function isInlineFiller(domText: Text): boolean;
/**
 * Get string data from the text node, removing an {@link module:engine/view/filler~INLINE_FILLER inline filler} from it,
 * if text node contains it.
 *
 * ```ts
 * getDataWithoutFiller( document.createTextNode( INLINE_FILLER + 'foo' ) ) == 'foo' // true
 * getDataWithoutFiller( document.createTextNode( 'foo' ) ) == 'foo' // true
 * ```
 *
 * @param domText DOM text node, possible with inline filler.
 * @returns Data without filler.
 */
export declare function getDataWithoutFiller(domText: Text | string): string;
/**
 * Assign key observer which move cursor from the end of the inline filler to the beginning of it when
 * the left arrow is pressed, so the filler does not break navigation.
 *
 * @param view View controller instance we should inject quirks handling on.
 */
export declare function injectQuirksHandling(view: View): void;
