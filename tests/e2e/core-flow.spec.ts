import { expect, test } from '@playwright/test';

test('creates argument, places it on pro +2 and exports project json', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByRole('button', { name: /Argument hinzufügen|Add argument/i }).click();

  const textarea = page.locator('textarea').first();
  await textarea.fill('Mehr Grünflächen');

  const argumentId = await page.locator('.argument-card').first().getAttribute('data-testid');
  const id = argumentId?.replace('argument-', '') ?? '';
  await page.getByTestId(`place-pro-2-${id}`).click();

  const dropZone = page.getByTestId('drop-zone-pro-2');
  await expect(dropZone.locator('.argument-card')).toHaveCount(1);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Projekt speichern|Save project/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toContain('.argumentationswaage.json');
});

test('mobile viewport shows board and staging area', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByText(/Neue Argumente|New arguments/i)).toBeVisible();
  await expect(page.locator('.seesaw-panel')).toBeVisible();
});
