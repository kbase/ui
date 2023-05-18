import classes from './App.module.scss';

import { BrowserRouter as Router } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../common/hooks';
import {
  Dispatch,
  FC,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from 'react';
import { setEnvironment } from '../features/layout/layoutSlice';
import {
  authInitialized,
  authUsername,
  useTokenCookie,
} from '../features/auth/authSlice';
import { useLoggedInProfileUser } from '../features/profile/profileSlice';
import { ErrorBoundary } from 'react-error-boundary';

import Routes from './Routes';
import LeftNavBar from '../features/layout/LeftNavBar';
import TopBar from '../features/layout/TopBar';
import ErrorPage from '../features/layout/ErrorPage';

const useInitApp = () => {
  const dispatch = useAppDispatch();

  // Pulls token from cookie, syncs cookie to auth state
  useTokenCookie('kbase_session');

  // Use authenticated username to load user's profile
  const username = useAppSelector(authUsername);
  const initialized = useAppSelector(authInitialized);
  useLoggedInProfileUser(username);

  // Placeholder code for determining environment.
  useEffect(() => {
    dispatch(setEnvironment('ci-europa'));
  }, [dispatch]);

  return { isLoading: !initialized };
};

export const getModal = () => {
  let dialog: HTMLDialogElement | null = document.querySelector(
    `.${classes['kbase-modal']}`
  );
  // This should not happen, but if it does then we can recover.
  if (!dialog) {
    dialog = document.createElement('dialog');
    document.body.appendChild(dialog);
  }
  return dialog;
};

const ModalContextDefault: {
  modalContents: JSX.Element;
  getModalControls: () => Record<string, () => void>;
  setModalContents: Dispatch<SetStateAction<JSX.Element>>;
} = {
  modalContents: <></>,
  getModalControls: () => ({}),
  setModalContents: () => ({}),
};

export const ModalContext = createContext(ModalContextDefault);

export const getModalControls = () => {
  const modalClose = () => {
    const dialog: HTMLDialogElement | null = document.querySelector(
      `.${classes['kbase-modal']}`
    );
    if (!dialog || !dialog.close) return;
    dialog.close();
  };
  const modalOpen = () => {
    const dialog: HTMLDialogElement | null = document.querySelector(
      `.${classes['kbase-modal']}`
    );
    if (!dialog || !dialog.close) return;
    dialog.close();
    dialog.showModal();
  };
  return { modalClose, modalOpen };
};

export default function App() {
  const { isLoading } = useInitApp();
  const [modalContents, setModalContents] = useState(<></>);
  const [initial, setInitial] = useState(true);
  const setModalContentsDownstream: typeof setModalContents = (element) => {
    setInitial(false);
    setModalContents(element);
  };
  const ModalContextValue = {
    modalContents,
    getModalControls,
    setModalContents: setModalContentsDownstream,
  };

  const Modal: FC = () => {
    useEffect(() => {
      if (initial) return;
      const { modalOpen } = getModalControls();
      modalOpen();
    });
    return <dialog className={classes['kbase-modal']}>{modalContents}</dialog>;
  };

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Modal />
      <ModalContext.Provider value={ModalContextValue}>
        <div className={classes.container}>
          <div className={classes.topbar}>
            <TopBar />
          </div>
          <div className={classes.site_content}>
            <div className={classes.left_navbar}>
              <LeftNavBar />
            </div>
            <div className={classes.page_content}>
              <ErrorBoundary FallbackComponent={ErrorPage}>
                {isLoading ? 'Loading...' : <Routes />}
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </ModalContext.Provider>
    </Router>
  );
}
