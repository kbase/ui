import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LinkRecordPublic,
  ORCIDProfile,
} from '../../../common/api/orcidLinkCommon';
import RealName from '../common/RealName';

export interface ManageTabProps {
  linkRecord: LinkRecordPublic;
  profile: ORCIDProfile;
  orcidSiteURL: string;
  removeLink: () => void;
  toggleShowInProfile: () => void;
}

export default function ManageTab({
  linkRecord,
  profile,
  orcidSiteURL,
  removeLink,
  toggleShowInProfile,
}: ManageTabProps) {
  const [confirm, setConfirm] = useState<boolean>(false);

  return (
    <Grid container rowSpacing={2} columnSpacing={2}>
      <Grid xs={6}>
        <Card variant="outlined">
          <CardHeader title="Remove your KBase ORCID® Link" />
          <CardContent>
            <Typography>
              You may <b>remove</b> your KBase ORCID® Link at any time.
            </Typography>

            <p>
              Removing the link will not alter any of your data stored at KBase
              or ORCID®. It will simply delete the link to your ORCID® account,
              preventing KBase from accessing your ORCID® profile thereafter.
            </p>

            <p>
              Please note that after you remove the link at KBase, you may also
              want to{' '}
              <a
                href={`${orcidSiteURL}/trusted-parties`}
                target="_blank"
                rel="noreferrer"
              >
                revoke the permissions granted to KBase at ORCID®
              </a>{' '}
              as well.
            </p>
          </CardContent>
          <CardActions style={{ justifyContent: 'center' }}>
            <Button
              variant="outlined"
              type="button"
              color="error"
              onClick={() => {
                setConfirm(!confirm);
              }}
              startIcon={<FontAwesomeIcon icon={faTrash} size="lg" />}
            >
              Remove KBase ORCID® Link …
            </Button>
            <Dialog open={confirm}>
              <DialogTitle>Confirm Removal of ORCID® Link </DialogTitle>
              <DialogContent>
                <p>Are you sure you want to remove this KBase ORCID® Link?</p>
                <p>
                  ORCID® iD is <b>{linkRecord.orcid_auth.orcid}</b> for{' '}
                  <b>
                    <RealName profile={profile} />
                  </b>
                </p>
              </DialogContent>
              <DialogActions>
                <Button
                  color="secondary"
                  onClick={() => {
                    removeLink();
                  }}
                >
                  Yes, go ahead and remove this link
                </Button>
                <Button
                  color="error"
                  onClick={() => {
                    setConfirm(false);
                  }}
                >
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>
          </CardActions>
        </Card>
      </Grid>
      <Grid xs={6}>
        <Card variant="outlined">
          <CardHeader title="Settings" />
          <CardContent>
            <Grid container rowSpacing={2} columnSpacing={2}>
              <Grid xs={4}>Show in User Profile?</Grid>
              <Grid xs={2}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Yes"
                  onChange={() => {
                    toggleShowInProfile();
                  }}
                />
              </Grid>
              <Grid xs={6}>
                When enabled your ORCID® iD will be displayed in{' '}
                <Link
                  to="legacy/people"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  your User Profile
                </Link>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
