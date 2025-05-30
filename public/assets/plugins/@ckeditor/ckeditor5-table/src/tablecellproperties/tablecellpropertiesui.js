/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablecellproperties/tablecellpropertiesui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, clickOutsideHandler, ContextualBalloon, getLocalizedColorOptions, normalizeColorOptions } from 'ckeditor5/src/ui.js';
import TableCellPropertiesView from './ui/tablecellpropertiesview.js';
import { colorFieldValidator, getLocalizedColorErrorText, getLocalizedLengthErrorText, defaultColors, lengthFieldValidator, lineWidthFieldValidator } from '../utils/ui/table-properties.js';
import { debounce } from 'lodash-es';
import { getTableWidgetAncestor } from '../utils/ui/widget.js';
import { getBalloonCellPositionData, repositionContextualBalloon } from '../utils/ui/contextualballoon.js';
import tableCellProperties from './../../theme/icons/table-cell-properties.svg';
import { getNormalizedDefaultCellProperties } from '../utils/table-properties.js';
const ERROR_TEXT_TIMEOUT = 500;
// Map of view properties and related commands.
const propertyToCommandMap = {
    borderStyle: 'tableCellBorderStyle',
    borderColor: 'tableCellBorderColor',
    borderWidth: 'tableCellBorderWidth',
    height: 'tableCellHeight',
    width: 'tableCellWidth',
    padding: 'tableCellPadding',
    backgroundColor: 'tableCellBackgroundColor',
    horizontalAlignment: 'tableCellHorizontalAlignment',
    verticalAlignment: 'tableCellVerticalAlignment'
};
/**
 * The table cell properties UI plugin. It introduces the `'tableCellProperties'` button
 * that opens a form allowing to specify the visual styling of a table cell.
 *
 * It uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */
