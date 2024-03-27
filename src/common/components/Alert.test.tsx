import { render } from '@testing-library/react';
import Alert, { Variant } from './Alert';

describe('Alert component', () => {
  test('renders successfully with minimal props', () => {
    const { container } = render(<Alert variant="info" />);
    const heading = container.querySelector('[role="heading"]');
    // The title is not rendered if it is not provided.
    expect(heading).toBeNull();
  });

  test('renders successfully with title supplied', () => {
    const { container } = render(<Alert variant="info" title="Foo" />);
    const heading = container.querySelector('[role="heading"]');
    expect(heading).toHaveTextContent('Foo');
  });

  test('renders successfully with title and message supplied', () => {
    const { container } = render(
      <Alert variant="info" title="Foo" message="Bar" />
    );
    const heading = container.querySelector('[role="heading"]');
    expect(heading).toHaveTextContent('Foo');
    //  no specific role for the content.
    expect(container).toHaveTextContent('Bar');
  });

  test('renders successfully with title and message supplied in children', () => {
    const { container } = render(
      <Alert variant="info" title="Foo">
        Baz Buzz
      </Alert>
    );
    const heading = container.querySelector('[role="heading"]');
    expect(heading).toHaveTextContent('Foo');
    //  no specific role for the content.
    expect(container).toHaveTextContent('Baz Buzz');
  });

  test('renders successfully with title and message supplied in children for all variants', () => {
    const testCases: { variant: Variant; title: string; message: string }[] = [
      {
        variant: 'info',
        title: 'My Info',
        message: 'Info here...',
      },
      {
        variant: 'error',
        title: 'My Error',
        message: 'Error here...',
      },
    ];
    for (const { variant, title, message } of testCases) {
      const { container } = render(
        <Alert variant={variant} title={title} message={message} />
      );
      const heading = container.querySelector('[role="heading"]');
      expect(heading).toHaveTextContent(title);
      //  no specific role for the content.
      expect(container).toHaveTextContent(message);
    }
  });
});
