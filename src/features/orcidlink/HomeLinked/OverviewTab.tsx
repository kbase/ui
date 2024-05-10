import {
  Card,
  CardContent,
  CardHeader,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { InfoResult } from '../../../common/api/orcidlinkAPI';
import {
  LinkRecordPublic,
  ORCIDProfile,
} from '../../../common/api/orcidLinkCommon';
import LinkInfo from './LinkInfo';

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
          <CardHeader title="Notes" />
          <CardContent sx={{ pt: 0 }}>
            <div>NOTES HERE</div>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardHeader title="More Information" />
          <CardContent sx={{ pt: 0 }}>
            <div>LINKS TO MORE INFO HERE</div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
