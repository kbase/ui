import { FC } from 'react';
import { JSONSerializable } from '../types';

interface PlaceholderInterface {
  [x: string]: undefined | JSONSerializable;
}

// This placeholder factory makes components that can be used as stubs for
// development. There should be no Placeholders in production, so an error is
// thrown in that case.
export const PlaceholderFactory = (name: string) => {
  const Placeholder: FC<PlaceholderInterface> = (props) => {
    const invalidEnvironment =
      process.env.NODE_ENV === 'production' &&
      process.env.REACT_APP_KBASE_DOMAIN !== 'ci-europa.kbase.us';
    if (invalidEnvironment) {
      throw new Error('Placeholder components may not be used in production.');
    }
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
