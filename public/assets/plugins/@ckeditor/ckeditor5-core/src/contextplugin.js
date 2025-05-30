/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module core/contextplugin
 */
import { ObservableMixin } from '@ckeditor/ckeditor5-utils';
/**
 * The base class for {@link module:core/context~Context} plugin classes.
 *
 * A context plugin can either be initialized for an {@link module:core/editor/editor~Editor editor} or for
 * a {@link module:core/context~Context context}. In other words, it can either
 * work within one editor instance or with one or more editor instances that use a single context.
 * It is the context plugin's role to implement handling for both modes.
 *
 * There are a few rules for interaction between the editor plugins and context plugins:
 *
 * * A context plugin can require another context plugin.
 * * An {@link module:core/plugin~Plugin editor plugin} can require a context plugin.
 * * A context plugin MUST NOT require an {@link module:core/plugin~Plugin editor plugin}.
 */
export default class ContextPlugin extends /* #__PURE__ */ ObservableMixin() {
    /**
     * Creates a new plugin instance.
     */
    constructor(context) {
        super();
        this.context = context;
    }
    /**
     * @inheritDoc
     */
    destroy() {
        this.stopListening();
    }
    /**
     * @inheritDoc
     */
    static get isContextPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return false;
    }
    /**
     * @inheritDoc
     */
    static get isPremiumPlugin() {
        return false;
    }
}
