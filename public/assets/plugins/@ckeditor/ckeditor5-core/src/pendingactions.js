/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module core/pendingactions
 */
import ContextPlugin from './contextplugin.js';
import { CKEditorError, Collection, ObservableMixin } from '@ckeditor/ckeditor5-utils';
/**
 * The list of pending editor actions.
 *
 * This plugin should be used to synchronise plugins that execute long-lasting actions
 * (e.g. file upload) with the editor integration. It gives the developer who integrates the editor
 * an easy way to check if there are any actions pending whenever such information is needed.
 * All plugins that register a pending action also provide a message about the action that is ongoing
 * which can be displayed to the user. This lets them decide if they want to interrupt the action or wait.
 *
 * Adding and updating a pending action:
 *
 * ```ts
 * const pendingActions = editor.plugins.get( 'PendingActions' );
 * const action = pendingActions.add( 'Upload in progress: 0%.' );
 *
 * // You can update the message:
 * action.message = 'Upload in progress: 10%.';
 * ```
 *
 * Removing a pending action:
 *
 * ```ts
 * const pendingActions = editor.plugins.get( 'PendingActions' );
 * const action = pendingActions.add( 'Unsaved changes.' );
 *
 * pendingActions.remove( action );
 * ```
 *
 * Getting pending actions:
 *
 * ```ts
 * const pendingActions = editor.plugins.get( 'PendingActions' );
 *
 * const action1 = pendingActions.add( 'Action 1' );
 * const action2 = pendingActions.add( 'Action 2' );
 *
 * pendingActions.first; // Returns action1
 * Array.from( pendingActions ); // Returns [ action1, action2 ]
 * ```
 *
 * This plugin is used by features like {@link module:upload/filerepository~FileRepository} to register their ongoing actions
 * and by features like {@link module:autosave/autosave~Autosave} to detect whether there are any ongoing actions.
 * Read more about saving the data in the
 * {@glink getting-started/setup/getting-and-setting-data Saving and getting data} guide.
 */
export default class PendingActions extends ContextPlugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'PendingActions';
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
        this.set('hasAny', false);
        this._actions = new Collection({ idProperty: '_id' });
        this._actions.delegate('add', 'remove').to(this);
    }
    /**
     * Adds an action to the list of pending actions.
     *
     * This method returns an action object with an observable message property.
     * The action object can be later used in the {@link #remove} method. It also allows you to change the message.
     *
     * @param message The action message.
     * @returns An observable object that represents a pending action.
     */
    add(message) {
        if (typeof message !== 'string') {
            /**
             * The message must be a string.
             *
             * @error pendingactions-add-invalid-message
             */
            throw new CKEditorError('pendingactions-add-invalid-message', this);
        }
        const action = new (ObservableMixin())();
        action.set('message', message);
        this._actions.add(action);
        this.hasAny = true;
        return action;
    }
    /**
     * Removes an action from the list of pending actions.
     *
     * @param action An action object.
     */
    remove(action) {
        this._actions.remove(action);
        this.hasAny = !!this._actions.length;
    }
    /**
     * Returns the first action from the list or null if the list is empty
     *
     * @returns The pending action object.
     */
    get first() {
        return this._actions.get(0);
    }
    /**
     * Iterable interface.
     */
    [Symbol.iterator]() {
        return this._actions[Symbol.iterator]();
    }
}
