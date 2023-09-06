// Storys for <NarrativeControl />

import { ComponentMeta, ComponentStory } from '@storybook/react';
import { FC } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore, RootState } from '../../../app/store';
import { noOp } from '../../common';
import { ModalDialog } from '../../layout/Modal';
import { testNarrativeDoc, initialTestState } from '../fixtures';
import { ControlProps } from './common';
import { Copy, CopyProps } from './Copy';
import { Delete } from './Delete';
import { LinkOrg } from './LinkOrg';
import { Rename } from './Rename';
import { Restore } from './Restore';
import { Share } from './Share';
import NarrativeControl, { NarrativeControlProps } from './';

interface StoryProps extends NarrativeControlProps {
  initialState?: Partial<RootState>;
}

interface ControlStoryProps extends ControlProps {
  initialState?: Partial<RootState>;
}

interface CopyStoryProps extends CopyProps {
  initialState?: Partial<RootState>;
}

export const CopyTemplate: ComponentStory<FC<CopyStoryProps>> = ({
  initialState,
  ...args
}) => {
  return (
    <Provider store={createTestStore(initialState)}>
      <Copy {...args} />
    </Provider>
  );
};

export const StoryCopy: ComponentMeta<typeof Copy> = {
  title: 'Components/NarrativeControl/Copy',
  component: CopyTemplate,
  args: {
    narrativeDoc: testNarrativeDoc,
    modalClose: noOp,
    version: 1,
  },
  render: CopyTemplate,
};

export const DeleteTemplate: ComponentStory<FC<ControlStoryProps>> = ({
  initialState,
  ...args
}) => {
  return (
    <Provider store={createTestStore(initialState)}>
      <Router>
        <Delete {...args} />
      </Router>
    </Provider>
  );
};

export const StoryDelete: ComponentMeta<typeof Delete> = {
  title: 'Components/NarrativeControl/Delete',
  component: Delete,
  args: {
    narrativeDoc: testNarrativeDoc,
    modalClose: noOp,
  },
  render: DeleteTemplate,
};

export const LinkOrgTemplate: ComponentStory<FC<ControlStoryProps>> = ({
  initialState,
  ...args
}) => {
  return (
    <Provider store={createTestStore(initialState)}>
      <LinkOrg {...args} />
    </Provider>
  );
};

export const StoryLink: ComponentMeta<typeof LinkOrg> = {
  title: 'Components/NarrativeControl/LinkOrg',
  component: LinkOrg,
  args: {
    narrativeDoc: testNarrativeDoc,
    modalClose: noOp,
  },
  render: LinkOrgTemplate,
};

export const RenameTemplate: ComponentStory<FC<ControlStoryProps>> = ({
  initialState,
  ...args
}) => {
  return (
    <Provider store={createTestStore(initialState)}>
      <Rename {...args} />
    </Provider>
  );
};

export const StoryRename: ComponentMeta<typeof Rename> = {
  title: 'Components/NarrativeControl/Rename',
  component: Rename,
  args: {
    narrativeDoc: testNarrativeDoc,
    modalClose: noOp,
  },
  render: RenameTemplate,
};

export const RestoreTemplate: ComponentStory<FC<CopyStoryProps>> = ({
  initialState,
  ...args
}) => {
  return (
    <Provider store={createTestStore(initialState)}>
      <Restore {...args} />
    </Provider>
  );
};

export const StoryRestore: ComponentMeta<typeof Restore> = {
  title: 'Components/NarrativeControl/Restore',
  component: Restore,
  args: {
    narrativeDoc: testNarrativeDoc,
    modalClose: noOp,
  },
  render: RestoreTemplate,
};

export const ShareTemplate: ComponentStory<FC<ControlStoryProps>> = ({
  initialState,
  ...args
}) => {
  return (
    <Provider store={createTestStore(initialState)}>
      <Share {...args} />
    </Provider>
  );
};

export const StoryShare: ComponentMeta<typeof Share> = {
  title: 'Components/NarrativeControl/Share',
  component: Share,
  args: {
    narrativeDoc: testNarrativeDoc,
    modalClose: noOp,
  },
  render: ShareTemplate,
};

export const NarrativeControlTemplate: ComponentStory<FC<StoryProps>> = ({
  initialState,
  ...args
}) => {
  return (
    <div style={{ textAlign: 'right' }}>
      <Provider store={createTestStore(initialState)}>
        <NarrativeControl {...args} />
        <ModalDialog />
      </Provider>
    </div>
  );
};

export const Default = NarrativeControlTemplate.bind({});

Default.args = {
  narrativeDoc: testNarrativeDoc,
  initialState: { navigator: initialTestState },
};

export default {
  title: 'Components/NarrativeControl',
  component: NarrativeControl,
  excludeStories: /Template/,
} as ComponentMeta<typeof NarrativeControl>;
