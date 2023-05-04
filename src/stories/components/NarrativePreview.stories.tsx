import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import { NarrativePreview } from '../../features/navigator/NarrativeView';
import { testNarrativeDoc } from '../../features/navigator/fixtures';

export const NarrativePreviewTemplate: ComponentStory<typeof NarrativePreview> =
  (args) => {
    return (
      <Provider store={createTestStore()}>
        <NarrativePreview {...args} />
      </Provider>
    );
  };

export const Default = NarrativePreviewTemplate.bind({});

Default.args = {
  cells: testNarrativeDoc.cells,
  narrativeDoc: testNarrativeDoc,
  wsId: testNarrativeDoc.access_group,
};

export default {
  title: 'Components/NarrativePreview',
  component: NarrativePreview,
  excludeStories: /NarrativePreviewTemplate/,
} as ComponentMeta<typeof NarrativePreview>;
