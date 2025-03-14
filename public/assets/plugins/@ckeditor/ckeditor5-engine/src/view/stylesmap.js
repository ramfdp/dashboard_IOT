/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/stylesmap
 */
import { get, isObject, merge, set, unset } from 'lodash-es';
/**
 * Styles map. Allows handling (adding, removing, retrieving) a set of style rules (usually, of an element).
 */
export default class StylesMap {
    /**
     * Creates Styles instance.
     */
    constructor(styleProcessor) {
        /**
         * Cached list of style names for faster access.
         */
        this._cachedStyleNames = null;
        /**
         * Cached list of expanded style names for faster access.
         */
        this._cachedExpandedStyleNames = null;
        this._styles = {};
        this._styleProcessor = styleProcessor;
    }
    /**
     * Returns true if style map has no styles set.
     */
    get isEmpty() {
        const entries = Object.entries(this._styles);
        return !entries.length;
    }
    /**
     * Number of styles defined.
     */
    get size() {
        if (this.isEmpty) {
            return 0;
        }
        return this.getStyleNames().length;
    }
    /**
     * Set styles map to a new value.
     *
     * ```ts
     * styles.setTo( 'border:1px solid blue;margin-top:1px;' );
     * ```
     */
    setTo(inlineStyle) {
        this.clear();
        const parsedStyles = parseInlineStyles(inlineStyle);
        for (const [key, value] of parsedStyles) {
            this._styleProcessor.toNormalizedForm(key, value, this._styles);
        }
    }
    /**
     * Checks if a given style is set.
     *
     * ```ts
     * styles.setTo( 'margin-left:1px;' );
     *
     * styles.has( 'margin-left' );    // -> true
     * styles.has( 'padding' );        // -> false
     * ```
     *
     * **Note**: This check supports normalized style names.
     *
     * ```ts
     * // Enable 'margin' shorthand processing:
     * editor.data.addStyleProcessorRules( addMarginRules );
     *
     * styles.setTo( 'margin:2px;' );
     *
     * styles.has( 'margin' );         // -> true
     * styles.has( 'margin-top' );     // -> true
     * styles.has( 'margin-left' );    // -> true
     *
     * styles.remove( 'margin-top' );
     *
     * styles.has( 'margin' );         // -> false
     * styles.has( 'margin-top' );     // -> false
     * styles.has( 'margin-left' );    // -> true
     * ```
     *
     * @param name Style name.
     */
    has(name) {
        if (this.isEmpty) {
            return false;
        }
        const styles = this._styleProcessor.getReducedForm(name, this._styles);
        const propertyDescriptor = styles.find(([property]) => property === name);
        // Only return a value if it is set;
        return Array.isArray(propertyDescriptor);
    }
    set(nameOrObject, valueOrObject) {
        this._cachedStyleNames = null;
        this._cachedExpandedStyleNames = null;
        if (isObject(nameOrObject)) {
            for (const [key, value] of Object.entries(nameOrObject)) {
                this._styleProcessor.toNormalizedForm(key, value, this._styles);
            }
        }
        else {
            this._styleProcessor.toNormalizedForm(nameOrObject, valueOrObject, this._styles);
        }
    }
    /**
     * Removes given style.
     *
     * ```ts
     * styles.setTo( 'background:#f00;margin-right:2px;' );
     *
     * styles.remove( 'background' );
     *
     * styles.toString();   // -> 'margin-right:2px;'
     * ```
     *
     * ***Note**:* This method uses {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules
     * enabled style processor rules} to normalize passed values.
     *
     * ```ts
     * // Enable 'margin' shorthand processing:
     * editor.data.addStyleProcessorRules( addMarginRules );
     *
     * styles.setTo( 'margin:1px' );
     *
     * styles.remove( 'margin-top' );
     * styles.remove( 'margin-right' );
     *
     * styles.toString(); // -> 'margin-bottom:1px;margin-left:1px;'
     * ```
     *
     * @param name Style name.
     */
    remove(name) {
        this._cachedStyleNames = null;
        this._cachedExpandedStyleNames = null;
        const path = toPath(name);
        unset(this._styles, path);
        delete this._styles[name];
        this._cleanEmptyObjectsOnPath(path);
    }
    /**
     * Returns a normalized style object or a single value.
     *
     * ```ts
     * // Enable 'margin' shorthand processing:
     * editor.data.addStyleProcessorRules( addMarginRules );
     *
     * const styles = new Styles();
     * styles.setTo( 'margin:1px 2px 3em;' );
     *
     * styles.getNormalized( 'margin' );
     * // will log:
     * // {
     * //     top: '1px',
     * //     right: '2px',
     * //     bottom: '3em',
     * //     left: '2px'     // normalized value from margin shorthand
     * // }
     *
     * styles.getNormalized( 'margin-left' ); // -> '2px'
     * ```
     *
     * **Note**: This method will only return normalized styles if a style processor was defined.
     *
     * @param name Style name.
     */
    getNormalized(name) {
        return this._styleProcessor.getNormalized(name, this._styles);
    }
    /**
     * Returns a normalized style string. Styles are sorted by name.
     *
     * ```ts
     * styles.set( 'margin' , '1px' );
     * styles.set( 'background', '#f00' );
     *
     * styles.toString(); // -> 'background:#f00;margin:1px;'
     * ```
     *
     * **Note**: This method supports normalized styles if defined.
     *
     * ```ts
     * // Enable 'margin' shorthand processing:
     * editor.data.addStyleProcessorRules( addMarginRules );
     *
     * styles.set( 'margin' , '1px' );
     * styles.set( 'background', '#f00' );
     * styles.remove( 'margin-top' );
     * styles.remove( 'margin-right' );
     *
     * styles.toString(); // -> 'background:#f00;margin-bottom:1px;margin-left:1px;'
     * ```
     */
    toString() {
        if (this.isEmpty) {
            return '';
        }
        return this.getStylesEntries()
            .map(arr => arr.join(':'))
            .sort()
            .join(';') + ';';
    }
    /**
     * Returns property as a value string or undefined if property is not set.
     *
     * ```ts
     * // Enable 'margin' shorthand processing:
     * editor.data.addStyleProcessorRules( addMarginRules );
     *
     * const styles = new Styles();
     * styles.setTo( 'margin:1px;' );
     * styles.set( 'margin-bottom', '3em' );
     *
     * styles.getAsString( 'margin' ); // -> 'margin: 1px 1px 3em;'
     * ```
     *
     * Note, however, that all sub-values must be set for the longhand property name to return a value:
     *
     * ```ts
     * const styles = new Styles();
     * styles.setTo( 'margin:1px;' );
     * styles.remove( 'margin-bottom' );
     *
     * styles.getAsString( 'margin' ); // -> undefined
     * ```
     *
     * In the above scenario, it is not possible to return a `margin` value, so `undefined` is returned.
     * Instead, you should use:
     *
     * ```ts
     * const styles = new Styles();
     * styles.setTo( 'margin:1px;' );
     * styles.remove( 'margin-bottom' );
     *
     * for ( const styleName of styles.getStyleNames() ) {
     * 	console.log( styleName, styles.getAsString( styleName ) );
     * }
     * // 'margin-top', '1px'
     * // 'margin-right', '1px'
     * // 'margin-left', '1px'
     * ```
     *
     * In general, it is recommend to iterate over style names like in the example above. This way, you will always get all
     * the currently set style values. So, if all the 4 margin values would be set
     * the for-of loop above would yield only `'margin'`, `'1px'`:
     *
     * ```ts
     * const styles = new Styles();
     * styles.setTo( 'margin:1px;' );
     *
     * for ( const styleName of styles.getStyleNames() ) {
     * 	console.log( styleName, styles.getAsString( styleName ) );
     * }
     * // 'margin', '1px'
     * ```
     *
     * **Note**: To get a normalized version of a longhand property use the {@link #getNormalized `#getNormalized()`} method.
     */
    getAsString(propertyName) {
        if (this.isEmpty) {
            return;
        }
        if (this._styles[propertyName] && !isObject(this._styles[propertyName])) {
            // Try return styles set directly - values that are not parsed.
            return this._styles[propertyName];
        }
        const styles = this._styleProcessor.getReducedForm(propertyName, this._styles);
        const propertyDescriptor = styles.find(([property]) => property === propertyName);
        // Only return a value if it is set;
        if (Array.isArray(propertyDescriptor)) {
            return propertyDescriptor[1];
        }
    }
    /**
     * Returns all style properties names as they would appear when using {@link #toString `#toString()`}.
     *
     * When `expand` is set to true and there's a shorthand style property set, it will also return all equivalent styles:
     *
     * ```ts
     * stylesMap.setTo( 'margin: 1em' )
     * ```
     *
     * will be expanded to:
     *
     * ```ts
     * [ 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left' ]
     * ```
     *
     * @param expand Expand shorthand style properties and all return equivalent style representations.
     */
    getStyleNames(expand = false) {
        if (this.isEmpty) {
            return [];
        }
        if (expand) {
            this._cachedExpandedStyleNames = this._cachedExpandedStyleNames || this._styleProcessor.getStyleNames(this._styles);
            return this._cachedExpandedStyleNames;
        }
        this._cachedStyleNames = this._cachedStyleNames || this.getStylesEntries().map(([key]) => key);
        return this._cachedStyleNames;
    }
    /**
     * Removes all styles.
     */
    clear() {
        this._styles = {};
        this._cachedStyleNames = null;
        this._cachedExpandedStyleNames = null;
    }
    /**
     * Returns normalized styles entries for further processing.
     */
    getStylesEntries() {
        const parsed = [];
        const keys = Object.keys(this._styles);
        for (const key of keys) {
            parsed.push(...this._styleProcessor.getReducedForm(key, this._styles));
        }
        return parsed;
    }
    /**
     * Removes empty objects upon removing an entry from internal object.
     */
    _cleanEmptyObjectsOnPath(path) {
        const pathParts = path.split('.');
        const isChildPath = pathParts.length > 1;
        if (!isChildPath) {
            return;
        }
        const parentPath = pathParts.splice(0, pathParts.length - 1).join('.');
        const parentObject = get(this._styles, parentPath);
        if (!parentObject) {
            return;
        }
        const isParentEmpty = !Object.keys(parentObject).length;
        if (isParentEmpty) {
            this.remove(parentPath);
        }
    }
}
/**
 * Style processor is responsible for writing and reading a normalized styles object.
 */
