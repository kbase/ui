import { ComponentMeta, ComponentStory } from '@storybook/react';
import { FC } from 'react';
import { Provider } from 'react-redux';
import { createTestStore, RootState } from '../../app/store';
import NarrativeMetadata from '../../features/navigator/NarrativeMetadata';
import type { NarrativeMetadataProps } from '../../features/navigator/NarrativeMetadata';
import {
  testNarrativeDoc,
  initialTestState,
} from '../../features/navigator/fixtures';

interface StoryProps extends NarrativeMetadataProps {
  initialState?: Partial<RootState>;
}

export const NarrativeMetadataTemplate: ComponentStory<FC<StoryProps>> = ({
  initialState,
  ...args
}) => {
  return (
    <Provider store={createTestStore(initialState)}>
      <NarrativeMetadata {...args} />
    </Provider>
  );
};

export const Default = NarrativeMetadataTemplate.bind({});

Default.args = {
  cells: testNarrativeDoc.cells,
  narrativeDoc: testNarrativeDoc,
  initialState: { navigator: initialTestState },
};

export default {
  title: 'Components/NarrativeMetadata',
  component: NarrativeMetadata,
  excludeStories: /NarrativeMetadataTemplate/,
} as ComponentMeta<typeof NarrativeMetadata>;
