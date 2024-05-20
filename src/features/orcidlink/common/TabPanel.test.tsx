import { render } from '@testing-library/react';
import TabPanel from './TabPanel';

describe('The TabPanel component', () => {
  it('to render children if selected', () => {
    const { container } = render(
      <TabPanel index={0} value={0}>
        FOO
      </TabPanel>
    );

    expect(container).toHaveTextContent('FOO');
  });

  it('not to render children if not selected', () => {
    const { container } = render(
      <TabPanel index={1} value={2}>
        FOO
      </TabPanel>
    );

    expect(container).not.toHaveTextContent('FOO');
  });
});
