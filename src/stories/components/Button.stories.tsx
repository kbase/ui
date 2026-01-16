import type { Meta, StoryObj } from '@storybook/react';
import { MouseEvent } from 'react';

import { Button } from '../../common/components';
import classes from '../../common/components/Button.module.scss';

const randomBackground = (evt: MouseEvent<HTMLButtonElement>) => {
  const classNames = Object.keys(classes);
  const randomIndex = Math.floor(classNames.length * Math.random());
  const randomClass = classes[classNames[randomIndex]];
  const currentClasses = evt.currentTarget.classList;
  currentClasses.forEach((cls) => currentClasses.remove(cls));
  currentClasses.add(randomClass);
};

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ul>
      <li>
        <Button>A button to click.</Button>
      </li>
      <li>
        <Button onClick={randomBackground}>Randomize background color.</Button>
      </li>
      <li>
        <Button disabled={true}>This button is disabled.</Button>
      </li>
    </ul>
  ),
};
