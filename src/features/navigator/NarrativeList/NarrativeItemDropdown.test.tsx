import { screen, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { GroupBase } from 'react-select';
import { createTestStore } from '../../../app/store';
import { DropdownProps } from '../../../common/components/Dropdown';
import { SelectOption, OptionsArray } from '../../../common/components/Select';
import NarrativeItemDropdown from './NarrativeItemDropdown';

// mock react-select with regular HTML select
jest.mock('../../../common/components/Dropdown', () => ({
  __esModule: true,
  Dropdown: ({ options, onChange }: DropdownProps) => {
    function handleChange(event: SelectOption) {
      for (const option of options as OptionsArray) {
        if (
          (option as GroupBase<SelectOption>).options[0].value === event.value
        ) {
          onChange?.([event]);
        }
      }
    }
    return (
      <select
        data-testid="select"
        onChange={(e) =>
          handleChange({
            value: e.target.value,
            label: e.target.value.toString(),
          })
        }
      >
        {(options as OptionsArray).map((option, idx) => (
          <option
            data-testid={(option as GroupBase<SelectOption>).options[0].value}
            key={idx}
            value={(option as SelectOption).value}
            onClick={() =>
              handleChange((option as GroupBase<SelectOption>).options[0])
            }
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  },
}));

test('NarrativeItemDropdown renders', async () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router>
        <NarrativeItemDropdown
          narrativeUPA={'1/2/400'}
          version={400}
          visible={true}
        />
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  expect(container.querySelector('.dropdown_wrapper')).toBeInTheDocument();
});

test('NarrativeItemDropdown populates right number of versions', () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router>
        <NarrativeItemDropdown
          narrativeUPA={'1/2/123'}
          version={123}
          visible={true}
        />
      </Router>
    </Provider>
  );
  const select = screen.getByTestId('select');
  // this tests that the component will render 123 separate items in the dropdown
  expect(select.querySelectorAll('option')).toHaveLength(123);

  expect(container).toBeTruthy();
});
