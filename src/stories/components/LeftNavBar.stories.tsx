import type { Meta, StoryObj } from '@storybook/react';

import LeftNavBar from '../../features/layout/LeftNavBar';

const meta: Meta<typeof LeftNavBar> = {
  title: 'Components/LeftNavBar',
  component: LeftNavBar,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: '75px', position: 'relative' }}>
      <LeftNavBar />
    </div>
  ),
};
