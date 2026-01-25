[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XPathBaseParser

# Abstract Class: XPathBaseParser

Defined in: [parser/base-parser.ts:59](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L59)

Recursive descent parser shared by XPath 1.0+ implementations.

Grammar (simplified):
  Expr           ::= OrExpr
  OrExpr         ::= AndExpr ('or' AndExpr)*
  AndExpr        ::= EqualityExpr ('and' EqualityExpr)*
  EqualityExpr   ::= RelationalExpr (('=' | '!=') RelationalExpr)*
  RelationalExpr ::= AdditiveExpr (('<' | '>' | '<=' | '>=') AdditiveExpr)*
  AdditiveExpr   ::= MultiplicativeExpr (('+' | '-') MultiplicativeExpr)*
  MultiplicativeExpr ::= UnaryExpr (('*' | 'div' | 'mod') UnaryExpr)*
  UnaryExpr      ::= '-'* UnionExpr
  UnionExpr      ::= PathExpr ('|' PathExpr)*
  PathExpr       ::= LocationPath | FilterExpr (('/' | '//') RelativeLocationPath)?
  FilterExpr     ::= PrimaryExpr Predicate*
  PrimaryExpr    ::= VariableReference | '(' Expr ')' | Literal | Number | FunctionCall
  LocationPath   ::= RelativeLocationPath | AbsoluteLocationPath
  Step           ::= AxisSpecifier NodeTest Predicate* | AbbreviatedStep
  Predicate      ::= '[' Expr ']'

## Constructors

### Constructor

> `protected` **new XPathBaseParser**(`options?`): `XPathBaseParser`

Defined in: [parser/base-parser.ts:72](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L72)

Create a new XPath parser.

#### Parameters

##### options?

[`XPathBaseParserOptions`](../interfaces/XPathBaseParserOptions.md)

Optional parser configuration including XSLT extensions

#### Returns

`XPathBaseParser`

## Properties

### tokens

> `protected` **tokens**: [`XPathToken`](XPathToken.md)[] = `[]`

Defined in: [parser/base-parser.ts:60](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L60)

***

### current

> `protected` **current**: `number` = `0`

Defined in: [parser/base-parser.ts:61](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L61)

***

### extensions?

> `protected` `optional` **extensions**: [`XSLTExtensions`](../interfaces/XSLTExtensions.md)

Defined in: [parser/base-parser.ts:62](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L62)

***

### options

> `protected` **options**: [`XPathBaseParserOptions`](../interfaces/XPathBaseParserOptions.md)

Defined in: [parser/base-parser.ts:63](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L63)

***

### staticContext

> `protected` **staticContext**: [`XPathStaticContext`](../interfaces/XPathStaticContext.md)

Defined in: [parser/base-parser.ts:64](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L64)

***

### warningCollector

> `protected` **warningCollector**: [`WarningCollector`](WarningCollector.md)

Defined in: [parser/base-parser.ts:65](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L65)

## Methods

### getWarningCollector()

> **getWarningCollector**(): [`WarningCollector`](WarningCollector.md)

Defined in: [parser/base-parser.ts:110](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L110)

Get the warning collector for this parser.
Useful for retrieving warnings after parsing.

#### Returns

[`WarningCollector`](WarningCollector.md)

***

### ensureVersionSupport()

> `protected` **ensureVersionSupport**(`supportedVersions`, `defaultVersion`): `void`

Defined in: [parser/base-parser.ts:117](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L117)

Enforce the supported XPath versions for a concrete parser.

#### Parameters

##### supportedVersions

[`XPathVersion`](../type-aliases/XPathVersion.md)[]

##### defaultVersion

[`XPathVersion`](../type-aliases/XPathVersion.md)

#### Returns

`void`

***

### getOptions()

> **getOptions**(): `Readonly`\<[`XPathBaseParserOptions`](../interfaces/XPathBaseParserOptions.md)\>

Defined in: [parser/base-parser.ts:132](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L132)

Get the parser options.

#### Returns

`Readonly`\<[`XPathBaseParserOptions`](../interfaces/XPathBaseParserOptions.md)\>

***

### parse()

> **parse**(`tokens`): `XPathExpression`

Defined in: [parser/base-parser.ts:136](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L136)

#### Parameters

##### tokens

[`XPathToken`](XPathToken.md)[]

#### Returns

`XPathExpression`

***

### peek()

> `protected` **peek**(): [`XPathToken`](XPathToken.md)

Defined in: [parser/base-parser.ts:166](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L166)

#### Returns

[`XPathToken`](XPathToken.md)

***

### peekNext()

> `protected` **peekNext**(): [`XPathToken`](XPathToken.md)

Defined in: [parser/base-parser.ts:170](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L170)

#### Returns

[`XPathToken`](XPathToken.md)

***

### previous()

> `protected` **previous**(): [`XPathToken`](XPathToken.md)

Defined in: [parser/base-parser.ts:174](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L174)

#### Returns

[`XPathToken`](XPathToken.md)

***

### isAtEnd()

> `protected` **isAtEnd**(): `boolean`

Defined in: [parser/base-parser.ts:178](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L178)

#### Returns

`boolean`

***

### advance()

> `protected` **advance**(): [`XPathToken`](XPathToken.md)

Defined in: [parser/base-parser.ts:182](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L182)

#### Returns

[`XPathToken`](XPathToken.md)

***

### check()

> `protected` **check**(`type`): `boolean`

Defined in: [parser/base-parser.ts:187](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L187)

#### Parameters

##### type

[`TokenType`](../type-aliases/TokenType.md)

#### Returns

`boolean`

***

### checkLexeme()

> `protected` **checkLexeme**(`lexeme`): `boolean`

Defined in: [parser/base-parser.ts:192](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L192)

#### Parameters

##### lexeme

`string`

#### Returns

`boolean`

***

### match()

> `protected` **match**(...`types`): `boolean`

Defined in: [parser/base-parser.ts:197](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L197)

#### Parameters

##### types

...[`TokenType`](../type-aliases/TokenType.md)[]

#### Returns

`boolean`

***

### consume()

> `protected` **consume**(`type`, `message`): [`XPathToken`](XPathToken.md)

Defined in: [parser/base-parser.ts:207](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L207)

#### Parameters

##### type

[`TokenType`](../type-aliases/TokenType.md)

##### message

`string`

#### Returns

[`XPathToken`](XPathToken.md)

***

### parseExpr()

> `protected` **parseExpr**(): `XPathExpression`

Defined in: [parser/base-parser.ts:214](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L214)

#### Returns

`XPathExpression`

***

### parseOrExpr()

> `protected` **parseOrExpr**(): `XPathExpression`

Defined in: [parser/base-parser.ts:218](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L218)

#### Returns

`XPathExpression`

***

### parseAndExpr()

> `protected` **parseAndExpr**(): `XPathExpression`

Defined in: [parser/base-parser.ts:230](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L230)

#### Returns

`XPathExpression`

***

### parseEqualityExpr()

> `protected` **parseEqualityExpr**(): `XPathExpression`

Defined in: [parser/base-parser.ts:242](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L242)

#### Returns

`XPathExpression`

***

### parseRelationalExpr()

> `protected` **parseRelationalExpr**(): `XPathExpression`

Defined in: [parser/base-parser.ts:254](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L254)

#### Returns

`XPathExpression`

***

### parseAdditiveExpr()

> `protected` **parseAdditiveExpr**(): `XPathExpression`

Defined in: [parser/base-parser.ts:266](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L266)

#### Returns

`XPathExpression`

***

### parseMultiplicativeExpr()

> `protected` **parseMultiplicativeExpr**(): `XPathExpression`

Defined in: [parser/base-parser.ts:278](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L278)

#### Returns

`XPathExpression`

***

### parseUnaryExpr()

> `protected` **parseUnaryExpr**(): `XPathExpression`

Defined in: [parser/base-parser.ts:297](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L297)

#### Returns

`XPathExpression`

***

### parseUnionExpr()

> `protected` **parseUnionExpr**(): `XPathExpression`

Defined in: [parser/base-parser.ts:306](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L306)

#### Returns

`XPathExpression`

***

### parsePathExpr()

> `protected` **parsePathExpr**(): `XPathExpression`

Defined in: [parser/base-parser.ts:319](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L319)

#### Returns

`XPathExpression`

***

### isStepStart()

> `protected` **isStepStart**(): `boolean`

Defined in: [parser/base-parser.ts:351](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L351)

#### Returns

`boolean`

***

### parseLocationPath()

> `protected` **parseLocationPath**(): `XPathExpression`

Defined in: [parser/base-parser.ts:405](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L405)

#### Returns

`XPathExpression`

***

### parseRelativeLocationPath()

> `protected` **parseRelativeLocationPath**(): `XPathStep`[]

Defined in: [parser/base-parser.ts:430](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L430)

#### Returns

`XPathStep`[]

***

### parseStep()

> `protected` **parseStep**(): `XPathStep`

Defined in: [parser/base-parser.ts:449](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L449)

#### Returns

`XPathStep`

***

### parseNodeTest()

> `protected` **parseNodeTest**(): `NodeTest`

Defined in: [parser/base-parser.ts:490](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L490)

#### Returns

`NodeTest`

***

### parsePredicates()

> `protected` **parsePredicates**(): `XPathExpression`[]

Defined in: [parser/base-parser.ts:576](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L576)

#### Returns

`XPathExpression`[]

***

### parseFilterExpr()

> `protected` **parseFilterExpr**(): `XPathExpression`

Defined in: [parser/base-parser.ts:590](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L590)

#### Returns

`XPathExpression`

***

### parsePrimaryExpr()

> `protected` **parsePrimaryExpr**(): `XPathExpression`

Defined in: [parser/base-parser.ts:607](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L607)

#### Returns

`XPathExpression`

***

### parseFunctionCall()

> `protected` **parseFunctionCall**(): `XPathExpression`

Defined in: [parser/base-parser.ts:647](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/parser/base-parser.ts#L647)

#### Returns

`XPathExpression`
