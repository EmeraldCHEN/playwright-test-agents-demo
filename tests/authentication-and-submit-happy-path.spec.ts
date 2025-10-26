// spec: tests/permit_portal_test_plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication and application — Happy Path', () => {
  test('Authentication and application — Happy Path', async ({ page }) => {
    // 1. Navigate to `https://permitapplication-y2pbo.powerappsportals.com/`

    await page.goto('https://permitapplication-y2pbo.powerappsportals.com/');

    // 2-3. On Microsoft login page, enter valid username : emeraldchen@emeraldchen25.onmicrosoft.com
    await page.getByRole('textbox', { name: 'Enter your email, phone, or' }).fill('.....onmicrosoft.com');

    // 4. and continue
    await page.getByRole('button', { name: 'Next' }).click();

    // 5. Enter valid password :  *WRNf2025
    await page.getByRole('textbox', { name: 'Enter the password for' }).fill('xxxxxx');

    // 6. and sign in
    await page.getByRole('button', { name: 'Sign in' }).click();

    // 7. If prompted for "Stay signed in?", select the option "Yes"
    await page.getByRole('button', { name: 'Yes' }).click();

    // 8. Click on 'Sign in' button on the right top corner on the homepage (if shown)

    await page.getByRole('link', { name: 'Sign in' }).click();
  

    // 9. Enter valid username : emeraldchen@emeraldchen25.onmicrosoft.com
    await page.getByRole('textbox', { name: 'Username' }).fill('.....onmicrosoft.com');
    
    // 10. Enter valid password :  *WRNf2025
    await page.getByRole('textbox', { name: 'Password' }).fill('xxxxxx');
      
    // 11. Click on 'Sign in' button to log in
    await page.getByRole('button', { name: 'Sign in' }).click();


    // 12. Click 'Our Permits' nav item
    await page.getByRole('link', { name: 'Our Permits' }).click();

    // 13. Select 'Deck' tile to navigate to the Default Permit page
    await page.getByRole('button', { name: 'Deck' }).click();

    // 14. Click on 'Submit' button
    await page.getByRole('button', { name: /Submit|Apply/i }).click();

    // 15. Enter '020123456' in the Phone Number field
    await page.getByRole('textbox', { name: /Phone Number/i }).fill('020123456');

    // 16. Click on 'Next' button
    await page.getByRole('button', { name: 'Next' }).click();

    // 17. Click on 'Next' button
    await page.getByRole('button', { name: 'Next' }).click();

    // 18. Click on 'Next' button
    await page.getByRole('button', { name: 'Next' }).click();

    // 19. Enter "Sample text" in the Initials field
    await page.getByRole('textbox', { name: /Initials/i }).fill('Sample text');

    // 20. Click on 'Next' button
    await page.getByRole('button', { name: 'Next' }).click();

    // 21. Click on 'Submit' button
    await page.getByRole('button', { name: /Submit/i }).click();

    // 22. Verify the message displaying : "Permit submission successful"
    await expect(page.getByText('Permit submission successful', { exact: false })).toBeVisible();
    await page.getByRole('link', { name: 'My Permits' }).click();
   
    // Assert the 'Submitted' status is visible in the My Permits table (robust locator)
    await expect(
      page.getByRole('cell', { name: /Submitted/i })
    ).toBeVisible();
  });
});