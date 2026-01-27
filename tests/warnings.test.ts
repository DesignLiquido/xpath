/**
 * Tests for XPath Warning System (Phase 8.2)
 */

import {
    WarningCollector,
    createWarningCollector,
    createNoOpWarningCollector,
    WARNING_CODES,
    getWarningMetadata,
    isValidWarningCode,
    getAllWarningCodes,
    getWarningCodesByCategory,
    getWarningCodesBySeverity,
    formatWarning,
    formatWarningCodeDescription,
    XPathWarning,
    WarningSeverity,
    WarningCategory,
} from '../src/warnings';

describe('Warning System', () => {
    describe('WarningCollector', () => {
        it('should collect warnings when emit is called', () => {
            const collector = createWarningCollector();
            collector.emit('XPWD0001', 'test context');

            expect(collector.hasWarnings()).toBe(true);
            expect(collector.count()).toBe(1);

            const warnings = collector.getWarnings();
            expect(warnings[0].code).toBe('XPWD0001');
            expect(warnings[0].context).toBe('test context');
        });

        it('should not collect warnings when disabled', () => {
            const collector = createWarningCollector({ enabled: false });
            collector.emit('XPWD0001', 'test context');

            expect(collector.hasWarnings()).toBe(false);
            expect(collector.count()).toBe(0);
        });

        it('should respect minimum severity level', () => {
            const collector = createWarningCollector({ minSeverity: 'warning' });

            // Info-level warning should be suppressed
            collector.emit('XPWP0001'); // performance info
            expect(collector.count()).toBe(0);

            // Warning-level should be collected
            collector.emit('XPWC0001'); // compatibility warning
            expect(collector.count()).toBe(1);
        });

        it('should suppress specified warning codes', () => {
            const collector = createWarningCollector({
                suppressCodes: ['XPWD0001'],
            });

            collector.emit('XPWD0001');
            expect(collector.count()).toBe(0);

            collector.emit('XPWD0002');
            expect(collector.count()).toBe(1);
        });

        it('should suppress specified categories', () => {
            const collector = createWarningCollector({
                suppressCategories: ['deprecation'],
            });

            collector.emit('XPWD0001'); // deprecation
            expect(collector.count()).toBe(0);

            collector.emit('XPWC0001'); // compatibility
            expect(collector.count()).toBe(1);
        });

        it('should emit each warning only once when emitOnce is true', () => {
            const collector = createWarningCollector({ emitOnce: true });

            collector.emit('XPWD0001');
            collector.emit('XPWD0001');
            collector.emit('XPWD0001');

            expect(collector.count()).toBe(1);
        });

        it('should emit same warning multiple times when emitOnce is false', () => {
            const collector = createWarningCollector({ emitOnce: false });

            collector.emit('XPWD0001');
            collector.emit('XPWD0001');
            collector.emit('XPWD0001');

            expect(collector.count()).toBe(3);
        });

        it('should respect maxWarnings limit', () => {
            const collector = createWarningCollector({ maxWarnings: 2, emitOnce: false });

            collector.emit('XPWD0001');
            collector.emit('XPWD0001');
            collector.emit('XPWD0001');

            expect(collector.count()).toBe(2);
        });

        it('should call custom handler when provided', () => {
            const warnings: XPathWarning[] = [];
            const collector = createWarningCollector({
                handler: (warning) => warnings.push(warning),
            });

            collector.emit('XPWD0001', 'test');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].code).toBe('XPWD0001');
        });

        it('should filter warnings by severity', () => {
            const collector = createWarningCollector({ emitOnce: false });

            collector.emit('XPWD0001'); // deprecation
            collector.emit('XPWC0001'); // warning
            collector.emit('XPWP0001'); // info

            const deprecations = collector.getWarningsBySeverity('deprecation');
            expect(deprecations).toHaveLength(1);
            expect(deprecations[0].code).toBe('XPWD0001');
        });

        it('should filter warnings by category', () => {
            const collector = createWarningCollector({ emitOnce: false });

            collector.emit('XPWD0001'); // deprecation
            collector.emit('XPWC0001'); // compatibility
            collector.emit('XPWP0001'); // performance

            const performance = collector.getWarningsByCategory('performance');
            expect(performance).toHaveLength(1);
            expect(performance[0].code).toBe('XPWP0001');
        });

        it('should clear warnings', () => {
            const collector = createWarningCollector();

            collector.emit('XPWD0001');
            expect(collector.count()).toBe(1);

            collector.clear();
            expect(collector.count()).toBe(0);
            expect(collector.hasWarnings()).toBe(false);
        });

        it('should format report correctly', () => {
            const collector = createWarningCollector();

            collector.emit('XPWD0001', 'namespace axis usage');
            collector.emit('XPWC0001', 'compatibility mode');

            const report = collector.formatReport();
            expect(report).toContain('XPath Warnings Report');
            expect(report).toContain('XPWD0001');
            expect(report).toContain('XPWC0001');
            expect(report).toContain('Deprecated Features');
            expect(report).toContain('Compatibility Issues');
        });

        it('should format empty report correctly', () => {
            const collector = createWarningCollector();
            const report = collector.formatReport();
            expect(report).toBe('No warnings.');
        });

        it('should emit custom warnings', () => {
            const collector = createWarningCollector();

            collector.emitCustom({
                code: 'CUSTOM0001',
                message: 'Custom warning message',
                severity: 'warning',
                category: 'compatibility',
            });

            expect(collector.count()).toBe(1);
            expect(collector.getWarnings()[0].code).toBe('CUSTOM0001');
        });

        it('should handle unknown warning codes gracefully', () => {
            const collector = createWarningCollector();

            collector.emit('UNKNOWN0001', 'unknown context');

            expect(collector.count()).toBe(1);
            const warning = collector.getWarnings()[0];
            expect(warning.code).toBe('UNKNOWN0001');
            expect(warning.message).toContain('Unknown warning');
        });
    });

    describe('createNoOpWarningCollector', () => {
        it('should create a collector that does not collect warnings', () => {
            const collector = createNoOpWarningCollector();

            collector.emit('XPWD0001');
            collector.emit('XPWC0001');

            expect(collector.hasWarnings()).toBe(false);
            expect(collector.count()).toBe(0);
        });
    });

    describe('WARNING_CODES', () => {
        it('should have all expected deprecation warnings', () => {
            expect(WARNING_CODES.XPWD0001).toBeDefined();
            expect(WARNING_CODES.XPWD0001.severity).toBe('deprecation');
            expect(WARNING_CODES.XPWD0001.category).toBe('deprecation');
        });

        it('should have all expected compatibility warnings', () => {
            expect(WARNING_CODES.XPWC0001).toBeDefined();
            expect(WARNING_CODES.XPWC0001.severity).toBe('warning');
            expect(WARNING_CODES.XPWC0001.category).toBe('compatibility');
        });

        it('should have all expected type coercion warnings', () => {
            expect(WARNING_CODES.XPWT0001).toBeDefined();
            expect(WARNING_CODES.XPWT0001.category).toBe('type-coercion');
        });

        it('should have all expected behavior change warnings', () => {
            expect(WARNING_CODES.XPWB0001).toBeDefined();
            expect(WARNING_CODES.XPWB0001.category).toBe('behavior-change');
        });

        it('should have all expected performance warnings', () => {
            expect(WARNING_CODES.XPWP0001).toBeDefined();
            expect(WARNING_CODES.XPWP0001.severity).toBe('info');
            expect(WARNING_CODES.XPWP0001.category).toBe('performance');
        });

        it('should have migration guidance for deprecation warnings', () => {
            expect(WARNING_CODES.XPWD0001.migration).toBeDefined();
            expect(WARNING_CODES.XPWD0001.migration!.length).toBeGreaterThan(0);
        });

        it('should have spec references where applicable', () => {
            expect(WARNING_CODES.XPWD0001.specReference).toBeDefined();
        });
    });

    describe('Helper Functions', () => {
        describe('getWarningMetadata', () => {
            it('should return metadata for known codes', () => {
                const meta = getWarningMetadata('XPWD0001');
                expect(meta).toBeDefined();
                expect(meta!.code).toBe('XPWD0001');
                expect(meta!.title).toBe('Namespace axis deprecated');
            });

            it('should return undefined for unknown codes', () => {
                const meta = getWarningMetadata('UNKNOWN0001');
                expect(meta).toBeUndefined();
            });
        });

        describe('isValidWarningCode', () => {
            it('should return true for valid codes', () => {
                expect(isValidWarningCode('XPWD0001')).toBe(true);
                expect(isValidWarningCode('XPWC0001')).toBe(true);
            });

            it('should return false for invalid codes', () => {
                expect(isValidWarningCode('UNKNOWN0001')).toBe(false);
                expect(isValidWarningCode('')).toBe(false);
            });
        });

        describe('getAllWarningCodes', () => {
            it('should return all warning codes', () => {
                const codes = getAllWarningCodes();
                expect(codes).toContain('XPWD0001');
                expect(codes).toContain('XPWC0001');
                expect(codes).toContain('XPWT0001');
                expect(codes).toContain('XPWB0001');
                expect(codes).toContain('XPWP0001');
                expect(codes.length).toBeGreaterThanOrEqual(10);
            });
        });

        describe('getWarningCodesByCategory', () => {
            it('should return codes for deprecation category', () => {
                const codes = getWarningCodesByCategory('deprecation');
                expect(codes).toContain('XPWD0001');
                expect(codes.every((code) => WARNING_CODES[code].category === 'deprecation')).toBe(
                    true
                );
            });

            it('should return codes for compatibility category', () => {
                const codes = getWarningCodesByCategory('compatibility');
                expect(codes).toContain('XPWC0001');
            });
        });

        describe('getWarningCodesBySeverity', () => {
            it('should return codes for deprecation severity', () => {
                const codes = getWarningCodesBySeverity('deprecation');
                expect(codes).toContain('XPWD0001');
            });

            it('should return codes for info severity', () => {
                const codes = getWarningCodesBySeverity('info');
                expect(codes).toContain('XPWP0001');
            });
        });

        describe('formatWarning', () => {
            it('should format a warning with all details', () => {
                const warning: XPathWarning = {
                    code: 'XPWD0001',
                    message: 'Test message',
                    severity: 'deprecation',
                    category: 'deprecation',
                    context: 'test context',
                };

                const formatted = formatWarning(warning);
                expect(formatted).toContain('XPWD0001');
                expect(formatted).toContain('Namespace axis deprecated');
                expect(formatted).toContain('test context');
                expect(formatted).toContain('Migration');
            });
        });

        describe('formatWarningCodeDescription', () => {
            it('should format known warning codes', () => {
                const desc = formatWarningCodeDescription('XPWD0001');
                expect(desc).toContain('XPWD0001');
                expect(desc).toContain('Namespace axis deprecated');
            });

            it('should handle unknown codes', () => {
                const desc = formatWarningCodeDescription('UNKNOWN0001');
                expect(desc).toContain('Unknown warning');
            });
        });
    });
});

