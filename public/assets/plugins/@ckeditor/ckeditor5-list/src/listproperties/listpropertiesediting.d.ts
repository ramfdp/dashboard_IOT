/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/listproperties/listpropertiesediting
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import type { Consumables, DowncastWriter, Element, Item, ViewElement } from 'ckeditor5/src/engine.js';
import ListEditing, { type ListItemAttributesMap } from '../list/listediting.js';
import ListPropertiesUtils from './listpropertiesutils.js';
/**
 * The document list properties engine feature.
 *
 * It registers the `'listStyle'`, `'listReversed'` and `'listStart'` commands if they are enabled in the configuration.
 * Read more in {@link module:list/listconfig~ListPropertiesConfig}.
 */
export default class ListPropertiesEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ListEditing, typeof ListPropertiesUtils];
    /**
     * @inheritDoc
     */
    static get pluginName(): "ListPropertiesEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
}
/**
 * Strategy for dealing with `listItem` attributes supported by this plugin.
 *
 * @internal
 */
export interface AttributeStrategy {
    /**
     * The model attribute name.
     */
    attributeName: keyof ListItemAttributesMap;
    /**
     * The model attribute default value.
     */
    defaultValue: unknown;
    /**
     * The view consumable as expected by {@link module:engine/conversion/viewconsumable~ViewConsumable#consume `ViewConsumable`}.
     */
    viewConsumables: Consumables;
    /**
     * Registers an editor command.
     */
    addCommand(editor: Editor): void;
    /**
     * Verifies whether the strategy is applicable for the specified model element.
     */
    appliesToListItem(element: Item): boolean;
    /**
     * Verifies whether the model attribute value is valid.
     */
    hasValidAttribute(element: Element): boolean;
    /**
     * Sets the property on the view element.
     */
    setAttributeOnDowncast(writer: DowncastWriter, value: unknown, element: ViewElement): void;
    /**
     * Retrieves the property value from the view element.
     */
    getAttributeOnUpcast(element: ViewElement): unknown;
}
declare module '../list/listediting' {
    interface ListItemAttributesMap {
        listStyle?: string;
        listStart?: number;
        listReversed?: boolean;
    }
}
declare module '../list/utils/model' {
    interface ListElement {
        getAttribute(key: 'listStyle'): string;
        getAttribute(key: 'listStart'): number;
        getAttribute(key: 'listReversed'): boolean;
    }
}
