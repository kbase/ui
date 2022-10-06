import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import ErrorPage from '../../features/layout/ErrorPage';
import { Input } from './Input';
import { handlerPropError, missingLabelFactory } from './Input.common';
import classes from './Input.module.scss';

const consoleError = jest.spyOn(console, 'error');
// This mockImplementation supresses console.error calls.
// eslint-disable-next-line @typescript-eslint/no-empty-function
consoleError.mockImplementation(() => {});

describe('Input related components', () => {
  afterAll(() => {
    consoleError.mockRestore();
  });

  afterEach(() => {
    consoleError.mockClear();
  });

  test('Input Renders', () => {
    render(<Input idForLabel={'test'} label={<>test</>} />);
    const inputText = screen.getByLabelText('test', { exact: false });
    expect(inputText).toBeInTheDocument();
  });

  test('Specifying changeHandler and validate throws an error', () => {
    const validate = () => true;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const handler = () => {};
    render(
      <Provider store={createTestStore()}>
        <ErrorBoundary FallbackComponent={ErrorPage}>
          <Input
            changeHandler={handler}
            idForLabel={'test'}
            label={<>test</>}
            validate={validate}
          />
        </ErrorBoundary>
      </Provider>
    );
    const errorText = screen.getByText(handlerPropError, { exact: false });
    expect(errorText).toBeInTheDocument();
  });

  test('Specifying validate validates input', async () => {
    const validate = (value: string) => value === 'taco';
    render(
      <Input idForLabel={'test'} label={<>Validate</>} validate={validate} />
    );
    const inputElement = screen.getByLabelText('Validate', {
      exact: false,
    }) as HTMLInputElement;
    await userEvent.type(inputElement, 'cake');
    expect(inputElement).toHaveValue('cake');
    expect(inputElement.classList.contains(classes.error));
    await userEvent.type(
      inputElement,
      '[Backspace][Backspace][Backspace][Backspace]taco'
    );
    expect(inputElement).toHaveValue('taco');
    expect(inputElement.classList.contains(classes.success));
  });

  test('Provides a message for DOM manipulation errors.', async () => {
    const testId = 'test';
    const testStore = createTestStore();
    const validate = (value: string) => value === 'taco';
    render(
      <Provider store={testStore}>
        <ErrorBoundary FallbackComponent={ErrorPage}>
          <div>
            <Input
              idForLabel={testId}
              label={<>Validate</>}
              validate={validate}
            />
          </div>
        </ErrorBoundary>
      </Provider>
    );
    let errorReceived = '';
    window.addEventListener('error', (event) => {
      errorReceived = event.message;
    });
    const inputElement = screen.getByLabelText('Validate', {
      exact: false,
    }) as HTMLInputElement;
    Array.from(document.getElementsByTagName('label')).forEach(
      (label: HTMLLabelElement, ix: number) => {
        label.remove();
      }
    );
    await userEvent.type(inputElement, 'a');
    const errorMessage = missingLabelFactory(testId);
    expect(errorReceived).toBe(errorMessage);
    const errorText = screen.getByText(errorMessage, { exact: false });
    expect(errorText).toBeInTheDocument();
  });
});
