import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Select, handleChangeFactory, SelectOption } from './Select';

test('The change handler does nothing when passed null.', () => {
  // This test is (currently) required for 100% coverage.
  const handleChange = handleChangeFactory((options) => {
    // Move `ZIG`. For great coverage.
  });
  expect(handleChange(null)).toBe(undefined);
});

test('Select Renders', () => {
  const { container } = render(
    <Select
      options={[
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' },
      ]}
    />
  );
  const selectControl = container.querySelector('.react-select__control');
  expect(selectControl).toBeInTheDocument();
});

test('Select Renders with icons', async () => {
  const { container } = render(
    <Select
      options={[{ value: 'coffee', label: 'Coffee', icon: 'faCoffee' }]}
    />
  );
  const selectControl = container.querySelector('.react-select__control');
  expect(selectControl).toBeInTheDocument();

  selectControl && (await userEvent.click(selectControl));
  const opt = await screen.findByText('Coffee');
  opt && (await userEvent.click(opt));
});

test('Single select onchange', async () => {
  const onChange = jest.fn();
  const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];
  const { container } = render(
    <Select onChange={onChange} options={options} />
  );
  const selectControl = container.querySelector('.react-select__control');
  expect(selectControl).toBeInTheDocument();

  selectControl && (await userEvent.click(selectControl));
  const opt = await screen.findByText('Chocolate');
  opt && (await userEvent.click(opt));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([options[0]]));

  selectControl && userEvent.click(selectControl);
  const opt2 = await screen.findByText('Vanilla');
  opt2 && (await userEvent.click(opt2));
  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([options[2]]));
  expect(onChange).toHaveBeenCalledWith(
    expect.not.arrayContaining([options[0]])
  );
});

test('Multi select onchange and remove', async () => {
  const onChange = jest.fn();
  const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];
  const { container } = render(
    <Select multiple onChange={onChange} options={options} />
  );
  const selectControl = container.querySelector('.react-select__control');
  expect(selectControl).toBeInTheDocument();

  selectControl && (await userEvent.click(selectControl));
  const opt = await screen.findByText('Chocolate');
  opt && (await userEvent.click(opt));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([options[0]]));

  selectControl && (await userEvent.click(selectControl));
  const opt2 = await screen.findByText('Vanilla');
  opt2 && (await userEvent.click(opt2));
  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenCalledWith(
    expect.arrayContaining([options[2], options[0]])
  );

  selectControl && (await userEvent.click(selectControl));
  const remove = (await screen.findByText('Chocolate'))
    ?.closest('.react-select__multi-value')
    ?.querySelector('.react-select__multi-value__remove');
  remove && (await userEvent.click(remove));
  expect(onChange).toHaveBeenCalledTimes(3);
  expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([options[2]]));
  expect(onChange).toHaveBeenCalledWith(
    expect.not.arrayContaining([options[0]])
  );
});

test('Async option loading and selection', async () => {
  const onChange = jest.fn();
  const Parent = () => {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const handleSuggest = async (inputValue: string) => {
      await new Promise<void>((r) => setTimeout(r, 100));
      act(() => {
        setOptions([
          { value: 'chocolate', label: 'Chocolate' },
          { value: 'strawberry', label: 'Strawberry' },
          { value: 'vanilla', label: 'Vanilla' },
          { value: 'test-value', label: inputValue },
        ]);
      });
    };
    return (
      <Select onChange={onChange} onSearch={handleSuggest} options={options} />
    );
  };
  const { container } = render(<Parent />);
  const selectControl = container.querySelector('.react-select__control');
  expect(selectControl).toBeInTheDocument();

  const input = container.querySelector('input');
  const testText = 'foobar';
  await userEvent.type(input as HTMLInputElement, testText);

  const opt = await screen.findByText(testText);
  expect(opt).toBeInTheDocument();
  opt && (await userEvent.click(opt));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(
    expect.arrayContaining([{ value: 'test-value', label: testText }])
  );
});
