# Click-Delivery Diagnosis — Branch Search screen, 2026-08-15

**Diagnosis IDs:** `DIAG-BR-20260815-01` (D3) and `DIAG-BR-20260815-02` (D4)
**Mode:** Headed · **JDK:** Java 21.0.11 (Microsoft) · **Runner:** Maven Surefire, the suite's own SHAFT/Selenium stack
**Safety:** `SEARCH`/`READ`, `Shared`, branch, Staging → Allowed. Nothing created, updated, approved, rejected or deleted.
**Harness:** temporary `ClickDeliveryDiagnostic_TC`, **deleted after capture**; `mvn clean compile test-compile` exit 0 afterwards. It drove the production mechanism (`driver.element().click(...)`), added **no retries**, asserted nothing and repaired nothing.

## 1. D3 — 12 interaction cycles in ONE driver session

Each cycle: navigate to the Branch list → wait for rows **and** summary → click a Status label → click Search.

| Metric | Result |
|---|---|
| Status radio committed | **12 / 12** |
| Search click delivered (grid re-rendered) | **11 / 12** |
| The single loss | **Iteration 1** |

Iteration 1, verbatim:
```
STATUS clickMs=3524 exception=none committed=true timeline=[0ms=true … 3000ms=true]
       POST-radios="Active=true/1 Inactive=false/0 Both=false/-1" events=[]
PRE-search displayed=true enabled=true topmostAtButton=SPAN.p-button-label [NOT TARGET]
SEARCH exception=none clickEvents=[] overlayCycle=[] gridReplaced=false
       summaryAfter="Showing 10 results of 509 results"
```
Iterations 2-12, by contrast, all recorded trusted events and a full result cycle, e.g.:
```
POST-radios="Active=false/1 Inactive=true/0 Both=false/-1"
events=["Inactive:LABEL:click(t)","Inactive:INPUT:click(t)","Inactive:INPUT:input(t)","Inactive:INPUT:change(t)"]
SEARCH clickEvents=["SEARCH:mousedown(t)","SEARCH:click(t)"] overlayCycle=["appeared","disappeared"]
       gridReplaced=true replacedAt=1999ms summaryAfter="Showing 10 results of 173 results"
```
Iteration 1's `committed=true` is itself a false positive: the requested status was `Active`, which is already the default, so the guard passed on a state the click never produced.

## 2. D4 — ONE interaction per FRESH driver session, six sessions

Mirrors what the suite actually does: `TestBase` builds a new `SHAFT.GUI.WebDriver`, logs in, and navigates before **every** test method. Each session clicked the Status `Both` label once, then Search once.

| Session | Status committed | Events recorded | Overlay cycle | Search delivered |
|---|---|---|---|---|
| 1 | **false** | `[]` | `[]` | false (8900 ms) |
| 2 | **false** | `[]` | `[]` | false (8852 ms) |
| 3 | **false** | `[]` | `[]` | false (8852 ms) |
| 4 | **false** | `SEARCH:mousedown(t)`, `SEARCH:click(t)` | appeared → disappeared | **true** (1986 ms) |
| 5 | **false** | `SEARCH:mousedown(t)`, `SEARCH:click(t)` | appeared → disappeared | **true** (1000 ms) |
| 6 | **false** | `[]` | `[]` | false (8802 ms) |

**The first interaction after a fresh driver reaches the Branch list page was lost in 6 of 6 sessions.** The second interaction landed in 2 of 6.

## 3. Confirmed root cause

**The first `driver.element()` interaction on the Branch Search screen in a new WebDriver session is silently dropped**, and the second is unreliable. Against the nine candidate mechanisms:

| Candidate | Verdict |
|---|---|
| **The click was never dispatched / did not trigger the application event** | **✔ CONFIRMED** — zero events recorded on the label, the radio or the button; no overlay cycle; no request; no grid change |
| A loading layer or invisible element intercepted the click | **Ruled out** — `document.elementFromPoint` at the label centre returned `LABEL … [IS TARGET]` in every iteration, including the failing ones. `topmostAtButton=SPAN.p-button-label [NOT TARGET]` appears in **all 12** iterations including the 11 that succeeded — it is PrimeNG's inner label span, a child of the button, not an interceptor |
| Angular did not commit the radio value | **Ruled out** — when the click lands, `input`/`change` fire and the model updates immediately; when it does not land, no `click` fires either, so Angular never had anything to commit |
| Search clicked before the status committed | **Ruled out** — the failure occurs on the very first interaction, before any ordering question arises |
| Verification checks state too early | **Ruled out** — the timeline sampled 0/100/250/500/1000/2000/3000 ms and never changed; a longer wait would not help |
| Wrong or replaced DOM element / rerender between lookup and interaction | **Consistent, not isolated** — the most likely mechanism for a dispatched-but-inert click, since SHAFT's click takes ~3.4 s and the control could be replaced within that window. Not separated from "never dispatched" by this evidence |
| Reopening the page races Angular initialization | **Consistent** — the loss is tied to a fresh session's first arrival on this route. Grid render time varied 677-2200 ms with no correlation to success, so a simple "load slower" wait would not fix it |
| Stale-element or SHAFT exception | **Ruled out** — `exception=none` on every dropped click. It fails silently, which is why every previous layer of this investigation mis-attributed it |

