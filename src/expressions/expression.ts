import { XPathContext, XPathResult } from '../context';

export abstract class XPathExpression {
    abstract evaluate(context: XPathContext): XPathResult;
}
