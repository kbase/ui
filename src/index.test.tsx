import ReactDOM from 'react-dom';
import * as Europa from '.';

jest.mock('react-dom');

describe('Europa...', () => {
  test('exists.', () => {
    expect(Europa).toBeTruthy();
    expect(ReactDOM.render).toBeCalled();
  });
});
