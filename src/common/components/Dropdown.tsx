import { FC, ComponentPropsWithRef } from 'react';
import { components } from 'react-select';
import classes from './Dropdown.module.scss';
import { Select } from './Select';

const { DropdownIndicator } = components;

export type DropdownProps = ComponentPropsWithRef<typeof Select>;

const Dropdown: FC<DropdownProps> = (props) => {
  const indicator = props.children;
  return (
    <Select
      {...props}
      value={null}
      className={[classes['dropdown'], props.className].join(' ')}
      components={{
        DropdownIndicator: (props) => (
          <DropdownIndicator {...props}>{indicator}</DropdownIndicator>
        ),
      }}
    />
  );
};

export { Dropdown };
