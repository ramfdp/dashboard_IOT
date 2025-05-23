/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablecellproperties
 */
import { Plugin } from 'ckeditor5/src/core.js';
import TableCellPropertiesUI from './tablecellproperties/tablecellpropertiesui.js';
import TableCellPropertiesEditing from './tablecellproperties/tablecellpropertiesediting.js';
/**
 * The table cell properties feature. Enables support for setting properties of table cells (size, border, background, etc.).
 *
 * Read more in the {@glink features/tables/tables-styling Table and cell styling tools} section.
 * See also the {@link module:table/tableproperties~TableProperties} plugin.
 *
 * This is a "glue" plugin that loads the
 * {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing table cell properties editing feature} and
 * the {@link module:table/tablecellproperties/tablecellpropertiesui~TableCellPropertiesUI table cell properties UI feature}.
 */
export default class TableCellProperties extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'TableCellProperties';
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
    static get requires() {
        return [TableCellPropertiesEditing, TableCellPropertiesUI];
    }
}
