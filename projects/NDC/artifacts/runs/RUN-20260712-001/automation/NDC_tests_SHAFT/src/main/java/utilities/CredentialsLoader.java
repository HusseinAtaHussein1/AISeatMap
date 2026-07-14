package utilities;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Path;

/**
 * Deliberately NOT modeled on the Reference Project's Environment.properties pattern — that file
 * stores real credentials in plain text, checked into Git (see
 * projects/NDC/reference_automation_project.md's Security Flag). This loader instead reads the
 * platform's own git-ignored projects/NDC/credentials/credentials.json at test-execution time
 * only, mirroring tools/browser_driver/driver.js's loadCredentials contract. Values are never
 * logged, never written to any other file, and never hardcoded here.
 */
public class CredentialsLoader {

    public static String[] loadValidCredential() throws IOException {
        // NDC_tests_SHAFT -> automation -> RUN-20260712-001 -> runs -> artifacts -> NDC
        Path credentialsPath = Path.of("").toAbsolutePath()
                .resolve("../../../../../credentials/credentials.json").normalize();
        try (FileReader reader = new FileReader(credentialsPath.toFile())) {
            JsonObject root = JsonParser.parseReader(reader).getAsJsonObject();
            JsonObject creds = root.has("environments")
                    ? root.getAsJsonObject("environments").getAsJsonObject(root.get("activeEnvironment").getAsString())
                    : root;
            String username = creds.get("username").getAsString();
            String password = creds.get("password").getAsString();
            return new String[]{username, password};
        }
    }
}
