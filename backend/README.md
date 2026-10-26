# Spring Boot API

1. Copy `.env.example` to `.env` and set the database credentials. Spring Boot loads that local file; it is not committed.
2. In MySQL Workbench execute `../database/schema.sql`.
3. Run `./run-local.ps1` from PowerShell (or `mvn.cmd spring-boot:run` after setting the same variables in the shell).

The API validates ownership by querying both resource and authenticated user ID. The ML client does not manufacture a fallback prediction on service failure.