## 4. This explains every prior observation

- **Suite runs are worst-hit**: a fresh driver per test method means *every test's first interaction* is in the failure window. `rerun-23`'s suite: 11/11 failed.
- **`rerun-23` TC-BR-045 isolated, 1 pass in 3**: the first interaction was `selectStatus(Active)` — Active is the default, so the commit guard passed on a click that never landed — and Search was the second interaction, which D4 shows lands roughly a third of the time. Runs 1 and 3 lost it; run 2 landed it and produced the correct `509 → 172 → 681`.
- **`rerun-22` pre-repair**: the same losses occurred but were swallowed silently, so tests "passed" against the initially-loaded grid.
- **D2's typing diagnosis (`DIAG-BR-20260814-06`)**: its `clear()+sendKeys` and W3C Actions attempts were the first interactions after a fresh page arrival — both in the drop window. **The earlier conclusion that keystroke delivery is broken per se is therefore not safe**, and the Chrome 150 / SHAFT 7.4 CDP-mismatch lead is further weakened: login typing works because the login page is not this route.

## 4a. MECHANISM SEPARATED — `DIAG-BR-20260815-03` (D5), Headless

Four mechanisms, each run as the **first** interaction of its own fresh driver session (`TestBase` builds a new driver and logs in per method), identical navigation/login/target/timing. Temporary harness `ClickBoundaryDiagnostic_TC`, **deleted after capture**; compile exit 0 afterwards.

| Mechanism | Command ms | Exception | Label identity same | Label connected | Radio identity same | Mutations | Events seen | Radio checked |
|---|---|---|---|---|---|---|---|---|
| **A — SHAFT `driver.element().click()`** | 206 | none | true | true | true | `[]` | **`[]`** | false |
| **B — Selenium `WebElement.click()`** | 111 | none | true | true | true | `[]` | **`[]`** | false |
| **C — W3C `Actions`** | 153 | none | true | true | true | `[]` | **`[]`** | false |
| **D — JavaScript `.click()` (control only)** | 55 | none | true | true | true | `[]` | **full chain** | **true** |

D's full chain, for contrast:
```
DOCUMENT click trusted=false target=LABEL.ng-star-inserted isOriginalLabel=true
ORIGINAL_LABEL click trusted=false
DOCUMENT click trusted=false target=INPUT#id-Status-Both isOriginalRadio=true
ORIGINAL_RADIO click trusted=false
ORIGINAL_RADIO input  trusted=true
ORIGINAL_RADIO change trusted=true
→ radioCheckedNow = true
```

### Which boundary fails

| Boundary | Verdict |
|---|---|
| SHAFT wrapper before Selenium command dispatch | **Ruled out** — plain Selenium (B) and W3C Actions (C) fail identically, so the loss is below SHAFT |
| **Element replacement between lookup and event delivery** | **RULED OUT** — `labelIdentitySame:true`, `labelStillConnected:true`, `radioIdentitySame:true`, `radioStillConnected:true`, `mutations:[]` in all four sessions. The node located before the command is still the live node after it; no rerender occurred |
| WebDriver command dispatch/response | **Command succeeded** — all three real-input commands returned with no exception in 111-206 ms |
| **Browser event delivery despite a successful command response** | **CONFIRMED** — the document-level capture listener, which sees clicks on *any* node including replacements, recorded **nothing** for A, B and C. No event reached the page at all |

**Mechanical root cause: Chrome's real-input pipeline does not deliver synthesized input for the first interaction after arriving on this route, while reporting the WebDriver command as successful.** The page is fully functional at that moment — the JavaScript control click produced the complete event chain and Angular committed the radio — so this is neither a page-readiness problem in the DOM sense nor an application defect.

Two sub-cases remain merged and cannot be separated from the page side: ChromeDriver never emitting `Input.dispatchMouseEvent`, versus Chrome receiving it and discarding it. Both present identically as *success response, no event*. Separating them needs a ChromeDriver wire/verbose log, not page probes.

**Mode-independence confirmed:** D4 reproduced this Headed 6/6; D5 reproduced it Headless 4/4. The pre-run caveat that a Headless run might not reproduce the defect is resolved — it does.

**This materially re-strengthens the Chrome 150 / SHAFT 7.4 (bundled Selenium) mismatch lead** recorded in `DIAG-BR-20260814-06`: every *real input* path fails while the JavaScript path works, with no exception raised. That is the characteristic signature of a driver/browser incompatibility in the input-dispatch path. It remains a lead — no controlled matched-version experiment has been run.

## 4b. SUB-CASE SEPARATED — `DIAG-BR-20260815-04` (Configuration A), Headed

The §4a merged sub-cases were "ChromeDriver never emits `Input.dispatchMouseEvent`" versus "Chrome
receives it and discards it". Separating them needed a ChromeDriver wire log. This section reports
that log.

