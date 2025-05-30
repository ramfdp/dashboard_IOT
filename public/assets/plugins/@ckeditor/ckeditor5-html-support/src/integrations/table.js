/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { updateViewAttributes } from '../utils.js';
import DataFilter from '../datafilter.js';
import { getDescendantElement } from './integrationutils.js';
/**
 * Provides the General HTML Support integration with {@link module:table/table~Table Table} feature.
 */
export default class TableElementSupport extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [DataFilter];
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'TableElementSupport';
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
        if (!editor.plugins.has('TableEditing')) {
            return;
        }
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const dataFilter = editor.plugins.get(DataFilter);
        const tableUtils = editor.plugins.get('TableUtils');
        dataFilter.on('register:figure', () => {
            conversion.for('upcast').add(viewToModelFigureAttributeConverter(dataFilter));
        });
        dataFilter.on('register:table', (evt, definition) => {
            if (definition.model !== 'table') {
                return;
            }
            schema.extend('table', {
                allowAttributes: [
                    'htmlTableAttributes',
                    // Figure, thead and tbody elements don't have model counterparts.
                    // We will be preserving attributes on table element using these attribute keys.
                    'htmlFigureAttributes', 'htmlTheadAttributes', 'htmlTbodyAttributes'
                ]
            });
            conversion.for('upcast').add(viewToModelTableAttributeConverter(dataFilter));
            conversion.for('downcast').add(modelToViewTableAttributeConverter());
            editor.model.document.registerPostFixer(createHeadingRowsPostFixer(editor.model, tableUtils));
            evt.stop();
        });
    }
}
/**
 * Creates a model post-fixer for thead and tbody GHS related attributes.
 */
function createHeadingRowsPostFixer(model, tableUtils) {
    return writer => {
        const changes = model.document.differ.getChanges();
        let wasFixed = false;
        for (const change of changes) {
            if (change.type != 'attribute' || change.attributeKey != 'headingRows') {
                continue;
            }
            const table = change.range.start.nodeAfter;
            const hasTHeadAttributes = table.getAttribute('htmlTheadAttributes');
            const hasTBodyAttributes = table.getAttribute('htmlTbodyAttributes');
            if (hasTHeadAttributes && !change.attributeNewValue) {
                writer.removeAttribute('htmlTheadAttributes', table);
                wasFixed = true;
            }
            else if (hasTBodyAttributes && change.attributeNewValue == tableUtils.getRows(table)) {
                writer.removeAttribute('htmlTbodyAttributes', table);
                wasFixed = true;
            }
        }
        return wasFixed;
    };
}
/**
 * View-to-model conversion helper preserving allowed attributes on {@link module:table/table~Table Table}
 * feature model element.
 *
 * @returns Returns a conversion callback.
 */
function viewToModelTableAttributeConverter(dataFilter) {
    return (dispatcher) => {
        dispatcher.on('element:table', (evt, data, conversionApi) => {
            if (!data.modelRange) {
                return;
            }
            const viewTableElement = data.viewItem;
            preserveElementAttributes(viewTableElement, 'htmlTableAttributes');
            for (const childNode of viewTableElement.getChildren()) {
                if (childNode.is('element', 'thead')) {
                    preserveElementAttributes(childNode, 'htmlTheadAttributes');
                }
                if (childNode.is('element', 'tbody')) {
                    preserveElementAttributes(childNode, 'htmlTbodyAttributes');
                }
            }
            function preserveElementAttributes(viewElement, attributeName) {
                const viewAttributes = dataFilter.processViewAttributes(viewElement, conversionApi);
                if (viewAttributes) {
                    conversionApi.writer.setAttribute(attributeName, viewAttributes, data.modelRange);
                }
            }
        }, { priority: 'low' });
    };
}
/**
 * View-to-model conversion helper preserving allowed attributes on {@link module:table/table~Table Table}
 * feature model element from figure view element.
 *
 * @returns Returns a conversion callback.
 */
function viewToModelFigureAttributeConverter(dataFilter) {
    return (dispatcher) => {
        dispatcher.on('element:figure', (evt, data, conversionApi) => {
            const viewFigureElement = data.viewItem;
            if (!data.modelRange || !viewFigureElement.hasClass('table')) {
                return;
            }
            const viewAttributes = dataFilter.processViewAttributes(viewFigureElement, conversionApi);
            if (viewAttributes) {
                conversionApi.writer.setAttribute('htmlFigureAttributes', viewAttributes, data.modelRange);
            }
        }, { priority: 'low' });
    };
}
/**
 * Model-to-view conversion helper applying attributes from {@link module:table/table~Table Table}
 * feature.
 *
 * @returns Returns a conversion callback.
 */
function modelToViewTableAttributeConverter() {
    return (dispatcher) => {
        addAttributeConversionDispatcherHandler('table', 'htmlTableAttributes');
        addAttributeConversionDispatcherHandler('figure', 'htmlFigureAttributes');
        addAttributeConversionDispatcherHandler('thead', 'htmlTheadAttributes');
        addAttributeConversionDispatcherHandler('tbody', 'htmlTbodyAttributes');
        function addAttributeConversionDispatcherHandler(elementName, attributeName) {
            dispatcher.on(`attribute:${attributeName}:table`, (evt, data, conversionApi) => {
                if (!conversionApi.consumable.test(data.item, evt.name)) {
                    return;
                }
                const containerElement = conversionApi.mapper.toViewElement(data.item);
                const viewElement = getDescendantElement(conversionApi.writer, containerElement, elementName);
                if (!viewElement) {
                    return;
                }
                conversionApi.consumable.consume(data.item, evt.name);
                updateViewAttributes(conversionApi.writer, data.attributeOldValue, data.attributeNewValue, viewElement);
            });
        }
    };
}
