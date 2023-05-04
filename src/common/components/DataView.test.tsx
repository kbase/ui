import { render, screen } from '@testing-library/react';
import Dataview from './DataView';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import { testDataObjects } from './DataView.fixture';

test('Dataview renders', () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Dataview wsId={42} dataObjects={testDataObjects} />
    </Provider>
  );
  expect(container.querySelectorAll('a').length).toBe(5);
  // should only render 1 faIcon
  expect(container.querySelectorAll('svg').length).toBe(1);
  // should render 4 kbase icons
  expect(container.querySelectorAll('span.icon').length).toBe(4);
  // tests that object type is formatted from unreadable type
  expect(screen.getByText(/Genome/)).toBeInTheDocument();
  const firstAnchor = container.querySelector('a');
  expect(firstAnchor?.getAttribute('href')).toBe(
    '/#dataview/42/ridiculous_fake_type_that_shouldnt_exist'
  );
  // test that types are sorted alphabetically by readable type
  const readableTypes = screen.getAllByTestId('readable-type');
  const readableTypeCompare = [
    'Beeker',
    'FBA Model',
    'FBA Model',
    'Genome',
    'Metagenome',
  ];
  readableTypes.forEach((readableType, idx) => {
    expect(readableType.textContent).toBe(readableTypeCompare[idx]);
  });
});

test('Dataview renders empty message', () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Dataview wsId={42} dataObjects={[]} />
    </Provider>
  );
  expect(container.firstChild instanceof HTMLParagraphElement).toBeTruthy();
  expect(screen.getByText('This narrative has no data.')).toBeInTheDocument();
});
