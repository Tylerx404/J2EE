# Database submission notes

This project uses Oracle for the backend, so there is no single `.db` file like SQLite.
To satisfy a "database file" submission requirement, this folder provides the Oracle
database package in script form:

- `schema.sql`: creates sequences, tables, foreign keys, check constraints, and indexes.
- `data.sql`: inserts the system default categories used by the app.

## Objects covered

The scripts are based on the current backend domain model:

- `USERS`
- `WALLETS`
- `CATEGORIES`
- `TRANSACTIONS`
- `AI_ADVICE_LOGS`

Notes:

- `USER_SEQ` is used for `USERS`.
- `COMMON_SEQ` is used for `WALLETS`, `CATEGORIES`, `TRANSACTIONS`, and `AI_ADVICE_LOGS`.
- The backend still has `spring.jpa.hibernate.ddl-auto=update`, so Hibernate can keep
  syncing small differences when the app starts.
- `data.sql` uses ASCII-safe category labels and icon keywords so Oracle import tools do
  not break on Unicode/emoji encoding.
- A placeholder `ExampleEntity` exists in code, but it is not part of the business
  schema and is intentionally not included in this submission package.

## How to run on Oracle

Run in this order on an empty schema:

```sql
@database/schema.sql
@database/data.sql
```

Example with SQL*Plus:

```bash
sqlplus username/password@service_name @database/schema.sql
sqlplus username/password@service_name @database/data.sql
```

## What the app will do after import

- New users created through the backend will still get a default wallet:
  `Vi chinh`, currency `VND`, balance `0`.
- Wallet balance is computed by business logic using:
  `initialBalance + totalIncome - totalExpense`.
- Default categories are available immediately after running `data.sql`.

## Submission suggestion

If your instructor asks why there is no single database file:

`Oracle is a server-based DBMS, so the database is submitted as schema/data scripts instead of a single .db file.`
