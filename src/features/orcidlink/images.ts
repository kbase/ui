/**
 * Constructs urls for images used in the orcidlink ui
 *
 * Note that the usual technique, importing the image, which creates a url back
 * into the web app, does not work with the current state of Europa dependencies.
 * Therefore, we use hardcoded image paths, combined with the PUBLIC_URL.
 * When Europa deps are updated, or it is switched to vite, the image imports
 * should be re-enabled.
 */

const ORCID_ICON = '/assets/images/ORCID-iD_icon-vector.svg';

export type ImageName = 'orcidIcon';

export function image(name: ImageName): string {
  switch (name) {
    case 'orcidIcon':
      return `${process.env.PUBLIC_URL}${ORCID_ICON}`;
  }
}
