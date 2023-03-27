import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import { NarrativePreview } from '../../features/navigator/NarrativeView';
import { testNarrative } from '../../features/navigator/NarrativeView.fixture';

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
  wsId: 42,
  cells: testNarrative.cells,
};

export default {
  title: 'Components/NarrativePreview',
  component: NarrativePreview,
} as ComponentMeta<typeof NarrativePreview>;
