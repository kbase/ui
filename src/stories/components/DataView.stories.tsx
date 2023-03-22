import { ComponentMeta, ComponentStory } from '@storybook/react';
import DataView from '../../common/components/DataView';
import { testDataObjects } from '../../common/components/DataView.fixture';

export default {
  title: 'Components/DataView',
  component: DataView,
} as ComponentMeta<typeof DataView>;

// Using a template allows the component to be rendered with dynamic storybook
// controls (args) these can be used to dynamically change the props of the
// component e.g. `<Component {...args} />`
const DataViewTemplate: ComponentStory<typeof DataView> = (args) => {
  return (
    <div style={{ height: '70px', width: '100%', position: 'relative' }}>
      <DataView {...args}></DataView>
    </div>
  );
};

export const Default = DataViewTemplate.bind({});

Default.args = {
  wsId: 42,
  dataObjects: testDataObjects,
};
