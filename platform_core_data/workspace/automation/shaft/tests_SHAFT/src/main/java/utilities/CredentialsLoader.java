package utilities;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Path;

/**
 * Deliberately NOT modeled on the Reference Project's Environment.properties pattern — that file
 * stores real credentials in plain text, checked into Git (see
 * platform_core_data/reference_automation_project.md's Security Flag). This loader instead reads the
 * platform's own git-ignored platform_core_data/credentials/credentials.json at test-execution time
 * only, mirroring tools/browser_driver/driver.js's loadCredentials contract. Values are never
 * logged, never written to any other file, and never hardcoded here.
 */
public class CredentialsLoader {

    public static String[] loadValidCredential() throws IOException {
        // tests_SHAFT -> shaft -> automation -> workspace -> platform_core_data
        // Repair 2026-07-18: corrected from 5 "../" to 4 — the repo's runs/ directory was
        // restructured (dropping one `artifacts/` level) but this relative path was never updated
        // to match, breaking every test in this suite's login step until then. Still 4 after the
        // 2026-07-25 move to platform_core_data/: that migration removed a level *above* the
        // project root, so the distance from this package to credentials/ is unchanged.
        Path credentialsPath = Path.of("").toAbsolutePath()
                .resolve("../../../../credentials/credentials.json").normalize();
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
