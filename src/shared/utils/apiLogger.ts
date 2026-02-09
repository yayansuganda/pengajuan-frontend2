/**
 * API Debug Logger for Pengecekan Integration
 * 
 * Utility untuk logging dan debugging API calls ke Pos Indonesia
 */

interface APICallLog {
    timestamp: string;
    nopen: string;
    payload: object;
    headers: Record<string, string>;
    jwtToken: string;
    response?: any;
    error?: any;
    duration?: number;
}

class PengecekanAPILogger {
    private logs: APICallLog[] = [];
    private enabled: boolean = true;

    /**
     * Enable/disable logging
     */
    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    /**
     * Log API call
     */
    logAPICall(log: APICallLog) {
        if (!this.enabled) return;

        this.logs.push(log);

        console.group(`🔍 Pengecekan API Call - ${log.nopen}`);
        console.log('⏰ Timestamp:', log.timestamp);
        console.log('📦 Payload:', log.payload);
        console.log('🔑 JWT Token:', log.jwtToken);
        console.log('📋 Headers:', log.headers);

        if (log.response) {
            console.log('✅ Response:', log.response);
        }

        if (log.error) {
            console.error('❌ Error:', log.error);
        }

        if (log.duration) {
            console.log(`⏱️ Duration: ${log.duration}ms`);
        }

        console.groupEnd();
    }

    /**
     * Get all logs
     */
    getLogs(): APICallLog[] {
        return [...this.logs];
    }

    /**
     * Get logs for specific NOPEN
     */
    getLogsByNopen(nopen: string): APICallLog[] {
        return this.logs.filter(log => log.nopen === nopen);
    }

    /**
     * Get failed requests
     */
    getFailedRequests(): APICallLog[] {
        return this.logs.filter(log => log.error);
    }

    /**
     * Get successful requests
     */
    getSuccessfulRequests(): APICallLog[] {
        return this.logs.filter(log => log.response && !log.error);
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
        console.log('🗑️ API logs cleared');
    }

    /**
     * Export logs as JSON
     */
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }

    /**
     * Get statistics
     */
    getStats() {
        const total = this.logs.length;
        const successful = this.getSuccessfulRequests().length;
        const failed = this.getFailedRequests().length;
        const avgDuration = this.logs
            .filter(log => log.duration)
            .reduce((sum, log) => sum + (log.duration || 0), 0) / total || 0;

        return {
            total,
            successful,
            failed,
            successRate: total > 0 ? (successful / total * 100).toFixed(2) + '%' : '0%',
            avgDuration: avgDuration.toFixed(2) + 'ms'
        };
    }

    /**
     * Print statistics to console
     */
    printStats() {
        const stats = this.getStats();

        console.group('📊 Pengecekan API Statistics');
        console.log('Total Requests:', stats.total);
        console.log('Successful:', stats.successful);
        console.log('Failed:', stats.failed);
        console.log('Success Rate:', stats.successRate);
        console.log('Average Duration:', stats.avgDuration);
        console.groupEnd();
    }

    /**
     * Analyze JWT tokens
     */
    analyzeJWTTokens() {
        console.group('🔐 JWT Token Analysis');

        this.logs.forEach((log, index) => {
            const parts = log.jwtToken.split('.');
            console.log(`\nRequest #${index + 1} (NOPEN: ${log.nopen})`);
            console.log('Token:', log.jwtToken);
            console.log('Parts:', {
                header: parts[0],
                payload: parts[1],
                signature: parts[2]
            });
            console.log('Lengths:', {
                header: parts[0]?.length || 0,
                payload: parts[1]?.length || 0,
                signature: parts[2]?.length || 0,
                total: log.jwtToken.length
            });
        });

        console.groupEnd();
    }

    /**
     * Compare with expected JWT format
     */
    compareWithExpected(nopen: string, expectedToken: string) {
        const logs = this.getLogsByNopen(nopen);

        if (logs.length === 0) {
            console.warn(`No logs found for NOPEN: ${nopen}`);
            return;
        }

        const actualToken = logs[0].jwtToken;

        console.group(`🔍 JWT Comparison - NOPEN: ${nopen}`);
        console.log('Expected:', expectedToken);
        console.log('Actual:  ', actualToken);
        console.log('Match:', expectedToken === actualToken ? '✅ YES' : '❌ NO');

        if (expectedToken !== actualToken) {
            const expectedParts = expectedToken.split('.');
            const actualParts = actualToken.split('.');

            console.log('\nPart-by-part comparison:');
            console.log('Header match:', expectedParts[0] === actualParts[0] ? '✅' : '❌');
            console.log('Payload match:', expectedParts[1] === actualParts[1] ? '✅' : '❌');
            console.log('Signature match:', expectedParts[2] === actualParts[2] ? '✅' : '❌');
        }

        console.groupEnd();
    }
}

// Singleton instance
const apiLogger = new PengecekanAPILogger();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
    (window as any).pengecekanAPILogger = apiLogger;
}

export { PengecekanAPILogger, apiLogger };
export type { APICallLog };

/**
 * Usage in Browser Console:
 * 
 * // Get logger instance
 * const logger = window.pengecekanAPILogger;
 * 
 * // View all logs
 * logger.getLogs();
 * 
 * // View statistics
 * logger.printStats();
 * 
 * // View failed requests
 * logger.getFailedRequests();
 * 
 * // Analyze JWT tokens
 * logger.analyzeJWTTokens();
 * 
 * // Compare with expected token
 * logger.compareWithExpected('08000511000', 'eyJhbGc...');
 * 
 * // Export logs
 * console.log(logger.exportLogs());
 * 
 * // Clear logs
 * logger.clearLogs();
 */
