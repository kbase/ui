import { FC } from 'react';
import { Meta } from '../types';

interface PlaceholderInterface {
  [x: string]:
    | boolean
    | null
    | number
    | string
    | undefined
    | Array<boolean | null | number | string | undefined | Meta>
    | Meta;
}

export const PlaceholderFactory = (name: string) => {
  const Placeholder: FC<PlaceholderInterface> = (props) => {
    const entrys = Object.entries(props);
    return (
      <pre
        className={
          'className' in props && props.className
            ? props.className.toString()
            : ''
        }
      >{`
<${name}${
        entrys.length
          ? `\n  ${entrys.map((entry) => entry.join('={')).join('}\n  ')}}\n`
          : ' '
      }/>
`}</pre>
    );
  };
  return Placeholder;
};
