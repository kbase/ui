import { ComponentStory, ComponentMeta } from '@storybook/react';

import TopBar from '../../features/layout/TopBar';
import { usePageTitle } from '../../features/layout/layoutSlice';

export default {
  title: 'Components/TopBar',
  component: TopBar,
} as ComponentMeta<typeof TopBar>;

// Using a template allows the component to be rendered with dynamic storybook
// controls (args) these can be used to dynamically change the props of the
// component e.g. `<Component {...args} />`
const TopBarTemplate: ComponentStory<typeof TopBar> = (args) => {
  const { title } = args as ArgTypes;
  usePageTitle(title);
  return (
    <div style={{ height: '70px', width: '100%', position: 'relative' }}>
      <TopBar />
    </div>
  );
};

// Each story for the component can then reuse the template, setting props with
// the "args" attribute
interface ArgTypes {
  title: string;
}
export const Default = TopBarTemplate.bind({});
Default.args = {
  title: 'Some Page Title',
};
