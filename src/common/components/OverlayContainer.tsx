import { PropsWithChildren } from 'react';
import classes from './OverlayContainer.module.scss';

export type OverlayContainerProps = PropsWithChildren;

const OverlayContainer = ({ children }: OverlayContainerProps) => {
  return <div className={classes.main}>{children}</div>;
};

export default OverlayContainer;
