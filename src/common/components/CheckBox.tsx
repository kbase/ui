import { HTMLProps, useEffect, useRef } from 'react';

export const CheckBox = ({
  partial,
  className = '',
  ...rest
}: { partial?: boolean } & HTMLProps<HTMLInputElement>) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof partial === 'boolean' && ref.current) {
      ref.current.indeterminate = !rest.checked && partial;
    }
  }, [ref, partial, rest.checked]);

  return <input type="checkbox" ref={ref} className={className} {...rest} />;
};
