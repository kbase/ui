// Stories for <NarrativeControl />

import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore, RootState } from '../../../app/store';
import { noOp } from '../../common';
import { ModalDialog } from '../../layout/Modal';
import { testNarrativeDoc, initialTestState } from '../fixtures';
import { Copy } from './Copy';
import { Delete } from './Delete';
import { LinkOrg } from './LinkOrg';
import { Rename } from './Rename';
import { Restore } from './Restore';
import { Share } from './Share';
import NarrativeControl from './';

interface StoryInitialState {
  initialState?: Partial<RootState>;
}

// Main NarrativeControl stories
const meta: Meta<typeof NarrativeControl> = {
  title: 'Components/NarrativeControl',
  component: NarrativeControl,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const storyArgs = args as typeof args & StoryInitialState;
    return (
      <div style={{ textAlign: 'right' }}>
        <Provider store={createTestStore(storyArgs.initialState)}>
          <NarrativeControl narrativeDoc={args.narrativeDoc} />
          <ModalDialog />
        </Provider>
      </div>
    );
  },
  args: {
    narrativeDoc: testNarrativeDoc,
    initialState: { navigator: initialTestState },
  } as React.ComponentProps<typeof NarrativeControl> & StoryInitialState,
};

// Copy component stories
export const StoryCopy: Meta<typeof Copy> = {
  title: 'Components/NarrativeControl/Copy',
  component: Copy,
  render: (args) => {
    const storyArgs = args as typeof args & StoryInitialState;
    return (
      <Provider store={createTestStore(storyArgs.initialState)}>
        <Copy
          narrativeDoc={args.narrativeDoc}
          modalClose={args.modalClose}
          version={args.version}
        />
      </Provider>
    );
  },
  args: {
    narrativeDoc: testNarrativeDoc,
    modalClose: noOp,
    version: 1,
  },
};

// Delete component stories
export const StoryDelete: Meta<typeof Delete> = {
  title: 'Components/NarrativeControl/Delete',
  component: Delete,
  render: (args) => {
    const storyArgs = args as typeof args & StoryInitialState;
    return (
      <Provider store={createTestStore(storyArgs.initialState)}>
        <Router>
          <Delete
            narrativeDoc={args.narrativeDoc}
            modalClose={args.modalClose}
          />
        </Router>
      </Provider>
    );
  },
  args: {
    narrativeDoc: testNarrativeDoc,
    modalClose: noOp,
  },
};

// LinkOrg component stories
export const StoryLink: Meta<typeof LinkOrg> = {
  title: 'Components/NarrativeControl/LinkOrg',
  component: LinkOrg,
  render: (args) => {
    const storyArgs = args as typeof args & StoryInitialState;
    return (
      <Provider store={createTestStore(storyArgs.initialState)}>
        <LinkOrg
          narrativeDoc={args.narrativeDoc}
          modalClose={args.modalClose}
        />
      </Provider>
    );
  },
  args: {
    narrativeDoc: testNarrativeDoc,
    modalClose: noOp,
  },
};

// Rename component stories
export const StoryRename: Meta<typeof Rename> = {
  title: 'Components/NarrativeControl/Rename',
  component: Rename,
  render: (args) => {
    const storyArgs = args as typeof args & StoryInitialState;
    return (
      <Provider store={createTestStore(storyArgs.initialState)}>
        <Rename narrativeDoc={args.narrativeDoc} modalClose={args.modalClose} />
      </Provider>
    );
  },
  args: {
    narrativeDoc: testNarrativeDoc,
    modalClose: noOp,
  },
};

// Restore component stories
export const StoryRestore: Meta<typeof Restore> = {
  title: 'Components/NarrativeControl/Restore',
  component: Restore,
  render: (args) => {
    const storyArgs = args as typeof args & StoryInitialState;
    return (
      <Provider store={createTestStore(storyArgs.initialState)}>
        <Restore
          narrativeDoc={args.narrativeDoc}
          modalClose={args.modalClose}
          version={args.version}
        />
      </Provider>
    );
  },
  args: {
    narrativeDoc: testNarrativeDoc,
    modalClose: noOp,
  },
};

// Share component stories
export const StoryShare: Meta<typeof Share> = {
  title: 'Components/NarrativeControl/Share',
  component: Share,
  render: (args) => {
    const storyArgs = args as typeof args & StoryInitialState;
    return (
      <Provider store={createTestStore(storyArgs.initialState)}>
        <Share narrativeDoc={args.narrativeDoc} modalClose={args.modalClose} />
      </Provider>
    );
  },
  args: {
    narrativeDoc: testNarrativeDoc,
    modalClose: noOp,
  },
};
