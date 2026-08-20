package utilities;

import com.shaft.driver.DriverFactory;
import com.shaft.driver.SHAFT;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeOptions;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * The single place this whole automation project constructs a browser from. Suite-wide and
 * module-agnostic on purpose: it is not Branch-specific, and no test class or Page Object should
 * ever call {@code new SHAFT.GUI.WebDriver()} directly again.
 *
 * <h2>Why this class exists</h2>
 *
 * <p>Chrome's password-manager leak detection sends every password submitted through a login form
 * to Google's breach-check service. When the password is found in a known breach, Chrome raises a
 * <b>"Change your password"</b> dialog. That dialog is <b>tab-modal browser UI</b>, not page
 * content, which makes it uniquely destructive to a Selenium run:</p>
 *
 * <ul>
 *   <li>It is invisible to WebDriver -- it lives in browser chrome, not the DOM, so no locator can
 *       find it, no {@code findElements} can count it, and no screenshot assertion can see it.</li>
 *   <li>It blocks interaction with the page underneath while WebDriver still reports every click
 *       and keystroke as delivered successfully.</li>
 * </ul>
 *
 * <p>That combination is exactly the long-running intermittency this suite chased for weeks: the
 * Credential dropdown "open" action reported as delivered, then {@code overlayPanelCount=0} and
 * {@code aria-expanded="false"} across all three bounded attempts, with identical code, browser
 * version and lifecycle between a passing and a failing run. Whether the dialog fired on a given
 * run depended on Chrome's own breach-check timing, which is why the failure never correlated with
 * JDK version, execution mode, or suite position -- all of which were tested and ruled out.</p>
 *
 * <h2>The fix is prevention, not dismissal</h2>
 *
 * <p>Because the dialog is browser UI, there is no supported way for WebDriver to close it once it
 * is up. So this class stops it being raised at all, by turning the leak check off for the
 * automation profile. {@code profile.password_manager_leak_detection} is the authoritative switch --
 * it maps to Chromium's own {@code kPasswordLeakDetectionEnabled} preference, which gates whether
 * the check runs. The two companion preferences stop Chrome offering to save or update the
 * credential, which is the other bubble that can steal a click on the login screen.</p>
 *
 * <p>This changes nothing about the application under test. It disables a <i>browser</i> convenience
 * feature for the throwaway automation profile only.</p>
 *
 * <p><b>Note on the underlying cause:</b> the dialog is factually correct -- the Staging password in
 * {@link EnvironmentConfig} really does appear in a public breach corpus, which is unsurprising for
 * a credential committed to a repository. Suppressing the browser dialog stops it corrupting test
 * runs; it does not make the credential safe. Rotating it stays an open recommendation, tracked
 * separately as KL-03.</p>
 *
 * <h2>Two behaviours of Selenium's option merge this class depends on</h2>
 *
 * <p>SHAFT builds its own {@code ChromeOptions} and then calls {@code options.merge(ours)}
 * (DriverFactoryHelper#setupChromiumOptions). Reading Selenium's
 * {@code ChromiumOptions#mergeInPlace} shows the two halves behave differently, and both matter:</p>
 *
 * <ul>
 *   <li><b>Arguments are unioned</b> -- each of ours is appended unless already present, so SHAFT's
 *       own arguments all survive.</li>
 *   <li><b>Experimental options are replaced by key</b> -- {@code experimentalOptions.forEach(
 *       this::setExperimentalOption)} overwrites the whole {@code prefs} map rather than merging
 *       into it. So {@link #chromePreferences()} below deliberately re-declares the three
 *       preferences SHAFT sets for itself. Drop them and the configured download directory is
 *       silently lost.</li>
 * </ul>
 */
public final class BrowserSession {

    /**
     * The password-related feature names here are <b>defence in depth, not the mechanism</b>. They
     * have shifted between Chrome releases and are not verified against Chrome 150; an unrecognised
     * feature name is ignored rather than rejected, so listing a stale one is harmless. The
     * preference in {@link #chromePreferences()} is the switch actually relied on, and it is the one
     * verified to take effect.
     *
     * <p>The trailing entries re-declare features SHAFT already asks to disable. That is belt and
     * braces against Chrome's own command-line rule that a repeated switch keeps only its last
     * occurrence -- SHAFT passes fourteen separate {@code --disable-features=} arguments, which that
     * rule alone would reduce to one. <b>Verified 2026-08-15 that this does not actually happen:</b>
     * inspecting the launched process shows chromedriver concatenates every {@code --disable-features}
     * value into a single comma-separated switch before starting Chrome, so SHAFT's list survives on
     * its own. The duplicates below are therefore redundant rather than load-bearing, and are kept
     * only so this list stays correct if a future driver stops merging them.
     */
    private static final String DISABLE_FEATURES = "--disable-features=" + String.join(",",
            // --- the fix: password leak detection and its follow-up prompts ---
            "PasswordLeakDetection",
            "PasswordChange",
            "PasswordChangeAffiliatedApps",
            "PasswordLeakToggleMove",
            "SafetyHub",
            // --- re-declared from SHAFT's own list, which Chrome was discarding (see above) ---
            "AutofillServerCommunication",
            "CalculateNativeWinOcclusion",
            "MediaRouter",
            "Translate",
            "AvoidUnnecessaryBeforeUnloadCheckSync",
            "CertificateTransparencyComponentUpdater",
            "OptimizationHints",
            "DialMediaRouteProvider",
            "GlobalMediaControls",
            "ImprovedCookieControls",
            "LazyFrameLoading",
            "InterestFeedContentSuggestions");

    private static final List<String> CHROMIUM_ARGUMENTS = List.of(
            DISABLE_FEATURES,
            // Suppresses the "Chrome is out of date" / save-password infobars that render inside the
            // viewport and can absorb a click aimed at the top of the page.
            "--disable-infobars",
            // Stops the first-run profile bubbles that can open over the page on a fresh profile.
            "--no-first-run",
            "--no-default-browser-check");

    private BrowserSession() {
        // Static factory only.
    }

    /**
     * Builds the browser this suite runs against, with the hardening above applied when the target
     * is a Chromium browser. Any other target falls through to SHAFT's own unmodified construction,
     * so switching {@code targetBrowserName} in {@code execution.properties} still works -- it just
     * carries no Chromium-specific hardening, which is correct rather than a gap.
     */
    public static SHAFT.GUI.WebDriver start() {
        String browser = SHAFT.Properties.web.targetBrowserName();
        String name = browser == null ? "" : browser.trim().toLowerCase();

        if (name.contains("edge")) {
            EdgeOptions options = new EdgeOptions();
            CHROMIUM_ARGUMENTS.forEach(options::addArguments);
            options.setExperimentalOption("prefs", chromePreferences());
            return new SHAFT.GUI.WebDriver(DriverFactory.DriverType.EDGE, options);
        }

        if (name.contains("chrom")) {
            ChromeOptions options = new ChromeOptions();
            CHROMIUM_ARGUMENTS.forEach(options::addArguments);
            options.setExperimentalOption("prefs", chromePreferences());
            return new SHAFT.GUI.WebDriver(DriverFactory.DriverType.CHROME, options);
        }

        return new SHAFT.GUI.WebDriver();
    }

    /**
     * The complete {@code prefs} map for the automation profile.
     *
     * <p>The first three entries are copied verbatim from SHAFT's
     * {@code DriverFactoryHelper#setupChromiumOptions} and must stay: Selenium's merge replaces this
     * map wholesale rather than merging into it, so anything omitted here is lost rather than
     * inherited. If SHAFT is ever upgraded, re-read that method and reconcile this map with it.</p>
     */
    private static Map<String, Object> chromePreferences() {
        Map<String, Object> preferences = new HashMap<>();

        // --- replicated from SHAFT, not additions of ours ---
        preferences.put("profile.default_content_settings.popups", 0);
        preferences.put("download.prompt_for_download", "false");
        preferences.put("download.default_directory",
                System.getProperty("user.dir") + File.separatorChar
                        + SHAFT.Properties.paths.downloads().replace("/", File.separator));

        // --- the fix ---
        // Chromium's kPasswordLeakDetectionEnabled. Off means the submitted password is never sent
        // for a breach check, so the tab-modal "Change your password" dialog is never raised.
        preferences.put("profile.password_manager_leak_detection", false);
        // Stops the separate "Save password?" / "Update password?" bubbles on the login screen.
        preferences.put("credentials_enable_service", false);
        preferences.put("profile.password_manager_enabled", false);

        return preferences;
    }
}
