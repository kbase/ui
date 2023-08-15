/* NarrativeControl/LinkOrg */
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FC, useEffect, useId, useState } from 'react';
import {
  getNarrativeOrgs,
  getUserOrgs,
  OrgInfo,
} from '../../../common/api/orgsApi';
import { Button, Select } from '../../../common/components';
import { useAppDispatch, useAppSelector } from '../../../common/hooks';
import { NarrativeDoc } from '../../../common/types/NarrativeDoc';
import { TODOAddLoadingState } from '../common';
import {
  linkNarrative,
  narrativeLinkedOrgs,
  setLinkedOrgs,
} from '../navigatorSlice';

export interface OrgsValues {
  narrativeOrgs: string[];
}

export const LinkOrg: FC<{
  narrativeDoc: NarrativeDoc;
  modalClose: () => void;
}> = ({ narrativeDoc, modalClose }) => {
  const dispatch = useAppDispatch();
  const [orgSelected, setOrgSelected] = useState('');
  const narrativeOrgs = useAppSelector(narrativeLinkedOrgs);
  const narrativeOrgsQuery = getNarrativeOrgs.useQuery(
    narrativeDoc.access_group
  );
  const userOrgsQuery = getUserOrgs.useQuery();
  useEffect(() => {
    if (narrativeOrgsQuery.isSuccess) {
      const narrativeOrgs = narrativeOrgsQuery.currentData;
      if (narrativeOrgs) {
        dispatch(setLinkedOrgs(narrativeOrgs));
      }
    }
  });
  const orgSelectId = useId();
  if (!narrativeOrgsQuery.currentData) {
    return <></>;
  }
  const narrativeOrgsIds = narrativeOrgs.map(({ id }) => id);
  const linkOrg =
    ({ orgSelected }: { orgSelected: string }) =>
    async () => {
      await TODOAddLoadingState();
      dispatch(
        linkNarrative({ org: orgSelected, wsId: narrativeDoc.access_group })
      );
      modalClose();
    };
  const orgsResults = userOrgsQuery.currentData
    ? userOrgsQuery.currentData
    : [];
  const availableOrgs = orgsResults.filter(
    ({ id }) => narrativeOrgsIds.indexOf(id) === -1
  );
  return (
    <>
      <p>Organizations</p>

      <div>
        <label htmlFor={orgSelectId}>New Organization</label>
        <Select
          options={availableOrgs.map(({ id, name }) => ({
            value: id,
            label: name,
          }))}
          onChange={(opts) => {
            console.log({ value: opts[0].value }); // eslint-disable-line no-console
            const orgSelectedByUser = opts[0].value.toString();
            setOrgSelected(orgSelectedByUser);
          }}
        />
        {narrativeOrgs.length === 0 ? (
          <></>
        ) : (
          <>
            <p>Organizations this Narrative is linked to:</p>
            <ul>
              {narrativeOrgs.map(({ name, id }: OrgInfo) => (
                <a key={id} href={`/dev/#orgs/${id}`}>
                  <FAIcon icon={faArrowUpRightFromSquare} />
                  <li>{name}</li>
                </a>
              ))}
            </ul>
          </>
        )}
        <Button onClick={linkOrg({ orgSelected })}>OK</Button>
        <Button onClick={modalClose}>Cancel</Button>
      </div>
    </>
  );
};
