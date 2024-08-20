import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Profile, ProfileParams } from '../../features/profile/Profile';

export default {
  title: 'Components/Profile',
  component: Profile,
} as ComponentMeta<typeof Profile>;

// Using a template allows the component to be rendered with dynamic storybook
// controls (args) these can be used to dynamically change the props of the
// component e.g. `<Component {...args} />`
const ProfileTemplate: ComponentStory<typeof Profile> = (args) => {
  const {
    narrativesLink,
    pageTitle,
    profileLink,
    profileData,
    realname,
    username,
    viewMine,
    viewNarratives,
  } = args as ProfileParams;
  return (
    <Profile
      narrativesLink={narrativesLink}
      pageTitle={pageTitle}
      profileLink={profileLink}
      profileData={profileData}
      realname={realname}
      username={username}
      viewMine={viewMine}
      viewNarratives={viewNarratives}
    />
  );
};

// Each story for the component can then reuse the template, setting props with
// the "args" attribute
export const Default = ProfileTemplate.bind({});
Default.args = {
  narrativesLink: '/profile/narratives',
  pageTitle: 'Some profile',
  profileLink: '/profile',
  profileData: {},
  realname: 'Some Realname',
  username: 'someusername',
  viewMine: true,
  viewNarratives: false,
};
