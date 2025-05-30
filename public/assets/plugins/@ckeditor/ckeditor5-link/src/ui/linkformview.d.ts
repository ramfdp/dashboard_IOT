/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module link/ui/linkformview
 */
import { ButtonView, LabeledFieldView, View, ViewCollection, type InputTextView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import type LinkCommand from '../linkcommand.js';
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/linkform.css';
/**
 * The link form view controller class.
 *
 * See {@link module:link/ui/linkformview~LinkFormView}.
 */
export default class LinkFormView extends View {
    /**
     * Tracks information about DOM focus in the form.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * The URL input view.
     */
    urlInputView: LabeledFieldView<InputTextView>;
    /**
     * The Save button view.
     */
    saveButtonView: ButtonView;
    /**
     * The Cancel button view.
     */
    cancelButtonView: ButtonView;
    /**
     * A collection of {@link module:ui/button/switchbuttonview~SwitchButtonView},
     * which corresponds to {@link module:link/linkcommand~LinkCommand#manualDecorators manual decorators}
     * configured in the editor.
     */
    private readonly _manualDecoratorSwitches;
    /**
     * A collection of child views in the form.
     */
    readonly children: ViewCollection;
    /**
     * An array of form validators used by {@link #isValid}.
     */
    private readonly _validators;
    /**
     * A collection of views that can be focused in the form.
     */
    private readonly _focusables;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    private readonly _focusCycler;
    /**
     * Creates an instance of the {@link module:link/ui/linkformview~LinkFormView} class.
     *
     * Also see {@link #render}.
     *
     * @param locale The localization services instance.
     * @param linkCommand Reference to {@link module:link/linkcommand~LinkCommand}.
     * @param validators  Form validators used by {@link #isValid}.
     */
    constructor(locale: Locale, linkCommand: LinkCommand, validators: Array<LinkFormValidatorCallback>);
    /**
     * Obtains the state of the {@link module:ui/button/switchbuttonview~SwitchButtonView switch buttons} representing
     * {@link module:link/linkcommand~LinkCommand#manualDecorators manual link decorators}
     * in the {@link module:link/ui/linkformview~LinkFormView}.
     *
     * @returns Key-value pairs, where the key is the name of the decorator and the value is its state.
     */
    getDecoratorSwitchesState(): Record<string, boolean>;
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Focuses the fist {@link #_focusables} in the form.
     */
    focus(): void;
    /**
     * Validates the form and returns `false` when some fields are invalid.
     */
    isValid(): boolean;
    /**
     * Cleans up the supplementary error and information text of the {@link #urlInputView}
     * bringing them back to the state when the form has been displayed for the first time.
     *
     * See {@link #isValid}.
     */
    resetFormStatus(): void;
    /**
     * Creates a labeled input view.
     *
     * @returns Labeled field view instance.
     */
    private _createUrlInput;
    /**
     * Creates a button view.
     *
     * @param label The button label.
     * @param icon The button icon.
     * @param className The additional button CSS class name.
     * @param eventName An event name that the `ButtonView#execute` event will be delegated to.
     * @returns The button view instance.
     */
    private _createButton;
    /**
     * Populates {@link module:ui/viewcollection~ViewCollection} of {@link module:ui/button/switchbuttonview~SwitchButtonView}
     * made based on {@link module:link/linkcommand~LinkCommand#manualDecorators}.
     *
     * @param linkCommand A reference to the link command.
     * @returns ViewCollection of switch buttons.
     */
    private _createManualDecoratorSwitches;
    /**
     * Populates the {@link #children} collection of the form.
     *
     * If {@link module:link/linkcommand~LinkCommand#manualDecorators manual decorators} are configured in the editor, it creates an
     * additional `View` wrapping all {@link #_manualDecoratorSwitches} switch buttons corresponding
     * to these decorators.
     *
     * @param manualDecorators A reference to
     * the collection of manual decorators stored in the link command.
     * @returns The children of link form view.
     */
    private _createFormChildren;
    /**
     * The native DOM `value` of the {@link #urlInputView} element.
     *
     * **Note**: Do not confuse it with the {@link module:ui/inputtext/inputtextview~InputTextView#value}
     * which works one way only and may not represent the actual state of the component in the DOM.
     */
    get url(): string | null;
}
/**
 * Callback used by {@link ~LinkFormView} to check if passed form value is valid.
 *
 * 	* If `undefined` is returned, it is assumed that the form value is correct and there is no error.
 * 	* If string is returned, it is assumed that the form value is incorrect and the returned string is displayed in the error label
 */
export type LinkFormValidatorCallback = (form: LinkFormView) => string | undefined;
/**
 * Fired when the form view is submitted (when one of the children triggered the submit event),
 * for example with a click on {@link ~LinkFormView#saveButtonView}.
 *
 * @eventName ~LinkFormView#submit
 */
export type SubmitEvent = {
    name: 'submit';
    args: [];
};
/**
 * Fired when the form view is canceled, for example with a click on {@link ~LinkFormView#cancelButtonView}.
 *
 * @eventName ~LinkFormView#cancel
 */
export type CancelEvent = {
    name: 'cancel';
    args: [];
};
