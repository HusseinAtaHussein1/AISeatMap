@echo off
REM Runs the suite. Credentials live in src/main/java/utilities/EnvironmentConfig.java, so no
REM environment setup is needed -- `mvn test` on its own works too (see README.md "Credentials").

mvn test -Drp.endpoint=http://localhost:8080 -Drp.enable=false %*