**Configuration A = the current runtime, unchanged.** Nothing in the pom, the properties, the page
objects or `REPAIR-BR-012` was altered. The only addition was a per-session verbose ChromeDriver log,
requested through Selenium's own `webdriver.chrome.logfile` / `verboseLogging` /
`readableTimestamp` service system properties, which `ChromeDriverService.Builder` reads when
`new ChromeDriver(options)` builds its default service. Temporary harness
`ClickDriverLogDiagnostic_TC` plus a separate `testng-diag-configA.xml`, both **deleted after
capture**; `mvn compile test-compile` exit 0 afterwards and the working tree is byte-identical to
its pre-run state. The suite's own `testng.xml` was never touched.

Four fresh WebDriver sessions, each `TestBase`-shaped (new `SHAFT.GUI.WebDriver`, login, navigate).
Each session then performed a **fixed, unconditional sequence of three identical probe clicks** on
the Status `Both` label through the production mechanism `driver.element().click(By)` — no retry, no
readiness probe, no verified re-drive, no JavaScript fallback. The sequence never stops early on
success and never reacts to failure, so it is evidence collection rather than a retry. `Both` was
used, never `Active`, because `Active` is the screen default and a commit check against it passes on
a click that never landed (§1). Search was never clicked; nothing was created, updated, approved,
rejected or deleted. `SEARCH`/`READ`, `Shared`, branch, Staging → Allowed.

### Exact runtime

| Fact | Value |
|---|---|
| Selenium | **4.13.0** (`BuildInfo` release label; revision `ba948ece5b*`) |
| SHAFT | **7.4.20231015** (`…/.m2/repository/io/github/shafthq/SHAFT_ENGINE/7.4.20231015/SHAFT_ENGINE-7.4.20231015.jar`) |
| Chrome | **150.0.7871.187** (capability `browserVersion`; `se:cdpVersion` identical) |
| Chrome binary | `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe` (set explicitly in the InitSession capabilities) |
| ChromeDriver | **150.0.7871.124** (`Starting ChromeDriver 150.0.7871.124 … branch-heads/7871@{#3359}`) |
| ChromeDriver binary | `C:\Users\Aymoon\.cache\selenium\chromedriver\win64\150.0.7871.124\chromedriver.exe` (Selenium Manager cache; matched by version and `se-metadata.json`. The cache was read only, never modified) |
| JDK | 21.0.11+10-LTS, Microsoft |
| Mode | Headed (`headlessExecution=false`), `executionAddress=local`, `--start-maximized` |
| Session capabilities of note | `pageLoadStrategy=none`, `unhandledPromptBehavior=ignore`, `timeouts={implicit=0, pageLoad=60000, script=30000}`, `goog:chromeOptions={debuggerAddress=localhost:…}` |
| SHAFT flags of note | `disableCache=false` (so SHAFT opens **no** DevTools session of its own), `clickUsingJavascriptWhenWebDriverClickFails=false` |

**Chrome and ChromeDriver are the same major version (150).** The version-mismatch lead is therefore
*not* supported at the major-version level by this evidence. Note separately that a Chrome
`151.0.7922.138` version folder was staged on 2026-08-14 and will become the running binary after
the next browser restart; the binary that actually ran here was 150.0.7871.187.

### Result — 12 losses out of 12

| Session | Probe 1 | Probe 2 | Probe 3 | Events seen | Radio committed |
|---|---|---|---|---|---|
| 1 | lost | lost | lost | `[]` | false |
| 2 | lost | lost | lost | `[]` | false |
| 3 | lost | lost | lost | `[]` | false |
| 4 | lost | lost | lost | `[]` | false |

Every probe: `exception=none`, command time 172-190 ms, `labelIdentitySame=true`,
`labelStillConnected=true`, `radioIdentitySame=true`, `radioStillConnected=true`, `mutations=[]`,
`radios{Active=true Inactive=false Both=false}`, and at install time
`topmostAtLabelCentre=LABEL.ng-star-inserted [IS TARGET]` with `readyState=complete`.

This is **worse than §4a's "the first interaction is lost"**: here the second and third real-input
clicks were lost as well, in all four sessions. The three probes ran within ~700 ms of each other
with no intervening navigation, whereas D3's recovering iterations were seconds apart and each began
with a fresh navigation. So the recovery window is not simply "the second interaction" — elapsed
time or the navigation itself is doing the work. No successful *real-input* interaction on the
Branch list was captured at all in this configuration.

### The verbose log — sub-case resolved

**ChromeDriver does emit the mouse-input command, and Chrome answers it successfully.** For every
lost probe the log shows the complete, correctly-formed dispatch:

