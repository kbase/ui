import type { Meta, StoryObj } from '@storybook/react';

import { Profile } from '../../features/profile/Profile';

const meta: Meta<typeof Profile> = {
  title: 'Components/Profile',
  component: Profile,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    narrativesLink: '/profile/narratives',
    pageTitle: 'Some profile',
    profileLink: '/profile',
    realname: 'Some Realname',
    username: 'someusername',
    viewMine: true,
    viewNarratives: false,
  },
};
