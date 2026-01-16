import type { Meta, StoryObj } from '@storybook/react';

import TypeIcon from '../../features/icons/TypeIcon';
import { typeIconInfos } from '../../features/icons/common';

const meta: Meta<typeof TypeIcon> = {
  title: 'Components/TypeIcon',
  component: TypeIcon,
  argTypes: {
    objType: {
      options: [...Object.keys(typeIconInfos), 'BadFakeType'],
      control: { type: 'select' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ height: '70px', width: '100%', position: 'relative' }}>
      <TypeIcon objType={args.objType!} />
    </div>
  ),
  args: {
    objType: 'AssemblyInput',
  },
};
