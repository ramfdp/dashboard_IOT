/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module style/ui/stylepanelview
 */
import { FocusCycler, View, ViewCollection } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils.js';
import StyleGroupView from './stylegroupview.js';
import '../../theme/stylepanel.css';
/**
 * A class representing a panel with available content styles. It renders styles in button grids, grouped
 * in categories.
 */
export default class StylePanelView extends View {
    /**
     * Creates an instance of the {@link module:style/ui/stylegroupview~StyleGroupView} class.
     *
     * @param locale The localization services instance.
     * @param styleDefinitions Normalized definitions of the styles.
     */
    constructor(locale, styleDefinitions) {
        super(locale);
        const t = locale.t;
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.children = this.createCollection();
        this.blockStylesGroupView = new StyleGroupView(locale, t('Block styles'), styleDefinitions.block);
        this.inlineStylesGroupView = new StyleGroupView(locale, t('Text styles'), styleDefinitions.inline);
        this.set('activeStyles', []);
        this.set('enabledStyles', []);
        this._focusables = new ViewCollection();
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate style groups backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
                focusPrevious: ['shift + tab'],
                // Navigate style groups forward using the <kbd>Tab</kbd> key.
                focusNext: ['tab']
            }
        });
        if (styleDefinitions.block.length) {
            this.children.add(this.blockStylesGroupView);
        }
        if (styleDefinitions.inline.length) {
            this.children.add(this.inlineStylesGroupView);
        }
        this.blockStylesGroupView.gridView.delegate('execute').to(this);
        this.inlineStylesGroupView.gridView.delegate('execute').to(this);
        this.blockStylesGroupView.gridView
            .bind('activeStyles', 'enabledStyles')
            .to(this, 'activeStyles', 'enabledStyles');
        this.inlineStylesGroupView.gridView
            .bind('activeStyles', 'enabledStyles')
            .to(this, 'activeStyles', 'enabledStyles');
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-style-panel'
                ]
            },
            children: this.children
        });
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        // Register the views as focusable.
        this._focusables.add(this.blockStylesGroupView.gridView);
        this._focusables.add(this.inlineStylesGroupView.gridView);
        // Register the views in the focus tracker.
        this.focusTracker.add(this.blockStylesGroupView.gridView.element);
        this.focusTracker.add(this.inlineStylesGroupView.gridView.element);
        this.keystrokes.listenTo(this.element);
    }
    /**
     * Focuses the first focusable element in the panel.
     */
    focus() {
        this._focusCycler.focusFirst();
    }
    /**
     * Focuses the last focusable element in the panel.
     */
    focusLast() {
        this._focusCycler.focusLast();
    }
}
