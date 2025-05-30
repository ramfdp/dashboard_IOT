/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablecellproperties/commands/tablecellpropertycommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { Element, Batch } from 'ckeditor5/src/engine.js';
/**
 * The table cell attribute command.
 *
 * The command is a base command for other table cell property commands.
 */
export default class TableCellPropertyCommand extends Command {
    /**
     * The attribute that will be set by the command.
     */
    readonly attributeName: string;
    /**
     * The default value for the attribute.
     */
    protected readonly _defaultValue: string;
    /**
     * Creates a new `TableCellPropertyCommand` instance.
     *
     * @param editor An editor in which this command will be used.
     * @param attributeName Table cell attribute name.
     * @param defaultValue The default value of the attribute.
     */
    constructor(editor: Editor, attributeName: string, defaultValue: string);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * @fires execute
     * @param options.value If set, the command will set the attribute on selected table cells.
     * If it is not set, the command will remove the attribute from the selected table cells.
     * @param options.batch Pass the model batch instance to the command to aggregate changes,
     * for example to allow a single undo step for multiple executions.
     */
    execute(options?: {
        value?: string | number;
        batch?: Batch;
    }): void;
    /**
     * Returns the attribute value for a table cell.
     */
    protected _getAttribute(tableCell: Element | undefined): unknown;
    /**
     * Returns the proper model value. It can be used to add a default unit to numeric values.
     */
    protected _getValueToSet(value: string | number | undefined): unknown;
    /**
     * Returns a single value for all selected table cells. If the value is the same for all cells,
     * it will be returned (`undefined` otherwise).
     */
    private _getSingleValue;
}
