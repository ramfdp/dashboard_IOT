/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-embed/htmlembedediting
 */
import { Plugin, icons } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';
import { toWidget } from 'ckeditor5/src/widget.js';
import { logWarning, createElement } from 'ckeditor5/src/utils.js';
import HtmlEmbedCommand from './htmlembedcommand.js';
import '../theme/htmlembed.css';
/**
 * The HTML embed editing feature.
 */
export default class HtmlEmbedEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'HtmlEmbedEditing';
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
        /**
         * Keeps references to {@link module:ui/button/buttonview~ButtonView edit, save, and cancel} button instances created for
         * each widget so they can be destroyed if they are no longer in DOM after the editing view was re-rendered.
         */
        this._widgetButtonViewReferences = new Set();
        editor.config.define('htmlEmbed', {
            showPreviews: false,
            sanitizeHtml: rawHtml => {
                /**
                 * When using the HTML embed feature with the `config.htmlEmbed.showPreviews` set to `true`, it is strongly recommended to
                 * define a sanitize function that will clean up the input HTML in order to avoid XSS vulnerability.
                 *
                 * For a detailed overview, check the {@glink features/html/html-embed HTML embed feature} documentation.
                 *
                 * @error html-embed-provide-sanitize-function
                 */
                logWarning('html-embed-provide-sanitize-function');
                return {
                    html: rawHtml,
                    hasChanged: false
                };
            }
        });
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        schema.register('rawHtml', {
            inheritAllFrom: '$blockObject',
            allowAttributes: ['value']
        });
        editor.commands.add('htmlEmbed', new HtmlEmbedCommand(editor));
        this._setupConversion();
    }
    /**
     * Prepares converters for the feature.
     */
    _setupConversion() {
        const editor = this.editor;
        const t = editor.t;
        const view = editor.editing.view;
        const widgetButtonViewReferences = this._widgetButtonViewReferences;
        const htmlEmbedConfig = editor.config.get('htmlEmbed');
        // Destroy UI buttons created for widgets that have been removed from the view document (e.g. in the previous conversion).
        // This prevents unexpected memory leaks from UI views.
        this.editor.editing.view.on('render', () => {
            for (const buttonView of widgetButtonViewReferences) {
                if (buttonView.element && buttonView.element.isConnected) {
                    return;
                }
                buttonView.destroy();
                widgetButtonViewReferences.delete(buttonView);
            }
        }, { priority: 'lowest' });
        // Register div.raw-html-embed as a raw content element so all of it's content will be provided
        // as a view element's custom property while data upcasting.
        editor.data.registerRawContentMatcher({
            name: 'div',
            classes: 'raw-html-embed'
        });
        editor.conversion.for('upcast').elementToElement({
            view: {
                name: 'div',
                classes: 'raw-html-embed'
            },
            model: (viewElement, { writer }) => {
                // The div.raw-html-embed is registered as a raw content element,
                // so all it's content is available in a custom property.
                return writer.createElement('rawHtml', {
                    value: viewElement.getCustomProperty('$rawContent')
                });
            }
        });
        editor.conversion.for('dataDowncast').elementToElement({
            model: 'rawHtml',
            view: (modelElement, { writer }) => {
                return writer.createRawElement('div', { class: 'raw-html-embed' }, function (domElement) {
                    domElement.innerHTML = modelElement.getAttribute('value') || '';
                });
            }
        });
        editor.conversion.for('editingDowncast').elementToStructure({
            model: { name: 'rawHtml', attributes: ['value'] },
            view: (modelElement, { writer }) => {
                let domContentWrapper;
                let state;
                let props;
                const viewContentWrapper = writer.createRawElement('div', {
                    class: 'raw-html-embed__content-wrapper'
                }, function (domElement) {
                    domContentWrapper = domElement;
                    renderContent({ editor, domElement, state, props });
                    // Since there is a `data-cke-ignore-events` attribute set on the wrapper element in the editable mode,
                    // the explicit `mousedown` handler on the `capture` phase is needed to move the selection onto the whole
                    // HTML embed widget.
                    domContentWrapper.addEventListener('mousedown', () => {
                        if (state.isEditable) {
                            const model = editor.model;
                            const selectedElement = model.document.selection.getSelectedElement();
                            // Move the selection onto the whole HTML embed widget if it's currently not selected.
                            if (selectedElement !== modelElement) {
                                model.change(writer => writer.setSelection(modelElement, 'on'));
                            }
                        }
                    }, true);
                });
                // API exposed on each raw HTML embed widget so other features can control a particular widget.
                const rawHtmlApi = {
                    makeEditable() {
                        state = Object.assign({}, state, {
                            isEditable: true
                        });
                        renderContent({ domElement: domContentWrapper, editor, state, props });
                        view.change(writer => {
                            writer.setAttribute('data-cke-ignore-events', 'true', viewContentWrapper);
                        });
                        // This could be potentially pulled to a separate method called focusTextarea().
                        domContentWrapper.querySelector('textarea').focus();
                    },
                    save(newValue) {
                        // If the value didn't change, we just cancel. If it changed,
                        // it's enough to update the model – the entire widget will be reconverted.
                        if (newValue !== state.getRawHtmlValue()) {
                            editor.execute('htmlEmbed', newValue);
                            editor.editing.view.focus();
                        }
                        else {
                            this.cancel();
                        }
                    },
                    cancel() {
                        state = Object.assign({}, state, {
                            isEditable: false
                        });
                        renderContent({ domElement: domContentWrapper, editor, state, props });
                        editor.editing.view.focus();
                        view.change(writer => {
                            writer.removeAttribute('data-cke-ignore-events', viewContentWrapper);
                        });
                    }
                };
                state = {
                    showPreviews: htmlEmbedConfig.showPreviews,
                    isEditable: false,
                    getRawHtmlValue: () => modelElement.getAttribute('value') || ''
                };
                props = {
                    sanitizeHtml: htmlEmbedConfig.sanitizeHtml,
                    textareaPlaceholder: t('Paste raw HTML here...'),
                    onEditClick() {
                        rawHtmlApi.makeEditable();
                    },
                    onSaveClick(newValue) {
                        rawHtmlApi.save(newValue);
                    },
                    onCancelClick() {
                        rawHtmlApi.cancel();
                    }
                };
                const viewContainer = writer.createContainerElement('div', {
                    class: 'raw-html-embed',
                    'data-html-embed-label': t('HTML snippet'),
                    dir: editor.locale.uiLanguageDirection
                }, viewContentWrapper);
                writer.setCustomProperty('rawHtmlApi', rawHtmlApi, viewContainer);
                writer.setCustomProperty('rawHtml', true, viewContainer);
                return toWidget(viewContainer, writer, {
                    label: t('HTML snippet'),
                    hasSelectionHandle: true
                });
            }
        });
        function renderContent({ editor, domElement, state, props }) {
            // Remove all children;
            domElement.textContent = '';
            const domDocument = domElement.ownerDocument;
            let domTextarea;
            if (state.isEditable) {
                const textareaProps = {
                    isDisabled: false,
                    placeholder: props.textareaPlaceholder
                };
                domTextarea = createDomTextarea({ domDocument, state, props: textareaProps });
                domElement.append(domTextarea);
            }
            else if (state.showPreviews) {
                const previewContainerProps = {
                    sanitizeHtml: props.sanitizeHtml
                };
                domElement.append(createPreviewContainer({ domDocument, state, props: previewContainerProps, editor }));
            }
            else {
                const textareaProps = {
                    isDisabled: true,
                    placeholder: props.textareaPlaceholder
                };
                domElement.append(createDomTextarea({ domDocument, state, props: textareaProps }));
            }
            const buttonsWrapperProps = {
                onEditClick: props.onEditClick,
                onSaveClick: () => {
                    props.onSaveClick(domTextarea.value);
                },
                onCancelClick: props.onCancelClick
            };
            domElement.prepend(createDomButtonsWrapper({ editor, domDocument, state, props: buttonsWrapperProps }));
        }
        function createDomButtonsWrapper({ editor, domDocument, state, props }) {
            const domButtonsWrapper = createElement(domDocument, 'div', {
                class: 'raw-html-embed__buttons-wrapper'
            });
            if (state.isEditable) {
                const saveButtonView = createUIButton(editor, 'save', props.onSaveClick);
                const cancelButtonView = createUIButton(editor, 'cancel', props.onCancelClick);
                domButtonsWrapper.append(saveButtonView.element, cancelButtonView.element);
                widgetButtonViewReferences.add(saveButtonView).add(cancelButtonView);
            }
            else {
                const editButtonView = createUIButton(editor, 'edit', props.onEditClick);
                domButtonsWrapper.append(editButtonView.element);
                widgetButtonViewReferences.add(editButtonView);
            }
            return domButtonsWrapper;
        }
        function createDomTextarea({ domDocument, state, props }) {
            const domTextarea = createElement(domDocument, 'textarea', {
                placeholder: props.placeholder,
                class: 'ck ck-reset ck-input ck-input-text raw-html-embed__source'
            });
            domTextarea.disabled = props.isDisabled;
            domTextarea.value = state.getRawHtmlValue();
            return domTextarea;
        }
        function createPreviewContainer({ editor, domDocument, state, props }) {
            const sanitizedOutput = props.sanitizeHtml(state.getRawHtmlValue());
            const placeholderText = state.getRawHtmlValue().length > 0 ?
                t('No preview available') :
                t('Empty snippet content');
            const domPreviewPlaceholder = createElement(domDocument, 'div', {
                class: 'ck ck-reset_all raw-html-embed__preview-placeholder'
            }, placeholderText);
            const domPreviewContent = createElement(domDocument, 'div', {
                class: 'raw-html-embed__preview-content',
                dir: editor.locale.contentLanguageDirection
            });
            // Creating a contextual document fragment allows executing scripts when inserting into the preview element.
            // See: #8326.
            const domRange = domDocument.createRange();
            const domDocumentFragment = domRange.createContextualFragment(sanitizedOutput.html);
            domPreviewContent.appendChild(domDocumentFragment);
            const domPreviewContainer = createElement(domDocument, 'div', {
                class: 'raw-html-embed__preview'
            }, [
                domPreviewPlaceholder, domPreviewContent
            ]);
            return domPreviewContainer;
        }
    }
}
/**
 * Returns a UI button view that can be used in conversion.
 */
function createUIButton(editor, type, onClick) {
    const { t } = editor.locale;
    const buttonView = new ButtonView(editor.locale);
    const command = editor.commands.get('htmlEmbed');
    buttonView.set({
        class: `raw-html-embed__${type}-button`,
        icon: icons.pencil,
        tooltip: true,
        tooltipPosition: editor.locale.uiLanguageDirection === 'rtl' ? 'e' : 'w'
    });
    buttonView.render();
    if (type === 'edit') {
        buttonView.set({
            icon: icons.pencil,
            label: t('Edit source')
        });
        buttonView.bind('isEnabled').to(command);
    }
    else if (type === 'save') {
        buttonView.set({
            icon: icons.check,
            label: t('Save changes')
        });
        buttonView.bind('isEnabled').to(command);
    }
    else {
        buttonView.set({
            icon: icons.cancel,
            label: t('Cancel')
        });
    }
    buttonView.on('execute', onClick);
    return buttonView;
}