export default class TableCellPropertiesUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [ContextualBalloon];
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'TableCellPropertiesUI';
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
    constructor(editor) {
        super(editor);
        editor.config.define('table.tableCellProperties', {
            borderColors: defaultColors,
            backgroundColors: defaultColors
        });
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const t = editor.t;
        this._defaultTableCellProperties = getNormalizedDefaultCellProperties(editor.config.get('table.tableCellProperties.defaultProperties'), {
            includeVerticalAlignmentProperty: true,
            includeHorizontalAlignmentProperty: true,
            includePaddingProperty: true,
            isRightToLeftContent: editor.locale.contentLanguageDirection === 'rtl'
        });
        this._balloon = editor.plugins.get(ContextualBalloon);
        this.view = null;
        this._isReady = false;
        editor.ui.componentFactory.add('tableCellProperties', locale => {
            const view = new ButtonView(locale);
            view.set({
                label: t('Cell properties'),
                icon: tableCellProperties,
                tooltip: true
            });
            this.listenTo(view, 'execute', () => this._showView());
            const commands = Object.values(propertyToCommandMap)
                .map(commandName => editor.commands.get(commandName));
            view.bind('isEnabled').toMany(commands, 'isEnabled', (...areEnabled) => (areEnabled.some(isCommandEnabled => isCommandEnabled)));
            return view;
        });
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        // Destroy created UI components as they are not automatically destroyed.
        // See https://github.com/ckeditor/ckeditor5/issues/1341.
        if (this.view) {
            this.view.destroy();
        }
    }
    /**
     * Creates the {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView} instance.
     *
     * @returns The cell properties form view instance.
     */
    _createPropertiesView() {
        const editor = this.editor;
        const config = editor.config.get('table.tableCellProperties');
        const borderColorsConfig = normalizeColorOptions(config.borderColors);
        const localizedBorderColors = getLocalizedColorOptions(editor.locale, borderColorsConfig);
        const backgroundColorsConfig = normalizeColorOptions(config.backgroundColors);
        const localizedBackgroundColors = getLocalizedColorOptions(editor.locale, backgroundColorsConfig);
        const hasColorPicker = config.colorPicker !== false;
        const view = new TableCellPropertiesView(editor.locale, {
            borderColors: localizedBorderColors,
            backgroundColors: localizedBackgroundColors,
            defaultTableCellProperties: this._defaultTableCellProperties,
            colorPickerConfig: hasColorPicker ? (config.colorPicker || {}) : false
        });
        const t = editor.t;
        // Render the view so its #element is available for the clickOutsideHandler.
        view.render();
        this.listenTo(view, 'submit', () => {
            this._hideView();
        });
        this.listenTo(view, 'cancel', () => {
            // https://github.com/ckeditor/ckeditor5/issues/6180
            if (this._undoStepBatch.operations.length) {
                editor.execute('undo', this._undoStepBatch);
            }
            this._hideView();
        });
        // Close the balloon on Esc key press.
        view.keystrokes.set('Esc', (data, cancel) => {
            this._hideView();
            cancel();
        });
        // Close on click outside of balloon panel element.
        clickOutsideHandler({
            emitter: view,
            activator: () => this._isViewInBalloon,
            contextElements: [this._balloon.view.element],
            callback: () => this._hideView()
        });
        const colorErrorText = getLocalizedColorErrorText(t);
        const lengthErrorText = getLocalizedLengthErrorText(t);
        // Create the "UI -> editor data" binding.
        // These listeners update the editor data (via table commands) when any observable
        // property of the view has changed. They also validate the value and display errors in the UI
        // when necessary. This makes the view live, which means the changes are
        // visible in the editing as soon as the user types or changes fields' values.
        view.on('change:borderStyle', this._getPropertyChangeCallback('tableCellBorderStyle'));
        view.on('change:borderColor', this._getValidatedPropertyChangeCallback({
            viewField: view.borderColorInput,
            commandName: 'tableCellBorderColor',
            errorText: colorErrorText,
            validator: colorFieldValidator
        }));
        view.on('change:borderWidth', this._getValidatedPropertyChangeCallback({
            viewField: view.borderWidthInput,
            commandName: 'tableCellBorderWidth',
            errorText: lengthErrorText,
            validator: lineWidthFieldValidator
        }));
        view.on('change:padding', this._getValidatedPropertyChangeCallback({
            viewField: view.paddingInput,
            commandName: 'tableCellPadding',
            errorText: lengthErrorText,
            validator: lengthFieldValidator
        }));
        view.on('change:width', this._getValidatedPropertyChangeCallback({
            viewField: view.widthInput,
            commandName: 'tableCellWidth',
            errorText: lengthErrorText,
            validator: lengthFieldValidator
        }));
        view.on('change:height', this._getValidatedPropertyChangeCallback({
            viewField: view.heightInput,
            commandName: 'tableCellHeight',
            errorText: lengthErrorText,
            validator: lengthFieldValidator
        }));
        view.on('change:backgroundColor', this._getValidatedPropertyChangeCallback({
            viewField: view.backgroundInput,
            commandName: 'tableCellBackgroundColor',
            errorText: colorErrorText,
            validator: colorFieldValidator
        }));
        view.on('change:horizontalAlignment', this._getPropertyChangeCallback('tableCellHorizontalAlignment'));
        view.on('change:verticalAlignment', this._getPropertyChangeCallback('tableCellVerticalAlignment'));
        return view;
    }
    /**
     * In this method the "editor data -> UI" binding is happening.
     *
     * When executed, this method obtains selected cell property values from various table commands
     * and passes them to the {@link #view}.
     *
     * This way, the UI stays up–to–date with the editor data.
     */
    _fillViewFormFromCommandValues() {
        const commands = this.editor.commands;
        const borderStyleCommand = commands.get('tableCellBorderStyle');
        Object.entries(propertyToCommandMap)
            .map(([property, commandName]) => {
            const defaultValue = this._defaultTableCellProperties[property] || '';
            return [
                property,
                commands.get(commandName).value || defaultValue
            ];
        })
            .forEach(([property, value]) => {
            // Do not set the `border-color` and `border-width` fields if `border-style:none`.
            if ((property === 'borderColor' || property === 'borderWidth') && borderStyleCommand.value === 'none') {
                return;
            }
            this.view.set(property, value);
        });
        this._isReady = true;
    }
    /**
     * Shows the {@link #view} in the {@link #_balloon}.
     *
     * **Note**: Each time a view is shown, a new {@link #_undoStepBatch} is created. It contains
     * all changes made to the document when the view is visible, allowing a single undo step
     * for all of them.
     */
    _showView() {
        const editor = this.editor;
        if (!this.view) {
            this.view = this._createPropertiesView();
        }
        this.listenTo(editor.ui, 'update', () => {
            this._updateView();
        });
        // Update the view with the model values.
        this._fillViewFormFromCommandValues();
        this._balloon.add({
            view: this.view,
            position: getBalloonCellPositionData(editor)
        });
        // Create a new batch. Clicking "Cancel" will undo this batch.
        this._undoStepBatch = editor.model.createBatch();
        // Basic a11y.
        this.view.focus();
    }
    /**
     * Removes the {@link #view} from the {@link #_balloon}.
     */
    _hideView() {
        const editor = this.editor;
        this.stopListening(editor.ui, 'update');
        this._isReady = false;
        // Blur any input element before removing it from DOM to prevent issues in some browsers.
        // See https://github.com/ckeditor/ckeditor5/issues/1501.
        this.view.saveButtonView.focus();
        this._balloon.remove(this.view);
        // Make sure the focus is not lost in the process by putting it directly
        // into the editing view.
        this.editor.editing.view.focus();
    }
    /**
     * Repositions the {@link #_balloon} or hides the {@link #view} if a table cell is no longer selected.
     */
    _updateView() {
        const editor = this.editor;
        const viewDocument = editor.editing.view.document;
        if (!getTableWidgetAncestor(viewDocument.selection)) {
            this._hideView();
        }
        else if (this._isViewVisible) {
            repositionContextualBalloon(editor, 'cell');
        }
    }
    /**
     * Returns `true` when the {@link #view} is visible in the {@link #_balloon}.
     */
    get _isViewVisible() {
        return !!this.view && this._balloon.visibleView === this.view;
    }
    /**
     * Returns `true` when the {@link #view} is in the {@link #_balloon}.
     */
    get _isViewInBalloon() {
        return !!this.view && this._balloon.hasView(this.view);
    }
    /**
     * Creates a callback that when executed upon the {@link #view view's} property change
     * executes a related editor command with the new property value.
     *
     * @param defaultValue The default value of the command.
     */
    _getPropertyChangeCallback(commandName) {
        return (evt, propertyName, newValue) => {
            if (!this._isReady) {
                return;
            }
            this.editor.execute(commandName, {
                value: newValue,
                batch: this._undoStepBatch
            });
        };
    }
    /**
     * Creates a callback that when executed upon the {@link #view view's} property change:
     * * Executes a related editor command with the new property value if the value is valid,
     * * Or sets the error text next to the invalid field, if the value did not pass the validation.
     */
    _getValidatedPropertyChangeCallback(options) {
        const { commandName, viewField, validator, errorText } = options;
        const setErrorTextDebounced = debounce(() => {
            viewField.errorText = errorText;
        }, ERROR_TEXT_TIMEOUT);
        return (evt, propertyName, newValue) => {
            setErrorTextDebounced.cancel();
            // Do not execute the command on initial call (opening the table properties view).
            if (!this._isReady) {
                return;
            }
            if (validator(newValue)) {
                this.editor.execute(commandName, {
                    value: newValue,
                    batch: this._undoStepBatch
                });
                viewField.errorText = null;
            }
            else {
                setErrorTextDebounced();
            }
        };
    }
}
