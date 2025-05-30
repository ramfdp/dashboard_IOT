/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/legacytodolist/legacychecktodolistcommand
 */
import { Command } from 'ckeditor5/src/core.js';
const attributeKey = 'todoListChecked';
/**
 * The check to-do command.
 *
 * The command is registered by the {@link module:list/legacytodolist/legacytodolistediting~LegacyTodoListEditing} as
 * the `checkTodoList` editor command and it is also available via aliased `todoListCheck` name.
 */
export default class LegacyCheckTodoListCommand extends Command {
    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor);
        this._selectedElements = [];
        // Refresh command before executing to be sure all values are up to date.
        // It is needed when selection has changed before command execution, in the same change block.
        this.on('execute', () => {
            this.refresh();
        }, { priority: 'highest' });
    }
    /**
     * Updates the command's {@link #value} and {@link #isEnabled} properties based on the current selection.
     */
    refresh() {
        this._selectedElements = this._getSelectedItems();
        this.value = this._selectedElements.every(element => !!element.getAttribute(attributeKey));
        this.isEnabled = !!this._selectedElements.length;
    }
    /**
     * Gets all to-do list items selected by the {@link module:engine/model/selection~Selection}.
     */
    _getSelectedItems() {
        const model = this.editor.model;
        const schema = model.schema;
        const selectionRange = model.document.selection.getFirstRange();
        const startElement = selectionRange.start.parent;
        const elements = [];
        if (schema.checkAttribute(startElement, attributeKey)) {
            elements.push(startElement);
        }
        for (const item of selectionRange.getItems()) {
            if (schema.checkAttribute(item, attributeKey) && !elements.includes(item)) {
                elements.push(item);
            }
        }
        return elements;
    }
    /**
     * Executes the command.
     *
     * @param options.forceValue If set, it will force the command behavior. If `true`, the command will apply
     * the attribute. Otherwise, the command will remove the attribute. If not set, the command will look for its current
     * value to decide what it should do.
     */
    execute(options = {}) {
        this.editor.model.change(writer => {
            for (const element of this._selectedElements) {
                const value = (options.forceValue === undefined) ? !this.value : options.forceValue;
                if (value) {
                    writer.setAttribute(attributeKey, true, element);
                }
                else {
                    writer.removeAttribute(attributeKey, element);
                }
            }
        });
    }
}
