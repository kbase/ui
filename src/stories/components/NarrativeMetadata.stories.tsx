import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import NarrativeMetadata from '../../features/navigator/NarrativeMetadata';
import {
  testNarrativeDoc,
  initialTestState,
} from '../../features/navigator/fixtures';

export const NarrativeMetadataTemplate: ComponentStory<
  typeof NarrativeMetadata
> = (args) => {
  return (
    <Provider store={createTestStore({ navigator: initialTestState })}>
      <NarrativeMetadata {...args} />
    </Provider>
  );
};

export const Default = NarrativeMetadataTemplate.bind({});

Default.args = {
  cells: testNarrativeDoc.cells,
  narrativeDoc: testNarrativeDoc,
};

export default {
  title: 'Components/NarrativeMetadata',
  component: NarrativeMetadata,
  excludeStories: /NarrativeMetadataTemplate/,
} as ComponentMeta<typeof NarrativeMetadata>;
