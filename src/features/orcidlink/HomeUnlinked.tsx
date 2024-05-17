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

export default function Unlinked() {
  return (
    <Grid container rowSpacing={2} columnSpacing={2}>
      <Grid xs={6}>
        <Card variant="outlined">
          <CardHeader title="Create Your KBase ORCID® Link!" />
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
            <Button
              variant="contained"
              color="primary"
              startIcon={<FontAwesomeIcon icon={faPlus} size="lg" />}
            >
              Create your KBase ORCID® Link …
            </Button>
          </CardActions>
        </Card>
      </Grid>
      <Grid xs={6}>
        <Card variant="outlined">
          <CardHeader title="Notes" />
          <CardContent>
            <Typography>NOTES HERE</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardHeader title="More Information" />
          <CardContent>
            <Typography>LINKS TO MORE INFORMATION HERE</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
