import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import { vi } from 'vitest';

test('renders Button', () => {
  const onClickSpy = vi.fn();
  render(
    <ul>
      <li>
        <Button onClick={onClickSpy}>A clickable button</Button>
      </li>
      <li>
        <Button disabled={true}>A disabled button</Button>
      </li>
      <li>
        <Button disabled={true} onClick={onClickSpy}>
          Another button
        </Button>
      </li>
    </ul>
  );
  const clickable = screen.getByText(/clickable/i);
  expect(clickable).toBeInTheDocument();
  clickable.click();
  const disabled = screen.getByText(/disabled/);
  expect(disabled).toBeInTheDocument();
  expect((disabled as HTMLButtonElement).disabled).toBe(true);
  disabled.click();
  const another = screen.getByText(/another/i);
  expect(another).toBeInTheDocument();
  another.click();
  expect(onClickSpy).toHaveBeenCalledTimes(1);
});