export class StylesProcessor {
    /**
     * Creates StylesProcessor instance.
     *
     * @internal
     */
    constructor() {
        this._normalizers = new Map();
        this._extractors = new Map();
        this._reducers = new Map();
        this._consumables = new Map();
    }
    /**
     * Parse style string value to a normalized object and appends it to styles object.
     *
     * ```ts
     * const styles = {};
     *
     * stylesProcessor.toNormalizedForm( 'margin', '1px', styles );
     *
     * // styles will consist: { margin: { top: '1px', right: '1px', bottom: '1px', left: '1px; } }
     * ```
     *
     * **Note**: To define normalizer callbacks use {@link #setNormalizer}.
     *
     * @param name Name of style property.
     * @param propertyValue Value of style property.
     * @param styles Object holding normalized styles.
     */
    toNormalizedForm(name, propertyValue, styles) {
        if (isObject(propertyValue)) {
            appendStyleValue(styles, toPath(name), propertyValue);
            return;
        }
        if (this._normalizers.has(name)) {
            const normalizer = this._normalizers.get(name);
            const { path, value } = normalizer(propertyValue);
            appendStyleValue(styles, path, value);
        }
        else {
            appendStyleValue(styles, name, propertyValue);
        }
    }
    /**
     * Returns a normalized version of a style property.
     *
     * ```ts
     * const styles = {
     * 	margin: { top: '1px', right: '1px', bottom: '1px', left: '1px; },
     * 	background: { color: '#f00' }
     * };
     *
     * stylesProcessor.getNormalized( 'background' );
     * // will return: { color: '#f00' }
     *
     * stylesProcessor.getNormalized( 'margin-top' );
     * // will return: '1px'
     * ```
     *
     * **Note**: In some cases extracting single value requires defining an extractor callback {@link #setExtractor}.
     *
     * @param name Name of style property.
     * @param styles Object holding normalized styles.
     */
    getNormalized(name, styles) {
        if (!name) {
            return merge({}, styles);
        }
        // Might be empty string.
        if (styles[name] !== undefined) {
            return styles[name];
        }
        if (this._extractors.has(name)) {
            const extractor = this._extractors.get(name);
            if (typeof extractor === 'string') {
                return get(styles, extractor);
            }
            const value = extractor(name, styles);
            if (value) {
                return value;
            }
        }
        return get(styles, toPath(name));
    }
    /**
     * Returns a reduced form of style property form normalized object.
     *
     * For default margin reducer, the below code:
     *
     * ```ts
     * stylesProcessor.getReducedForm( 'margin', {
     * 	margin: { top: '1px', right: '1px', bottom: '2px', left: '1px; }
     * } );
     * ```
     *
     * will return:
     *
     * ```ts
     * [
     * 	[ 'margin', '1px 1px 2px' ]
     * ]
     * ```
     *
     * because it might be represented as a shorthand 'margin' value. However if one of margin long hand values is missing it should return:
     *
     * ```ts
     * [
     * 	[ 'margin-top', '1px' ],
     * 	[ 'margin-right', '1px' ],
     * 	[ 'margin-bottom', '2px' ]
     * 	// the 'left' value is missing - cannot use 'margin' shorthand.
     * ]
     * ```
     *
     * **Note**: To define reducer callbacks use {@link #setReducer}.
     *
     * @param name Name of style property.
     */
    getReducedForm(name, styles) {
        const normalizedValue = this.getNormalized(name, styles);
        // Might be empty string.
        if (normalizedValue === undefined) {
            return [];
        }
        if (this._reducers.has(name)) {
            const reducer = this._reducers.get(name);
            return reducer(normalizedValue);
        }
        return [[name, normalizedValue]];
    }
    /**
     * Return all style properties. Also expand shorthand properties (e.g. `margin`, `background`) if respective extractor is available.
     *
     * @param styles Object holding normalized styles.
     */
    getStyleNames(styles) {
        const styleNamesKeysSet = new Set();
        // Find all extractable styles that have a value.
        for (const name of this._consumables.keys()) {
            const style = this.getNormalized(name, styles);
            if (style && (typeof style != 'object' || Object.keys(style).length)) {
                styleNamesKeysSet.add(name);
            }
        }
        // For simple styles (for example `color`) we don't have a map of those styles
        // but they are 1 to 1 with normalized object keys.
        for (const name of Object.keys(styles)) {
            styleNamesKeysSet.add(name);
        }
        return Array.from(styleNamesKeysSet);
    }
    /**
     * Returns related style names.
     *
     * ```ts
     * stylesProcessor.getRelatedStyles( 'margin' );
     * // will return: [ 'margin-top', 'margin-right', 'margin-bottom', 'margin-left' ];
     *
     * stylesProcessor.getRelatedStyles( 'margin-top' );
     * // will return: [ 'margin' ];
     * ```
     *
     * **Note**: To define new style relations load an existing style processor or use
     * {@link module:engine/view/stylesmap~StylesProcessor#setStyleRelation `StylesProcessor.setStyleRelation()`}.
     */
    getRelatedStyles(name) {
        return this._consumables.get(name) || [];
    }
    /**
     * Adds a normalizer method for a style property.
     *
     * A normalizer returns describing how the value should be normalized.
     *
     * For instance 'margin' style is a shorthand for four margin values:
     *
     * - 'margin-top'
     * - 'margin-right'
     * - 'margin-bottom'
     * - 'margin-left'
     *
     * and can be written in various ways if some values are equal to others. For instance `'margin: 1px 2em;'` is a shorthand for
     * `'margin-top: 1px;margin-right: 2em;margin-bottom: 1px;margin-left: 2em'`.
     *
     * A normalizer should parse various margin notations as a single object:
     *
     * ```ts
     * const styles = {
     * 	margin: {
     * 		top: '1px',
     * 		right: '2em',
     * 		bottom: '1px',
     * 		left: '2em'
     * 	}
     * };
     * ```
     *
     * Thus a normalizer for 'margin' style should return an object defining style path and value to store:
     *
     * ```ts
     * const returnValue = {
     * 	path: 'margin',
     * 	value: {
     * 		top: '1px',
     * 		right: '2em',
     * 		bottom: '1px',
     * 		left: '2em'
     * 	}
     * };
     * ```
     *
     * Additionally to fully support all margin notations there should be also defined 4 normalizers for longhand margin notations. Below
     * is an example for 'margin-top' style property normalizer:
     *
     * ```ts
     * stylesProcessor.setNormalizer( 'margin-top', valueString => {
     * 	return {
     * 		path: 'margin.top',
     * 		value: valueString
     * 	}
     * } );
     * ```
     */
    setNormalizer(name, callback) {
        this._normalizers.set(name, callback);
    }
    /**
     * Adds a extractor callback for a style property.
     *
     * Most normalized style values are stored as one level objects. It is assumed that `'margin-top'` style will be stored as:
     *
     * ```ts
     * const styles = {
     * 	margin: {
     * 		top: 'value'
     * 	}
     * }
     * ```
     *
     * However, some styles can have conflicting notations and thus it might be harder to extract a style value from shorthand. For instance
     * the 'border-top-style' can be defined using `'border-top:solid'`, `'border-style:solid none none none'` or by `'border:solid'`
     * shorthands. The default border styles processors stores styles as:
     *
     * ```ts
     * const styles = {
     * 	border: {
     * 		style: {
     * 			top: 'solid'
     * 		}
     * 	}
     * }
     * ```
     *
     * as it is better to modify border style independently from other values. On the other part the output of the border might be
     * desired as `border-top`, `border-left`, etc notation.
     *
     * In the above example an extractor should return a side border value that combines style, color and width:
     *
     * ```ts
     * styleProcessor.setExtractor( 'border-top', styles => {
     * 	return {
     * 		color: styles.border.color.top,
     * 		style: styles.border.style.top,
     * 		width: styles.border.width.top
     * 	}
     * } );
     * ```
     *
     * @param callbackOrPath Callback that return a requested value or path string for single values.
     */
    setExtractor(name, callbackOrPath) {
        this._extractors.set(name, callbackOrPath);
    }
    /**
     * Adds a reducer callback for a style property.
     *
     * Reducer returns a minimal notation for given style name. For longhand properties it is not required to write a reducer as
     * by default the direct value from style path is taken.
     *
     * For shorthand styles a reducer should return minimal style notation either by returning single name-value tuple or multiple tuples
     * if a shorthand cannot be used. For instance for a margin shorthand a reducer might return:
     *
     * ```ts
     * const marginShortHandTuple = [
     * 	[ 'margin', '1px 1px 2px' ]
     * ];
     * ```
     *
     * or a longhand tuples for defined values:
     *
     * ```ts
     * // Considering margin.bottom and margin.left are undefined.
     * const marginLonghandsTuples = [
     * 	[ 'margin-top', '1px' ],
     * 	[ 'margin-right', '1px' ]
     * ];
     * ```
     *
     * A reducer obtains a normalized style value:
     *
     * ```ts
     * // Simplified reducer that always outputs 4 values which are always present:
     * stylesProcessor.setReducer( 'margin', margin => {
     * 	return [
     * 		[ 'margin', `${ margin.top } ${ margin.right } ${ margin.bottom } ${ margin.left }` ]
     * 	]
     * } );
     * ```
     */
    setReducer(name, callback) {
        this._reducers.set(name, callback);
    }
    /**
     * Defines a style shorthand relation to other style notations.
     *
     * ```ts
     * stylesProcessor.setStyleRelation( 'margin', [
     * 	'margin-top',
     * 	'margin-right',
     * 	'margin-bottom',
     * 	'margin-left'
     * ] );
     * ```
     *
     * This enables expanding of style names for shorthands. For instance, if defined,
     * {@link module:engine/conversion/viewconsumable~ViewConsumable view consumable} items are automatically created
     * for long-hand margin style notation alongside the `'margin'` item.
     *
     * This means that when an element being converted has a style `margin`, a converter for `margin-left` will work just
     * fine since the view consumable will contain a consumable `margin-left` item (thanks to the relation) and
     * `element.getStyle( 'margin-left' )` will work as well assuming that the style processor was correctly configured.
     * However, once `margin-left` is consumed, `margin` will not be consumable anymore.
     */
    setStyleRelation(shorthandName, styleNames) {
        this._mapStyleNames(shorthandName, styleNames);
        for (const alsoName of styleNames) {
            this._mapStyleNames(alsoName, [shorthandName]);
        }
    }
    /**
     * Set two-way binding of style names.
     */
    _mapStyleNames(name, styleNames) {
        if (!this._consumables.has(name)) {
            this._consumables.set(name, []);
        }
        this._consumables.get(name).push(...styleNames);
    }
}
/**
 * Parses inline styles and puts property - value pairs into styles map.
 *
 * @param stylesString Styles to parse.
 * @returns Map of parsed properties and values.
 */
