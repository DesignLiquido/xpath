import { errorFn } from '../src/functions';
import { getErrorCode, formatError } from '../src/errors';

describe('fn:error (Phase 9.3)', () => {
  it('throws with default code when none provided', () => {
    try {
      errorFn();
      fail('Expected fn:error to throw');
    } catch (e) {
      expect(getErrorCode(e)).toBe('FOER0000');
      expect(formatError(e)).toContain('Error raised via fn:error');
    }
  });

  it('throws with provided QName code and description', () => {
    try {
      errorFn('err:XPDY0002', 'Dynamic context missing');
      fail('Expected fn:error to throw');
    } catch (e) {
      expect(getErrorCode(e)).toBe('XPDY0002');
      expect(formatError(e)).toContain('Dynamic context missing');
    }
  });

  it('accepts Clark notation QName', () => {
    try {
      errorFn('{http://www.w3.org/2005/xqt-errors}XPTY0004', 'Type mismatch');
      fail('Expected fn:error to throw');
    } catch (e) {
      expect(getErrorCode(e)).toBe('XPTY0004');
      expect(formatError(e)).toContain('Type mismatch');
    }
  });

  it('includes error-object summary in message', () => {
    const obj = new Map<any, any>([["details", "extra"]]);
    try {
      errorFn('err:FOER0000', 'Something bad', obj);
      fail('Expected fn:error to throw');
    } catch (e) {
      const msg = formatError(e);
      expect(msg).toContain('Something bad');
      expect(msg).toContain('object:');
    }
  });
});
