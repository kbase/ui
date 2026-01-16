import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FunctionComponent as FC } from 'react';
import { act } from 'react';
import { useForm, RegisterOptions, Path } from 'react-hook-form';
import { Input } from './Input';
import {
  _randomBackground,
  inputRegisterFactory,
  validateInputIsTacoFactory,
} from './Input.common';
import classes from './Input.module.scss';

interface TestValues {
  testValue: string;
}

interface TestProps {
  options?: RegisterOptions<TestValues, Path<TestValues>>;
}

const TestInput: FC<TestProps> = ({ options }) => {
  const { formState, register } = useForm<TestValues>({
    defaultValues: {
      testValue: '',
    },
    mode: 'all',
  });
  const inputRegister = inputRegisterFactory<TestValues>({
    formState,
    register,
  });
  const { errors } = formState;
  const errorEntrys = Object.entries(errors);

  return (
    <form>
      <ul>
        <li>
          <Input
            label={<>Uncontrolled with validations.</>}
            {...inputRegister('testValue', options)}
          />
        </li>
      </ul>
      {errorEntrys.length > 0 ? <h2>Errors</h2> : <></>}
      <ul>
        {errorEntrys.map(([key, { message, type }]) => (
          <li key={key}>{message}</li>
        ))}
      </ul>
    </form>
  );
};

describe('Input related components', () => {
  test('Input Renders', () => {
    render(<Input label={<>test</>} />);
    const inputText = screen.getByLabelText('test', { exact: false });
    expect(inputText).toBeInTheDocument();
  });

  test('Input registered with no validations renders', () => {
    render(<TestInput />);
    const inputElement = screen.getByLabelText('validations', {
      exact: false,
    }) as HTMLInputElement;
    expect(inputElement).toHaveValue('');
  });

  test('Input registered with validations validates as expected', async () => {
    const validate = validateInputIsTacoFactory('testValue');
    render(<TestInput options={{ validate, onChange: _randomBackground }} />);
    const inputElement = screen.getByLabelText('validations', {
      exact: false,
    }) as HTMLInputElement;
    await act(async () => {
      await userEvent.type(inputElement, 'cake');
      expect(inputElement).toHaveValue('cake');
      expect(inputElement.classList.contains(classes.error));
    });
    await act(async () => {
      await userEvent.type(
        inputElement,
        '[Backspace][Backspace][Backspace][Backspace]taco'
      );
    });
    expect(inputElement).toHaveValue('taco');
    expect(inputElement.classList.contains(classes.success));
  });
});
