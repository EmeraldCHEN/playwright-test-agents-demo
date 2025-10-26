# Permit Application Portal — Automation Test Plan

## Executive Summary

Application under test: https://permitapplication-y2pbo.powerappsportals.com/

This test plan covers automated functional and edge-case test scenarios for the Permit Application Portal (Power Apps Portal). The portal supports:
- Authentication (Microsoft account / Azure AD)
- Browsing available permits
- Starting an application for a permit
- Viewing "My Permits" (user-specific dashboard)
- Search/filtering of permits
- Document uploads and form submission (subject to user permissions)

Assumptions:
- Tests start from a blank/fresh state (no prior session cookies or localStorage). Clear session before each test.
- The portal is deployed at the URL above and accessible from the test environment.
- Application content (sample text/images) may be static sample content; tests should validate functional behavior more than exact text copy.

Test objectives:
- Verify authentication flows (happy path + negative cases)
- Verify main navigation and page flows (Our Permits, My Permits, permit summary, start application)
- Verify form interactions and permission handling
- Verify search/filter and basic accessibility checks
- Provide reproducible scenarios for automation implementation (Playwright)

## Test Data and Environment
- Recommended browser: Chromium (headless for CI; headed for debugging)
- Fresh browser context per test
- Test user(s):
  - Primary: `......onmicrosoft.com` (assume valid AD account)
  - Secondary/Negative: a non-existent or invalid user for negative tests
- Files for upload tests: small PDF (<= 100 KB), empty file, large file (~10 MB) to test limits

## Test Scenarios

Notes on format for each scenario:
- Title
- Assumptions / Seed state
- Steps (numbered) — exact actions to run in automation
- Expected results
- Success criteria
- Failure conditions / Notes

---

### 1. Authentication and submit — Happy Path 
Assumptions: fresh browser context, network access to Microsoft login endpoints.

Steps:
1. Navigate to `https://permitapplication-y2pbo.powerappsportals.com/`
2. Click "Sign in" (if not auto-redirected)
3. On Microsoft login page, enter valid username 
4. and continue
5. Enter valid password 
6. and sign in
7. If prompted for "Stay signed in?", select the option "Yes" 
8. Click on 'Sign in' buntton on the right top corner on the homepage
9. Enter valid username 
10. Enter  valid password 
11. Click on 'Sign in' button to log in
12. Click 'Our Permits' nav item
13. Select 'Deck' tile to navigate to hte Default Permit page
14. Click on 'Submit' button
15. Enter '020123456' in the Phone Number field
16. Click on 'Next' button
17. Click on 'Next' button
18. Click on 'Next' button
19. Enter "Sample text" in the Initials field
20. Click on 'Next' button
20. Click on 'Submit' button
21. Verify the message displaying : "Permit submission successful"



### 2. Authentication — Invalid Credentials (Negative)
Assumptions: fresh context

Steps:
1. Go to portal sign-in
2. Enter an invalid username or password
3. Attempt to sign in

Expected results:
- Microsoft login surface shows a clear error message (e.g., "That username doesn't exist" or "Incorrect password")
- User remains unauthenticated and portal does not show "Signed in as"

Success criteria:
- Error message is shown and no portal session is created

Failure conditions:
- Silent failure (no message) or redirection to protected content

---

### 3. Navigation — Our Permits Listing (Happy Path)
Assumptions: signed-in or not-signed-in user (listing is public but site indicates private status). Start fresh.

Steps:
1. Navigate to `/search/` via top navigation or direct URL
2. Verify page title and the presence of the search box
3. Inspect the list of permit tiles/cards (e.g., "Deck", "Default", etc.)
4. Click a permit tile (e.g., "Deck") to open permit summary

Expected results:
- The listing displays the expected number of results (page shows heading like "Permits" and a search input)
- Clicking a tile goes to a summary page with sections and a primary CTA (e.g., "Submit")

