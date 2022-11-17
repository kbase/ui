import { ComponentMeta, ComponentStory } from '@storybook/react';
import NarrativeList from '../../features/navigator/NarrativeList/NarrativeList';
import { testItems } from '../../features/navigator/NarrativeList/NarrativeList.fixture';
export default {
  title: 'Components/NarrativeList',
  component: NarrativeList,
} as ComponentMeta<typeof NarrativeList>;

// Using a template allows the component to be rendered with dynamic storybook
// controls (args) these can be used to dynamically change the props of the
// component e.g. `<Component {...args} />`
const NarrativeListTemplate: ComponentStory<typeof NarrativeList> = (args) => {
  return (
    <div style={{ height: '70px', width: '100%', position: 'relative' }}>
      <NarrativeList {...args}></NarrativeList>
    </div>
  );
};

export const Default = NarrativeListTemplate.bind({});
Default.args = {
  showVersionDropdown: true,
  itemsRemaining: 16,
  hasMoreItems: false,
  items: testItems,
};
