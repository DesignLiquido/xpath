export * from './base-parser';
export * from './parser-10';
export * from './parser-20';
export * from './parser-30';

import { XPath10Parser } from './parser-10';
import { XPath20Parser } from './parser-20';
import { XPath30Parser } from './parser-30';
import { XPathBaseParserOptions } from '../xslt-extensions';
import { XPathVersion, DEFAULT_XPATH_VERSION } from '../xpath-version';

/**
 * Factory function to create an XPath parser for the specified version.
 *
 * @param version - The XPath version to use. Defaults to '1.0'.
 * @param options - Parser configuration options.
 * @returns An XPath parser instance appropriate for the version.
 *
 * @example
 * ```typescript
 * // Create XPath 1.0 parser (default)
 * const parser = createXPathParser();
 *
 * // Create XPath 1.0 parser explicitly
 * const parser10 = createXPathParser('1.0');
 *
 * // Create XPath 2.0 parser
 * const parser20 = createXPathParser('2.0');
 *
 * // Create parser with options
 * const parser = createXPathParser('1.0', { enableNamespaceAxis: true });
 * ```
 */
export function createXPathParser(
    version: XPathVersion = DEFAULT_XPATH_VERSION,
    options?: Omit<XPathBaseParserOptions, 'version'>
): XPath10Parser | XPath20Parser | XPath30Parser {
    const fullOptions: XPathBaseParserOptions = { ...options, version };

    switch (version) {
        case '1.0':
            return new XPath10Parser(fullOptions);
        case '2.0':
            return new XPath20Parser(fullOptions);
        case '3.0':
        case '3.1':
            return new XPath30Parser(fullOptions);
        default:
            throw new Error(`Unsupported XPath version: ${version}`);
    }
}

/**
 * Alias for XPath10Parser for backward compatibility.
 *
 * @deprecated Use XPath10Parser, XPath20Parser, or createXPathParser() instead.
 * This alias defaults to XPath 1.0 behavior.
 *
 * @example
 * ```typescript
 * // Old usage (deprecated):
 * const parser = new XPathParser();
 *
 * // New recommended usage:
 * const parser = new XPath10Parser();
 * // or for XPath 2.0:
 * const parser = new XPath20Parser();
 * // or using the factory:
 * const parser = createXPathParser('1.0');
 * ```
 */
export const XPathParser = XPath10Parser;
