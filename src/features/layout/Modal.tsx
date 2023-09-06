import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../common/components';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { noOp } from '../common';
import { setModalDialogId } from './layoutSlice';
import classes from './Modal.module.scss';

interface ModalProps {
  body: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
}

export const ModalDialog = () => {
  const modalDialogId = useId();

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setModalDialogId(modalDialogId));
  }, [dispatch, modalDialogId]);

  const { dialogElement, close } = useModalControls();

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

      if (dialogElement && !clickedInside) close();
    },
    [close, dialogElement]
  );
  return (
    <dialog
      id={modalDialogId}
      className={classes['modal']}
      onClick={clickOutHandler}
    />
  );
};

export const useModalControls = () => {
  const modalDialogId = useAppSelector((state) => state.layout.modalDialogId);
  const dialogElement = modalDialogId
    ? (document.getElementById(modalDialogId) as HTMLDialogElement)
    : undefined;
  return {
    dialogId: modalDialogId,
    dialogElement,
    show: dialogElement?.showModal?.bind(dialogElement) ?? noOp,
    close: dialogElement?.close?.bind(dialogElement) ?? noOp,
  };
};

export const Modal = (props: ModalProps) => {
  const { dialogId, dialogElement, close } = useModalControls();
  if (!dialogId) {
    return <></>;
  }
  if (!dialogElement) {
    // eslint-disable-next-line no-console
    console.error(
      'A modal with the following content was specified but the modal dialog element could not be found.',
      props
    );
    return <></>;
  }
  return createPortal(
    <>
      <div className={classes['header']}>
        <div>
          <h2>
            {props.title}
            {props.subtitle ? (
              <>
                <br />
                <small className={classes['subtitle']}>{props.subtitle}</small>
              </>
            ) : null}
          </h2>
        </div>
        <Button
          role="button"
          color="base"
          variant="text"
          onClick={() => {
            close();
          }}
        >
          <FontAwesomeIcon icon={faX} />
        </Button>
      </div>
      <div className={classes['body']}>{props.body}</div>
      {props.footer ? (
        <div className={classes['footer']}>{props.footer}</div>
      ) : null}
    </>,
    dialogElement
  );
};