Success criteria:
- Navigation from listing to summary works and elements are reachable by automation selectors (role, aria-label, text)

Failure conditions:
- Tiles are not clickable or do not navigate

---

### 4. Permit Summary → Start Application (Permission handling)
Assumptions: Signed-in test user may or may not have permission to apply.

Steps:
1. From a permit summary page (e.g., `/summary/?q=default`), locate and click the primary CTA (e.g., "Submit" or "Apply")
2. Observe behavior: either the application form loads, or an error/permission message appears

Expected results (two branches):
- If user has permission: app form opens and shows sections "Applicant Info", "Project Details", etc.
- If user does not have permission: clear message is shown (e.g., "You don't have the appropriate permissions") and action is blocked

Success criteria:
- Application start respects permissions and provides an actionable message when access is denied

Failure conditions:
- Form shows but save/submit is blocked without a clear message
- Silent failure or crash in JS

---

### 5. My Permits — View Dashboard (Auth gating)
Assumptions: fresh context

Steps:
1. Click "My Permits" from top navigation
2. If not signed in, ensure the site prompts to sign in or shows login flow
3. If signed in and authorized, verify the table shows the list of applications; otherwise, verify a message indicates none or permission issues

Expected results:
- Non-authenticated users are prompted to sign in
- Authenticated users see a table with column headers: Application ID, Permit Type, Submit Date, Status, Actions or a message explaining no applications

Success criteria:
- Access rules are consistent and clear messages/controls are present

Failure conditions:
- Page shows empty/unhelpful content, or errors are visible in the console causing broken UI

---

### 6. Search Functionality — Basic and Edge Cases
Assumptions: search endpoint available

Steps:
1. On `/search/`, type a known permit name (e.g., "Deck") and click Search
2. Observe results
3. Test searches with: empty string, long string (> 256 chars), SQL/JS injection characters, and whitespace-only input

Expected results:
- Valid queries return matching tiles
- Edge/invalid inputs are handled gracefully (no JS error, sanitized input, either 0 results or helpful message)

Success criteria:
- Search component does not crash and returns expected results or a consistent empty-state message

Failure conditions:
- Unhandled exceptions, server errors, or UI hangs

---

### 7. Application Form — Happy Path (when permissions allow)
Assumptions: user has permissions to begin and submit an application for a permit

Steps:
1. Start an application for a permit
2. Fill in each required section (Applicant Info, Project Details, etc.) using valid data
3. Upload required documents (valid PDF <= 100 KB)
4. Complete acknowledgement(s) and proceed to final review
5. Submit the application
6. Verify confirmation page or application ID is shown and user is redirected to "My Permits" with the new application listed

Expected results:
- Fields accept valid input and show real-time validation where applicable
- Uploaded files attach to the application
- Successful submission yields application ID and confirmation

Success criteria:
- End-to-end create-and-submit works and the new app appears in user's list

Failure conditions:
- Validation prevents submission with valid data
- File upload fails silently or corrupts the application

---

### 8. Form Validation and Negative Inputs
Assumptions: form has client-side and server-side validation

Steps:
1. For each required field, try leaving it blank and attempt to submit
2. Enter invalid formats (e.g., letters in numeric fields, bad email format)
3. Upload an unsupported file type (e.g., .exe) and a very large file (~>10 MB)

Expected results:
- Clear validation messages for each failed field
- Unsupported file types rejected with a helpful message
- Large files either rejected with an error message or handled by server with an error

Success criteria:
- Validation prevents bad data and provides actionable error messages

Failure conditions:
- Silent rejection, corrupted state, or server errors without messages

---

### 9. Uploads and Attachment Edge Cases
Assumptions: portal supports document upload in a form section

Steps:
1. Upload a small valid document (pdf)
2. Upload a zero-byte file
3. Upload a very large file (near or above documented limits)
4. Attempt simultaneous uploads (if UI supports multiple)

Expected results:
- Small valid files accepted
- Zero-byte file rejected with a clear message
- Large files rejected or processed per server limits with error messages

