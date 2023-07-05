import { FunctionComponent as FC } from 'react';
import classes from './Button.module.scss';
import { CommonButtonProps } from './Button';

interface LinkButtonProps
  extends CommonButtonProps,
    React.ComponentProps<'a'> {}

export const LinkButton: FC<LinkButtonProps> = ({
  variant = 'contained',
  color = 'white',
  className,
  ...props
}) => {
  const classNames = [
    classes.button,
    className,
    classes[`button--${color}`],
  ].join(' ');
  return (
    <a className={classNames} {...props}>
      {props.icon && <span className={classes.icon}>{props.icon}</span>}
      {props.children}
    </a>
  );
};
