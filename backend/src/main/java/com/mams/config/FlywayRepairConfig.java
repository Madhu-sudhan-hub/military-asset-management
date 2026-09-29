package com.mams.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayRepairConfig {

    @Bean
    public FlywayMigrationStrategy cleanMigrateStrategy() {
        return flyway -> {
            System.out.println("Executing Flyway CLEAN to wipe corrupted database schema...");
            flyway.clean();
            System.out.println("Database wiped perfectly. Hibernate ddl-auto will now generate the fresh schema.");
        };
    }
}
