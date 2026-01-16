import type { Meta, StoryObj } from '@storybook/react';

import AppCellIcon from '../../features/icons/AppCellIcon';
import { AppTag } from '../../features/icons/iconSlice';

const meta: Meta<typeof AppCellIcon> = {
  title: 'Components/AppCellIcon',
  component: AppCellIcon,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ height: '70px', width: '100%', position: 'relative' }}>
      <AppCellIcon appId={args.appId!} appTag={args.appTag!} />
    </div>
  ),
  args: {
    appTag: AppTag.release,
    appId: 'Taxon',
  },
};
