/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/list/listui
 */
import { createUIComponents } from './utils.js';
import { icons, Plugin } from 'ckeditor5/src/core.js';
/**
 * The list UI feature. It introduces the `'numberedList'` and `'bulletedList'` buttons that
 * allow to convert paragraphs to and from list items and indent or outdent them.
 */
export default class ListUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'ListUI';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    init() {
        const t = this.editor.t;
        // Create button numberedList.
        if (!this.editor.ui.componentFactory.has('numberedList')) {
            createUIComponents(this.editor, 'numberedList', t('Numbered List'), icons.numberedList);
        }
        // Create button bulletedList.
        if (!this.editor.ui.componentFactory.has('bulletedList')) {
            createUIComponents(this.editor, 'bulletedList', t('Bulleted List'), icons.bulletedList);
        }
    }
}
