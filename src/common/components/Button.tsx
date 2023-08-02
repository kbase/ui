import { FunctionComponent as FC } from 'react';
import classes from './Button.module.scss';

const colorClasses = Object.keys(classes).filter((d) => d !== 'button');
const colors = [...colorClasses] as const;
type Color = typeof colors[number];

export interface CommonButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  color?: Color;
  icon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

interface ButtonProps
  extends CommonButtonProps,
    React.ComponentProps<'button'> {}

export const Button: FC<ButtonProps> = ({
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  className,
  ...props
}) => {
  const classNames = [
    classes.button,
    className,
    classes[`button--${color}`],
    classes[size],
  ].join(' ');
  return (
    <button className={classNames} {...props}>
      {props.icon && <span className={classes.icon}>{props.icon}</span>}
      {props.children}
    </button>
  );
};
