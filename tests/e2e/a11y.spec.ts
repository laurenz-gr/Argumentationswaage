import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('start screen has no critical or serious accessibility violations', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.seesaw-panel')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  const blocking = results.violations.filter(
    (violation) => violation.impact === 'critical' || violation.impact === 'serious',
  );

  expect(
    blocking,
    blocking.map((violation) => `${violation.id}: ${violation.help}`).join('\n'),
  ).toEqual([]);
});

test('board with a placed argument stays accessible', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /Argument hinzufügen|Add argument/i }).click();
  await page.locator('textarea').first().fill('Mehr Grünflächen');

  const argumentId = await page.locator('.argument-card').first().getAttribute('data-testid');
  const id = argumentId?.replace('argument-', '') ?? '';
  await page.getByTestId(`place-pro-2-${id}`).click();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  const blocking = results.violations.filter(
    (violation) => violation.impact === 'critical' || violation.impact === 'serious',
  );

  expect(
    blocking,
    blocking.map((violation) => `${violation.id}: ${violation.help}`).join('\n'),
  ).toEqual([]);
});
