import { XPathExpression } from './expression';

export class XPathStringLiteral extends XPathExpression {
    value: string;

    constructor(value: string) {
        super();
        this.value = value;
    }

    evaluate(_context: any): string {
        return this.value;
    }
}

export class XPathNumberLiteral extends XPathExpression {
    value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    evaluate(_context: any): number {
        return this.value;
    }
}
