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

const delaySeconds = AUTOMATIC_REFRESH_DELAY / 1000;
const RefreshButton: FC = () => {
  const [count, setCount] = useState(delaySeconds);
  const dispatch = useAppDispatch();
  const syncd = useAppSelector(synchronized);
  const syncdLast = useAppSelector(synchronizedLast);

  const refreshHandler = useCallback(() => {
    dispatch(setSynchronized(true));
    dispatch(clearCacheAction);
    setCount(delaySeconds);
  }, [dispatch]);

  useEffect(() => {
    const now = Date.now();
    const age = now - syncdLast;
    if (!syncd) {
      if (age < AUTOMATIC_REFRESH_DELAY) {
        if (count > 0) {
          setTimeout(() => {
            if (syncd) return;
            setCount(Math.max(0, count - 1));
          }, 1000);
          return;
        }
      }
      refreshHandler();
    }
  }, [count, refreshHandler, syncd, syncdLast]);

  return (
    <Button
      className="refresh"
      color="primary"
      disabled={!syncd}
      icon={<FAIcon icon={faRefresh} />}
      onClick={refreshHandler}
    >
      {syncd ? 'Refresh' : `Refreshing in (${count})`}
    </Button>
  );
};

export default RefreshButton;
