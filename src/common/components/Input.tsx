import { forwardRef, useMemo, ComponentProps, ReactElement } from 'react';
import { v4 as uuidv4 } from 'uuid';

import classes from './Input.module.scss';

interface InputInterface extends ComponentProps<'input'> {
  label: ReactElement;
  errors?: boolean;
  validated?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputInterface>(
  (props, ref) => {
    const { className, errors, validated, label, ...rest } = props;
    const { name } = rest; // react-hook-form internals
    const idForLabel = useMemo(() => `input-${uuidv4()}`, []);
    const statusClass = errors ? classes.error : classes.success;
    const inputClass = [
      classes.input,
      validated ? statusClass : '',
      className,
    ].join(' ');
    const labelClass = [
      classes.label,
      validated ? statusClass : '',
      className,
    ].join(' ');
    return (
      <>
        <label className={labelClass} htmlFor={idForLabel}>
          {label}
        </label>
        <input
          name={name /* used by react-hook-form */}
          ref={ref /* used by react */}
          {...rest}
          className={inputClass}
          id={idForLabel}
          type={'text'}
        />
      </>
    );
  }
);
