package com.newwork.backend.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Simple in-memory cache configuration using Spring's built-in cache.
 * No serialization issues, perfect for development and moderate traffic.
 * For production with multiple instances, consider Redis with proper serialization.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    // Cache names as constants
    public static final String EMPLOYEE_BY_ID_CACHE = "employee";
    public static final String EMPLOYEES_CACHE = "employees";
    public static final String FEEDBACKS_CACHE = "feedbacks";

    @Bean
    public CacheManager cacheManager() {
        // Simple in-memory cache - no serialization, stores Java objects directly
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager(
                EMPLOYEE_BY_ID_CACHE,
                EMPLOYEES_CACHE,
                FEEDBACKS_CACHE
        );
        
        // Allow dynamic cache creation
        cacheManager.setAllowNullValues(false);
        
        return cacheManager;
    }
}
