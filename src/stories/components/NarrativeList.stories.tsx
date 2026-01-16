import type { Meta, StoryObj } from '@storybook/react';
import NarrativeList from '../../features/navigator/NarrativeList/NarrativeList';
import { testItems } from '../../features/navigator/fixtures';

const meta: Meta<typeof NarrativeList> = {
  title: 'Components/NarrativeList',
  component: NarrativeList,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ height: '70px', width: '100%', position: 'relative' }}>
      <NarrativeList
        hasMoreItems={args.hasMoreItems!}
        items={args.items!}
        itemsRemaining={args.itemsRemaining!}
        loading={args.loading!}
        narrativeUPA={args.narrativeUPA!}
        nextLimit={args.nextLimit!}
        showVersionDropdown={args.showVersionDropdown!}
      />
    </div>
  ),
  args: {
    showVersionDropdown: true,
    itemsRemaining: 16,
    hasMoreItems: false,
    items: testItems,
    loading: false,
    narrativeUPA: null,
    nextLimit: '20',
  },
};
