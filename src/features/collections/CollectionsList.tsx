import { listCollections } from '../../common/api/collectionsApi';
import { usePageTitle } from '../layout/layoutSlice';
import { useNavigate } from 'react-router-dom';
import classes from './Collections.module.scss';
import { Card, CardList } from '../../common/components/Card';

export const CollectionsList = () => {
  const navigate = useNavigate();
  usePageTitle('Data Collections');
  const collections = listCollections.useQuery();
  return (
    <div className={classes['collection_wrapper']}>
      <CardList>
        {collections.isSuccess
          ? collections.data?.data.map((collection) => {
              const detailLink = encodeURIComponent(collection.id);
              const handleClick = () => navigate(detailLink);
              return (
                <Card
                  key={collection.id}
                  title={collection.name}
                  subtitle={collection.ver_tag}
                  onClick={handleClick}
                  image={
                    <img
                      src={collection.icon_url}
                      alt={`${collection.name} collection icon`}
                    />
                  }
                />
              );
            })
          : null}
      </CardList>
    </div>
  );
};
