import type { Meta, StoryObj } from '@storybook/react';

import TopBar from '../../features/layout/TopBar';
import { usePageTitle } from '../../features/layout/layoutSlice';

const meta: Meta<typeof TopBar> = {
  title: 'Components/TopBar',
  component: TopBar,
};

export default meta;
type Story = StoryObj<typeof meta>;

interface TopBarStoryArgs {
  title: string;
}

const TopBarDemo = ({ title }: TopBarStoryArgs) => {
  usePageTitle(title);
  return (
    <div style={{ height: '70px', width: '100%', position: 'relative' }}>
      <TopBar />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <TopBarDemo title={(args as TopBarStoryArgs).title} />,
  args: {
    title: 'Some Page Title',
  } as TopBarStoryArgs & Partial<React.ComponentProps<typeof TopBar>>,
};
