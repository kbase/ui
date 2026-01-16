import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Select, SelectOption } from '../../common/components/Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
};

export default meta;
type Story = StoryObj<typeof meta>;

const SelectDemo = (args: {
  disabled?: boolean;
  clearable?: boolean;
  multiple?: boolean;
}) => {
  const [value, setValue] = useState<SelectOption[] | undefined>();
  const handleChange = (selected: SelectOption[]) => {
    setValue(selected);
  };
  const options: SelectOption[] = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry', icon: '🍓' },
    { value: 'vanilla', label: 'Vanilla' },
  ];
  return (
    <Select {...args} value={value} options={options} onChange={handleChange} />
  );
};

export const Default: Story = {
  render: (args) => <SelectDemo {...args} />,
  args: {
    disabled: false,
    clearable: true,
    multiple: false,
  },
};

const SelectAsyncDemo = (args: {
  disabled?: boolean;
  clearable?: boolean;
  multiple?: boolean;
}) => {
  const [value, setValue] = useState<SelectOption[] | undefined>();
  const handleChange = (selected: SelectOption[]) => {
    setValue(selected);
  };
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <Select
      loading={loading}
      {...args}
      value={value}
      onChange={handleChange}
      options={options}
      onSearch={(inputValue) => {
        new Promise<void>((resolve) => {
          setLoading(true);
          setTimeout(() => {
            setOptions([
              { value: 'chocolate', label: 'Chocolate' },
              { value: 'strawberry', label: 'Strawberry' },
              { value: 'vanilla', label: 'Vanilla' },
              { value: inputValue, label: `Some Option(s) ${inputValue}` },
            ]);
            setLoading(false);
            resolve();
          }, 500);
        });
      }}
    />
  );
};

export const Async: Story = {
  render: (args) => <SelectAsyncDemo {...args} />,
  args: {
    disabled: false,
    clearable: true,
    multiple: false,
  },
};
