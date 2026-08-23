package Generic_Classes;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * One small, generic JSON test-data reader: loads a JSON file from the classpath and exposes typed
 * getters over it. Not a data framework, builder, provider, or multiple-model-class layer -- any module
 * needing fixed test data from JSON reads it through this one class, the same way {@code Properties} was
 * read before.
 *
 * <p>Jackson's {@code ObjectMapper}/{@code JsonNode} is already a transitive, compile-scope dependency
 * of {@code SHAFT_ENGINE} (via {@code jackson-datatype-jdk8}), so no new dependency was added to
 * {@code pom.xml} to build this.
 */
public final class JsonDataReader {

    private final JsonNode root;
    private final String sourcePath;

    private JsonDataReader(JsonNode root, String sourcePath) {
        this.root = root;
        this.sourcePath = sourcePath;
    }

    /**
     * Loads a JSON file from the classpath (test or main resources, whichever the running module's
     * classpath includes), e.g. {@code "testDataFiles/agency/agency-data.json"}.
     */
    public static JsonDataReader fromClasspath(String classpathRelativePath) {
        try (InputStream in = JsonDataReader.class.getClassLoader().getResourceAsStream(classpathRelativePath)) {
            if (in == null) {
                throw new IllegalStateException(
                        classpathRelativePath + " was not found on the classpath. The suite cannot run "
                                + "without its JSON test data file.");
            }
            JsonNode node = new ObjectMapper().readTree(in);
            return new JsonDataReader(node, classpathRelativePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load JSON test data from " + classpathRelativePath, e);
        }
    }

    /** A nested object under {@code key}, as its own reader -- for a small object such as a Branch config. */
    public JsonDataReader object(String key) {
        JsonNode child = root.get(key);
        if (child == null || child.isMissingNode()) {
            throw new IllegalStateException(sourcePath + " is missing a JSON object for \"" + key + "\".");
        }
        return new JsonDataReader(child, sourcePath + "#" + key);
    }

    /** A required string value. Fails loudly rather than typing a literal "null" into a field. */
    public String getString(String key) {
        JsonNode value = root.get(key);
        if (value == null || value.isNull() || value.asText().trim().isEmpty()) {
            throw new IllegalStateException(sourcePath + " is missing a value for \"" + key + "\". Set it "
                    + "rather than letting the suite type an empty or null value into the form.");
        }
        return value.asText().trim();
    }

    /** A string value, or {@code fallback} when the key is absent/empty. */
    public String getString(String key, String fallback) {
        JsonNode value = root.get(key);
        if (value == null || value.isNull() || value.asText().trim().isEmpty()) {
            return fallback;
        }
        return value.asText().trim();
    }

    /** A required list of strings, e.g. a Branch's configured supplier names. */
    public List<String> getStringList(String key) {
        JsonNode value = root.get(key);
        List<String> result = new ArrayList<>();
        if (value == null || value.isNull()) {
            return result;
        }
        for (JsonNode item : value) {
            result.add(item.asText().trim());
        }
        return result;
    }
}
