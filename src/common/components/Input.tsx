import {
  forwardRef,
  useMemo,
  ChangeEvent,
  ComponentProps,
  ReactElement,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

import classes from './Input.module.scss';

interface InputInterface extends ComponentProps<'input'> {
  label: ReactElement;
  errors?: boolean;
  onChangeAlso?: (event: ChangeEvent<HTMLInputElement>) => void;
  validated?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputInterface>(
  (props, ref) => {
    const { className, errors, onChangeAlso, validated, label, ...rest } =
      props;
    const { name, onChange } = rest; // react-hook-form internals
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
    let handler = onChange;
    if (onChangeAlso && onChange) {
      handler = (event) => {
        onChangeAlso(event);
        onChange(event);
      };
    }
    return (
      <>
        <label className={labelClass} htmlFor={idForLabel}>
          {label}
        </label>
        <input
          name={name /* used by react-hook-form */}
          ref={ref /* used by react */}
          {...rest}
          onChange={handler}
          className={inputClass}
          id={idForLabel}
          type={'text'}
        />
      </>
    );
  }
);
