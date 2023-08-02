import { FC } from 'react';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../common/components';
import { useAppDispatch } from '../../common/hooks';
import { clearCacheAction } from '../../common/api/searchApi';

const RefreshButton: FC = () => {
  const dispatch = useAppDispatch();
  const refreshHandler = () => {
    dispatch(clearCacheAction);
  };
  return (
    <Button
      className="refresh"
      color="primary"
      icon={<FAIcon icon={faRefresh} />}
      onClick={refreshHandler}
    >
      Refresh
    </Button>
  );
};

export default RefreshButton;
