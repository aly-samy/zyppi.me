export type RawJsonGuardErrorCode = "INVALID_RAW_JSON" | "DUPLICATE_JSON_KEY";

export type RawJsonGuardResult =
  | {
      readonly ok: true;
    }
  | {
      readonly ok: false;
      readonly code: RawJsonGuardErrorCode;
      readonly message: string;
    };

/**
 * Validates raw JSON text syntax and enforces strict duplicate object-key rejection
 * across all nesting levels using decoded key values.
 *
 * Does NOT construct domain objects, rewrite input, canonicalize, or perform generation classification.
 */
export function checkRawJsonDuplicateKeys(rawJson: string): RawJsonGuardResult {
  let index = 0;
  const length = rawJson.length;

  function skipWhitespace(): void {
    while (index < length) {
      const ch = rawJson.charCodeAt(index);
      if (ch === 0x20 || ch === 0x09 || ch === 0x0a || ch === 0x0d) {
        index++;
      } else {
        break;
      }
    }
  }

  function parseString(): string {
    // index is at opening '"'
    index++;
    let result = "";

    while (index < length) {
      const ch = rawJson.charCodeAt(index);

      if (ch === 0x22) {
        // Closing double quote '"'
        index++;
        return result;
      }

      if (ch === 0x5c) {
        // Backslash '\'
        index++;
        if (index >= length) {
          throw new GuardError(
            "INVALID_RAW_JSON",
            "Unterminated escape sequence in JSON string",
          );
        }
        const escCh = rawJson.charAt(index);
        index++;

        switch (escCh) {
          case '"':
            result += '"';
            break;
          case "\\":
            result += "\\";
            break;
          case "/":
            result += "/";
            break;
          case "b":
            result += "\b";
            break;
          case "f":
            result += "\f";
            break;
          case "n":
            result += "\n";
            break;
          case "r":
            result += "\r";
            break;
          case "t":
            result += "\t";
            break;
          case "u": {
            if (index + 4 > length) {
              throw new GuardError(
                "INVALID_RAW_JSON",
                "Invalid unicode escape sequence in JSON string",
              );
            }
            const hexStr = rawJson.substring(index, index + 4);
            if (!/^[0-9a-fA-F]{4}$/.test(hexStr)) {
              throw new GuardError(
                "INVALID_RAW_JSON",
                `Invalid hex in unicode escape sequence: \\u${hexStr}`,
              );
            }
            index += 4;
            const codePoint = parseInt(hexStr, 16);
            result += String.fromCharCode(codePoint);
            break;
          }
          default:
            throw new GuardError(
              "INVALID_RAW_JSON",
              `Invalid escape character in JSON string: \\${escCh}`,
            );
        }
      } else if (ch < 0x20) {
        throw new GuardError(
          "INVALID_RAW_JSON",
          "Unescaped control character in JSON string",
        );
      } else {
        result += String.fromCharCode(ch);
        index++;
      }
    }

    throw new GuardError("INVALID_RAW_JSON", "Unterminated JSON string");
  }

  function parseNumber(): void {
    const start = index;

    if (rawJson.charAt(index) === "-") {
      index++;
    }

    if (index >= length) {
      throw new GuardError("INVALID_RAW_JSON", "Invalid JSON number format");
    }

    const firstDigit = rawJson.charAt(index);
    if (firstDigit === "0") {
      index++;
      if (index < length) {
        const next = rawJson.charCodeAt(index);
        if (next >= 0x30 && next <= 0x39) {
          throw new GuardError(
            "INVALID_RAW_JSON",
            "Leading zeros are not allowed in JSON numbers",
          );
        }
      }
    } else if (firstDigit >= "1" && firstDigit <= "9") {
      index++;
      while (index < length) {
        const next = rawJson.charCodeAt(index);
        if (next >= 0x30 && next <= 0x39) {
          index++;
        } else {
          break;
        }
      }
    } else {
      throw new GuardError("INVALID_RAW_JSON", "Invalid JSON number format");
    }

    // Fractional part
    if (index < length && rawJson.charAt(index) === ".") {
      index++;
      if (index >= length) {
        throw new GuardError(
          "INVALID_RAW_JSON",
          "Unterminated fraction in JSON number",
        );
      }
      let fracDigitCount = 0;
      while (index < length) {
        const next = rawJson.charCodeAt(index);
        if (next >= 0x30 && next <= 0x39) {
          fracDigitCount++;
          index++;
        } else {
          break;
        }
      }
      if (fracDigitCount === 0) {
        throw new GuardError(
          "INVALID_RAW_JSON",
          "Expected digits after decimal point in JSON number",
        );
      }
    }

    // Exponent part
    if (
      index < length &&
      (rawJson.charAt(index) === "e" || rawJson.charAt(index) === "E")
    ) {
      index++;
      if (
        index < length &&
        (rawJson.charAt(index) === "+" || rawJson.charAt(index) === "-")
      ) {
        index++;
      }
      if (index >= length) {
        throw new GuardError(
          "INVALID_RAW_JSON",
          "Unterminated exponent in JSON number",
        );
      }
      let expDigitCount = 0;
      while (index < length) {
        const next = rawJson.charCodeAt(index);
        if (next >= 0x30 && next <= 0x39) {
          expDigitCount++;
          index++;
        } else {
          break;
        }
      }
      if (expDigitCount === 0) {
        throw new GuardError(
          "INVALID_RAW_JSON",
          "Expected digits in exponent in JSON number",
        );
      }
    }

    if (start === index) {
      throw new GuardError("INVALID_RAW_JSON", "Invalid JSON number format");
    }
  }

  function parseObject(): void {
    // index is at '{'
    index++;
    skipWhitespace();

    if (index < length && rawJson.charAt(index) === "}") {
      index++;
      return;
    }

    const seenKeys = new Set<string>();

    while (index < length) {
      skipWhitespace();

      if (index >= length || rawJson.charAt(index) !== '"') {
        throw new GuardError(
          "INVALID_RAW_JSON",
          "Expected double-quoted property key in JSON object",
        );
      }

      const key = parseString();

      if (seenKeys.has(key)) {
        throw new GuardError(
          "DUPLICATE_JSON_KEY",
          `Duplicate object key detected: "${key}"`,
        );
      }
      seenKeys.add(key);

      skipWhitespace();

      if (index >= length || rawJson.charAt(index) !== ":") {
        throw new GuardError(
          "INVALID_RAW_JSON",
          "Expected ':' after property key in JSON object",
        );
      }
      index++; // skip ':'

      parseValue();

      skipWhitespace();

      if (index >= length) {
        throw new GuardError("INVALID_RAW_JSON", "Unterminated JSON object");
      }

      const nextChar = rawJson.charAt(index);
      if (nextChar === "}") {
        index++;
        return;
      }

      if (nextChar === ",") {
        index++;
        skipWhitespace();
        if (index < length && rawJson.charAt(index) === "}") {
          throw new GuardError(
            "INVALID_RAW_JSON",
            "Trailing comma in JSON object",
          );
        }
      } else {
        throw new GuardError(
          "INVALID_RAW_JSON",
          "Expected ',' or '}' in JSON object",
        );
      }
    }

    throw new GuardError("INVALID_RAW_JSON", "Unterminated JSON object");
  }

  function parseArray(): void {
    // index is at '['
    index++;
    skipWhitespace();

    if (index < length && rawJson.charAt(index) === "]") {
      index++;
      return;
    }

    while (index < length) {
      parseValue();

      skipWhitespace();

      if (index >= length) {
        throw new GuardError("INVALID_RAW_JSON", "Unterminated JSON array");
      }

      const nextChar = rawJson.charAt(index);
      if (nextChar === "]") {
        index++;
        return;
      }

      if (nextChar === ",") {
        index++;
        skipWhitespace();
        if (index < length && rawJson.charAt(index) === "]") {
          throw new GuardError(
            "INVALID_RAW_JSON",
            "Trailing comma in JSON array",
          );
        }
      } else {
        throw new GuardError(
          "INVALID_RAW_JSON",
          "Expected ',' or ']' in JSON array",
        );
      }
    }

    throw new GuardError("INVALID_RAW_JSON", "Unterminated JSON array");
  }

  function parseValue(): void {
    skipWhitespace();

    if (index >= length) {
      throw new GuardError("INVALID_RAW_JSON", "Unexpected end of JSON input");
    }

    const ch = rawJson.charAt(index);

    if (ch === "{") {
      parseObject();
    } else if (ch === "[") {
      parseArray();
    } else if (ch === '"') {
      parseString();
    } else if (ch === "t") {
      if (rawJson.substring(index, index + 4) === "true") {
        index += 4;
      } else {
        throw new GuardError("INVALID_RAW_JSON", "Invalid JSON token");
      }
    } else if (ch === "f") {
      if (rawJson.substring(index, index + 5) === "false") {
        index += 5;
      } else {
        throw new GuardError("INVALID_RAW_JSON", "Invalid JSON token");
      }
    } else if (ch === "n") {
      if (rawJson.substring(index, index + 4) === "null") {
        index += 4;
      } else {
        throw new GuardError("INVALID_RAW_JSON", "Invalid JSON token");
      }
    } else if (ch === "-" || (ch >= "0" && ch <= "9")) {
      parseNumber();
    } else {
      throw new GuardError("INVALID_RAW_JSON", `Unexpected JSON token '${ch}'`);
    }
  }

  try {
    skipWhitespace();
    if (index >= length) {
      return {
        ok: false,
        code: "INVALID_RAW_JSON",
        message: "JSON text must not be empty",
      };
    }

    parseValue();

    skipWhitespace();
    if (index < length) {
      return {
        ok: false,
        code: "INVALID_RAW_JSON",
        message: "Unexpected extra content after JSON value",
      };
    }

    return { ok: true };
  } catch (err) {
    if (err instanceof GuardError) {
      return {
        ok: false,
        code: err.code,
        message: err.message,
      };
    }
    return {
      ok: false,
      code: "INVALID_RAW_JSON",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

class GuardError extends Error {
  readonly code: RawJsonGuardErrorCode;

  constructor(code: RawJsonGuardErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "GuardError";
  }
}