function parseInlineStyles(stylesString) {
    // `null` if no quote was found in input string or last found quote was a closing quote. See below.
    let quoteType = null;
    let propertyNameStart = 0;
    let propertyValueStart = 0;
    let propertyName = null;
    const stylesMap = new Map();
    // Do not set anything if input string is empty.
    if (stylesString === '') {
        return stylesMap;
    }
    // Fix inline styles that do not end with `;` so they are compatible with algorithm below.
    if (stylesString.charAt(stylesString.length - 1) != ';') {
        stylesString = stylesString + ';';
    }
    // Seek the whole string for "special characters".
    for (let i = 0; i < stylesString.length; i++) {
        const char = stylesString.charAt(i);
        if (quoteType === null) {
            // No quote found yet or last found quote was a closing quote.
            switch (char) {
                case ':':
                    // Most of time colon means that property name just ended.
                    // Sometimes however `:` is found inside property value (for example in background image url).
                    if (!propertyName) {
                        // Treat this as end of property only if property name is not already saved.
                        // Save property name.
                        propertyName = stylesString.substr(propertyNameStart, i - propertyNameStart);
                        // Save this point as the start of property value.
                        propertyValueStart = i + 1;
                    }
                    break;
                case '"':
                case '\'':
                    // Opening quote found (this is an opening quote, because `quoteType` is `null`).
                    quoteType = char;
                    break;
                case ';': {
                    // Property value just ended.
                    // Use previously stored property value start to obtain property value.
                    const propertyValue = stylesString.substr(propertyValueStart, i - propertyValueStart);
                    if (propertyName) {
                        // Save parsed part.
                        stylesMap.set(propertyName.trim(), propertyValue.trim());
                    }
                    propertyName = null;
                    // Save this point as property name start. Property name starts immediately after previous property value ends.
                    propertyNameStart = i + 1;
                    break;
                }
            }
        }
        else if (char === quoteType) {
            // If a quote char is found and it is a closing quote, mark this fact by `null`-ing `quoteType`.
            quoteType = null;
        }
    }
    return stylesMap;
}
/**
 * Return lodash compatible path from style name.
 */
function toPath(name) {
    return name.replace('-', '.');
}
/**
 * Appends style definition to the styles object.
 */
function appendStyleValue(stylesObject, nameOrPath, valueOrObject) {
    let valueToSet = valueOrObject;
    if (isObject(valueOrObject)) {
        valueToSet = merge({}, get(stylesObject, nameOrPath), valueOrObject);
    }
    set(stylesObject, nameOrPath, valueToSet);
}
