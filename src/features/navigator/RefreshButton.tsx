import { FC, useCallback, useEffect, useState } from 'react';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../common/components';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { clearCacheAction } from '../../common/api/searchApi';
import { AUTOMATIC_REFRESH_DELAY } from './common';
import {
  synchronized,
  synchronizedLast,
  setSynchronized,
} from './navigatorSlice';

const RefreshButton: FC = () => {
  const [count, setCount] = useState(5);
  const dispatch = useAppDispatch();
  const syncd = useAppSelector(synchronized);
  const syncdLast = useAppSelector(synchronizedLast);

  const refreshHandler = useCallback(() => {
    dispatch(clearCacheAction);
    dispatch(setSynchronized(true));
    setCount(5);
  }, [dispatch]);

  useEffect(() => {
    const now = Date.now();
    const age = now - syncdLast;
    if (!syncd && age > AUTOMATIC_REFRESH_DELAY) {
      if (count > 0) {
        setCount(count - 1);
        return;
      }
      refreshHandler();
    }
  }, [count, refreshHandler, syncd, syncdLast]);

  if (!syncd) {
    setTimeout(() => {
      setCount(Math.max(0, count - 1));
    }, 1000);
  }

  return (
    <Button
      className="refresh"
      color={syncd ? 'primary' : 'warning'}
      icon={<FAIcon icon={faRefresh} />}
      onClick={refreshHandler}
    >
      {syncd ? 'Refresh' : `Refreshing in (${count})`}
    </Button>
  );
};

export default RefreshButton;
