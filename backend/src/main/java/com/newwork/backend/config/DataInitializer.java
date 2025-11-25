package com.newwork.backend.config;

import com.newwork.backend.entity.Absence;
import com.newwork.backend.entity.Employee;
import com.newwork.backend.entity.User;
import com.newwork.backend.repository.AbsenceRepository;
import com.newwork.backend.repository.EmployeeRepository;
import com.newwork.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final AbsenceRepository absenceRepository;
    private final PasswordEncoder passwordEncoder;
    
    private static final String[] FIRST_NAMES = {
            "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
            "William", "Barbara", "David", "Elizabeth", "Richard", "Susan", "Joseph", "Jessica",
            "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa"
    };
    
    private static final String[] LAST_NAMES = {
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
            "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor",
            "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Clark"
    };
    
    private static final String[] DEPARTMENTS = {
            "Engineering", "Human Resources", "Sales", "Marketing", "Finance", "Operations",
            "Customer Service", "Design", "Product", "Legal", "Research & Development"
    };
    
    private static final String[] POSITIONS = {
            "Software Engineer", "Senior Engineer", "Team Lead", "Manager", "Director",
            "Designer", "Analyst", "Specialist", "Coordinator", "Associate", "Executive",
            "Consultant", "Administrator", "Developer", "Architect", "Strategist"
    };
    
    private static final String[] BUILDINGS = {
            "Building A", "Building B", "Building C", "Building D", "Building E"
    };
    
    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            long startTime = System.currentTimeMillis();
            log.info("🚀 Initializing 200 employees with parallel processing...");
            
            // Create test users first
            createTestUsers();
            
            // Multi-threaded employee generation
            int totalEmployees = 200;
            int batchSize = 50;
            int numBatches = totalEmployees / batchSize;
            int numThreads = Runtime.getRuntime().availableProcessors(); // Use all available CPU cores
            
            log.info("💻 Using {} threads for parallel processing", numThreads);
            
            // Create thread pool
            ExecutorService executorService = Executors.newFixedThreadPool(numThreads);
            AtomicInteger completedBatches = new AtomicInteger(0);
            
            // Submit all batch creation tasks
            List<CompletableFuture<Void>> futures = new ArrayList<>();
            
            for (int batchNum = 0; batchNum < numBatches; batchNum++) {
                final int batch = batchNum;
                CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                    createEmployeeBatch(batch, batchSize);
                    int completed = completedBatches.incrementAndGet();
                    log.info("✅ Completed batch {}/{} ({} / {} employees)", 
                            completed, numBatches, completed * batchSize, totalEmployees);
                }, executorService);
                
                futures.add(future);
            }
            
            // Wait for all tasks to complete
            try {
                CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).get();
                executorService.shutdown();
                executorService.awaitTermination(60, TimeUnit.SECONDS);
            } catch (InterruptedException | ExecutionException e) {
                log.error("Error during parallel employee creation", e);
                executorService.shutdownNow();
            }
            
            long endTime = System.currentTimeMillis();
            double seconds = (endTime - startTime) / 1000.0;
            log.info("🎉 Successfully initialized {} employees in {:.2f} seconds!", 
                    totalEmployees + 3, seconds);
            log.info("⚡ Average: {:.0f} employees/second", (totalEmployees / seconds));
            
            // Create sample absence requests
            log.info("📅 Creating sample absence requests...");
            createSampleAbsences();
            
            log.info("");
            log.info("Test users:");
            log.info("  Manager - username: manager, password: password123");
            log.info("  Employee - username: employee, password: password123");
            log.info("  Coworker - username: coworker, password: password123");
        }
    }
    
    private void createEmployeeBatch(int batchNum, int batchSize) {
        Random random = new Random();
        List<Employee> employeeBatch = new ArrayList<>();
        
        for (int i = 0; i < batchSize; i++) {
            int employeeNum = batchNum * batchSize + i + 1;
            
            String firstName = FIRST_NAMES[random.nextInt(FIRST_NAMES.length)];
            String lastName = LAST_NAMES[random.nextInt(LAST_NAMES.length)];
            String department = DEPARTMENTS[random.nextInt(DEPARTMENTS.length)];
            String position = POSITIONS[random.nextInt(POSITIONS.length)];
            String building = BUILDINGS[random.nextInt(BUILDINGS.length)];
            int floor = random.nextInt(10) + 1;
            
            // Create user without password (non-login employees)
            User user = User.builder()
                    .username("emp" + employeeNum)
                    .password(passwordEncoder.encode("password123"))
                    .email("emp" + employeeNum + "@newwork.com")
                    .role(User.Role.EMPLOYEE)
                    .build();
            user = userRepository.save(user);
            
            // Create employee with varied realistic data
            Employee employee = Employee.builder()
                    .user(user)
                    .firstName(firstName)
                    .lastName(lastName + " " + employeeNum)
                    .position(position)
                    .department(department)
                    .phone("+1" + String.format("%010d", random.nextInt(1000000000)))
                    .officeLocation(building + ", Floor " + floor)
                    .salary(40000.0 + random.nextInt(160000))
                    .dateOfBirth(LocalDate.of(1960 + random.nextInt(40), 
                            random.nextInt(12) + 1, 
                            random.nextInt(28) + 1))
                    .socialSecurityNumber(String.format("%03d-%02d-%04d", 
                            random.nextInt(900) + 100,
                            random.nextInt(100),
                            random.nextInt(10000)))
                    .bankAccount("DE" + String.format("%020d", Math.abs(random.nextLong())))
                    .address(employeeNum + " Main Street, City " + (random.nextInt(50) + 1))
                    .emergencyContact("Emergency Contact: +1" + String.format("%010d", random.nextInt(1000000000)))
                    .hireDate(LocalDate.of(2015 + random.nextInt(10), 
                            random.nextInt(12) + 1, 
                            random.nextInt(28) + 1))
                    .contractType(random.nextBoolean() ? "Full-time" : "Part-time")
                    .build();
            
            employeeBatch.add(employee);
        }
        
        // Batch save for better performance
        employeeRepository.saveAll(employeeBatch);
    }
    
    private void createTestUsers() {
            // Create a manager user
            User managerUser = User.builder()
                    .username("manager")
                    .password(passwordEncoder.encode("password123"))
                    .email("manager@newwork.com")
                    .role(User.Role.MANAGER)
                    .build();
            managerUser = userRepository.save(managerUser);
            
            Employee manager = Employee.builder()
                    .user(managerUser)
                    .firstName("John")
                    .lastName("Manager")
                    .position("HR Manager")
                    .department("Human Resources")
                    .phone("+1234567890")
                    .officeLocation("Building A, Floor 3")
                .salary(120000.0)
                    .dateOfBirth(LocalDate.of(1985, 5, 15))
                    .socialSecurityNumber("123-45-6789")
                    .bankAccount("DE89370400440532013000")
                    .address("123 Manager Street, City")
                    .emergencyContact("Jane Manager: +1234567891")
                    .hireDate(LocalDate.of(2020, 1, 1))
                    .contractType("Full-time")
                    .build();
            employeeRepository.save(manager);
            
            // Create an employee user
            User employeeUser = User.builder()
                    .username("employee")
                    .password(passwordEncoder.encode("password123"))
                    .email("employee@newwork.com")
                    .role(User.Role.EMPLOYEE)
                    .build();
            employeeUser = userRepository.save(employeeUser);
            
            Employee employee = Employee.builder()
                    .user(employeeUser)
                    .firstName("Alice")
                    .lastName("Smith")
                    .position("Software Engineer")
                    .department("Engineering")
                    .phone("+1234567892")
                    .officeLocation("Building B, Floor 2")
                .salary(95000.0)
                    .dateOfBirth(LocalDate.of(1990, 8, 20))
                    .socialSecurityNumber("987-65-4321")
                    .bankAccount("DE89370400440532013001")
                    .address("456 Employee Avenue, City")
                    .emergencyContact("Bob Smith: +1234567893")
                    .hireDate(LocalDate.of(2021, 6, 15))
                    .contractType("Full-time")
                    .build();
            employeeRepository.save(employee);
            
            // Create a coworker user
            User coworkerUser = User.builder()
                    .username("coworker")
                    .password(passwordEncoder.encode("password123"))
                    .email("coworker@newwork.com")
                    .role(User.Role.COWORKER)
                    .build();
            coworkerUser = userRepository.save(coworkerUser);
            
            Employee coworker = Employee.builder()
                    .user(coworkerUser)
                    .firstName("Bob")
                    .lastName("Johnson")
                    .position("Product Designer")
                    .department("Design")
                    .phone("+1234567894")
                    .officeLocation("Building B, Floor 1")
                .salary(85000.0)
                    .dateOfBirth(LocalDate.of(1992, 3, 10))
                    .socialSecurityNumber("555-55-5555")
                    .bankAccount("DE89370400440532013002")
                    .address("789 Coworker Lane, City")
                    .emergencyContact("Mary Johnson: +1234567895")
                    .hireDate(LocalDate.of(2022, 3, 1))
                    .contractType("Full-time")
                    .build();
            employeeRepository.save(coworker);
    }
    
    private void createSampleAbsences() {
        Random random = new Random();
        List<Employee> allEmployees = employeeRepository.findAll();
        List<Absence> absences = new ArrayList<>();
        
        // Sample absence types and reasons
        Absence.AbsenceType[] types = Absence.AbsenceType.values();
        String[] vacationReasons = {
            "Family vacation", "Wedding trip", "Beach holiday", "Mountain retreat", "Visit relatives"
        };
        String[] sickReasons = {
            "Flu symptoms", "Medical appointment", "Recovery period", "Minor surgery", "Doctor's orders"
        };
        String[] personalReasons = {
            "Moving houses", "Family emergency", "Personal matters", "House repairs", "Legal appointment"
        };
        
        // Create 30-50 absence requests across different employees
        int numAbsences = 30 + random.nextInt(21);
        
        for (int i = 0; i < numAbsences && i < allEmployees.size(); i++) {
            Employee employee = allEmployees.get(random.nextInt(allEmployees.size()));
            Absence.AbsenceType type = types[random.nextInt(types.length)];
            
            // Generate dates
            LocalDate today = LocalDate.now();
            int daysFromToday = random.nextInt(60) - 30; // Between -30 and +30 days
            LocalDate startDate = today.plusDays(daysFromToday);
            LocalDate endDate = startDate.plusDays(1 + random.nextInt(14)); // 1-14 days duration
            
            // Select reason based on type
            String reason = "";
            switch (type) {
                case VACATION -> reason = vacationReasons[random.nextInt(vacationReasons.length)];
                case SICK_LEAVE -> reason = sickReasons[random.nextInt(sickReasons.length)];
                case PERSONAL_LEAVE -> reason = personalReasons[random.nextInt(personalReasons.length)];
                case MATERNITY_PATERNITY -> reason = "Parental leave";
                case OTHER -> reason = "Other personal reasons";
            }
            
            // Determine status - more pending for future dates, more approved/rejected for past
            Absence.AbsenceStatus status;
            if (daysFromToday > 0) {
                // Future dates: 70% pending, 20% approved, 10% rejected
                int statusRoll = random.nextInt(100);
                if (statusRoll < 70) {
                    status = Absence.AbsenceStatus.PENDING;
                } else if (statusRoll < 90) {
                    status = Absence.AbsenceStatus.APPROVED;
                } else {
                    status = Absence.AbsenceStatus.REJECTED;
                }
            } else {
                // Past dates: 10% pending, 70% approved, 20% rejected
                int statusRoll = random.nextInt(100);
                if (statusRoll < 10) {
                    status = Absence.AbsenceStatus.PENDING;
                } else if (statusRoll < 80) {
                    status = Absence.AbsenceStatus.APPROVED;
                } else {
                    status = Absence.AbsenceStatus.REJECTED;
                }
            }
            
            Absence absence = Absence.builder()
                    .employee(employee)
                    .startDate(startDate)
                    .endDate(endDate)
                    .type(type)
                    .reason(reason)
                    .status(status)
                    .build();
            
            // Set approver for non-pending requests
            if (status != Absence.AbsenceStatus.PENDING) {
                absence.setApprovedBy("John Manager");
                absence.setApprovedAt(LocalDate.now().minusDays(random.nextInt(30)).atTime(9, 0));
            }
            
            absences.add(absence);
        }
        
        // Batch save
        absenceRepository.saveAll(absences);
        
        long pendingCount = absences.stream()
                .filter(a -> a.getStatus() == Absence.AbsenceStatus.PENDING)
                .count();
        long approvedCount = absences.stream()
                .filter(a -> a.getStatus() == Absence.AbsenceStatus.APPROVED)
                .count();
        long rejectedCount = absences.stream()
                .filter(a -> a.getStatus() == Absence.AbsenceStatus.REJECTED)
                .count();
        
        log.info("✅ Created {} absence requests (Pending: {}, Approved: {}, Rejected: {})", 
                absences.size(), pendingCount, approvedCount, rejectedCount);
    }
}

