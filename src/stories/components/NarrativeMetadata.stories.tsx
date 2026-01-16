import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { createTestStore, RootState } from '../../app/store';
import NarrativeMetadata from '../../features/navigator/NarrativeMetadata';
import {
  testNarrativeDoc,
  initialTestState,
} from '../../features/navigator/fixtures';

const meta: Meta<typeof NarrativeMetadata> = {
  title: 'Components/NarrativeMetadata',
  component: NarrativeMetadata,
};

export default meta;
type Story = StoryObj<typeof meta>;

interface DecoratorProps {
  initialState?: Partial<RootState>;
}

export const Default: Story = {
  render: (args) => {
    const decoratorArgs = args as typeof args & DecoratorProps;
    return (
      <Provider store={createTestStore(decoratorArgs.initialState)}>
        <NarrativeMetadata
          cells={args.cells!}
          narrativeDoc={args.narrativeDoc!}
        />
      </Provider>
    );
  },
  args: {
    cells: testNarrativeDoc.cells,
    narrativeDoc: testNarrativeDoc,
    initialState: { navigator: initialTestState },
  } as React.ComponentProps<typeof NarrativeMetadata> & DecoratorProps,
};
