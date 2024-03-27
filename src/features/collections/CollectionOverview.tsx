import {
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Button,
  Stack,
} from '@mui/material';
import { FC } from 'react';
import type { SetModalView } from './CollectionDetail';
import {
  getCollection,
  getGenomeAttribs,
  getSampleAttribs,
} from '../../common/api/collectionsApi';
import { Loader } from '../../common/components/Loader';
import { SampleAttribs } from './data_products/SampleAttribs';
import { TaxaCount } from './data_products/TaxaCount';
import createDOMPurify from 'dompurify';
import { marked } from 'marked';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useModalControls } from '../layout/Modal';
import classes from './Collections.module.scss';

const purify = createDOMPurify(window);

export const CollectionOverview: FC<{
  collection_id: string;
  setModalView: SetModalView;
  modal?: ReturnType<typeof useModalControls>;
}> = ({ collection_id, setModalView, modal }) => {
  const navigate = useNavigate();

  const { data: collection, ...collectionQuery } =
    getCollection.useQuery(collection_id);
  if (collectionQuery.isLoading || !collection) return <Loader></Loader>;

  // In this Collection
  const hasGenomes = collection.data_products.find(
    (dp) => dp.product === 'genome_attribs'
  );
  const { data: genomeCount } = getGenomeAttribs.useQuery(
    {
      collection_id: collection_id,
      count: true,
    },
    { skip: !hasGenomes }
  );
  const hasSamples = collection.data_products.find(
    (dp) => dp.product === 'samples'
  );
  const { data: sampleCount } = getSampleAttribs.useQuery(
    {
      collection_id: collection_id,
      count: true,
    },
    { skip: !hasSamples }
  );

  //DPs
  const taxa_count = collection.data_products.find(
    (dp) => dp.product === 'taxa_count'
  );
  const samples = collection.data_products.find(
    (dp) => dp.product === 'samples'
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <Card sx={{ height: '100%' }} elevation={0}>
          <CardHeader
            title={
              <Typography variant="h6" fontWeight="bold">
                Details
              </Typography>
            }
            sx={{ paddingBottom: 0 }}
          />
          <CardContent>
            <Typography
              sx={{ fontSize: 12 }}
              color="text.secondary"
              gutterBottom
            >
              Collection Name
            </Typography>
            <div>{collection.name}</div>
            <br></br>
            <Typography
              sx={{ fontSize: 12 }}
              color="text.secondary"
              gutterBottom
            >
              Updated On
            </Typography>
            <div>
              {new Date(collection.date_active).toLocaleString(undefined, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
            <br></br>
            <Typography
              sx={{ fontSize: 12 }}
              color="text.secondary"
              gutterBottom
            >
              Source Version
            </Typography>
            <div>{collection.ver_src}</div>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={9}>
        <Card sx={{ height: '100%' }} elevation={0}>
          <CardHeader
            title={
              <Typography variant="h6" fontWeight="bold">
                Description
              </Typography>
            }
            sx={{ paddingBottom: 0 }}
          />
          <CardContent>
            <div>{collection.desc}</div>
            {collection.attribution && (
              <>
                <Typography fontWeight="bold" sx={{ marginTop: 2 }}>
                  Attribution
                </Typography>
                <div
                  dangerouslySetInnerHTML={{
                    __html: marked(purify.sanitize(collection.attribution)),
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6}>
        <Card sx={{ height: '100%' }} elevation={0}>
          <CardHeader
            title={
              <Typography variant="h6" fontWeight="bold">
                In this Collection
              </Typography>
            }
            sx={{ paddingBottom: 0 }}
          />
          <CardContent>
            <Stack direction={'row'} spacing={2}>
              {hasGenomes ? (
                <Card
                  className={classes['clickable-overview-card']}
                  onClick={() => {
                    navigate(`/collections/${collection_id}/genome_attribs`);
                  }}
                >
                  <CardContent>
                    <Button variant="text" sx={{ padding: '0' }}>
                      <Typography
                        sx={{ fontSize: 24, textTransform: 'none' }}
                        color="primary"
                        gutterBottom
                      >
                        Genomes
                      </Typography>
                    </Button>
                    <Typography color="text.primary">
                      {genomeCount?.count?.toLocaleString() ?? (
                        <Loader></Loader>
                      )}{' '}
                      total
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <></>
              )}

              {hasSamples ? (
                <Card
                  className={classes['clickable-overview-card']}
                  onClick={() => {
                    navigate(`/collections/${collection_id}/samples`);
                  }}
                >
                  <CardContent>
                    <Button variant="text" sx={{ padding: '0' }}>
                      <Typography
                        sx={{ fontSize: 24, textTransform: 'none' }}
                        color="primary"
                        gutterBottom
                      >
                        Samples
                      </Typography>
                    </Button>
                    <Typography color="text.primary">
                      {sampleCount?.count?.toLocaleString() ?? (
                        <Loader></Loader>
                      )}{' '}
                      total
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <></>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6}>
        <Card sx={{ height: '100%' }} elevation={0}>
          <CardHeader
            title={
              <Typography variant="h6" fontWeight="bold">
                Actions
              </Typography>
            }
            sx={{ paddingBottom: 0 }}
          />
          <CardContent>
            <Stack direction={'row'} spacing={2}>
              <Card
                className={classes['clickable-overview-card']}
                onClick={() => {
                  navigate(`/collections/${collection_id}/genome_attribs`);
                }}
              >
                <CardContent>
                  <strong>Explore</strong> and <strong>filter</strong> genomes
                </CardContent>
                <CardActions sx={{ flexDirection: 'row-reverse' }}>
                  <Button size="small">
                    <FAIcon icon={faArrowRight} size={'2x'} />
                  </Button>
                </CardActions>
              </Card>
              <Card
                className={classes['clickable-overview-card']}
                onClick={() => {
                  navigate(`/collections/${collection_id}/genome_attribs`);
                  setModalView('match');
                  modal?.show();
                }}
              >
                <CardContent>
                  <strong>Match</strong> collection data with data from a
                  Narrative
                </CardContent>
                <CardActions sx={{ flexDirection: 'row-reverse' }}>
                  <Button size="small">
                    <FAIcon icon={faArrowRight} size={'2x'} />
                  </Button>
                </CardActions>
              </Card>
              <Card
                className={classes['clickable-overview-card']}
                onClick={() => {
                  navigate(`/collections/${collection_id}/genome_attribs`);
                }}
              >
                <CardContent>
                  <strong>Select</strong> genomes to export
                </CardContent>
                <CardActions sx={{ flexDirection: 'row-reverse' }}>
                  <Button size="small">
                    <FAIcon icon={faArrowRight} size={'2x'} />
                  </Button>
                </CardActions>
              </Card>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      {taxa_count ? (
        <Grid item xs={6}>
          <Card sx={{ height: '100%', overflow: 'visible' }} elevation={0}>
            <CardHeader
              title={
                <Typography variant="h6" fontWeight="bold">
                  Taxa Counts
                </Typography>
              }
              sx={{ paddingBottom: 0 }}
            />
            <CardContent>
              <TaxaCount
                collection_id={collection_id}
                paperProps={{
                  variant: 'elevation',
                  elevation: 0,
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      ) : (
        <></>
      )}
      {samples ? (
        <Grid item xs={6}>
          <Card sx={{ height: '100%' }} elevation={0}>
            <CardHeader
              title={<Typography variant="h6">Sample Preview</Typography>}
            />
            <SampleAttribs
              mapOnly={true}
              collection_id={collection_id}
              paperProps={{
                variant: 'elevation',
                elevation: 0,
              }}
            ></SampleAttribs>
          </Card>
        </Grid>
      ) : (
        <></>
      )}
    </Grid>
  );
};
