/**
 * Displays the "home page", or primary orcidlink view, for unlinked users.
 */
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { Link } from 'react-router-dom';
import MoreInformation from './common/MoreInformation';

export default function Unlinked() {
  return (
    <Grid container rowSpacing={2} columnSpacing={2}>
      <Grid xs={6}>
        <Card variant="outlined">
          <CardHeader title="Create your KBase ORCID® Link" />

          <CardContent>
            <Typography>
              You do not currently have a link from your KBase account to an
              ORCID® account.
            </Typography>
            <Typography sx={{ mt: 2 }}>
              Click the button below to begin the KBase ORCID® Link process.
            </Typography>
          </CardContent>
          <CardActions style={{ justifyContent: 'center' }} sx={{ p: 2 }}>
            <Link to={'/orcidlink/link'}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FontAwesomeIcon icon={faPlus} size="lg" />}
              >
                Create your KBase ORCID® Link …
              </Button>
            </Link>
          </CardActions>
        </Card>
      </Grid>
      <Grid xs={6}>
        <Card variant="outlined">
          <CardHeader title="About" />
          <CardContent>
            <Typography>
              A KBase ORCID® Link gives KBase limited access to your ORCID®
              account while you are logged into KBase.
            </Typography>
            <p>
              If you don't have an ORCID® account, you may create one before
              creating the link, or even "on the fly" while creating a link.
            </p>
            <p>
              You can only create a KBase ORCID® Link from this page. It will be
              stored at KBase until you remove it.
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
