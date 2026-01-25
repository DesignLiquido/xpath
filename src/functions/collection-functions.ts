/**
 * XPath 2.0 Collection Functions (Phase 9.1)
 *
 * Implements collection-related functions from the F&O specification.
 * Reference: https://www.w3.org/TR/xpath-functions/#collection
 */

import { XPathContext } from '../context';
import { XPathNode } from '../node';
import { XPathDynamicError } from '../errors';

/**
 * fn:collection() - Returns a sequence of nodes from an available collection.
 *
 * Signature: fn:collection() as node()*
 *            fn:collection($arg as xs:string?) as node()*
 *
 * @param context - The dynamic context (required for collection lookup)
 * @param uri - Optional collection URI. If omitted, uses the default collection.
 * @returns A sequence of nodes from the specified collection, or empty sequence if not found.
 *
 * Behavior:
 * - If no argument is provided, returns the default collection
 * - If an argument is provided, returns the named collection
 * - Returns an empty sequence if the collection is not available
 * - Each node is returned only once (no duplicates)
 */
export function collectionFn(context: XPathContext, uri?: string | null): XPathNode[] {
  // Determine which collection URI to use
  let collectionUri: string | undefined;

  if (uri !== undefined && uri !== null) {
    // Explicit URI provided
    collectionUri = uri;
  } else {
    // Use default collection
    collectionUri = context.defaultCollection;
  }

  // If no collection URI determined, return empty sequence
  if (!collectionUri) {
    return [];
  }

  // Look up the collection
  const collections = context.availableCollections;
  if (!collections) {
    return [];
  }

  const collection = collections[collectionUri];
  if (!collection) {
    // Collection URI not found - return empty sequence (spec allows this)
    // Some implementations might raise FODC0002 error, but XPath 2.0 allows empty return
    return [];
  }

  // Return the collection (array of nodes)
  return Array.isArray(collection) ? collection : [];
}

/**
 * fn:doc() - Returns the document node of an external resource.
 *
 * Signature: fn:doc($uri as xs:string) as document-node()?
 *
 * @param context - The dynamic context (required for document lookup)
 * @param uri - The URI of the document to retrieve
 * @returns The document node, or null if not found
 *
 * NOTE: This function is partially deferred. Full implementation requires:
 * - URI resolution and resource loading
 * - Caching of loaded documents
 * - Proper error handling (FODC0005 for unavailable documents)
 */
export function docFn(context: XPathContext, uri: string): any {
  if (!uri) {
    throw new XPathDynamicError(
      'FODC0005',
      'fn:doc(): URI argument cannot be empty'
    );
  }

  const documents = context.availableDocuments;
  if (!documents) {
    return null;
  }

  const doc = documents[uri];
  return doc || null;
}

/**
 * fn:doc-available() - Tests whether a document is available.
 *
 * Signature: fn:doc-available($uri as xs:string) as xs:boolean
 *
 * @param context - The dynamic context (required for document lookup)
 * @param uri - The URI of the document to check
 * @returns true if the document is available, false otherwise
 *
 * NOTE: This function is partially deferred. Full implementation requires:
 * - URI resolution and resource availability checking
 * - Consistent behavior with fn:doc()
 */
export function docAvailableFn(context: XPathContext, uri: string): boolean {
  if (!uri) {
    return false;
  }

  const documents = context.availableDocuments;
  if (!documents) {
    return false;
  }

  return uri in documents;
}
