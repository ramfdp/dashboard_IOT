/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module link/linkui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ClickObserver } from 'ckeditor5/src/engine.js';
import { ButtonView, ContextualBalloon, clickOutsideHandler, CssTransitionDisablerMixin, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { isWidget } from 'ckeditor5/src/widget.js';
import LinkFormView from './ui/linkformview.js';
import LinkActionsView from './ui/linkactionsview.js';
import { addLinkProtocolIfApplicable, isLinkElement, createBookmarkCallbacks, LINK_KEYSTROKE } from './utils.js';
import linkIcon from '../theme/icons/link.svg';
const VISUAL_SELECTION_MARKER_NAME = 'link-ui';
/**
 * The link UI plugin. It introduces the `'link'` and `'unlink'` buttons and support for the <kbd>Ctrl+K</kbd> keystroke.
 *
 * It uses the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */
export default class LinkUI extends Plugin {
    constructor() {
        super(...arguments);
        /**
         * The actions view displayed inside of the balloon.
         */
        this.actionsView = null;
        /**
         * The form view displayed inside the balloon.
         */
        this.formView = null;
    }
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
        return 'LinkUI';
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
        const t = this.editor.t;
        editor.editing.view.addObserver(ClickObserver);
        this._balloon = editor.plugins.get(ContextualBalloon);
        // Create toolbar buttons.
        this._createToolbarLinkButton();
        this._enableBalloonActivators();
        // Renders a fake visual selection marker on an expanded selection.
        editor.conversion.for('editingDowncast').markerToHighlight({
            model: VISUAL_SELECTION_MARKER_NAME,
            view: {
                classes: ['ck-fake-link-selection']
            }
        });
        // Renders a fake visual selection marker on a collapsed selection.
        editor.conversion.for('editingDowncast').markerToElement({
            model: VISUAL_SELECTION_MARKER_NAME,
            view: (data, { writer }) => {
                if (!data.markerRange.isCollapsed) {
                    return null;
                }
                const markerElement = writer.createUIElement('span');
                writer.addClass(['ck-fake-link-selection', 'ck-fake-link-selection_collapsed'], markerElement);
                return markerElement;
            }
        });
        // Add the information about the keystrokes to the accessibility database.
        editor.accessibility.addKeystrokeInfos({
            keystrokes: [
                {
                    label: t('Create link'),
                    keystroke: LINK_KEYSTROKE
                },
                {
                    label: t('Move out of a link'),
                    keystroke: [
                        ['arrowleft', 'arrowleft'],
                        ['arrowright', 'arrowright']
                    ]
                }
            ]
        });
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        // Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
        if (this.formView) {
            this.formView.destroy();
        }
        if (this.actionsView) {
            this.actionsView.destroy();
        }
    }
    /**
     * Creates views.
     */
    _createViews() {
        this.actionsView = this._createActionsView();
        this.formView = this._createFormView();
        // Attach lifecycle actions to the the balloon.
        this._enableUserBalloonInteractions();
    }
    /**
     * Creates the {@link module:link/ui/linkactionsview~LinkActionsView} instance.
     */
    _createActionsView() {
        const editor = this.editor;
        const actionsView = new LinkActionsView(editor.locale, editor.config.get('link'), createBookmarkCallbacks(editor));
        const linkCommand = editor.commands.get('link');
        const unlinkCommand = editor.commands.get('unlink');
        actionsView.bind('href').to(linkCommand, 'value');
        actionsView.editButtonView.bind('isEnabled').to(linkCommand);
        actionsView.unlinkButtonView.bind('isEnabled').to(unlinkCommand);
        // Execute unlink command after clicking on the "Edit" button.
        this.listenTo(actionsView, 'edit', () => {
            this._addFormView();
        });
        // Execute unlink command after clicking on the "Unlink" button.
        this.listenTo(actionsView, 'unlink', () => {
            editor.execute('unlink');
            this._hideUI();
        });
        // Close the panel on esc key press when the **actions have focus**.
        actionsView.keystrokes.set('Esc', (data, cancel) => {
            this._hideUI();
            cancel();
        });
        // Open the form view on Ctrl+K when the **actions have focus**..
        actionsView.keystrokes.set(LINK_KEYSTROKE, (data, cancel) => {
            this._addFormView();
            cancel();
        });
        return actionsView;
    }
    /**
     * Creates the {@link module:link/ui/linkformview~LinkFormView} instance.
     */
    _createFormView() {
        const editor = this.editor;
        const linkCommand = editor.commands.get('link');
        const defaultProtocol = editor.config.get('link.defaultProtocol');
        const formView = new (CssTransitionDisablerMixin(LinkFormView))(editor.locale, linkCommand, getFormValidators(editor));
        formView.urlInputView.fieldView.bind('value').to(linkCommand, 'value');
        // Form elements should be read-only when corresponding commands are disabled.
        formView.urlInputView.bind('isEnabled').to(linkCommand, 'isEnabled');
        // Disable the "save" button if the command is disabled.
        formView.saveButtonView.bind('isEnabled').to(linkCommand, 'isEnabled');
        // Execute link command after clicking the "Save" button.
        this.listenTo(formView, 'submit', () => {
            if (formView.isValid()) {
                const { value } = formView.urlInputView.fieldView.element;
                const parsedUrl = addLinkProtocolIfApplicable(value, defaultProtocol);
                editor.execute('link', parsedUrl, formView.getDecoratorSwitchesState());
                this._closeFormView();
            }
        });
        // Update balloon position when form error changes.
        this.listenTo(formView.urlInputView, 'change:errorText', () => {
            editor.ui.update();
        });
        // Hide the panel after clicking the "Cancel" button.
        this.listenTo(formView, 'cancel', () => {
            this._closeFormView();
        });
        // Close the panel on esc key press when the **form has focus**.
        formView.keystrokes.set('Esc', (data, cancel) => {
            this._closeFormView();
            cancel();
        });
        return formView;
    }
    /**
     * Creates a toolbar Link button. Clicking this button will show
     * a {@link #_balloon} attached to the selection.
     */
    _createToolbarLinkButton() {
        const editor = this.editor;
        editor.ui.componentFactory.add('link', () => {
            const button = this._createButton(ButtonView);
            button.set({
                tooltip: true
            });
            return button;
        });
        editor.ui.componentFactory.add('menuBar:link', () => {
            const button = this._createButton(MenuBarMenuListItemButtonView);
            button.set({
                role: 'menuitemcheckbox'
            });
            return button;
        });
    }
    /**
     * Creates a button for link command to use either in toolbar or in menu bar.
     */
    _createButton(ButtonClass) {
        const editor = this.editor;
        const locale = editor.locale;
        const command = editor.commands.get('link');
        const view = new ButtonClass(editor.locale);
        const t = locale.t;
        view.set({
            label: t('Link'),
            icon: linkIcon,
            keystroke: LINK_KEYSTROKE,
            isToggleable: true
        });
        view.bind('isEnabled').to(command, 'isEnabled');
        view.bind('isOn').to(command, 'value', value => !!value);
        // Show the panel on button click.
        this.listenTo(view, 'execute', () => this._showUI(true));
        return view;
    }
    /**
     * Attaches actions that control whether the balloon panel containing the
     * {@link #formView} should be displayed.
     */
    _enableBalloonActivators() {
        const editor = this.editor;
        const viewDocument = editor.editing.view.document;
        // Handle click on view document and show panel when selection is placed inside the link element.
        // Keep panel open until selection will be inside the same link element.
        this.listenTo(viewDocument, 'click', () => {
            const parentLink = this._getSelectedLinkElement();
            if (parentLink) {
                // Then show panel but keep focus inside editor editable.
                this._showUI();
            }
        });
        // Handle the `Ctrl+K` keystroke and show the panel.
        editor.keystrokes.set(LINK_KEYSTROKE, (keyEvtData, cancel) => {
            // Prevent focusing the search bar in FF, Chrome and Edge. See https://github.com/ckeditor/ckeditor5/issues/4811.
            cancel();
            if (editor.commands.get('link').isEnabled) {
                this._showUI(true);
            }
        });
    }
    /**
     * Attaches actions that control whether the balloon panel containing the
     * {@link #formView} is visible or not.
     */
    _enableUserBalloonInteractions() {
        // Focus the form if the balloon is visible and the Tab key has been pressed.
        this.editor.keystrokes.set('Tab', (data, cancel) => {
            if (this._areActionsVisible && !this.actionsView.focusTracker.isFocused) {
                this.actionsView.focus();
                cancel();
            }
        }, {
            // Use the high priority because the link UI navigation is more important
            // than other feature's actions, e.g. list indentation.
            // https://github.com/ckeditor/ckeditor5-link/issues/146
            priority: 'high'
        });
        // Close the panel on the Esc key press when the editable has focus and the balloon is visible.
        this.editor.keystrokes.set('Esc', (data, cancel) => {
            if (this._isUIVisible) {
                this._hideUI();
                cancel();
            }
        });
        // Close on click outside of balloon panel element.
        clickOutsideHandler({
            emitter: this.formView,
            activator: () => this._isUIInPanel,
            contextElements: () => [this._balloon.view.element],
            callback: () => this._hideUI()
        });
    }
    /**
     * Adds the {@link #actionsView} to the {@link #_balloon}.
     *
     * @internal
     */
    _addActionsView() {
        if (!this.actionsView) {
            this._createViews();
        }
        if (this._areActionsInPanel) {
            return;
        }
        this._balloon.add({
            view: this.actionsView,
            position: this._getBalloonPositionData()
        });
    }
    /**
     * Adds the {@link #formView} to the {@link #_balloon}.
     */
    _addFormView() {
        if (!this.formView) {
            this._createViews();
        }
        if (this._isFormInPanel) {
            return;
        }
        const editor = this.editor;
        const linkCommand = editor.commands.get('link');
        this.formView.disableCssTransitions();
        this.formView.resetFormStatus();
        this._balloon.add({
            view: this.formView,
            position: this._getBalloonPositionData()
        });
        // Make sure that each time the panel shows up, the URL field remains in sync with the value of
        // the command. If the user typed in the input, then canceled the balloon (`urlInputView.fieldView#value` stays
        // unaltered) and re-opened it without changing the value of the link command (e.g. because they
        // clicked the same link), they would see the old value instead of the actual value of the command.
        // https://github.com/ckeditor/ckeditor5-link/issues/78
        // https://github.com/ckeditor/ckeditor5-link/issues/123
        this.formView.urlInputView.fieldView.value = linkCommand.value || '';
        // Select input when form view is currently visible.
        if (this._balloon.visibleView === this.formView) {
            this.formView.urlInputView.fieldView.select();
        }
        this.formView.enableCssTransitions();
    }
    /**
     * Closes the form view. Decides whether the balloon should be hidden completely or if the action view should be shown. This is
     * decided upon the link command value (which has a value if the document selection is in the link).
     *
     * Additionally, if any {@link module:link/linkconfig~LinkConfig#decorators} are defined in the editor configuration, the state of
     * switch buttons responsible for manual decorator handling is restored.
     */
    _closeFormView() {
        const linkCommand = this.editor.commands.get('link');
        // Restore manual decorator states to represent the current model state. This case is important to reset the switch buttons
        // when the user cancels the editing form.
        linkCommand.restoreManualDecoratorStates();
        if (linkCommand.value !== undefined) {
            this._removeFormView();
        }
        else {
            this._hideUI();
        }
    }
    /**
     * Removes the {@link #formView} from the {@link #_balloon}.
     */
    _removeFormView() {
        if (this._isFormInPanel) {
            // Blur the input element before removing it from DOM to prevent issues in some browsers.
            // See https://github.com/ckeditor/ckeditor5/issues/1501.
            this.formView.saveButtonView.focus();
            // Reset the URL field to update the state of the submit button.
            this.formView.urlInputView.fieldView.reset();
            this._balloon.remove(this.formView);
            // Because the form has an input which has focus, the focus must be brought back
            // to the editor. Otherwise, it would be lost.
            this.editor.editing.view.focus();
            this._hideFakeVisualSelection();
        }
    }
    /**
     * Shows the correct UI type. It is either {@link #formView} or {@link #actionsView}.
     *
     * @internal
     */
    _showUI(forceVisible = false) {
        if (!this.formView) {
            this._createViews();
        }
        // When there's no link under the selection, go straight to the editing UI.
        if (!this._getSelectedLinkElement()) {
            // Show visual selection on a text without a link when the contextual balloon is displayed.
            // See https://github.com/ckeditor/ckeditor5/issues/4721.
            this._showFakeVisualSelection();
            this._addActionsView();
            // Be sure panel with link is visible.
            if (forceVisible) {
                this._balloon.showStack('main');
            }
            this._addFormView();
        }
        // If there's a link under the selection...
        else {
            // Go to the editing UI if actions are already visible.
            if (this._areActionsVisible) {
                this._addFormView();
            }
            // Otherwise display just the actions UI.
            else {
                this._addActionsView();
            }
            // Be sure panel with link is visible.
            if (forceVisible) {
                this._balloon.showStack('main');
            }
        }
        // Begin responding to ui#update once the UI is added.
        this._startUpdatingUI();
    }
    /**
     * Removes the {@link #formView} from the {@link #_balloon}.
     *
     * See {@link #_addFormView}, {@link #_addActionsView}.
     */
    _hideUI() {
        if (!this._isUIInPanel) {
            return;
        }
        const editor = this.editor;
        this.stopListening(editor.ui, 'update');
        this.stopListening(this._balloon, 'change:visibleView');
        // Make sure the focus always gets back to the editable _before_ removing the focused form view.
        // Doing otherwise causes issues in some browsers. See https://github.com/ckeditor/ckeditor5-link/issues/193.
        editor.editing.view.focus();
        // Remove form first because it's on top of the stack.
        this._removeFormView();
        // Then remove the actions view because it's beneath the form.
        this._balloon.remove(this.actionsView);
        this._hideFakeVisualSelection();
    }
    /**
     * Makes the UI react to the {@link module:ui/editorui/editorui~EditorUI#event:update} event to
     * reposition itself when the editor UI should be refreshed.
     *
     * See: {@link #_hideUI} to learn when the UI stops reacting to the `update` event.
     */
    _startUpdatingUI() {
        const editor = this.editor;
        const viewDocument = editor.editing.view.document;
        let prevSelectedLink = this._getSelectedLinkElement();
        let prevSelectionParent = getSelectionParent();
        const update = () => {
            const selectedLink = this._getSelectedLinkElement();
            const selectionParent = getSelectionParent();
            // Hide the panel if:
            //
            // * the selection went out of the EXISTING link element. E.g. user moved the caret out
            //   of the link,
            // * the selection went to a different parent when creating a NEW link. E.g. someone
            //   else modified the document.
            // * the selection has expanded (e.g. displaying link actions then pressing SHIFT+Right arrow).
            //
            // Note: #_getSelectedLinkElement will return a link for a non-collapsed selection only
            // when fully selected.
            if ((prevSelectedLink && !selectedLink) ||
                (!prevSelectedLink && selectionParent !== prevSelectionParent)) {
                this._hideUI();
            }
            // Update the position of the panel when:
            //  * link panel is in the visible stack
            //  * the selection remains in the original link element,
            //  * there was no link element in the first place, i.e. creating a new link
            else if (this._isUIVisible) {
                // If still in a link element, simply update the position of the balloon.
                // If there was no link (e.g. inserting one), the balloon must be moved
                // to the new position in the editing view (a new native DOM range).
                this._balloon.updatePosition(this._getBalloonPositionData());
            }
            prevSelectedLink = selectedLink;
            prevSelectionParent = selectionParent;
        };
        function getSelectionParent() {
            return viewDocument.selection.focus.getAncestors()
                .reverse()
                .find((node) => node.is('element'));
        }
        this.listenTo(editor.ui, 'update', update);
        this.listenTo(this._balloon, 'change:visibleView', update);
    }
    /**
     * Returns `true` when {@link #formView} is in the {@link #_balloon}.
     */
    get _isFormInPanel() {
        return !!this.formView && this._balloon.hasView(this.formView);
    }
    /**
     * Returns `true` when {@link #actionsView} is in the {@link #_balloon}.
     */
    get _areActionsInPanel() {
        return !!this.actionsView && this._balloon.hasView(this.actionsView);
    }
    /**
     * Returns `true` when {@link #actionsView} is in the {@link #_balloon} and it is
     * currently visible.
     */
    get _areActionsVisible() {
        return !!this.actionsView && this._balloon.visibleView === this.actionsView;
    }
    /**
     * Returns `true` when {@link #actionsView} or {@link #formView} is in the {@link #_balloon}.
     */
    get _isUIInPanel() {
        return this._isFormInPanel || this._areActionsInPanel;
    }
    /**
     * Returns `true` when {@link #actionsView} or {@link #formView} is in the {@link #_balloon} and it is
     * currently visible.
     */
    get _isUIVisible() {
        const visibleView = this._balloon.visibleView;
        return !!this.formView && visibleView == this.formView || this._areActionsVisible;
    }
    /**
     * Returns positioning options for the {@link #_balloon}. They control the way the balloon is attached
     * to the target element or selection.
     *
     * If the selection is collapsed and inside a link element, the panel will be attached to the
     * entire link element. Otherwise, it will be attached to the selection.
     */
    _getBalloonPositionData() {
        const view = this.editor.editing.view;
        const model = this.editor.model;
        const viewDocument = view.document;
        let target;
        if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
            // There are cases when we highlight selection using a marker (#7705, #4721).
            const markerViewElements = Array.from(this.editor.editing.mapper.markerNameToElements(VISUAL_SELECTION_MARKER_NAME));
            const newRange = view.createRange(view.createPositionBefore(markerViewElements[0]), view.createPositionAfter(markerViewElements[markerViewElements.length - 1]));
            target = view.domConverter.viewRangeToDom(newRange);
        }
        else {
            // Make sure the target is calculated on demand at the last moment because a cached DOM range
            // (which is very fragile) can desynchronize with the state of the editing view if there was
            // any rendering done in the meantime. This can happen, for instance, when an inline widget
            // gets unlinked.
            target = () => {
                const targetLink = this._getSelectedLinkElement();
                return targetLink ?
                    // When selection is inside link element, then attach panel to this element.
                    view.domConverter.mapViewToDom(targetLink) :
                    // Otherwise attach panel to the selection.
                    view.domConverter.viewRangeToDom(viewDocument.selection.getFirstRange());
            };
        }
        return { target };
    }
    /**
     * Returns the link {@link module:engine/view/attributeelement~AttributeElement} under
     * the {@link module:engine/view/document~Document editing view's} selection or `null`
     * if there is none.
     *
     * **Note**: For a non–collapsed selection, the link element is returned when **fully**
     * selected and the **only** element within the selection boundaries, or when
     * a linked widget is selected.
     */
    _getSelectedLinkElement() {
        const view = this.editor.editing.view;
        const selection = view.document.selection;
        const selectedElement = selection.getSelectedElement();
        // The selection is collapsed or some widget is selected (especially inline widget).
        if (selection.isCollapsed || selectedElement && isWidget(selectedElement)) {
            return findLinkElementAncestor(selection.getFirstPosition());
        }
        else {
            // The range for fully selected link is usually anchored in adjacent text nodes.
            // Trim it to get closer to the actual link element.
            const range = selection.getFirstRange().getTrimmed();
            const startLink = findLinkElementAncestor(range.start);
            const endLink = findLinkElementAncestor(range.end);
            if (!startLink || startLink != endLink) {
                return null;
            }
            // Check if the link element is fully selected.
            if (view.createRangeIn(startLink).getTrimmed().isEqual(range)) {
                return startLink;
            }
            else {
                return null;
            }
        }
    }
    /**
     * Displays a fake visual selection when the contextual balloon is displayed.
     *
     * This adds a 'link-ui' marker into the document that is rendered as a highlight on selected text fragment.
     */
    _showFakeVisualSelection() {
        const model = this.editor.model;
        model.change(writer => {
            const range = model.document.selection.getFirstRange();
            if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
                writer.updateMarker(VISUAL_SELECTION_MARKER_NAME, { range });
            }
            else {
                if (range.start.isAtEnd) {
                    const startPosition = range.start.getLastMatchingPosition(({ item }) => !model.schema.isContent(item), { boundaries: range });
                    writer.addMarker(VISUAL_SELECTION_MARKER_NAME, {
                        usingOperation: false,
                        affectsData: false,
                        range: writer.createRange(startPosition, range.end)
                    });
                }
                else {
                    writer.addMarker(VISUAL_SELECTION_MARKER_NAME, {
                        usingOperation: false,
                        affectsData: false,
                        range
                    });
                }
            }
        });
    }
    /**
     * Hides the fake visual selection created in {@link #_showFakeVisualSelection}.
     */
    _hideFakeVisualSelection() {
        const model = this.editor.model;
        if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
            model.change(writer => {
                writer.removeMarker(VISUAL_SELECTION_MARKER_NAME);
            });
        }
    }
}
/**
 * Returns a link element if there's one among the ancestors of the provided `Position`.
 *
 * @param View position to analyze.
 * @returns Link element at the position or null.
 */
function findLinkElementAncestor(position) {
    return position.getAncestors().find((ancestor) => isLinkElement(ancestor)) || null;
}
/**
 * Returns link form validation callbacks.
 *
 * @param editor Editor instance.
 */
function getFormValidators(editor) {
    const t = editor.t;
    const allowCreatingEmptyLinks = editor.config.get('link.allowCreatingEmptyLinks');
    return [
        form => {
            if (!allowCreatingEmptyLinks && !form.url.length) {
                return t('Link URL must not be empty.');
            }
        }
    ];
}
