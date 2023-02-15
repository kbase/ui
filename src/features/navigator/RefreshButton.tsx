import { FC, MouseEvent } from 'react';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../common/components';
import type { AppDispatch } from '../../app/store';
import { useAppDispatch } from '../../common/hooks';
import { clearCacheAction } from '../../common/api/searchApi';
import classes from './Navigator.module.scss';

// This handler factory pattern is primarily to aid unit testing.
export const refreshHandlerFactory = (dispatch: AppDispatch) => () => {
  dispatch(clearCacheAction);
};

interface RefreshButtonParams {
  clickHandlerFactory?: (dispatch: AppDispatch) => (evt?: MouseEvent) => void;
}

const RefreshButton: FC<RefreshButtonParams> = ({ clickHandlerFactory }) => {
  const dispatch = useAppDispatch();
  const handler = clickHandlerFactory
    ? clickHandlerFactory(dispatch)
    : refreshHandlerFactory(dispatch);
  return (
    <Button
      className={`${classes.button} ${classes['refresh']}`}
      onClick={handler}
    >
      Refresh <FAIcon icon={faRefresh} />
    </Button>
  );
};

export default RefreshButton;
