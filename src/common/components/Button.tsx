import { forwardRef, FunctionComponent as FC, Ref } from 'react';
import classes from './Button.module.scss';

const colorClasses = Object.keys(classes).filter((d) => d !== 'button');
const colors = [...colorClasses] as const;
type Color = typeof colors[number];

export interface CommonButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  color?: Color;
  textColor?: Color;
  icon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

interface ButtonProps
  extends CommonButtonProps,
    React.ComponentProps<'button'> {}

export const Button = forwardRef(
  (
    {
      variant = 'contained',
      color = 'primary',
      textColor,
      size = 'medium',
      className,
      ...props
    }: ButtonProps,
    ref: Ref<HTMLButtonElement>
  ) => {
    const classNames = [
      classes.button,
      className,
      classes[variant],
      classes[`button--${color}`],
      textColor ? classes[`button-text--${textColor}`] : '',
      classes[size],
    ].join(' ');
    return (
      <button className={classNames} {...props} ref={ref}>
        {props.icon && <span className={classes.icon}>{props.icon}</span>}
        {props.children}
      </button>
    );
  }
);