Success criteria:
- Upload behavior predictable and error-handling clear

Failure conditions:
- Browser crashes, UI freezes, or server 5xx errors

---

### 10. Session and Persistence
Assumptions: portal uses cookies/session

Steps:
1. Sign in and start filling an application
2. Refresh the browser
3. Close and reopen browser (or simulate new context) and sign in again

Expected results:
- Partial form data may be saved as draft if feature exists; if not, refresh should not crash and user should be able to continue entering data

Success criteria:
- App does not lose data unexpectedly during accidental refresh

Failure conditions:
- Data loss without warning or signs of corruption

---

### 11. Access Control and RBAC Verification
Assumptions: portal differentiates users by roles/permissions

Steps:
1. Sign in with a user expected to have no creation permissions and attempt to submit an application
2. Verify message states lack of permission
3. Sign in with a user expected to have create permissions and verify submission is available

Expected results:
- Permission checks enforced at UI and server-level with clear messages

Success criteria:
- Permission scenarios consistently enforced

Failure conditions:
- Authorization bypass or inconsistent behavior

---

### 12. Accessibility & ARIA Sanity Checks
Assumptions: basic ARIA and role attributes present

Steps:
1. Verify presence of main landmarks (banner, navigation, main, contentinfo)
2. Ensure form fields have labels or accessible names
3. Verify focus order on navigation and form flows

Expected results:
- Basic accessibility landmarks and labels present
- Keyboard navigation possible for major flows

Success criteria:
- No critical accessibility blockers (e.g., unlabeled form inputs preventing automation)

Failure conditions:
- Missing labels, broken focus order, or un-navigable controls

---

### 13. Error and Recovery Scenarios
Assumptions: network errors or server errors may occur

Steps:
1. Simulate a failed network call (if test harness can throttle or block) during form submit
2. Verify UI displays a retry option or a helpful error

Expected results:
- App surfaces a retry option or persistent error message and does not leave user in an inconsistent state

Success criteria:
- User can retry or recover safely without data loss

Failure conditions:
- Hung state, invisible errors, or data corruption

---

## Automation Implementation Notes
- Use role-based selectors where possible (getByRole, getByLabel) to make tests robust against copy changes.
- For authentication with Azure AD, consider mocking/stubbing the auth flow for CI or using a test-only service account. If true E2E is required, protect credentials and store them in CI secrets.
- Add `beforeEach` to create a fresh browser context and `afterEach` to clear storage and cookies.
- Keep tests independent and idempotent.

## Priority / Recommended Test Suite
- Smoke (high priority): sign-in happy path, Our Permits listing, open a permit summary, verify Submit CTA presence, My Permits access gating
- Core flows (medium): form happy path (if permission), search basic, viewing application list
- Edge/Negative (lower): uploads edge cases, RBAC permutations, accessibility checks

## Example selectors observed during exploration (for automation authoring)
- Landing / banner: heading `Company XYZNZ` (role=heading)
- Top nav: link text `Our Permits`, `My Permits`, `Sign in`
- Search input: role=textbox with placeholder `Search`
- Permit tiles: buttons with visible headings (e.g., `Deck`, `Default`)
- Summary CTA: button with text `Submit` or `Apply`
- My Permits: table with headers `Application ID`, `Permit Type`, etc.
- Signed-in indicator: text `Signed in as` followed by link with user name

---

## Test Plan File History
- Created: automated exploratory planning run (Playwright planner) — includes observed behavior: when signing in with the provided account, the site allowed sign-in but showed permission restrictions on starting an application and indicated My Permits may require additional roles.

---

## Next steps / Recommendations
- Implement Playwright tests for the Smoke suite first, using the `tests/` folder and following the patterns in existing specs.
- Decide on Azure AD test strategy: full E2E auth (store creds in secrets) vs mocked auth.
- Add small test fixtures for file uploads and user roles.


---

*End of test plan*
