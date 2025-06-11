# Project Task Manager - Exercise Response

## Implementation Overview

This project implements a full-stack task management application using Nila Care's preferred tech stack. The application allows users to manage projects and their associated tasks through an intuitive web interface with authentication, CRUD operations, and drag-and-drop functionality.

## Architecture Decisions & Key Implementation Choices

### Authentication & User Management

**Decision**: Implemented cookie-based authentication with JWT tokens and bcrypt password hashing.
**Reasoning**: Chose cookies over localStorage for security benefits (HTTP-only, secure, sameSite protection). The single-user model assumes authenticated users have access to all projects, which simplifies the initial implementation while providing a foundation for future role-based access control.

### Database Design & Relationships

**Decision**: Established a foreign key relationship between projects and tasks with CASCADE DELETE.
**Reasoning**: When a project is deleted, all related tasks are automatically removed, maintaining data integrity and preventing orphaned records. This design choice ensures consistency and reduces the need for manual cleanup operations.

```sql
-- Key relationship structure
projects (1) -> tasks (many)
users (1) -> sessions (many) // for authentication
```

### Type Safety & Validation Strategy

**Decision**: Centralised all types in a structured DTO folder system with TypeBox integration.
**Reasoning**:

- **Consistency with Nila Care's codebase**: Used TypeBox throughout to align with existing patterns
- **Type safety**: Single source of truth for types shared between frontend and backend
- **Validation**: Built-in validation at API boundaries using TypeBox schemas
- **Developer experience**: IntelliSense and compile-time error checking

```
dto/
├── auth/
├── projects/
│   ├── create-project.dto.ts
│   └── update-project.dto.ts
└── tasks/
    ├── create-task.dto.ts
    └── update-task.dto.ts
```

### Frontend State Management & UX

**Decision**: Implemented React Query for server state and Zustand for client state, with drag-and-drop functionality.
**Reasoning**:

- **React Query**: Handles caching, synchronization, and optimistic updates automatically
- **Zustand**: Lightweight solution for authentication state with persistence
- **Drag-and-drop**: Enhanced user experience for task status updates using native HTML5 APIs
- **Mobile-responsive**: Ensured accessibility across devices

### Infrastructure & Development Environment

**Decision**: Extended the existing Docker setup and maintained consistency with provided tooling.
**Reasoning**: Built upon Nila Care's existing Dockerfile patterns to ensure compatibility with their deployment processes and development workflows.

## What I Would Do Differently With More Time

### 1. Enhanced User Management & Permissions

**Current**: Single-user model with global project access
**Improved**:

- Multi-tenant architecture with user-project associations
- Team-based permissions system
- Role-based access control (Admin, Member, Viewer)

```sql
-- Enhanced schema structure
users (1) -> user_projects (many) -> projects (1)
teams (1) -> team_members (many) -> users (1)
projects -> team_id (foreign key)
```

### 2. Advanced Data Fetching Strategy

**Current**: RESTful endpoints with basic filtering
**Improved**:

- GraphQL implementation for more efficient data fetching
- Reduced over-fetching and under-fetching
- Real-time subscriptions for collaborative features
- Field-level caching and optimization

### 3. Scalability Improvements

**Performance Enhancements**:

- **Pagination**: Implement cursor-based pagination for large project/task lists
- **Rate limiting**: Add API rate limiting to prevent abuse
- **Caching**: Redis integration for session management and frequently accessed data
- **Database optimization**: Proper indexing, query optimization, and connection pooling

### 4. Enhanced Developer Experience

**Testing & Quality**:

- Comprehensive test coverage (unit, integration, e2e)
- API documentation with OpenAPI/Swagger
- Error monitoring and logging (Sentry integration)
- Code quality tools (ESLint, Prettier, SonarQube)

## Assumptions Made

### 1. Technology Stack Alignment

**Assumption**: Utilized all package dependencies provided in the original setup to ensure consistency with Nila Care's existing development patterns and toolchain preferences.

### 2. User Experience Priorities

**Assumption**: Prioritized intuitive task management workflows over complex project configuration, assuming users need quick task status updates and clear visual organization.

### 3. Data Access Patterns

**Assumption**: All authenticated users should have access to all projects, simplifying the initial implementation. This assumption would be revisited in a production environment with proper user segmentation.

### 4. Performance vs. Feature Trade-offs

**Assumption**: Focused on core functionality and code quality over advanced features, ensuring a solid foundation that can be extended rather than a feature-rich but potentially unstable application.

## Technical Highlights

### 1. Type-Safe API Design

- Consistent TypeBox schemas across all endpoints
- Automatic validation and error handling
- Shared types between frontend and backend

### 2. Modern React Patterns

- Custom hooks for data fetching
- Component composition over inheritance
- Proper state management separation

### 3. Database Best Practices

- Proper foreign key relationships
- Migration scripts for reproducible deployments
- Environment-based configuration

### 4. Security Implementation

- HTTP-only cookies for authentication
- CORS configuration for cross-origin requests
- Input validation at multiple layers

## Conclusion

This implementation demonstrates a solid foundation for a project management tool that balances feature completeness with code quality. The architecture is designed to be extensible, with clear separation of concerns and consistent patterns that align with Nila Care's development practices. The focus on type safety, proper authentication, and user experience creates a maintainable codebase that can evolve with changing requirements.

The decisions made prioritise security, developer experience, and scalability foundations over feature breadth, ensuring that the core functionality is robust and can serve as a platform for future enhancements.
