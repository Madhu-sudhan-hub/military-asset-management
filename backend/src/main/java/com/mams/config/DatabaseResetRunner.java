package com.mams.config;

import com.mams.entity.Role;
import com.mams.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseResetRunner implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DatabaseResetRunner(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            Role admin = new Role();
            admin.setRoleName("ADMIN");
            roleRepository.save(admin);

            Role commander = new Role();
            commander.setRoleName("BASE_COMMANDER");
            roleRepository.save(commander);

            Role logistics = new Role();
            logistics.setRoleName("LOGISTICS_OFFICER");
            roleRepository.save(logistics);
            
            System.out.println("Inserted default roles successfully!");
        }
    }
}
