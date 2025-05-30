/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/dataprocessor/basichtmlwriter
 */
import type HtmlWriter from './htmlwriter.js';
/**
 * Basic HTML writer. It uses the native `innerHTML` property for basic conversion
 * from a document fragment to an HTML string.
 */
export default class BasicHtmlWriter implements HtmlWriter {
    /**
     * Returns an HTML string created from the document fragment.
     */
    getHtml(fragment: DocumentFragment): string;
}
