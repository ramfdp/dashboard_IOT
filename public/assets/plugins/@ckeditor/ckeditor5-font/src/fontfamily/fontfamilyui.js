/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module font/fontfamily/fontfamilyui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { Collection } from 'ckeditor5/src/utils.js';
import { ViewModel, createDropdown, addListToDropdown, MenuBarMenuView, MenuBarMenuListView, MenuBarMenuListItemView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { normalizeOptions } from './utils.js';
import { FONT_FAMILY } from '../utils.js';
import fontFamilyIcon from '../../theme/icons/font-family.svg';
/**
 * The font family UI plugin. It introduces the `'fontFamily'` dropdown.
 */
export default class FontFamilyUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'FontFamilyUI';
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
        const t = editor.t;
        const options = this._getLocalizedOptions();
        const command = editor.commands.get(FONT_FAMILY);
        const accessibleLabel = t('Font Family');
        const listOptions = _prepareListOptions(options, command);
        // Register UI component.
        editor.ui.componentFactory.add(FONT_FAMILY, locale => {
            const dropdownView = createDropdown(locale);
            addListToDropdown(dropdownView, listOptions, {
                role: 'menu',
                ariaLabel: accessibleLabel
            });
            dropdownView.buttonView.set({
                label: accessibleLabel,
                icon: fontFamilyIcon,
                tooltip: true
            });
            dropdownView.extendTemplate({
                attributes: {
                    class: 'ck-font-family-dropdown'
                }
            });
            dropdownView.bind('isEnabled').to(command);
            // Execute command when an item from the dropdown is selected.
            this.listenTo(dropdownView, 'execute', evt => {
                editor.execute(evt.source.commandName, { value: evt.source.commandParam });
                editor.editing.view.focus();
            });
            return dropdownView;
        });
        editor.ui.componentFactory.add(`menuBar:${FONT_FAMILY}`, locale => {
            const menuView = new MenuBarMenuView(locale);
            menuView.buttonView.set({
                label: accessibleLabel,
                icon: fontFamilyIcon
            });
            menuView.bind('isEnabled').to(command);
            const listView = new MenuBarMenuListView(locale);
            for (const definition of listOptions) {
                const listItemView = new MenuBarMenuListItemView(locale, menuView);
                const buttonView = new MenuBarMenuListItemButtonView(locale);
                buttonView.set({
                    role: 'menuitemradio',
                    isToggleable: true
                });
                buttonView.bind(...Object.keys(definition.model)).to(definition.model);
                buttonView.delegate('execute').to(menuView);
                buttonView.on('execute', () => {
                    editor.execute(definition.model.commandName, {
                        value: definition.model.commandParam
                    });
                    editor.editing.view.focus();
                });
                listItemView.children.add(buttonView);
                listView.items.add(listItemView);
            }
            menuView.panelView.children.add(listView);
            return menuView;
        });
    }
    /**
     * Returns options as defined in `config.fontFamily.options` but processed to account for
     * editor localization, i.e. to display {@link module:font/fontconfig~FontFamilyOption}
     * in the correct language.
     *
     * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
     * when the user configuration is defined because the editor does not exist yet.
     */
    _getLocalizedOptions() {
        const editor = this.editor;
        const t = editor.t;
        const options = normalizeOptions((editor.config.get(FONT_FAMILY)).options);
        return options.map(option => {
            // The only title to localize is "Default" others are font names.
            if (option.title === 'Default') {
                option.title = t('Default');
            }
            return option;
        });
    }
}
/**
 * Prepares FontFamily dropdown items.
 */
function _prepareListOptions(options, command) {
    const itemDefinitions = new Collection();
    // Create dropdown items.
    for (const option of options) {
        const def = {
            type: 'button',
            model: new ViewModel({
                commandName: FONT_FAMILY,
                commandParam: option.model,
                label: option.title,
                role: 'menuitemradio',
                withText: true
            })
        };
        def.model.bind('isOn').to(command, 'value', value => {
            // "Default" or check in strict font-family converters mode.
            if (value === option.model) {
                return true;
            }
            if (!value || !option.model) {
                return false;
            }
            return value.split(',')[0].replace(/'/g, '').toLowerCase() === option.model.toLowerCase();
        });
        // Try to set a dropdown list item style.
        if (option.view && typeof option.view !== 'string' && option.view.styles) {
            def.model.set('labelStyle', `font-family: ${option.view.styles['font-family']}`);
        }
        itemDefinitions.add(def);
    }
    return itemDefinitions;
}
