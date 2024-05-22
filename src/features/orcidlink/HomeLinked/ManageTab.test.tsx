import { screen } from '@testing-library/dom';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LINK_RECORD_1, PROFILE_1 } from '../test/data';
import { noop } from '../test/mocks';
import ManageTab from './ManageTab';

describe('The ManageTab component', () => {
  it('renders normally', () => {
    const linkRecord = LINK_RECORD_1;
    const profile = PROFILE_1;
    const orcidSiteURL = 'foo';

    const { container } = render(
      <MemoryRouter initialEntries={['/foo']}>
        <ManageTab
          linkRecord={linkRecord}
          profile={profile}
          orcidSiteURL={orcidSiteURL}
          removeLink={noop}
          toggleShowInProfile={noop}
        />
      </MemoryRouter>
    );

    expect(container).toHaveTextContent('Remove your KBase ORCID');
    expect(container).toHaveTextContent(
      'Removing the link will not alter any of your data'
    );
    expect(container).toHaveTextContent(
      'Please note that after you remove the link at KBase'
    );
  });

  it('cancel confirmation for removal of link', async () => {
    const user = userEvent.setup();
    const linkRecord = LINK_RECORD_1;
    const profile = PROFILE_1;
    const orcidSiteURL = 'foo';

    render(
      <MemoryRouter initialEntries={['/foo']}>
        <ManageTab
          linkRecord={linkRecord}
          profile={profile}
          orcidSiteURL={orcidSiteURL}
          removeLink={noop}
          toggleShowInProfile={noop}
        />
      </MemoryRouter>
    );

    const removeButton = await screen.findByText('Remove KBase ORCID® Link …');

    expect(removeButton).toBeVisible();

    await user.click(removeButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Confirm Removal of ORCID® Link')
      ).toBeVisible();
    });

    // Cancel the dialog

    const cancelButton = await screen.findByText('Cancel');

    expect(cancelButton).toBeVisible();

    await user.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Confirm Removal of ORCID® Link')
      ).not.toBeVisible();
    });
  });

  it('confirm removal of link', async () => {
    const user = userEvent.setup();
    const linkRecord = LINK_RECORD_1;
    const profile = PROFILE_1;
    const orcidSiteURL = 'foo';
    let removeLinkCalled = false;
    const removeLink = () => {
      removeLinkCalled = true;
    };

    render(
      <MemoryRouter initialEntries={['/foo']}>
        <ManageTab
          linkRecord={linkRecord}
          profile={profile}
          orcidSiteURL={orcidSiteURL}
          removeLink={removeLink}
          toggleShowInProfile={noop}
        />
      </MemoryRouter>
    );

    expect(removeLinkCalled).toBe(false);

    const removeButton = await screen.findByText('Remove KBase ORCID® Link …');

    expect(removeButton).toBeVisible();

    await user.click(removeButton);

    const dialog = await screen.findByText('Confirm Removal of ORCID® Link');

    expect(dialog).toBeVisible();

    // Confirm the dialog

    const yesButton = await screen.findByText(
      'Yes, go ahead and remove this link'
    );

    expect(yesButton).toBeVisible();

    await user.click(yesButton);

    expect(removeLinkCalled).toBe(true);
  });

  it('confirmation dialog can be canceled', async () => {
    const user = userEvent.setup();
    const linkRecord = LINK_RECORD_1;
    const profile = PROFILE_1;
    const orcidSiteURL = 'foo';

    const { container } = render(
      <MemoryRouter initialEntries={['/foo']}>
        <ManageTab
          linkRecord={linkRecord}
          profile={profile}
          orcidSiteURL={orcidSiteURL}
          removeLink={noop}
          toggleShowInProfile={noop}
        />
      </MemoryRouter>
    );

    // First, show that the main content is displayed.
    expect(container).toHaveTextContent('Remove your KBase ORCID® Link');

    // Then open the dialog.
    const removeButton = await screen.findByText('Remove KBase ORCID® Link …');
    expect(removeButton).toBeVisible();
    await user.click(removeButton);
    const dialog = await screen.findByText('Confirm Removal of ORCID® Link');
    expect(dialog).toBeVisible();

    // Cancel the dialog
    const cancelButton = await screen.findByText('Cancel');
    expect(cancelButton).toBeVisible();
    await user.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Confirm Removal of ORCID® Link')
      ).not.toBeVisible();
    });

    // And the main view should still be there.
    expect(container).toHaveTextContent('Remove your KBase ORCID® Link');
  });

  it('the "show in user profile" toggle calls the correct prop when clicked', async () => {
    const linkRecord = LINK_RECORD_1;
    const profile = PROFILE_1;
    const orcidSiteURL = 'foo';
    let toggleValue = false;
    const toggleShowInProfile = () => {
      toggleValue = !toggleValue;
    };

    render(
      <MemoryRouter initialEntries={['/foo']}>
        <ManageTab
          linkRecord={linkRecord}
          profile={profile}
          orcidSiteURL={orcidSiteURL}
          removeLink={noop}
          toggleShowInProfile={toggleShowInProfile}
        />
      </MemoryRouter>
    );

    const toggleControl = await screen.findByText('Yes');

    const user = userEvent.setup();

    await user.click(toggleControl);

    await waitFor(() => {
      expect(toggleValue).toBe(true);
    });

    await user.click(toggleControl);

    await waitFor(() => {
      expect(toggleValue).toBe(false);
    });
  });
});
