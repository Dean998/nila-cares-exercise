# Full-Stack Developer Take-Home Project

## Project Overview
Build a **Project Task Manager** - a simplified version of tools like Linear or Asana. This exercise will demonstrate your ability to work with our tech stack and make thoughtful architectural decisions.

**Time Expectation:** 3-4 hours maximum. We value quality over completeness - focus on demonstrating your approach rather than building every feature.

## Tech Stack Requirements

### Mandatory
- **Runtime:** Bun - https://bun.sh/
- **Frontend:** React with TypeScript
- **Backend:** NestJS with TypeScript
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM for database interactions
- **Validation:** TypeBox for API validation, DTOs, and schema definitions
  - https://orm.drizzle.team/ 
  - https://github.com/sinclairzx81/typebox
  - https://github.com/jayalfredprufrock/nestjs-typebox
- **UI Framework:** Mantine UI for components and styling
- **Data Fetching:** React Query (TanStack Query) for client-side data management

## Core Features to Implement

### 1. Project Management
- Create a new project with a name and description
- List all projects
- View a single project with its tasks

### 2. Task Management
- Add tasks to a project with:
   - Title (required)
   - Description (optional)
   - Status: `todo`, `in_progress`, `done`
   - Priority: `low`, `medium`, `high`
- Update task status (drag-and-drop is nice but not required)
- Basic task filtering by status or priority

### 3. Data Persistence
- Use PostgreSQL to store projects and tasks
- Include proper relationships between projects and tasks
- Implement basic CRUD operations

## What We're Looking For

### Technical Skills
- Clean, readable TypeScript code
- Proper React patterns (hooks, component composition)
- RESTful API design with NestJS
- Drizzle ORM usage for database operations
- TypeBox integration for validation and type safety
- Error handling and validation

### Thought Process
- How you structure and organize code
- Decision-making around state management
- Database design choices
- Trade-offs you make given time constraints

## Deliverables

1. **Code Repository**
   - Include a README with setup instructions
   - Both frontend and backend should run locally
   - Include any database migration/setup scripts

2. **Brief Architecture Notes** (2-3 paragraphs)
   - Key decisions you made and why
   - What you'd do differently with more time
   - Any assumptions you made

## Bonus Points (Optional)
- Basic authentication (even if mocked)
- Search/filter functionality
- Mobile-responsive design
- Unit tests for critical functions

## What You Don't Need to Worry About
- Complex authentication/authorization
- Perfect UI/UX design
- Comprehensive test coverage
- Production deployment setup
- Advanced optimizations

## Questions?
If anything is unclear, make reasonable assumptions and document them in your notes. We're interested in seeing how you handle ambiguity and make decisions with incomplete information.

## Submission
Please submit your code repository and architecture notes by [DATE]. We'll schedule a follow-up session to discuss your implementation and explore some technical scenarios together.

---

**Remember:** This isn't about building the perfect application - it's about demonstrating your thought process, coding style, and ability to work with our stack. Focus on showing us how you approach problems and make technical decisions.