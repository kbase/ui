import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ChangeEvent, FunctionComponent as FC } from 'react';

import { Input } from '../../common/components/Input';
import classes from '../../common/components/Input.module.scss';

export default {
  title: 'Components/Input',
  component: Input,
} as ComponentMeta<typeof Input>;

const LabelExample: FC = () => (
  <>
    <span>
      Input with a <abbr title="Functional Component">FC</abbr> label.
    </span>
  </>
);

const validateInputIsTaco = (input: string) => input === 'taco';
const randomBackground = (evt: ChangeEvent<HTMLInputElement>) => {
  const classNames = Object.keys(classes);
  const randomIndex = Math.floor(classNames.length * Math.random());
  const randomClass = classes[classNames[randomIndex]];
  const currentClasses = evt.currentTarget.classList;
  currentClasses.forEach((cls) => currentClasses.remove(cls));
  currentClasses.add(randomClass);
};

const InputTemplate: ComponentStory<typeof Input> = (args) => (
  <ul>
    <li>
      <Input idForLabel={'story-1'} label={<>Input with text label</>} />
    </li>
    <li>
      <Input idForLabel={'story-2'} label={<LabelExample />} />
    </li>
    <li>
      <Input idForLabel={'story-3'} disabled={true} label={<>Disabled.</>} />
    </li>
    <li>
      <Input
        idForLabel={'story-4'}
        label={<>Uncontrolled with validator.</>}
        validate={validateInputIsTaco}
      />
    </li>
    <li>
      <Input
        changeHandler={randomBackground}
        idForLabel={'story-5'}
        label={<>Uncontrolled with changeHandler.</>}
      />
    </li>
  </ul>
);

export const Default = InputTemplate.bind({});
Default.args = {};