describe('Parser Warning Integration', () => {
    // Import parser for integration tests
    const { XPath10Parser, XPath20Parser } = require('../src/parser');
    const { XPathLexer } = require('../src/lexer');

    it('should emit deprecation warning for namespace axis', () => {
        const collector = createWarningCollector();
        const parser = new XPath10Parser({
            enableNamespaceAxis: true,
            warningCollector: collector,
        });
        const lexer = new XPathLexer();

        const tokens = lexer.scan('namespace::*');
        parser.parse(tokens);

        expect(collector.hasWarnings()).toBe(true);
        const warnings = collector.getWarnings();
        expect(warnings.some((w) => w.code === 'XPWD0001')).toBe(true);
    });

    it('should emit compatibility mode warning when using XPath 2.0 with compatibility', () => {
        const collector = createWarningCollector();
        const parser = new XPath20Parser({
            xpath10CompatibilityMode: true,
            warningCollector: collector,
        });
        const lexer = new XPathLexer();

        const tokens = lexer.scan('/root/element');
        parser.parse(tokens);

        expect(collector.hasWarnings()).toBe(true);
        const warnings = collector.getWarnings();
        expect(warnings.some((w) => w.code === 'XPWC0001')).toBe(true);
    });

    it('should not emit compatibility warning for XPath 1.0', () => {
        const collector = createWarningCollector();
        const parser = new XPath10Parser({
            xpath10CompatibilityMode: true,
            warningCollector: collector,
        });
        const lexer = new XPathLexer();

        const tokens = lexer.scan('/root/element');
        parser.parse(tokens);

        const warnings = collector.getWarnings();
        expect(warnings.every((w) => w.code !== 'XPWC0001')).toBe(true);
    });

    it('should allow suppressing specific warnings', () => {
        const collector = createWarningCollector({
            suppressCodes: ['XPWD0001'],
        });
        const parser = new XPath10Parser({
            enableNamespaceAxis: true,
            warningCollector: collector,
        });
        const lexer = new XPathLexer();

        const tokens = lexer.scan('namespace::*');
        parser.parse(tokens);

        const warnings = collector.getWarnings();
        expect(warnings.every((w) => w.code !== 'XPWD0001')).toBe(true);
    });

    it('should make warning collector accessible via getWarningCollector', () => {
        const collector = createWarningCollector();
        const parser = new XPath10Parser({
            warningCollector: collector,
        });

        expect(parser.getWarningCollector()).toBe(collector);
    });

    it('should create default warning collector if none provided', () => {
        const parser = new XPath10Parser();
        const collector = parser.getWarningCollector();

        expect(collector).toBeDefined();
        expect(collector).toBeInstanceOf(WarningCollector);
    });

    it('should aggregate warnings across multiple parses with shared collector', () => {
        const collector = createWarningCollector({ emitOnce: false });
        const parser = new XPath10Parser({
            enableNamespaceAxis: true,
            warningCollector: collector,
        });
        const lexer = new XPathLexer();

        parser.parse(lexer.scan('namespace::*'));
        parser.parse(lexer.scan('namespace::prefix'));

        // With emitOnce: false, should have warnings from both parses
        expect(collector.count()).toBeGreaterThanOrEqual(2);
    });
});
