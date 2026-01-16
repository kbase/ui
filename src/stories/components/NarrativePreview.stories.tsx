import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import { NarrativePreview } from '../../features/navigator/NarrativeView';
import { testNarrativeDoc } from '../../features/navigator/fixtures';

const meta: Meta<typeof NarrativePreview> = {
  title: 'Components/NarrativePreview',
  component: NarrativePreview,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Provider store={createTestStore()}>
      <NarrativePreview
        cells={args.cells!}
        narrativeDoc={args.narrativeDoc!}
        wsId={args.wsId!}
      />
    </Provider>
  ),
  args: {
    cells: testNarrativeDoc.cells,
    narrativeDoc: testNarrativeDoc,
    wsId: testNarrativeDoc.access_group,
  },
};
