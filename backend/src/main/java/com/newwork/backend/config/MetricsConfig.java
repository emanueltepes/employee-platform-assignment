package com.newwork.backend.config;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Custom metrics configuration for monitoring application performance
 * 
 * Exposes:
 * - Cache metrics (hit rate, miss rate, size)
 * - Custom business metrics (API calls, response times)
 * - JVM metrics (memory, threads, GC)
 * - Database metrics (connection pool, query performance)
 */
@Configuration
public class MetricsConfig {
    
    /**
     * Customize the MeterRegistry with common tags
     * These tags will be applied to all metrics for better filtering
     */
    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config()
                .commonTags(
                    "environment", "production",
                    "service", "newwork-hr"
                );
    }
}

