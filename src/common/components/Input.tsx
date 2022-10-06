import {
  useState,
  ChangeEvent,
  FunctionComponent as FC,
  ReactElement,
} from 'react';

import { handlerPropError, missingLabelFactory } from './Input.common';
import classes from './Input.module.scss';

class InputInterfaceClass {
  constructor(
    readonly idForLabel: string,
    readonly label: ReactElement,
    readonly changeHandler?: (evt: ChangeEvent<HTMLInputElement>) => void,
    readonly validate?: (value: string) => boolean
  ) {}
}

const InputInterfaceKeys = Object.keys(new InputInterfaceClass('', <></>));

interface InputInterface
  extends React.ComponentProps<'input'>,
    InputInterfaceClass {}

export const Input: FC<InputInterface> = (props) => {
  const [error, setError] = useState('');
  const { className, changeHandler, idForLabel, label, validate } = props;
  const otherProps = Object.fromEntries(
    Object.entries(props).filter(
      ([key, value]) => InputInterfaceKeys.indexOf(key) === -1
    )
  );
  const inputClass = [classes.input, className].join(' ');
  const labelClass = [classes.label, className].join(' ');
  const consistencyError = (id: string) => {
    const message = missingLabelFactory(id);
    setError(message);
    throw new Error(message);
  };
  let validateHandler: (evt: ChangeEvent<HTMLInputElement>) => void;
  if (error) {
    throw new Error(error);
  }
  if (changeHandler && validate) {
    throw new Error(handlerPropError);
  }
  let handler = changeHandler;
  if (validate) {
    validateHandler = (evt: ChangeEvent<HTMLInputElement>) => {
      const validClasses = [classes.error, classes.success];
      const currentClasses = evt.currentTarget.classList;
      const valid = validate(evt.currentTarget.value);
      const label = document.querySelector(`[for=${evt.currentTarget.id}]`);
      if (!label) {
        return consistencyError(idForLabel);
      }
      const currentLabelClasses = label.classList;
      validClasses.forEach((cls) => currentLabelClasses.remove(cls));
      validClasses.forEach((cls) => currentClasses.remove(cls));
      const validClass = valid ? classes.success : classes.error;
      currentClasses.add(validClass);
      currentLabelClasses.add(validClass);
    };
    handler = validateHandler;
  }
  return (
    <>
      <label className={labelClass} htmlFor={idForLabel}>
        {label}
      </label>
      <input
        className={inputClass}
        id={idForLabel}
        onChange={handler}
        type={'text'}
        {...otherProps}
      />
    </>
  );
};
