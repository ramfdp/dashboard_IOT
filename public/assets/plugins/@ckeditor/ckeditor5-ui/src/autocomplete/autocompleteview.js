/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/autocomplete/autocompleteview
*/
import { getOptimalPosition, global, toUnit, Rect } from '@ckeditor/ckeditor5-utils';
import SearchTextView from '../search/text/searchtextview.js';
import '../../theme/components/autocomplete/autocomplete.css';
/**
 * The autocomplete component's view class. It extends the {@link module:ui/search/text/searchtextview~SearchTextView} class
 * with a floating {@link #resultsView} that shows up when the user starts typing and hides when they blur
 * the component.
 */
class AutocompleteView extends SearchTextView {
    /**
     * @inheritDoc
     */
    constructor(locale, config) {
        super(locale, config);
        this._config = config;
        const toPx = toUnit('px');
        this.extendTemplate({
            attributes: {
                class: ['ck-autocomplete']
            }
        });
        const bindResultsView = this.resultsView.bindTemplate;
        this.resultsView.set('isVisible', false);
        this.resultsView.set('_position', 's');
        this.resultsView.set('_width', 0);
        this.resultsView.extendTemplate({
            attributes: {
                class: [
                    bindResultsView.if('isVisible', 'ck-hidden', value => !value),
                    bindResultsView.to('_position', value => `ck-search__results_${value}`)
                ],
                style: {
                    width: bindResultsView.to('_width', toPx)
                }
            }
        });
        // Update the visibility of the results view when the user focuses or blurs the component.
        // This is also integration for the `resetOnBlur` configuration.
        this.focusTracker.on('change:isFocused', (evt, name, isFocused) => {
            this._updateResultsVisibility();
            if (isFocused) {
                // Reset the scroll position of the results view whenever the autocomplete reopens.
                this.resultsView.element.scrollTop = 0;
            }
            else if (config.resetOnBlur) {
                this.queryView.reset();
            }
        });
        // Update the visibility of the results view when the user types in the query field.
        // This is an integration for `queryMinChars` configuration.
        // This is an integration for search results changing length and the #resultsView requiring to be repositioned.
        this.on('search', () => {
            this._updateResultsVisibility();
            this._updateResultsViewWidthAndPosition();
        });
        // Hide the results view when the user presses the ESC key.
        this.keystrokes.set('esc', (evt, cancel) => {
            // Let the DOM event pass through if the focus is in the query view.
            if (!this.resultsView.isVisible) {
                return;
            }
            // Focus the query view first and only then close the results view. Otherwise, if the focus
            // was in the results view, it will get lost.
            this.queryView.focus();
            this.resultsView.isVisible = false;
            cancel();
        });
        // Update the position of the results view when the user scrolls the page.
        // TODO: This needs to be debounced down the road.
        this.listenTo(global.document, 'scroll', () => {
            this._updateResultsViewWidthAndPosition();
        });
        // Hide the results when the component becomes disabled.
        this.on('change:isEnabled', () => {
            this._updateResultsVisibility();
        });
        // Update the value of the query field when the user selects a result.
        this.filteredView.on('execute', (evt, { value }) => {
            // Focus the query view first to avoid losing the focus.
            this.focus();
            // Resetting the view will ensure that the #queryView will update its empty state correctly.
            // This prevents bugs related to dynamic labels or auto-grow when re-setting the same value
            // to #queryView.fieldView.value (which does not trigger empty state change) to an
            // #queryView.fieldView.element that has been changed by the user.
            this.reset();
            // Update the value of the query field.
            this.queryView.fieldView.value = this.queryView.fieldView.element.value = value;
            // Finally, hide the results view. The focus has been moved earlier so this is safe.
            this.resultsView.isVisible = false;
        });
        // Update the position and width of the results view when it becomes visible.
        this.resultsView.on('change:isVisible', () => {
            this._updateResultsViewWidthAndPosition();
        });
    }
    /**
     * Updates the position of the results view on demand.
     */
    _updateResultsViewWidthAndPosition() {
        if (!this.resultsView.isVisible) {
            return;
        }
        this.resultsView._width = new Rect(this.queryView.fieldView.element).width;
        const optimalResultsPosition = AutocompleteView._getOptimalPosition({
            element: this.resultsView.element,
            target: this.queryView.element,
            fitInViewport: true,
            positions: AutocompleteView.defaultResultsPositions
        });
        // _getOptimalPosition will return null if there is no optimal position found (e.g. target is off the viewport).
        this.resultsView._position = optimalResultsPosition ? optimalResultsPosition.name : 's';
    }
    /**
     * Updates the visibility of the results view on demand.
     */
    _updateResultsVisibility() {
        const queryMinChars = typeof this._config.queryMinChars === 'undefined' ? 0 : this._config.queryMinChars;
        const queryLength = this.queryView.fieldView.element.value.length;
        this.resultsView.isVisible = this.focusTracker.isFocused && this.isEnabled && queryLength >= queryMinChars;
    }
}
/**
 * Positions for the autocomplete results view. Two positions are defined by default:
 * * `s` - below the search field,
 * * `n` - above the search field.
 */
AutocompleteView.defaultResultsPositions = [
    (fieldRect => {
        return {
            top: fieldRect.bottom,
            left: fieldRect.left,
            name: 's'
        };
    }),
    ((fieldRect, resultsRect) => {
        return {
            top: fieldRect.top - resultsRect.height,
            left: fieldRect.left,
            name: 'n'
        };
    })
];
/**
 * A function used to calculate the optimal position for the dropdown panel.
 */
AutocompleteView._getOptimalPosition = getOptimalPosition;
export default AutocompleteView;
