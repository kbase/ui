import type { Meta, StoryObj } from '@storybook/react';
import DataView from '../../common/components/DataView';
import { testDataObjects } from '../../common/components/DataView.fixture';

const meta: Meta<typeof DataView> = {
  title: 'Components/DataView',
  component: DataView,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ height: '70px', width: '100%', position: 'relative' }}>
      <DataView wsId={args.wsId!} dataObjects={args.dataObjects!} />
    </div>
  ),
  args: {
    wsId: 42,
    dataObjects: testDataObjects,
  },
};
