import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { CardList, Card } from '../../common/components/Card';

const meta: Meta<typeof CardList> = {
  title: 'Components/CardList',
  component: CardList,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <CardList>
      <Card
        title="Any sort of Card can be show in any order"
        subtitle="some subtitle"
        image={<img src="https://picsum.photos/200/200" alt="img_desc" />}
      />
      <Card
        title="This is a card with an empty image"
        subtitle="what a great subtitle"
        image={<></>}
      />
      <Card title="This is a card with nothing but a title" />
      <Card title="Another card" subtitle="some subtitle" />
    </CardList>
  ),
};

const SelectableCardListDemo = () => {
  const options = [
    { id: 1, title: 'Click me!', subtitle: "I don't bite" },
    { id: 2, title: 'No! Click me!', subtitle: 'I have cookies' },
    { id: 3, title: "Wait don't click", subtitle: 'I find it kinda scary' },
  ];
  const [selected, setSelected] = useState<
    (typeof options)[number]['id'] | undefined
  >(undefined);
  return (
    <>
      <p>Selected: {selected ?? '-'}</p>
      <CardList>
        {options.map((option) => (
          <Card
            key={option.id}
            title={option.title}
            subtitle={option.subtitle}
            selected={selected === option.id}
            onClick={() => {
              if (selected === option.id) setSelected(undefined);
              else setSelected(option.id);
            }}
          />
        ))}
      </CardList>
    </>
  );
};

export const SelectableCardList: Story = {
  render: () => <SelectableCardListDemo />,
};
