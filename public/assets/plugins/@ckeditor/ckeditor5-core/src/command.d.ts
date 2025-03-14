/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module core/command
 */
import { type DecoratedMethodEvent } from '@ckeditor/ckeditor5-utils';
import type Editor from './editor/editor.js';
declare const Command_base: {
    new (): import("@ckeditor/ckeditor5-utils").Observable;
    prototype: import("@ckeditor/ckeditor5-utils").Observable;
};
/**
 * Base class for the CKEditor commands.
 *
 * Commands are the main way to manipulate the editor contents and state. They are mostly used by UI elements (or by other
 * commands) to make changes in the model. Commands are available in every part of the code that has access to
 * the {@link module:core/editor/editor~Editor editor} instance.
 *
 * Instances of registered commands can be retrieved from {@link module:core/editor/editor~Editor#commands `editor.commands`}.
 * The easiest way to execute a command is through {@link module:core/editor/editor~Editor#execute `editor.execute()`}.
 *
 * By default, commands are disabled when the editor is in the {@link module:core/editor/editor~Editor#isReadOnly read-only} mode
 * but commands with the {@link module:core/command~Command#affectsData `affectsData`} flag set to `false` will not be disabled.
 */
export default class Command extends /* #__PURE__ */ Command_base {
    /**
     * The editor on which this command will be used.
     */
    readonly editor: Editor;
    /**
     * The value of the command. A given command class should define what it represents for it.
     *
     * For example, the `'bold'` command's value indicates whether the selection starts in a bolded text.
     * And the value of the `'link'` command may be an object with link details.
     *
     * It is possible for a command to have no value (e.g. for stateless actions such as `'uploadImage'`).
     *
     * A given command class should control this value by overriding the {@link #refresh `refresh()`} method.
     *
     * @observable
     * @readonly
     */
    value: unknown;
    /**
     * Flag indicating whether a command is enabled or disabled.
     * A disabled command will do nothing when executed.
     *
     * A given command class should control this value by overriding the {@link #refresh `refresh()`} method.
     *
     * It is possible to disable a command "from outside" using {@link #forceDisabled} method.
     *
     * @observable
     * @readonly
     */
    isEnabled: boolean;
    /**
     * A flag indicating whether a command's `isEnabled` state should be changed depending on where the document
     * selection is placed.
     *
     * By default, it is set to `true`. If the document selection is placed in a
     * {@link module:engine/model/model~Model#canEditAt non-editable} place (such as non-editable root), the command becomes disabled.
     *
     * The flag should be changed to `false` in a concrete command's constructor if the command should not change its `isEnabled`
     * accordingly to the document selection.
     */
    protected _isEnabledBasedOnSelection: boolean;
    /**
     * A flag indicating whether a command execution changes the editor data or not.
     *
     * @see #affectsData
     */
    private _affectsData;
    /**
     * Holds identifiers for {@link #forceDisabled} mechanism.
     */
    private readonly _disableStack;
    /**
     * Creates a new `Command` instance.
     *
     * @param editor The editor on which this command will be used.
     */
    constructor(editor: Editor);
    /**
     * A flag indicating whether a command execution changes the editor data or not.
     *
     * Commands with `affectsData` set to `false` will not be automatically disabled in
     * the {@link module:core/editor/editor~Editor#isReadOnly read-only mode} and
     * {@glink features/read-only#related-features other editor modes} with restricted user write permissions.
     *
     * **Note:** You do not have to set it for your every command. It is `true` by default.
     *
     * @default true
     */
    get affectsData(): boolean;
    protected set affectsData(affectsData: boolean);
    /**
     * Refreshes the command. The command should update its {@link #isEnabled} and {@link #value} properties
     * in this method.
     *
     * This method is automatically called when
     * {@link module:engine/model/document~Document#event:change any changes are applied to the document}.
     */
    refresh(): void;
    /**
     * Disables the command.
     *
     * Command may be disabled by multiple features or algorithms (at once). When disabling a command, unique id should be passed
     * (e.g. the feature name). The same identifier should be used when {@link #clearForceDisabled enabling back} the command.
     * The command becomes enabled only after all features {@link #clearForceDisabled enabled it back}.
     *
     * Disabling and enabling a command:
     *
     * ```ts
     * command.isEnabled; // -> true
     * command.forceDisabled( 'MyFeature' );
     * command.isEnabled; // -> false
     * command.clearForceDisabled( 'MyFeature' );
     * command.isEnabled; // -> true
     * ```
     *
     * Command disabled by multiple features:
     *
     * ```ts
     * command.forceDisabled( 'MyFeature' );
     * command.forceDisabled( 'OtherFeature' );
     * command.clearForceDisabled( 'MyFeature' );
     * command.isEnabled; // -> false
     * command.clearForceDisabled( 'OtherFeature' );
     * command.isEnabled; // -> true
     * ```
     *
     * Multiple disabling with the same identifier is redundant:
     *
     * ```ts
     * command.forceDisabled( 'MyFeature' );
     * command.forceDisabled( 'MyFeature' );
     * command.clearForceDisabled( 'MyFeature' );
     * command.isEnabled; // -> true
     * ```
     *
     * **Note:** some commands or algorithms may have more complex logic when it comes to enabling or disabling certain commands,
     * so the command might be still disabled after {@link #clearForceDisabled} was used.
     *
     * @param id Unique identifier for disabling. Use the same id when {@link #clearForceDisabled enabling back} the command.
     */
    forceDisabled(id: string): void;
    /**
     * Clears forced disable previously set through {@link #forceDisabled}. See {@link #forceDisabled}.
     *
     * @param id Unique identifier, equal to the one passed in {@link #forceDisabled} call.
     */
    clearForceDisabled(id: string): void;
    /**
     * Executes the command.
     *
     * A command may accept parameters. They will be passed from {@link module:core/editor/editor~Editor#execute `editor.execute()`}
     * to the command.
     *
     * The `execute()` method will automatically abort when the command is disabled ({@link #isEnabled} is `false`).
     * This behavior is implemented by a high priority listener to the {@link #event:execute} event.
     *
     * In order to see how to disable a command from "outside" see the {@link #isEnabled} documentation.
     *
     * This method may return a value, which would be forwarded all the way down to the
     * {@link module:core/editor/editor~Editor#execute `editor.execute()`}.
     *
     * @fires execute
     */
    execute(...args: Array<unknown>): unknown;
    /**
     * Destroys the command.
     */
    destroy(): void;
}
/**
 * Event fired by the {@link module:core/command~Command#execute} method. The command action is a listener to this event so it's
 * possible to change/cancel the behavior of the command by listening to this event.
 *
 * See {@link module:utils/observablemixin~Observable#decorate} for more information and samples.
 *
 * **Note:** This event is fired even if command is disabled. However, it is automatically blocked
 * by a high priority listener in order to prevent command execution.
 *
 * @eventName ~Command#execute
 */
export type CommandExecuteEvent = DecoratedMethodEvent<Command, 'execute'>;
export {};
