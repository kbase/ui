import { ChangeEvent } from 'react';
import {
  Path,
  RegisterOptions,
  FormState,
  UseFormRegister,
} from 'react-hook-form';

import classes from '../../common/components/Input.module.scss';

export const _randomBackground = (evt: ChangeEvent<HTMLInputElement>) => {
  const classNames = Object.keys(classes);
  const randomIndex = Math.floor(classNames.length * Math.random());
  const randomClass = classes[classNames[randomIndex]];
  const currentClasses = evt.currentTarget.classList;
  currentClasses.forEach((cls) => currentClasses.remove(cls));
  currentClasses.add(classes.input);
  currentClasses.add(randomClass);
};

export const inputRegisterFactory = <T,>({
  formState,
  register,
}: {
  formState: FormState<T>;
  register: UseFormRegister<T>;
}) => {
  const { errors, dirtyFields } = formState;
  return (name: Path<T>, options?: RegisterOptions) => {
    if (options && Object.keys(options).length > 0) {
      return {
        errors: errors && name in errors,
        validated: dirtyFields && name in dirtyFields,
        ...register(name, options),
      };
    }
    return {
      validated: false,
      ...register(name, options),
    };
  };
};

export const validateInputIsTacoFactory = (name: string) => (input: string) => {
  if (input === 'taco') return true;
  return `The value for ${name} should be 'taco'.`;
};
