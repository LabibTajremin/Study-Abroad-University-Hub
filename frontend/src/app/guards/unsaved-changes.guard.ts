import { CanDeactivateFn } from '@angular/router';
import { AdminPage } from '../pages/admin-page/admin-page';

/**
 * Guards leaving the /admin route entirely (e.g. clicking Dashboard in the
 * sidebar, browser back) while there are unsaved staged changes. In-app tab
 * switching within /admin is guarded separately by AdminPage's own modal,
 * which offers Save/Discard/Cancel — this route-level guard uses a plain
 * confirm() since it only needs to block-or-allow navigation, not run an
 * async save before the route actually changes.
 */
export const unsavedChangesGuard: CanDeactivateFn<AdminPage> = (component) => {
  if (component.hasUnsavedChanges()) {
    return confirm(
      'You have unsaved changes in Manage Universities. Leave without saving?\n\n' +
      'Click Cancel to go back and click Save first.'
    );
  }
  return true;
};
