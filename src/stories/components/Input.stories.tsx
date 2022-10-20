import { ComponentStory, ComponentMeta } from '@storybook/react';
import { FunctionComponent as FC } from 'react';

import { useForm } from 'react-hook-form';

import {
  _randomBackground,
  inputRegisterFactory,
  validateInputIsTacoFactory,
} from '../../common/components/Input.common';
import { Input } from '../../common/components/Input';

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

const validateInputIsTodayFactory = (name: string) => (input: string) => {
  const today = new Date().toISOString().split('T')[0];
  if (input === today) return true;
  return `Please enter today's date for the value ${name}.`;
};

interface StoryValues {
  storyChange: string;
  storyDisabled: string;
  storyLabel: string;
  storyLabelFC: string;
  storyLength: string;
  storyPattern: string;
  storyTaco: string;
  storyToday: string;
}

const InputTemplate: ComponentStory<typeof Input> = (args) => {
  const { formState, register } = useForm<StoryValues>({
    defaultValues: {
      storyChange: '',
      storyDisabled: '',
      storyLabel: '',
      storyLabelFC: '',
      storyLength: '',
      storyPattern: '',
      storyTaco: '',
      storyToday: '',
    },
    mode: 'all',
  });
  const inputRegister = inputRegisterFactory<StoryValues>({
    formState,
    register,
  });
  const { errors } = formState;
  const errorEntrys = Object.entries(errors);
  const valueTooLong = (name: string) =>
    `The value for ${name} is too long, ` +
    'it should not be longer than 4 characters.';
  const valueTooShort = (name: string) =>
    `The value for ${name} is too short, ` +
    'it should not be shorter than 4 characters.';
  const valueDateShouldBeISO = (name: string) =>
    `Please use YYYY-MM-DD format for ${name}.`;
  const valueDateTooFuturistic = (name: string) =>
    `The date entered for ${name} is too far in the future.`;

  return (
    <form>
      <ul>
        <li>
          <Input
            label={<>Input with text label</>}
            placeholder={'storyLabel'}
            {...inputRegister('storyLabel')}
          />
        </li>
        <li>
          <Input
            label={<LabelExample />}
            placeholder={'storyLabelFC'}
            {...inputRegister('storyLabelFC')}
          />
        </li>
        <li>
          <Input
            disabled={true}
            label={<>Disabled.</>}
            placeholder={'storyDisabled'}
            {...inputRegister('storyDisabled')}
          />
        </li>
        <li>
          <Input
            label={<>Uncontrolled with onChange.</>}
            placeholder={'storyChange'}
            {...inputRegister('storyChange', { onChange: _randomBackground })}
          />
        </li>
        <li>
          <Input
            label={<>Uncontrolled with validations.</>}
            placeholder={'storyLength'}
            {...inputRegister('storyLength', {
              maxLength: {
                value: 4,
                message: valueTooLong('storyLength'),
              },
              minLength: {
                value: 4,
                message: valueTooShort('storyLength'),
              },
            })}
          />
        </li>
        <li>
          <Input
            label={<>Uncontrolled with validator and onChange.</>}
            placeholder={'storyTaco'}
            {...inputRegister('storyTaco', {
              onChange: _randomBackground,
              maxLength: {
                value: 4,
                message: valueTooLong('storyTaco'),
              },
              minLength: {
                value: 4,
                message: valueTooShort('storyTaco'),
              },
              validate: validateInputIsTacoFactory('storyTaco'),
            })}
          />
        </li>
        <li>
          <Input
            label={<>Should match pattern YYYY-MM-DD.</>}
            placeholder={'storyPattern'}
            {...inputRegister('storyPattern', {
              maxLength: {
                value: 12,
                message: valueDateTooFuturistic('storyPattern'),
              },
              pattern: {
                value: /^[0-9]+-[0-9]{2}-[0-9]{2}$/,
                message: valueDateShouldBeISO('storyPattern'),
              },
            })}
          />
        </li>
        <li>
          <Input
            label={<>Should match today's date in YYYY-MM-DD format.</>}
            placeholder={'storyToday'}
            {...inputRegister('storyToday', {
              maxLength: {
                value: 12,
                message: valueDateTooFuturistic('storyToday'),
              },
              pattern: {
                value: /^[0-9]+-[0-9]{2}-[0-9]{2}$/,
                message: valueDateShouldBeISO('storyToday'),
              },
              validate: validateInputIsTodayFactory('storyToday'),
            })}
          />
        </li>
      </ul>
      {errorEntrys.length > 0 ? <h2>Errors</h2> : <></>}
      <ul>
        {errorEntrys.map(([key, { message, type }]) => (
          <li key={key}>{message}</li>
        ))}
      </ul>
    </form>
  );
};

export const Default = InputTemplate.bind({});
Default.args = {};
