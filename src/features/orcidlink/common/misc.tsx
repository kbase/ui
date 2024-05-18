/**
 * Miscellaneous commmonly used rendering functions
 *
 * If a bit of rendered content is used more than once, it should be wrapped in
 * a function and moved here.
 *
 */
import {
  Alert,
  AlertTitle,
  CircularProgress,
  Modal,
  Typography,
} from '@mui/material';
import { ORCIDProfile } from '../../../common/api/orcidLinkCommon';
import { image } from '../images';
import styles from './misc.module.scss';

export function renderORCIDIcon() {
  return (
    <img
      src={image('orcidIcon')}
      alt="ORCID Icon"
      className={styles['orcid-icon']}
    />
  );
}

function renderPrivateField() {
  return <Typography fontStyle="italic">private</Typography>;
}

function renderNA() {
  return (
    <Typography fontStyle="italic" variant="body1">
      n/a
    </Typography>
  );
}

export function renderRealname(profile: ORCIDProfile) {
  // Name is the one stored from the original linking, may have changed.
  if (profile.nameGroup.private) {
    return renderPrivateField();
  }

  const { firstName, lastName } = profile.nameGroup.fields;
  if (lastName) {
    return (
      <Typography>
        {firstName} {lastName}
      </Typography>
    );
  }
  return <Typography>{firstName}</Typography>;
}

/**
 * Renders the "credit name" from an ORCID User Profile.
 *
 * This is an optional field, so we are repared to render as n/a.
 *
 * @param profile An ORCID User Profile
 * @returns
 */
export function renderCreditName(profile: ORCIDProfile) {
  if (profile.nameGroup.private) {
    return renderPrivateField();
  }
  if (!profile.nameGroup.fields.creditName) {
    return renderNA();
  }
  return <Typography>{profile.nameGroup.fields.creditName}</Typography>;
}

function renderLoading(title: string, description: string) {
  return (
    <div className={styles.loading}>
      <Alert icon={<CircularProgress size="1rem" />}>
        <AlertTitle>
          <span className={styles['loading-title']}>{title}</span>
        </AlertTitle>
        <p>{description}</p>
      </Alert>
    </div>
  );
}

export function renderLoadingOverlay(open: boolean) {
  return (
    <Modal open={open} disableAutoFocus={true}>
      {renderLoading('Loading...', 'Loading ORCID Link')}
    </Modal>
  );
}

/**
 * Creates a link to an ORCID profile in the form recommended by ORCID.
 *
 * @param orcidSiteURL A URL to an ORCID public site that hosts orcid profiles
 * @param orcidId An ORCID iD
 * @returns An anchor component linking to the given ORCID iD
 */
export function renderORCIDId(orcidSiteURL: string, orcidId: string) {
  return (
    <a
      href={`${orcidSiteURL}/${orcidId}`}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {renderORCIDIcon()}
      {orcidSiteURL}/{orcidId}
    </a>
  );
}