```
[11:16:26.344][INFO]: COMMAND PerformActions                 ← SHAFT's Actions.moveToElement
[11:16:26.348][DEBUG]: Command:  Input.dispatchMouseEvent (id=580) {"type":"mouseMoved","x":653,"y":549}
[11:16:26.348][DEBUG]: Response: Input.dispatchMouseEvent (id=580) {}
[11:16:26.449][INFO]: RESPONSE PerformActions
[11:16:26.451][INFO]: COMMAND ClickElement                   ← SHAFT's element.click()
[11:16:26.483][DEBUG]: Command:  Input.dispatchMouseEvent (id=636) {"type":"mouseMoved",   "x":653,"y":549}
[11:16:26.483][DEBUG]: Command:  Input.dispatchMouseEvent (id=637) {"type":"mousePressed", "x":653,"y":549}
[11:16:26.483][DEBUG]: Command:  Input.dispatchMouseEvent (id=638) {"type":"mouseReleased","x":653,"y":549}
[11:16:26.483][DEBUG]: Response: Input.dispatchMouseEvent (id=636) {}
[11:16:26.483][DEBUG]: Response: Input.dispatchMouseEvent (id=637) {}
[11:16:26.483][DEBUG]: Response: Input.dispatchMouseEvent (id=638) {}
[11:16:26.483][INFO]: RESPONSE ClickElement
```

The coordinates are right: `GetElementRect` returned `x=638.8125 y=538.0` with scroll offset `0,0`,
the element is 30×22, and the dispatch used `653,549` — its centre. The page agreed independently:
`document.elementFromPoint` at that centre returned the target label itself. Both the `PerformActions`
mouse move and all three `ClickElement` events were sent to the same DevTools target and session that
`ExecuteScript` was successfully reading the DOM through, milliseconds earlier and later.

**Contrast with a real-input click that lands.** The login-button click, in the same session, same
driver, same mechanism, ~2 s earlier:

```
[11:16:24.124][DEBUG]: Command:  Input.dispatchMouseEvent (id=467) {"type":"mouseMoved",   "x":1443,"y":702}
[11:16:24.124][DEBUG]: Command:  Input.dispatchMouseEvent (id=468) {"type":"mousePressed", "x":1443,"y":702}
[11:16:24.124][DEBUG]: Command:  Input.dispatchMouseEvent (id=469) {"type":"mouseReleased","x":1443,"y":702}
[11:16:24.125][DEBUG]: Response: (id=467) {}
[11:16:24.126][DEBUG]: Response: (id=468) {}
[11:16:24.135][DEBUG]: Response: (id=469) {}      ← 11 ms later; the app's login request is issued in between
```

The command payloads are byte-identical in shape. The one measurable difference is the acknowledgement
timing, and it reproduced in **all four sessions**:

| | Login click (lands) | Branch-list click (lost) |
|---|---|---|
| Session 1 | press +2 ms, release **+11 ms** | press +0 ms, release **+0 ms** |
| Session 2 | press +2 ms, release **+12 ms** | press +0 ms, release **+0 ms** |
| Session 3 | press +1 ms, release **+12 ms** | press +0 ms, release **+0 ms** |
| Session 4 | press +2 ms, release **+12 ms** | press +0 ms, release **+0 ms** |

A landed click's `mouseReleased` acknowledgement waits on renderer work — the page's handlers run
before Chrome answers. A lost click is acknowledged in the same millisecond it is sent, with no
renderer work at all.

### Which sub-case fails

| Sub-case | Verdict |
|---|---|
| ChromeDriver never emits `Input.dispatchMouseEvent` | **RULED OUT** — it emits all three events, correctly formed, at the correct viewport coordinates, on the correct target session, in 12 of 12 lost probes |
| ChromeDriver emits it and Chrome discards it | **CONFIRMED** — Chrome returns an empty success response to each, the renderer is never engaged (zero-millisecond acknowledgement, versus 11-12 ms when the same click lands), and the document-level capture listener records nothing |

**Mechanical root cause, now located: the loss happens inside Chrome, downstream of accepting the
CDP command and upstream of the renderer.** It is not a SHAFT defect, not a Selenium defect, not a
ChromeDriver emission defect, and not an application defect.

### New lead from the captured launch arguments — ⚠️ REFUTED, see §4c

The InitSession capabilities show SHAFT passing **twelve separate `--disable-features=` switches**,
the first of which is `--disable-features=CalculateNativeWinOcclusion`. Chrome reads a repeated
command-line switch as its **last** occurrence, so the eleven later `--disable-features` values would
override the first and leave native-window occlusion detection **active**. With occlusion detection
active, a Chrome window that Windows considers covered can have its widget treated as hidden, which
would drop synthesized mouse input in the browser process while still acknowledging the CDP command —
exactly the signature measured above. This is a **lead, not a finding**: it is derived from the
captured launch arguments and Chrome's documented switch-parsing behaviour, not from an experiment,
and it does not by itself explain §4a's headless reproduction. It is cheap to test and should be
considered before Configuration B or C.

**This lead was tested in §4c and is refuted.** ChromeDriver combines the twelve switches before
Chrome ever sees them. The reasoning above was wrong because it assumed the arguments in the
InitSession capabilities reach Chrome's command line unchanged; they do not.

### Evidence

`healing/evidence_configA_2026-08-15/` — `observations.txt` (all four sessions: full capability
dumps, per-probe DOM/event instrumentation) and `chromedriver_log_excerpts.txt` (the curated wire
traffic quoted above). The four full verbose logs were ~4.9 MB each, temporary, and are not kept.

## 4c. LEAD REFUTED — `DIAG-BR-20260815-05` (Configuration A2), Headed

Configuration A2 was to replace SHAFT's twelve separate `--disable-features=` switches with one
combined switch and re-measure. That experiment **was not run, because its premise is false.**

