import { XPathBaseParserOptions } from '../xslt-extensions';
import { XPathBaseParser } from './base-parser';

export class XPath10Parser extends XPathBaseParser {
    constructor(options?: XPathBaseParserOptions) {
        super(options);
        this.ensureVersionSupport(['1.0'], '1.0');
    }
}
