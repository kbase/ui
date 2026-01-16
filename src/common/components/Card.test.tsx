import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import classes from './Card.module.scss';
import { Card, CardList } from './Card';
import { act } from 'react';
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
} from 'react-router-dom';
import { vi } from 'vitest';

describe('Card', () => {
  test('renders Card with title', () => {
    render(
      <MemoryRouter>
        <Card title="Foo" />
      </MemoryRouter>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass(classes['card']);
    expect(card.querySelector('.body')?.textContent).toContain('Foo');
  });

  test('renders Card with image', () => {
    render(
      <MemoryRouter>
        <Card title="Foo" image={<img alt="nada" />} />
      </MemoryRouter>
    );
    const card = screen.getByTestId('card');
    expect(card.querySelector('img')).toBeInTheDocument();
  });

  test('renders Card with subtitle', () => {
    render(
      <MemoryRouter>
        <Card
          title="Foo"
          subtitle={
            <div data-testid="subtitleContent">Anything could be here!</div>
          }
        />
      </MemoryRouter>
    );
    const sub = screen.getByTestId('subtitleContent');
    expect(sub).toBeInTheDocument();
  });

  test('renders Card with classname', () => {
    render(
      <MemoryRouter>
        <Card title="Foo" className="Bar" />
      </MemoryRouter>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('Bar');
  });

  test('renders selected Card', () => {
    render(
      <MemoryRouter>
        <Card title="Foo" selected />
      </MemoryRouter>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass(classes['card']);
    expect(card).toHaveClass(classes['selected']);
  });

  test('renders unselected Card', () => {
    render(
      <MemoryRouter>
        <Card title="Foo" />
      </MemoryRouter>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass(classes['card']);
    expect(card).not.toHaveClass(classes['selected']);
  });

  test('renders clickable button Card', async () => {
    const clicked = vi.fn();
    render(
      <MemoryRouter>
        <Card title="Foo" onClick={clicked} />
      </MemoryRouter>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass(classes['card']);
    expect(card.getAttribute('role')).toBe('button');
    expect(card).toHaveClass(classes['clickable']);
    await act(() => userEvent.click(card));
    expect(clicked).toHaveBeenCalledTimes(1);
    card.focus();
    clicked.mockClear();
    fireEvent.keyDown(card, {
      key: 'Enter',
    });
    expect(clicked).toHaveBeenCalledTimes(1);
    clicked.mockClear();
    // Key that should not trigger onClick
    fireEvent.keyDown(card, {
      key: 'a',
    });
    expect(clicked).toHaveBeenCalledTimes(0);
  });

  test('renders clickable link Card', async () => {
    const clicked = vi.fn();
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <Card title="Foo" linkTo={'/foo'} onClick={clicked} />,
        },
        {
          path: '/foo',
          element: <div />,
        },
      ],
      {
        initialEntries: ['/'],
        initialIndex: 1,
      }
    );
    render(<RouterProvider router={router} />);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass(classes['card']);
    expect(card.getAttribute('role')).toBe('link');
    expect(card).toHaveClass(classes['clickable']);
    await act(() => userEvent.click(card));
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(router.state.location.pathname).toBe('/foo');
  });
});

describe('CardList', () => {
  test('renders CardList', () => {
    render(
      <MemoryRouter>
        <CardList>
          <Card title="Foo" />
          <Card title="bar" />
          <Card title="BaZ" />
        </CardList>
      </MemoryRouter>
    );
    const cardList = screen.getByTestId('cardList');
    expect(cardList).toHaveClass(classes['card-list']);
    expect(cardList.textContent).toContain('Foo');
    expect(cardList.textContent).toContain('bar');
    expect(cardList.textContent).toContain('BaZ');
  });
});
