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
    const { className, errors, label, maxLength, validated, ...rest } = props;
    const { name } = rest; // react-hook-form internals
    const idForLabel = useMemo(() => `input-${uuidv4()}`, []);
    const statusClass = errors ? classes.error : classes.success;
    const labelClass = [
      classes.label,
      validated ? statusClass : '',
      className,
    ].join(' ');
    const getInputContainerClasses = () => {
      return [
        classes['input-container'],
        validated ? statusClass : '',
        className,
      ].join(' ');
    };
    const [inputContainerClasses, setInputContainerClasses] = useState(
      getInputContainerClasses()
    );

    const handleFocus: FocusEventHandler<HTMLInputElement> = (...args) => {
      if (rest.onFocus) rest.onFocus(...args);
      setInputContainerClasses(
        `${getInputContainerClasses()} ${classes.focus}`
      );
    };

    const handleBlur: FocusEventHandler<HTMLInputElement> = (...args) => {
      if (rest.onBlur) rest.onBlur(...args);
      setInputContainerClasses(getInputContainerClasses());
    };

    return (
      <span className={inputContainerClasses}>
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
        />
      </span>
    );
  }
);