The §4b lead assumed the arguments listed in the InitSession capabilities reach Chrome's command line
unchanged, so that Chrome would honour only the last `--disable-features` value and leave
`CalculateNativeWinOcclusion` enabled. Before performing driver surgery to normalize the switch, the
premise was checked by reading Chrome's own report of its effective command line from
`chrome://version`. **ChromeDriver already combines them.** Identical in all four sessions:

```
--disable-features=IgnoreDuplicateNavs,Prewarm,CalculateNativeWinOcclusion,AutofillServerCommunication,
                   MediaRouter,Translate,AvoidUnnecessaryBeforeUnloadCheckSync,
                   CertificateTransparencyComponentUpdater,OptimizationHints,DialMediaRouteProvider,
                   GlobalMediaControls,ImprovedCookieControls,LazyFrameLoading,
                   InterestFeedContentSuggestions
--enable-features=NetworkService,NetworkServiceInProcess
```

Chrome receives **exactly one** `--disable-features` switch. It carries every value SHAFT passed —
including `CalculateNativeWinOcclusion` — plus ChromeDriver's own `IgnoreDuplicateNavs` and
`Prewarm`. `--enable-features` is combined the same way. So:

- Native-window occlusion detection **is** disabled, and always was.
- The normalization Configuration A2 would apply **is already the state of the world**. There is no
  change to make and nothing to compare against.
- The repeated-switch hypothesis is **rejected**, not merely unconfirmed.

### Focus and visibility ruled out alongside it

The same run captured window state per probe, which tests the occlusion *family* of explanations
directly rather than through the launch arguments. In all four sessions the page was
`visibilityState=visible`, `hidden=false`, `1920x889` inside a `1920x1032` window at screen position
`0,0`, `devicePixelRatio=1`.

| | Probe 1 | Probe 2 | Probe 3 |
|---|---|---|---|
| `document.hasFocus()` before the click | **false** (4/4 sessions) | **true** (4/4) | **true** (4/4) |
| Click delivered | no | no | no |

The first probe always ran unfocused and the later two always ran focused, and **all twelve were lost
regardless**. Focus state does not correlate with delivery, so "the window was not focused or was
occluded" is ruled out as the mechanism.

### Baseline reproduced

Configuration A2's probe run is otherwise Configuration A unchanged, and it reproduced the defect at
the same rate: **12 losses out of 12**, across four fresh sessions, `exception=none`, command time
175-198 ms, `events=[]`, `radios{Active=true Inactive=false Both=false}`, with
`elementFromPoint` returning the target label `[IS TARGET]` and `readyState=complete` each time. The
failure rate is unchanged from Configuration A, so there is no partial or intermittent improvement to
interpret.

Harness `ClickArgsDiagnostic_TC` plus `testng-diag-configA2.xml`, both **deleted after capture**;
`mvn compile test-compile` exit 0 afterwards. `chrome://version` was navigated to only after all
three probes, so it could not disturb first-interaction ordering. Evidence:
`healing/evidence_configA2_2026-08-15/observations.txt`.

## 4d. BOUNDARY FOUND — `DIAG-BR-20260815-06` (Configurations B and C), Headed

Two isolated matched-pair experiments, each four fresh sessions, each running the identical
unconditional three-probe sequence with unchanged timings. Selenium 4.13.0, SHAFT 7.4.20231015,
JDK 21.0.11, application, test code, login/navigation and the §4a instrumentation are the same in
both and the same as Configuration A. Only the browser and driver binaries differ.

Both binaries were pinned explicitly. Setting `webdriver.chrome.driver` makes Selenium's
`DriverFinder` resolve from that path and skip Selenium Manager entirely; the browser was pinned
through `ChromeOptions.setBinary`, which SHAFT merges last. Nothing was installed globally and
neither installed Chrome build was replaced.

### Configuration B — is it specific to ChromeDriver 150.0.7871.124?

An exact ChromeDriver `150.0.7871.187` **does not exist**: the official Chrome for Testing catalogue
has no such version. It does publish 56 other ChromeDriver 150 builds with win64 assets, so B was
runnable rather than skipped. The closest official pairing to the running browser was used:
**ChromeDriver `150.0.7871.115`**, same 7871 branch, one patch below the cached `.124`.

| | Value |
|---|---|
| Browser | Chrome **150.0.7871.187**, `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe` (confirmed by capability and by `chrome://version`) |
| Driver | ChromeDriver **150.0.7871.115** (`branch-heads/7871@{#2956}`), isolated directory |
| Result | **12 losses out of 12** |

Every probe: `exception=none`, 175-206 ms, `events=[]`, `radios{Active=true Inactive=false Both=false}`.
The wire signature is byte-identical to Configuration A — same three `Input.dispatchMouseEvent`
commands at the same `x=653, y=549`, all acknowledged within the same millisecond:

