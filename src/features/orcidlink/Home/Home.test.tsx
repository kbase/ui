import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SERVICE_INFO_1 } from '../test/data';
import Home from './Home';

// We are not testing the HomeLinked component; we just want to be sure that it
// is rendered.
jest.mock('../HomeLinked', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>Mocked Linked Component</div>;
    },
  };
});

describe('The Home Component', () => {
  it('renders correctly for unlinked', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/foo']}>
        <Home isLinked={false} info={SERVICE_INFO_1} />
      </MemoryRouter>
    );

    expect(container).not.toBeNull();
    expect(container).toHaveTextContent(
      'You do not currently have a link from your KBase account'
    );
  });

  it('renders correctly for linked', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/foo']}>
        <Home isLinked={true} info={SERVICE_INFO_1} />
      </MemoryRouter>
    );

    expect(container).not.toBeNull();
    expect(container).toHaveTextContent('Mocked Linked Component');
  });
});
