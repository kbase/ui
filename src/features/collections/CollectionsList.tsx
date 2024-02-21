import { Collection, listCollections } from '../../common/api/collectionsApi';
import { usePageTitle } from '../layout/layoutSlice';
import { useNavigate } from 'react-router-dom';
import classes from './Collections.module.scss';
import { Card } from '../../common/components/Card';
import { Chip, Container, Grid, Stack } from '@mui/material';
import TextClamp from '../../common/components/TextClamp';
import { FC } from 'react';
import { PageHeader } from '../../common/components/PageHeader';
import { dataProductsMeta } from './CollectionSidebar';

export const CollectionsList = () => {
  usePageTitle('Data Collections');
  const collections = listCollections.useQuery();

  return (
    <main className={classes['collections_main']}>
      <PageHeader
        title="Collections"
        subtitle="Explore, compare, and integrate curated data collections."
        // description="Collections are curated sets of genome data from external sources that can be integrated into KBase Narratives."
      />
      <Container className={classes['inner-container']} disableGutters>
        <Grid container spacing={2}>
          {collections.isSuccess &&
            collections.data?.data.map((collection) => (
              <Grid key={collection.id} item sm={6}>
                <CollectionCard collection={collection} />
              </Grid>
            ))}
        </Grid>
      </Container>
    </main>
  );
};

/**
 * Variation of the Card component for displaying Collection summary cards
 */
const CollectionCard: FC<{
  collection: Collection;
}> = ({ collection }) => {
  const navigate = useNavigate();
  const detailLink = encodeURIComponent(collection.id);
  const handleClick = () => navigate(detailLink);
  const chipProducts = collection.data_products.filter((dp) => {
    return dp.product === 'genome_attribs' || dp.product === 'samples';
  });
  const chips = chipProducts.map((dp) => {
    const dpMeta = dataProductsMeta.find((m) => m.product === dp.product);
    return dpMeta?.section;
  });
  return (
    <Card
      title={
        <h3 className={classes['collection-card-title']}>{collection.name}</h3>
      }
      subtitle={collection.ver_tag}
      onClick={handleClick}
      image={
        <img
          src={collection.icon_url}
          alt={`${collection.name} collection icon`}
        />
      }
      imageSize="md"
      content={<TextClamp lines={3}>{collection.desc}</TextClamp>}
      footer={
        <Stack direction="row" spacing={1}>
          {chips.map((chip) => (
            <Chip key={chip} label={chip} />
          ))}
        </Stack>
      }
    />
  );
};
