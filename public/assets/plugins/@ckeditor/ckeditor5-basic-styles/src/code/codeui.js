/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module basic-styles/code/codeui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { getButtonCreator } from '../utils.js';
import codeIcon from '../../theme/icons/code.svg';
import '../../theme/code.css';
const CODE = 'code';
/**
 * The code UI feature. It introduces the Code button.
 */
export default class CodeUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'CodeUI';
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
            commandName: CODE,
            plugin: this,
            icon: codeIcon,
            label: t('Code')
        });
        // Add code button to feature components.
        editor.ui.componentFactory.add(CODE, () => createButton(ButtonView));
        editor.ui.componentFactory.add('menuBar:' + CODE, () => createButton(MenuBarMenuListItemButtonView));
    }
}
