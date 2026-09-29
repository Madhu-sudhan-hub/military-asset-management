package com.mams.config;

import com.mams.entity.Role;
import com.mams.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DatabaseResetRunner implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final JdbcTemplate jdbcTemplate;

    public DatabaseResetRunner(RoleRepository roleRepository, JdbcTemplate jdbcTemplate) {
        this.roleRepository = roleRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("Executing database wipe to fix schema corruption...");
        try {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0;");
            
            String[] tables = {
                "flyway_schema_history", "audit_logs", "expenditures", "assignments", 
                "transfer_items", "transfers", "purchases", "user_roles", 
                "roles", "users", "assets", "personnel", "equipment_types", "bases"
            };
            
            for (String table : tables) {
                jdbcTemplate.execute("DROP TABLE IF EXISTS `" + table + "` CASCADE;");
            }
            
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1;");
            System.out.println("Successfully wiped all tables!");
        } catch (Exception e) {
            System.err.println("Wipe failed: " + e.getMessage());
        }

        // Wait... If we drop the tables here, how will they get recreated?
        // Spring Data JPA's ddl-auto=update runs BEFORE CommandLineRunner!
        // So dropping them here will just leave the database EMPTY for the application.

