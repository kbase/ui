import { FC } from 'react';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../common/components';
import { useAppDispatch } from '../../common/hooks';
import { clearCacheAction } from '../../common/api/searchApi';
import classes from './Navigator.module.scss';

const RefreshButton: FC = () => {
  const dispatch = useAppDispatch();
  const refreshHandler = () => {
    dispatch(clearCacheAction);
  };
  return (
    <Button
      className={`${classes.button} ${classes['refresh']}`}
      onClick={refreshHandler}
    >
      Refresh <FAIcon icon={faRefresh} />
    </Button>
  );
};

export default RefreshButton;
