import {
  forwardRef,
  useMemo,
  useState,
  ComponentProps,
  ReactElement,
  FocusEventHandler,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

import classes from './Input.module.scss';

interface InputInterface extends ComponentProps<'input'> {
  errors?: boolean;
  label?: ReactElement;
  maxLength?: number;
  validated?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputInterface>(
  (props, ref) => {
    const { className, errors, label, maxLength, validated, hidden, ...rest } =
      props;
    const { name } = rest; // react-hook-form internals
    const idForLabel = useMemo(() => `input-${uuidv4()}`, []);
    const statusClass = errors ? classes.error : classes.success;
    const labelClass = [
      classes.label,
      validated ? statusClass : '',
      className,
    ].join(' ');

    const [focused, setFocused] = useState(false);

    const handleFocus: FocusEventHandler<HTMLInputElement> = (...args) => {
      setFocused(true);
      if (rest.onFocus) rest.onFocus(...args);
    };

    const handleBlur: FocusEventHandler<HTMLInputElement> = (...args) => {
      setFocused(false);
      if (rest.onBlur) rest.onBlur(...args);
    };

    const getInputContainerClasses = () => {
      return [
        classes['input-container'],
        validated ? statusClass : '',
        hidden ? classes.hidden : '',
        focused ? classes.focus : '',
        className,
      ].join(' ');
    };

    return (
      <span className={getInputContainerClasses()}>
        {label && (
          <label className={labelClass} htmlFor={idForLabel}>
            {label}
          </label>
        )}
        <input
          name={name /* used by react-hook-form */}
          ref={ref /* used by react */}
          maxLength={maxLength}
          {...rest}
          className={classes.input}
          id={idForLabel}
          onBlur={handleBlur}
          onFocus={handleFocus}
          type={props.type || 'text'}
          hidden={hidden}
        />
      </span>
    );
  }
);