```
[12:08:51.408] Command:  Input.dispatchMouseEvent (id=636) {"type":"mouseMoved",   "x":653,"y":549}
[12:08:51.408] Command:  Input.dispatchMouseEvent (id=637) {"type":"mousePressed", "x":653,"y":549}
[12:08:51.408] Command:  Input.dispatchMouseEvent (id=638) {"type":"mouseReleased","x":653,"y":549}
[12:08:51.408] Response: (id=636) {} · (id=637) {} · (id=638) {}      ← no renderer work
```

**Configuration B fails.** The defect is not specific to driver build `.124`.

### Configuration C — does a Selenium-4.13-contemporary pair still fail?

Latest official 117 version publishing both Windows assets: **`117.0.5938.149`**. Selenium 4.13.0
bundles devtools v115/116/117, so this pair is exactly contemporary.

| | Value |
|---|---|
| Browser | Chrome **117.0.5938.149**, isolated Chrome for Testing build (confirmed by `chrome://version` `executable_path`) |
| Driver | ChromeDriver **117.0.5938.149** (`branch-heads/5938@{#1539}`), isolated directory |
| Result | **12 deliveries out of 12** |

The **first** real-input interaction after reaching the Branch list landed in every session, with the
complete trusted event chain and the model committed:

```
LABEL:pointerdown(t)@231ms  LABEL:mousedown(t)@231ms  LABEL:pointerup(t)@232ms
LABEL:mouseup(t)@232ms      LABEL:click(t)@232ms
INPUT#id-Status-Both:click(t)@235ms  input(t)@235ms  change(t)@235ms
→ radioCheckedNow=true   radios{Active=false Inactive=false Both=true}
```

Probes 2 and 3 also delivered; they show `click` without `input`/`change`, which is correct — the
radio was already checked, so there was no value change to fire. The wire traffic is the same three
commands at the same coordinates, but the acknowledgement behaves like a click that lands:

```
[12:12:40.306] Command:  (id=631) mouseMoved · (id=632) mousePressed
[12:12:40.307] Command:  (id=633) mouseReleased
[12:12:40.307] Response: (id=631) {}
[12:12:40.308] Response: (id=632) {}
[12:12:40.314] Response: (id=633) {}      ← +7 ms: the renderer ran the page's handlers
```

That +7 ms lag is the same signature §4b measured on the login click that lands (+11-12 ms), and its
absence is the signature of every lost click. **Configuration C passes.**

### Verdict

| Configuration | Browser | Driver | Delivered |
|---|---|---|---|
| A / A2 | Chrome 150.0.7871.187 | ChromeDriver 150.0.7871.124 | 0 / 24 |
| **B** | Chrome 150.0.7871.187 | ChromeDriver **150.0.7871.115** | **0 / 12** |
| **C** | Chrome **117.0.5938.149** | ChromeDriver **117.0.5938.149** | **12 / 12** |

Per the interpretation rule for *B fails, C passes*: **the defect is a Chrome 150-era browser/input
compatibility problem or regression, not a defect in a single ChromeDriver build.** Two different
official ChromeDriver 150 builds fail identically against Chrome 150, and a contemporary 117 pair
delivers every interaction under otherwise identical conditions.

> ⚠️ **§4e narrows this.** Chrome 151 fails too, so "150-era" is wrong as stated — the failing range
> spans at least two generations. §4e also identifies a build-architecture confound that this
> section did not control for: every failing configuration ran a **32-bit** Chrome and the only
> passing one ran a **64-bit** Chrome. Read §4d's verdict together with §4e before relying on it.

Two honest limits on the attribution:

- B changed only the driver, so it isolates the driver build within the 150 generation. C changed
  browser *and* driver together, so it establishes that the 117 generation works — it does not by
  itself separate "Chrome 150 is the problem" from "ChromeDriver 150 is the problem". Separating
  those needs a cross-generation pairing, which no supported configuration provides (ChromeDriver
  enforces a major-version match).
- The `--start-maximized` window, the target coordinates `653,549`, `elementFromPoint [IS TARGET]`
  and `readyState=complete` were identical in every configuration, so none of them is the variable.

Harness `ClickPairDiagnostic_TC` plus `testng-diag-pair.xml`, both **deleted after capture**; the
isolated binaries were deleted too; `mvn compile test-compile` exit 0 afterwards. Evidence:
`healing/evidence_configBC_2026-08-15/`.

## 4e. CHROME 151 FAILS TOO — `DIAG-BR-20260815-07` (Configuration D), Headed

Four fresh sessions, three unconditional Status `Both` probes each, unchanged timings, unchanged
instrumentation, unchanged Selenium 4.13.0 / SHAFT 7.4.20231015 / JDK 21.0.11.

| | Value |
|---|---|
| Browser | **Chrome 151.0.7922.138**, the *staged* build, launched in place as `C:\Program Files (x86)\Google\Chrome\Application\new_chrome.exe` |
| Driver | **ChromeDriver 151.0.7922.138** — an **exact** official version match (`branch-heads/7922@{#2891}`), isolated directory |
| Result | **12 losses out of 12** |

Unlike Configuration B, no compromise was needed: Chrome for Testing publishes an exact
`151.0.7922.138` driver. Both binaries were pinned explicitly, Selenium Manager was bypassed, and the
installed `chrome.exe` was neither restarted, replaced nor finalized — verified afterwards:
`chrome.exe` is still `150.0.7871.187` and `new_chrome.exe` is still the staged `151.0.7922.138`.

