import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Card } from '../../common/components/Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    title: { type: { name: 'string' } },
    subtitle: { type: { name: 'string' } },
    image: {
      table: {
        disable: true,
      },
    },
    onClick: {
      table: {
        disable: true,
      },
    },
  },
  parameters: { controls: { exclude: ['onClick'] } },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Some card title goes here',
    subtitle: 'Imagine this is a very interesting subtitle',
    image: <img src="https://picsum.photos/200/200" alt="img_desc" />,
  },
};

export const MinimalCard: Story = {
  args: {
    title: 'Some card title goes here',
  },
};

export const SubtitleCard: Story = {
  args: {
    title: 'Some card title goes here',
    subtitle: 'Imagine this is a very interesting subtitle',
  },
};

export const ImageCard: Story = {
  args: {
    title: 'Some card title goes here',
    image: <img src="https://picsum.photos/200/200" alt="img_desc" />,
  },
};

export const BlankImageCard: Story = {
  args: {
    title: 'Some card title goes here',
    image: <></>,
  },
};

export const ImageSubtitleCard: Story = {
  args: {
    title: 'Some card title goes here',
    subtitle: 'Imagine this is a very interesting subtitle',
    image: <img src="https://picsum.photos/200/200" alt="img_desc" />,
  },
};

export const LinkCard: Story = {
  args: {
    title: 'Some card title goes here',
    subtitle: 'Imagine this is a very interesting subtitle',
    image: <img src="https://picsum.photos/200/200" alt="img_desc" />,
    linkTo: './some/internal/link',
  },
};

export const ButtonCard: Story = {
  args: {
    title: 'Some card title goes here',
    subtitle: 'Imagine this is a very interesting subtitle',
    image: <img src="https://picsum.photos/200/200" alt="img_desc" />,
    onClick: () => alert('You clicked the button!'),
  },
};

const SelectableCardDemo = () => {
  const [selected, setSelected] = useState(true);
  return (
    <Card
      title="Foo"
      subtitle="Imagine this is a very interesting subtitle"
      image={<img src="https://picsum.photos/128" alt="img_desc" />}
      onClick={() => setSelected(!selected)}
      selected={selected}
    />
  );
};

export const SelectableCard: Story = {
  render: () => <SelectableCardDemo />,
};

export const CardInContainer: Story = {
  render: () => (
    <div style={{ width: '100px' }}>
      <Card
        title="Foo"
        subtitle="Imagine this is a very interesting subtitle but its a bit long so it wraps"
        image={<img src="https://picsum.photos/128" alt="img_desc" />}
      />
    </div>
  ),
};
