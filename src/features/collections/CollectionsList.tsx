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
      <div>
        Some text explaining to users what they are looking at would go here.
        Between this and the list below, we may add search/sort/etc inputs. We
        may also add some sort of pagination at the bottom of the list.
      </div>
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
