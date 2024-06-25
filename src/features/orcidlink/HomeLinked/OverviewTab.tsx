/**
 * Implements the "Overview" tab of the linked home view.
 *
 * THe primary job of this tab view is to display a summary of the user's
 * orcidlink and orcid profile.
 */
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { InfoResult } from '../../../common/api/orcidlinkAPI';
import {
  LinkRecordPublic,
  ORCIDProfile,
} from '../../../common/api/orcidLinkCommon';
import LinkInfo from '../common/LinkInfo';
import MoreInformation from '../common/MoreInformation';

export interface OverviewTabProps {
  info: InfoResult;
  linkRecord: LinkRecordPublic;
  profile: ORCIDProfile;
}

export default function OverviewTab({
  info,
  linkRecord,
  profile,
}: OverviewTabProps) {
  return (
    <Grid container rowSpacing={2} columnSpacing={2}>
      <Grid xs={6}>
        <Card variant="outlined">
          <CardHeader title="Your KBase ORCID Link" />
          <CardContent>
            <LinkInfo
              linkRecord={linkRecord}
              profile={profile}
              orcidSiteURL={info.runtime_info.orcid_site_url}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={6}>
        <Card variant="outlined">
          <CardHeader title="About" />
          <CardContent>
            <Typography>
              Your KBase ORCID® Link gives KBase tools access to your ORCID®
              account while you are logged into KBase.
            </Typography>
            <p>
              Your KBase ORCID® Link will be stored at KBase until you remove
              it.
            </p>
            <p>
              The link will only be used when you are signed in to KBase. In
              addition, any tool that uses the link will alert you before using
              it, and will explain how it will use it.
            </p>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardHeader title="More Information" />
          <CardContent>
            <MoreInformation />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
