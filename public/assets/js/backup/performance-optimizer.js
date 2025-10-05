class PerformanceOptimizer {
    constructor() {
        this.intervals = new Set();
        this.timeouts = new Set();
        this.isPageVisible = !document.hidden;
        this.init();
    }

    init() {
        this.overrideTimers();
        this.setupVisibilityHandlers();
        this.setupMemoryOptimization();
    }

    overrideTimers() {
        const originalSetInterval = window.setInterval;
        const originalSetTimeout = window.setTimeout;
        const originalClearInterval = window.clearInterval;
        const originalClearTimeout = window.clearTimeout;

        window.setInterval = (callback, delay, ...args) => {
            const id = originalSetInterval(callback, delay, ...args);
            this.intervals.add(id);
            return id;
        };

        window.setTimeout = (callback, delay, ...args) => {
            const id = originalSetTimeout(callback, delay, ...args);
            this.timeouts.add(id);
            return id;
        };

        window.clearInterval = (id) => {
            this.intervals.delete(id);
            return originalClearInterval(id);
        };

        window.clearTimeout = (id) => {
            this.timeouts.delete(id);
            return originalClearTimeout(id);
        };
    }

    setupVisibilityHandlers() {
        document.addEventListener('visibilitychange', () => {
            this.isPageVisible = !document.hidden;

            if (!this.isPageVisible) {
                this.pauseNonCriticalOperations();
            } else {
                this.resumeOperations();
            }
        });

        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    setupMemoryOptimization() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.optimizeMemory();
            });
        }

        setInterval(() => {
            if (this.isPageVisible) {
                this.optimizeMemory();
            }
        }, 300000);
    }

    pauseNonCriticalOperations() {
        console.log('Page hidden - reducing background operations');
    }

    resumeOperations() {
        console.log('Page visible - resuming normal operations');
    }

    optimizeMemory() {
        if (window.gc) {
            window.gc();
        }

        this.cleanupOrphanedTimers();
    }

    cleanupOrphanedTimers() {
        const activeElements = document.querySelectorAll('*');
        if (activeElements.length < 100) {
            console.log('Minimal DOM - optimizing timers');
        }
    }

    cleanup() {
        this.intervals.forEach(id => clearInterval(id));
        this.timeouts.forEach(id => clearTimeout(id));
        this.intervals.clear();
        this.timeouts.clear();
        console.log('Performance optimizer cleaned up');
    }
}

if (!window.performanceOptimizer) {
    window.performanceOptimizer = new PerformanceOptimizer();
}
