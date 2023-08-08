import { useEffect, useId } from 'react';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { setModalContent, setModalVisible } from './layoutSlice';

type Content = Parameters<typeof setModalContent>[0];

// Modal state management hook, used to set content and show/hide
export const useModal = (content: Content, consumeOnly = false) => {
  const dispatch = useAppDispatch();
  const visible = useAppSelector((state) => state.layout.modalVisible);

  useEffect(() => {
    if (!consumeOnly) dispatch(setModalContent(content));
  }, [dispatch, content, consumeOnly]);

  return {
    visible,
    show: () => dispatch(setModalVisible(true)),
    hide: () => dispatch(setModalVisible(true)),
    toggle: () => dispatch(setModalVisible(true)),
  };
};

// Rendering element for the modal. One to rule them all.
// Should only be used in the root layout
export const Modal = () => {
  const visible = useAppSelector((state) => state.layout.modalVisible);
  const content = useAppSelector((state) => state.layout.modalContent);

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

  return <dialog id={dialogId}>{content}</dialog>; // TODO: style this
};
