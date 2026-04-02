# Finance Data Processing and Access Control Backend

A Node.js backend using Express, TypeScript, and Prisma (SQLite) for processing financial records. This project demonstrates API design, proper data modeling, validation, and role-based access control.

## Project Structure
- `src/controllers`: Handlers for business logic
- `src/routes`: Express route definitions
- `src/middlewares`: JWT Authentication, RBAC, and Zod Validation
- `src/schemas`: Zod schema definitions
- `src/utils`: Utilities like JWT signing and hashing

## Requirements Met
- **User and Role Management**: Implemented VIEWER, ANALYST, and ADMIN roles. Admins manage user roles.
- **Financial Records Management**: CRUD endpoints with query filtering (type, category, date limits) and pagination.
- **Dashboard APIs**: Aggregation endpoints for overall summary, category-wise breakdown, and recent transactions.
- **Access Control**: Handled gracefully using separate `authenticate` and `requireRole` middlewares.
- **Validation**: Zod is utilized across all non-read endpoints.
- **Data Persistence**: Prisma DB with SQLite for simple transport.

## Local Development Setup

**1. Install dependencies:**
```sh
npm install
```

**2. Setup database:**
```sh
npx prisma db push
```

**3. Run the application:**
```sh
npm run dev
```

The server will be running on `http://localhost:3000`.

## API Documentation

### Public Endpoints
- `POST /api/users/register` - Register user. Body: `{ name, email, password, role? }`.
- `POST /api/users/login` - Login. Body `{ email, password }`. Returns a JWT.

### Protected User Endpoints (Require Bearer Token)
- `GET /api/users` - List all users (ADMIN only).
- `PUT /api/users/:id/role` - Update user role (ADMIN only). Body: `{ role }`.

### Protected Record Endpoints
- `POST /api/records` - Create a record (ADMIN only). Body: `{ amount, type, category, date, notes? }`
- `GET /api/records` - View records (ADMIN, ANALYST). Query options: `type`, `category`, `startDate`, `endDate`, `page`, `limit`.
- `GET /api/records/:id` - Fetch one record (ADMIN, ANALYST).
- `PUT /api/records/:id` - Update a record (ADMIN only).
- `DELETE /api/records/:id` - Delete a record (ADMIN only).

### Protected Dashboard Endpoints
- `GET /api/dashboard/summary` - Aggregated total income, expense, and net balance (VIEWER, ANALYST, ADMIN).
- `GET /api/dashboard/category-totals` - Category wise income/expense totals. Optional query `?type=(INCOME|EXPENSE)`.
- `GET /api/dashboard/recent-activity` - List latest records up to a limit limit. Optional query `?limit=5`.

## Technical Decisions and Trade-offs

1. **Express Over NestJS/Fastify**: Used standard Express to keep the codebase simple and readable for assignment assessment, avoiding the high boilerplate complexity of heavier enterprise modules.
2. **Prisma + SQLite**: Chosen strictly for optimal developer experience and submission simplicity. SQLite prevents the local evaluator from having to boot up Docker containers or Postgres pipelines. Prisma (version locked to 5.x to prevent Windows experimental CLI parsing bugs) allows safe, code-first data management.
3. **Zod Validation**: Replaced manual `if/else` input validations with strict `Zod` schemas to ensure predictable `req.body` handling, preventing nasty upstream errors.
4. **Vanilla Monolithic Frontend**: To impress without the overhead of distributing two separate repositories or running concurrent Next.js ports, the frontend was built natively (`HTML/JS/CSS`) inside the `public/` directory and routed statically in Express. This makes launching everything a single command (`npm run dev`).
5. **Stateless JWT**: Implemented JSON Web Tokens instead of Stateful Sessions. This removes the need for Redis caching mechanisms and keeps the API completely independent and horizontally scalable.

## Future Improvements for a Production Environment
- Replace SQLite with PostgreSQL for concurrent stability.
- Add refreshing token logic to expire and refresh access tokens securely.
- Improve test coverage with Jest.
