import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useEffect,
  useId,
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import { Button } from '../../common/components';
import classes from './Modal.module.scss';

interface Content {
  body: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
}

const ModalManagementContext = createContext<{
  show: () => void;
  hide: () => void;
  toggle: (visible?: boolean) => void;
  visible: boolean;
  useContent: (content: Content) => JSX.Element;
  /** Do not use within react render, sets state */
  setContent: (content: Content) => void;
}>({
  show: () => {
    /*noop*/
  },
  hide: () => {
    /*noop*/
  },
  toggle: () => {
    /*noop*/
  },
  visible: false,
  useContent: (content: Content) => <></>,
  /** Do not use within react render, sets state */
  setContent: (content: Content) => undefined,
});

// Modal hook, used to set content and show/hide
export const useModal = () => {
  const modal = useContext(ModalManagementContext);
  return modal;
};

// Renders the modal. One modal to rule them all.
// Should only be used in the root layout
export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisibility] = useState<boolean>(false);
  const [content, setContent] = useState<Content>({ body: '' });

  const dialogId = useId();
  useEffect(() => {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement;
    if (!dialog) return;
    if (visible) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [dialogId, visible]);

  const modal = useMemo(
    () => ({
      useContent: (content: Content) => {
        useEffect(() => {
          setContent(content);
        }, [content]);
        return <></>;
      },
      setContent,
      show: () => setVisibility(true),
      hide: () => setVisibility(false),
      toggle: (v?: boolean) => setVisibility(v ?? !visible),
      visible,
    }),
    [visible]
  );

  const clickOutHandler = useCallback<
    React.MouseEventHandler<HTMLDialogElement>
  >(
    (e) => {
      // Check we didn't click on a child element that is overflowing
      if (e.target !== e.currentTarget) return;
      // Check the bounds
      const bounds = e.currentTarget.getBoundingClientRect();
      const clickedInside =
        bounds.top <= e.clientY &&
        e.clientY <= bounds.top + bounds.height &&
        bounds.left <= e.clientX &&
        e.clientX <= bounds.left + bounds.width;

      if (!clickedInside) modal.hide();
    },
    [modal]
  );

  return (
    <ModalManagementContext.Provider value={modal}>
      <>
        {children}
        <div hidden={!visible}>
          <dialog
            id={dialogId}
            className={classes['modal']}
            onClick={clickOutHandler}
          >
            <div className={classes['header']}>
              <div>
                <h2>
                  {content.title}
                  {content.subtitle ? (
                    <>
                      <br />
                      <small className={classes['subtitle']}>
                        {content.subtitle}
                      </small>
                    </>
                  ) : null}
                </h2>
              </div>
              <Button
                role="button"
                color="base"
                variant="text"
                onClick={() => {
                  modal.hide();
                }}
              >
                <FontAwesomeIcon icon={faX} />
              </Button>
            </div>
            <div className={classes['body']}>{content.body}</div>
            {content.footer ? (
              <div className={classes['footer']}>{content.footer}</div>
            ) : null}
          </dialog>
        </div>
      </>
    </ModalManagementContext.Provider>
  );
};