Every probe: `exception=none`, 166-194 ms, `events=[]`, `radios{Active=true Inactive=false Both=false}`,
`elementFromPoint=LABEL [IS TARGET]`, `readyState=complete`. The wire signature is identical to A and B:

```
[12:23:32.404] Command:  Input.dispatchMouseEvent (id=639) {"type":"mouseMoved",   "x":653,"y":549}
[12:23:32.404] Command:  Input.dispatchMouseEvent (id=640) {"type":"mousePressed", "x":653,"y":549}
[12:23:32.404] Command:  Input.dispatchMouseEvent (id=641) {"type":"mouseReleased","x":653,"y":549}
[12:23:32.404] Response: (id=639) {} · (id=640) {} · (id=641) {}      ← no renderer work
```

**Decision gate outcome: Chrome 151 fails like Chrome 150.** The 151 upgrade is not a fix, and the
Chrome 117 pair must not be treated as a production repair — it is a diagnostic compatibility
baseline only. No verification suite was run and no repair was attempted.

### ⚠️ Architecture confound — this weakens §4d's attribution

`chrome://version` reports the build architecture, and it co-varies exactly with the outcome:

| Configuration | Chrome | Architecture | Source | Delivered |
|---|---|---|---|---|
| A / A2 | 150.0.7871.187 | **32-bit** | installed, `Program Files (x86)` | 0 / 24 |
| B | 150.0.7871.187 | **32-bit** | installed, `Program Files (x86)` | 0 / 12 |
| **C** | 117.0.5938.149 | **64-bit** | Chrome for Testing `chrome-win64` | **12 / 12** |
| D | 151.0.7922.138 | **32-bit** | installed (staged), `Program Files (x86)` | 0 / 12 |

Every failing configuration ran a 32-bit Chrome. The only passing one ran a 64-bit Chrome. Two
explanations now fit **all** the evidence equally well:

1. **Browser generation** — 117 delivers, 150 and 151 do not.
2. **Build architecture or provenance** — 64-bit (or Chrome for Testing) delivers, the installed
   32-bit build does not.

§4d could not see this because C was the only non-installed browser it ran. D makes it matter,
because "a 150-era regression" now has to span 150 *and* 151 while sparing 117 — whereas the
architecture explanation covers every observation without requiring a two-generation regression.

**Neither explanation may be asserted as the cause on current evidence.** They are cheaply separated
by one experiment: an official Chrome for Testing **`chrome-win64` 151.0.7922.138** (which exists,
with a matching driver) run against the same ChromeDriver 151. If that pair delivers, architecture
or provenance is the factor and generation is not. If it fails, generation stands and the
failing range is 150-151. That experiment has **not** been run — it is outside the approved scope.

Harness `ClickPairDiagnostic_TC` plus `testng-diag-pair.xml`, both **deleted after capture**; the
isolated ChromeDriver 151 was deleted too; `mvn compile test-compile` exit 0 afterwards. Evidence:
`healing/evidence_configD_2026-08-15/`.

## 4f. INCONCLUSIVE — `DIAG-BR-20260815-08` (Configuration E), Headed

Configuration E differs from Configuration D in the browser binary and nothing else: same exact
ChromeDriver `151.0.7922.138`, same Selenium 4.13.0 / SHAFT 7.4.20231015 / JDK 21.0.11, same
application, login/navigation, probe target, timings and §4a instrumentation, same Headed mode.

| | D | E |
|---|---|---|
| Chrome | 151.0.7922.138, installed/staged `new_chrome.exe` | 151.0.7922.138, Chrome for Testing `chrome-win64` |
| Architecture | 32-bit | **64-bit** (confirmed by `chrome://version`) |
| Driver | ChromeDriver 151.0.7922.138 | identical |
| Delivered | 0 / 12 | **3 / 12** |

### Neither decision-gate branch applies

**E is intermittent, not consistent, and not a clean failure.**

| Session | Cold start? | Driver-construction → login | Probes delivered |
|---|---|---|---|
| 1 | yes — first launch of the freshly extracted build | **32.4 s** | **3 / 3** |
| 2 | no | 20.5 s | 0 / 3 |
| 3 | no | 19.8 s | 0 / 3 |
| 4 | no | 24.1 s | 0 / 3 |

Session 1 delivered the complete trusted chain on the *first* real-input interaction
(`radios{Active=false Inactive=false Both=true}`); sessions 2-4 recorded `events=[]` with the radio
uncommitted, exactly like D. Every session had `hasFocus=false` before probe 1, so focus does not
distinguish them.

The proper unit of independence is the **session**, not the probe — within a session the three
probes are strongly correlated (every session here was 3/3 or 0/3). On that basis E is **1 of 4
sessions**, against D's 0 of 4 and C's 4 of 4. One session in four is far too weak to call a
difference from D, and it is clearly different from C.

**Per the standing rule that a partial or intermittent improvement is not confirmation, Configuration
E is reported as INCONCLUSIVE.** Neither gate branch is taken:

