/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module basic-styles/superscript/superscriptui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { getButtonCreator } from '../utils.js';
import superscriptIcon from '../../theme/icons/superscript.svg';
const SUPERSCRIPT = 'superscript';
/**
 * The superscript UI feature. It introduces the Superscript button.
 */
export default class SuperscriptUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'SuperscriptUI';
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
        const editor = this.editor;
        const t = editor.locale.t;
        const createButton = getButtonCreator({
            editor,
            commandName: SUPERSCRIPT,
            plugin: this,
            icon: superscriptIcon,
            label: t('Superscript')
        });
        // Add superscript button to feature components.
        editor.ui.componentFactory.add(SUPERSCRIPT, () => createButton(ButtonView));
        editor.ui.componentFactory.add('menuBar:' + SUPERSCRIPT, () => createButton(MenuBarMenuListItemButtonView));
    }
}
