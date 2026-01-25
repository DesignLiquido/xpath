[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / FunctionSignature

# Interface: FunctionSignature

Defined in: [static-context.ts:15](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/static-context.ts#L15)

## Properties

### name

> **name**: `string`

Defined in: [static-context.ts:17](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/static-context.ts#L17)

QName (prefix:local or local) of the function.

***

### namespace?

> `optional` **namespace**: `string`

Defined in: [static-context.ts:19](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/static-context.ts#L19)

Namespace for the function; defaults to DEFAULT_FUNCTION_NAMESPACE.

***

### argumentTypes?

> `optional` **argumentTypes**: [`SequenceType`](../classes/SequenceType.md)[]

Defined in: [static-context.ts:21](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/static-context.ts#L21)

Optional argument types for static checking.

***

### returnType?

> `optional` **returnType**: [`SequenceType`](../classes/SequenceType.md)

Defined in: [static-context.ts:23](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/static-context.ts#L23)

Optional return type for static checking.

***

### minArgs

> **minArgs**: `number`

Defined in: [static-context.ts:25](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/static-context.ts#L25)

Minimum required arguments.

***

### maxArgs?

> `optional` **maxArgs**: `number`

Defined in: [static-context.ts:27](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/static-context.ts#L27)

Maximum allowed arguments (undefined = unbounded).