- *"E delivers consistently"* — **not met.** 3/12 probes, 1/4 sessions. The verification suite
  (TC-BR-045, SearchBranchSuite, BranchProvisioner, Update Branch) was **not** run, and no claim is
  made about the acceptance gate.
- *"E loses all interactions like D"* — **not met.** Session 1 delivered, so 32-bit architecture and
  installed-browser provenance cannot be called *necessary* causes either.

### What E does establish

**The defect is not deterministic under Chrome 151 win64.** This is the first configuration to
produce both outcomes from identical binaries, which makes it the cleanest available comparison of a
delivered against a lost click:

```
E session 1 probe 1 — DELIVERED
[12:58:09.851] Command:  (id=639) mouseMoved · (id=640) mousePressed · (id=641) mouseReleased
[12:58:09.851] Response: (id=639) {}
[12:58:09.853] Response: (id=640) {}
[12:58:09.858] Response: (id=641) {}      ← +7 ms: the renderer ran the page's handlers

E session 2 probe 1 — LOST
[12:58:32.796] Command:  (id=645) mouseMoved · (id=646) mousePressed · (id=647) mouseReleased
[12:58:32.797] Response: (id=645) {} · (id=646) {} · (id=647) {}      ← +1 ms, no renderer work
```

The `mouseReleased` acknowledgement latency therefore discriminates delivered from lost **within a
single configuration**, independent of browser build, driver build and generation. It is the most
reliable signal this investigation has found.

### Consequences for the earlier attributions

- **§4d's "Chrome 150-era" verdict is further weakened.** Chrome 151 win64 can deliver, so no clean
  generation boundary at 150 survives.
- **§4e's architecture/provenance confound is not resolved.** E was designed to separate it and
  returned an intermittent result instead.
- **C's 12/12 is not explained by cold start.** C's four sessions had uniform 15.5-19.2 s
  construction-to-login times with no cold-start spike, and all four delivered. E delivered only in
  its cold session. So C and E behave differently, and "Chrome for Testing win64" alone does not
  account for C's result.
- **Every prior 0/12 result is still a 0/12**, but the intermittency means those runs bound the rate
  rather than prove impossibility. With 4 sessions per configuration, a low per-session success rate
  could plausibly have produced 0/4 by chance.

The cold-start correlation (the one delivering session was also the only cold launch, and was 12 s
slower to reach login) is a **single observation**, not a finding. It is the most interesting thread
E produced and it is untested.

Harness `ClickPairDiagnostic_TC` plus `testng-diag-pair.xml`, both **deleted after capture**; the
isolated Chrome for Testing 151 win64 pair was deleted too; `mvn compile test-compile` exit 0
afterwards. The installed Chrome was neither restarted, replaced nor finalized — `chrome.exe` is
still `150.0.7871.187`. Evidence: `healing/evidence_configE_2026-08-15/`.

## 5. Not yet established

- ~~Whether the drop is "never dispatched by ChromeDriver" or "dispatched onto an element replaced by an Angular re-render".~~ **Settled.** §4a ruled out element replacement; §4b's ChromeDriver wire log rules out non-emission. Chrome accepts the command and discards the input.
- **Why** the failing browsers discard it. §4b locates the loss inside Chrome, between accepting the CDP command and engaging the renderer. §4c rejects the `--disable-features` override candidate and rules out window focus and visibility. §4d and §4e bound the failure empirically but identify no code-level trigger.
- **Whether the factor is browser generation or build architecture/provenance.** §4e showed both fit; §4f ran the separating experiment and it came back **intermittent**, resolving neither.
- **Whether the defect is deterministic at all.** §4f says no — identical binaries produced 3/3 in one session and 0/3 in the next three. Every earlier "0/12" therefore bounds a rate rather than proving impossibility, and all per-configuration verdicts need re-reading in that light. Establishing per-configuration success *rates* needs many more sessions than four.
- **Whether cold start is the hidden variable.** E's only delivering session was its only cold browser launch, and was 12 s slower to reach login. One observation, untested, and C contradicts a simple version of it (C delivered in warm sessions too).
- Whether the 117 pass is specific to 117 or holds across the intervening generations. A bisect is premature while the outcome is intermittent — a bisect assumes a deterministic pass/fail per version, which §4f shows does not hold.
- Whether a current Selenium/SHAFT toolchain delivers against Chrome 151. Untested.
- Why the suite's `selectStatus` re-drive (3 attempts, ~19 s total) still failed in `rerun-23`, when D3 shows recovery after the first interaction. Suggests the window is longer or differently triggered under full-suite conditions.
- Whether other screens (Add Branch, Update Branch) share the defect. **The Credential-dropdown open-commit intermittency tracked for TC-BR-013/021/038/066/067/068 has the same signature — click reported, DOM unchanged, no exception — and is now a strong candidate for the same root cause.** Not tested.

## 6. Status of REPAIR-BR-012

Unchanged, uncommitted, guards not softened, nothing merged or promoted. Its synchronization fix is correct and was proven in `rerun-23` run 2. It is blocked from acceptance by this prerequisite defect, which it correctly exposes rather than causes.

No repair for the click-delivery defect has been implemented. Stopped for human review.
