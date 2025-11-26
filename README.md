# Employee Management Platform - Demo project vibe coded with Sonnet 4.5

A full-stack enterprise HR management system featuring multiple user roles, absence requests, and AI-powered feedback generation. The purpose of this project is to showcase a few backend concepts such as caching, pagination, circuit breakers, api integrations, etc.

## 

**App is deployed and accessible on Render:** [try it here](https://employee-platform-assignment-fronend.onrender.com)  

You might need to prewarm the backend too [here](https://employee-platform-assignment.onrender.com/actuator/health)


### Demo Credentials
- **Manager Account:** `manager` / `password123`
- **Employee Account:** `employee` / `password123`
- **Coworker Account:** `coworker` / `password123`

### 📖 How to Use the App

**As a Manager** (`manager` / `password123`):
1. **Dashboard**: Browse all employees with search and pagination
2. **Employee Profiles**: Click any employee to view/edit their full details
3. **Manage Absences**: View all pending requests in the "Absences" tab, approve or reject them
4. **Leave Feedback**: Visit any employee's profile to leave performance feedback
5. **AI Assistance**: Use the "Get AI Suggestions" button for professional feedback options

**As an Employee** (`employee` / `password123`):
1. **View Profile**: See your own employee information
2. **Request Time Off**: Create absence requests with date ranges and reasons
3. **Track Requests**: Monitor status of your absence requests (Pending/Approved/Rejected)
4. **Edit Contact Info**: Update your phone, address, and emergency contact
5. **View Feedback**: See feedback left by managers and coworkers

**As a Coworker** (`coworker` / `password123`):
1. **Browse Employees**: Search and view colleague profiles
2. **Leave Feedback**: Provide peer feedback for team members
3. **View Public Info**: Access basic information about other employees

**Key Features to Try**:
- 🔍 **Search**: Try searching for names, positions, or departments
- 📄 **Pagination**: Navigate through employee pages with smart page controls
- 🤖 **AI Feedback**: Generate 3 professional feedback suggestions 
- 📊 **System Health**: Check the header for real-time metrics (DB, Cache, Circuit Breaker)
- 🔔 **Live Notifications**: Badge updates when new absence requests are submitted
---

## ⚡ Quick Start with Docker

### Prerequisites
- Docker & Docker Compose
- (Optional) HuggingFace API key for AI feedback features

### Run Locally

```bash
# Clone the repository
git clone <repository-url>
cd employee-platform-assignment

# Set up environment variables (optional)
export HUGGINGFACE_API_KEY=your_api_key_here

# Start all services
./dev.sh

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# H2 Console: http://localhost:8080/h2-console
```

### Stop Services

```bash
./stop.sh
```

### View Logs

```bash
./logs.sh [service-name]  # backend, frontend, or redis
```

---

## 📋 Features

### Core Functionality
- **Employee Management**: CRUD operations with role-based access control
- **Absence Request System**: Create, approve/reject, and track employee absences
- **Feedback System**: AI-powered feedback generation with multiple suggestions
- **Real-time Notifications**: Badge notifications for pending absence requests
- **Advanced Search**: Full-text search across employee data with pagination

### Role-Based Permissions
- **Managers**: Full access to all employee data, can approve/reject absences
- **Employees**: View own profile, edit contact information, request absences

### AI Integration
- **Feedback Polishing**: Three AI-generated professional feedback options
- **Circuit Breaker Pattern**: Graceful degradation when AI service is unavailable
- **Async Processing**: Non-blocking AI requests for better performance

---

## 🏗️ Architecture

### System Overview

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   React     │◄────►│  Spring     │◄────►│  Postgres    │
│  Frontend   │      │   Boot      │      │   Database   │
└─────────────┘      └─────────────┘      └──────────────┘
                            │
                            ├──────────►┌──────────────┐
                            │           │    Redis     │
                            │           │    Cache     │
                            │           └──────────────┘
                            │
                            └──────────►┌──────────────┐
                                        │ HuggingFace  │
                                        │     API      │
                                        └──────────────┘
```

### Backend Architecture

#### Tech Stack
- **Framework**: Spring Boot 3.5.8
- **Language**: Java 17
- **Database**: Postgres (prod) , H2 - dev
- **Cache**: Redis/Valkey
- **Security**: Spring Security with JWT
- **Monitoring**: Spring Actuator + Micrometer + Prometheus
- **Resilience**: Resilience4j (Circuit Breaker, Async)

#### Performance Optimizations

1. **Redis Caching**
   - Employee list caching with 10-minute TTL
   - Automatic cache invalidation on updates
   - Custom serialization for Java 8 date/time types

2. **Query Optimization**
   - `@EntityGraph` annotations to prevent N+1 queries
   - Optimized pagination with indexed queries
   - Eager loading strategies for related entities

3. **Async Processing**
   - Non-blocking AI API calls with `@Async`
   - Configurable thread pool (10 threads)
   - Timeout handling (50s default)

4. **Circuit Breaker Pattern**
   - Protects against external API failures
   - Automatic recovery with half-open state
   - Configurable thresholds (50% failure rate, 10s wait)

#### Database Schema

**Core Entities:**
- `User`: Authentication and authorization
- `Employee`: Personal and professional information
- `Absence`: Time-off requests with approval workflow
- `Feedback`: Performance feedback with AI enhancement

**Relationships:**
- One-to-One: User ↔ Employee
- One-to-Many: Employee → Absences
- One-to-Many: Employee → Feedbacks

### Frontend Architecture

#### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v6

#### Key Features
- **Custom Hooks**: Reusable logic for employee, absence, and feedback management
- **Component Architecture**: Modular, single-responsibility components
- **Real-time Updates**: Custom event system for instant UI updates
- **Smart Pagination**: Optimized page number display with jump-to-page
- **Form Validation**: Client-side validation with date constraints

---

## 📊 Monitoring & Observability

### System Health Dashboard

The application includes a real-time system health header displaying:
- **System Status**: Overall application health
- **Database Status**: PostgreSQL/H2 connection state
- **Cache Status**: Redis availability
- **Circuit Breaker State**: AI service health (CLOSED/OPEN/HALF_OPEN)
- **AI API Calls**: Total successful calls counter

### Actuator Endpoints

Access metrics at `/actuator`:
- `/actuator/health` - Application health status
- `/actuator/metrics` - Detailed metrics
- `/actuator/prometheus` - Prometheus-compatible metrics

---

## 🧪 Testing

### Backend Unit Tests

Comprehensive test coverage for all service layers:

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=EmployeeServiceTest
```

**Test Coverage:**
- **EmployeeServiceTest** (7 tests): CRUD, pagination, search, role-based access
- **AbsenceServiceTest** (8 tests): Request lifecycle, approvals, permissions
- **FeedbackServiceTest** (8 tests): AI integration, authorization, validation

**Total: 24 tests, 100% passing** ✅

### Test Features
- Mockito for dependency mocking
- JUnit 5 for test framework
- SecurityContext mocking for authentication tests
- Lenient stubs for optional dependencies

---

## 🔧 Configuration

### Environment Variables

#### Backend
```bash
# Database (Production)
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/dbname
SPRING_DATASOURCE_USERNAME=username
SPRING_DATASOURCE_PASSWORD=password

# Security
JWT_SECRET=your-secret-key

# Redis Cache
REDIS_URL=redis://host:6379  # For Render/cloud deployment
# OR
REDIS_HOST=localhost          # For local Docker
REDIS_PORT=6379

# AI Integration (Optional)
HUGGINGFACE_API_KEY=your-api-key
HUGGINGFACE_MODEL=meta-llama/Meta-Llama-3-8B-Instruct
HUGGINGFACE_TIMEOUT=50
```

#### Frontend
```bash
VITE_API_URL=https://your-backend-url.com
```

---

## 📁 Project Structure

```
employee-platform-assignment/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/hrplatform/backend/
│   │   │   │   ├── config/          # Configuration classes
│   │   │   │   ├── controller/      # REST controllers
│   │   │   │   ├── dto/             # Data transfer objects
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   ├── mapper/          # MapStruct mappers
│   │   │   │   ├── repository/      # Spring Data repositories
│   │   │   │   ├── security/        # JWT & Spring Security
│   │   │   │   └── service/         # Business logic
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                    # Unit tests
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── pages/                   # Page components
│   │   ├── api.ts                   # Axios API client
│   │   ├── types.ts                 # TypeScript types
│   │   └── AuthContext.tsx          # Authentication context
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.dev.yml           # Local development stack
└── README.md
```

---

## 🔌 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "EMPLOYEE"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "password123"
}

Response: {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "john.doe",
  "role": "EMPLOYEE"
}
```

### Employees

#### Get All Employees (Paginated)
```http
GET /api/employees?page=0&size=10&sortBy=lastName&sortDir=asc
Authorization: Bearer <token>
```

#### Search Employees
```http
GET /api/employees/search?search=john&page=0&size=10
Authorization: Bearer <token>
```

#### Get Employee by ID
```http
GET /api/employees/{id}
Authorization: Bearer <token>
```

#### Update Employee
```http
PUT /api/employees/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "position": "Senior Developer",
  "salary": 120000.00
}
```

### Absences

#### Create Absence Request
```http
POST /api/absences/employee/{employeeId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "startDate": "2025-12-01",
  "endDate": "2025-12-05",
  "type": "VACATION",
  "reason": "Family vacation"
}
```

#### Get Employee Absences
```http
GET /api/absences/employee/{employeeId}
Authorization: Bearer <token>
```

#### Update Absence Status (Manager only)
```http
PUT /api/absences/{id}/status?status=APPROVED
Authorization: Bearer <token>
```

#### Get Pending Count (Manager only)
```http
GET /api/absences/pending/count
Authorization: Bearer <token>
```

### Feedback

#### Create Feedback
```http
POST /api/feedback/employee/{employeeId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great work on the project!",
  "useAiPolish": false
}
```

#### Get AI Suggestions
```http
POST /api/feedback/suggestions
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Good job"
}

Response: {
  "suggestions": [
    "Excellent performance on recent deliverables",
    "Outstanding contribution to the team",
    "Great work quality and dedication"
  ]
}
```

---

## 🛠️ Development Tools

### Scripts

- `./dev.sh` - Start all services in development mode
- `./stop.sh` - Stop all running services
- `./logs.sh [service]` - View service logs

### Hot Reload

- **Frontend**: Vite HMR enabled, changes reflect instantly
- **Backend**: Requires rebuild (`docker-compose restart backend`)

### Database Access

**H2 Console** (Development):
- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:hrdb`
- Username: `sa`
- Password: (empty)


## 👤 Author

**Emanuel Tepes**

If you have any questions or feedback, feel free to reach out!
