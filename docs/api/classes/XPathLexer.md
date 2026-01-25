[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XPathLexer

# Class: XPathLexer

Defined in: [lexer/lexer.ts:109](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L109)

## Constructors

### Constructor

> **new XPathLexer**(`version`): `XPathLexer`

Defined in: [lexer/lexer.ts:116](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L116)

#### Parameters

##### version

`XPathVersion` = `'2.0'`

#### Returns

`XPathLexer`

## Properties

### expression

> **expression**: `string`

Defined in: [lexer/lexer.ts:110](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L110)

***

### current

> **current**: `number`

Defined in: [lexer/lexer.ts:111](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L111)

***

### tokens

> **tokens**: [`XPathToken`](XPathToken.md)[]

Defined in: [lexer/lexer.ts:112](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L112)

## Methods

### registerFunctions()

> **registerFunctions**(`functionNames`): `void`

Defined in: [lexer/lexer.ts:124](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L124)

Register additional function names to be recognized by the lexer.
Used for XSLT extension functions.

#### Parameters

##### functionNames

`string`[]

#### Returns

`void`

***

### isAlpha()

> **isAlpha**(`char`): `boolean`

Defined in: [lexer/lexer.ts:137](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L137)

Check if character is a valid start of an identifier.
Supports Unicode letters according to XML NCName specification.

#### Parameters

##### char

`string`

#### Returns

`boolean`

***

### isAlphaNumeric()

> **isAlphaNumeric**(`char`): `boolean`

Defined in: [lexer/lexer.ts:148](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L148)

Check if character is valid in an identifier (after the first character).
Supports Unicode letters and digits according to XML NCName specification.
Note: Hyphen is handled separately in parseIdentifier for reserved words.

#### Parameters

##### char

`string`

#### Returns

`boolean`

***

### isNumber()

> **isNumber**(`char`): `boolean`

Defined in: [lexer/lexer.ts:153](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L153)

#### Parameters

##### char

`string`

#### Returns

`boolean`

***

### isWhitespace()

> **isWhitespace**(`char`): `boolean`

Defined in: [lexer/lexer.ts:157](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L157)

#### Parameters

##### char

`string`

#### Returns

`boolean`

***

### peek()

> **peek**(): `string`

Defined in: [lexer/lexer.ts:161](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L161)

#### Returns

`string`

***

### peekNext()

> **peekNext**(): `string`

Defined in: [lexer/lexer.ts:165](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L165)

#### Returns

`string`

***

### next()

> **next**(): `string`

Defined in: [lexer/lexer.ts:169](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L169)

#### Returns

`string`

***

### match()

> **match**(`expected`): `boolean`

Defined in: [lexer/lexer.ts:173](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L173)

#### Parameters

##### expected

`string`

#### Returns

`boolean`

***

### parseIdentifier()

> **parseIdentifier**(`firstCharacter`): [`XPathToken`](XPathToken.md)

Defined in: [lexer/lexer.ts:180](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L180)

#### Parameters

##### firstCharacter

`string`

#### Returns

[`XPathToken`](XPathToken.md)

***

### parseString()

> **parseString**(`quoteChar`): [`XPathToken`](XPathToken.md)

Defined in: [lexer/lexer.ts:229](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L229)

#### Parameters

##### quoteChar

`string`

#### Returns

[`XPathToken`](XPathToken.md)

***

### parseNumber()

> **parseNumber**(`firstCharacter`): [`XPathToken`](XPathToken.md)

Defined in: [lexer/lexer.ts:244](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L244)

#### Parameters

##### firstCharacter

`string`

#### Returns

[`XPathToken`](XPathToken.md)

***

### scanToken()

> **scanToken**(): [`XPathToken`](XPathToken.md)

Defined in: [lexer/lexer.ts:274](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L274)

#### Returns

[`XPathToken`](XPathToken.md)

***

### scan()

> **scan**(`expression`): [`XPathToken`](XPathToken.md)[]

Defined in: [lexer/lexer.ts:376](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/lexer/lexer.ts#L376)

#### Parameters

##### expression

`string`

#### Returns

[`XPathToken`](XPathToken.md)[]
