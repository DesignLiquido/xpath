export type TokenType =
    // Identifiers and literals
    "IDENTIFIER" |
    "NUMBER" |
    "STRING" |
    "FUNCTION" |
    "RESERVED_WORD" |
    "LOCATION" |
    "NODE_TYPE" |
    "OPERATOR" |

    // Single character tokens
    "AT" |                      // @
    "DOT" |                     // .
    "PIPE" |                    // |
    "DOLLAR" |                  // $
    "OPEN_CURLY_BRACKET" |      // {
    "CLOSE_CURLY_BRACKET" |     // }
    "OPEN_SQUARE_BRACKET" |     // [
    "CLOSE_SQUARE_BRACKET" |    // ]
    "OPEN_PAREN" |              // (
    "CLOSE_PAREN" |             // )
    "PLUS" |                    // +
    "MINUS" |                   // -
    "ASTERISK" |                // *
    "COMMA" |                   // ,
    "QUESTION" |                // ?
    "QUOTE" |                   // '
    "DOUBLE_QUOTE" |            // "
    "EQUALS" |                  // =
    "SLASH" |                   // /
    "LESS_THAN" |               // <
    "GREATER_THAN" |            // >
    "COLON" |                   // :

    // Two character tokens
    "DOT_DOT" |                 // ..
    "DOUBLE_SLASH" |            // //
    "COLON_COLON" |             // ::
    "NOT_EQUALS" |              // !=
    "LESS_THAN_OR_EQUAL" |      // <=
    "GREATER_THAN_OR_EQUAL" |   // >=

    // XPath 3.0 tokens
    "SIMPLE_MAP" |              // !
    "CONCAT" |                  // ||
    "HASH" |                    // #
    "FAT_ARROW" |               // =>
    "ASSIGNMENT";               // :=