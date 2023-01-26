import { ComponentMeta, ComponentStory } from '@storybook/react';

import AppCellIcon from '../../features/icons/AppCellIcon';
import { AppTag } from '../../features/icons/iconSlice';

export default {
  title: 'Components/AppCellIcon',
  component: AppCellIcon,
} as ComponentMeta<typeof AppCellIcon>;

// Using a template allows the component to be rendered with dynamic storybook
// controls (args) these can be used to dynamically change the props of the
// component e.g. `<Component {...args} />`
const AppCellIconTemplate: ComponentStory<typeof AppCellIcon> = (args) => {
  return (
    <div style={{ height: '70px', width: '100%', position: 'relative' }}>
      <AppCellIcon {...args}></AppCellIcon>
    </div>
  );
};

export const Default = AppCellIconTemplate.bind({});

Default.args = {
  appTag: AppTag.release,
  appId: 'Taxon',
};
