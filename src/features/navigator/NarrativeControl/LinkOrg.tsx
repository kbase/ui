/* NarrativeControl/LinkOrg */
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FC, useEffect, useId, useState } from 'react';
import toast from 'react-hot-toast';
import { isKBaseBaseQueryError } from '../../../common/api/utils/common';
import { parseError } from '../../../common/api/utils/parseError';
import {
  getNarrativeOrgs,
  getUserOrgs,
  linkNarrative,
  OrgInfo,
} from '../../../common/api/orgsApi';
import { Button, Select } from '../../../common/components';
import { useAppDispatch, useAppSelector } from '../../../common/hooks';
import { NarrativeDoc } from '../../../common/types/NarrativeDoc';
import {
  linkNarrative as linkAction,
  narrativeLinkedOrgs,
  setLinkedOrgs,
  setLoading,
} from '../navigatorSlice';
import { ErrorMessage } from './common';

export interface OrgsValues {
  narrativeOrgs: string[];
}

export const LinkOrg: FC<{
  narrativeDoc: NarrativeDoc;
  modalClose: () => void;
}> = ({ narrativeDoc, modalClose }) => {
  /* hooks */
  const dispatch = useAppDispatch();
  const [orgSelected, setOrgSelected] = useState('');
  const narrativeOrgs = useAppSelector(narrativeLinkedOrgs);
  const narrativeOrgsQuery = getNarrativeOrgs.useQuery(
    narrativeDoc.access_group
  );
  const userOrgsQuery = getUserOrgs.useQuery();
  const [linkTrigger] = linkNarrative.useMutation();
  useEffect(() => {
    if (narrativeOrgsQuery.isSuccess) {
      const narrativeOrgs = narrativeOrgsQuery.currentData;
      if (narrativeOrgs) {
        dispatch(setLinkedOrgs(narrativeOrgs));
      }
    }
  });
  const orgSelectId = useId();
  /* early exits */
  if (!narrativeOrgsQuery.currentData) {
    return <></>;
  }
  /* derived values */
  const narrativeOrgsIds = narrativeOrgs.map(({ id }) => id);
  const { access_group: wsId } = narrativeDoc;
  const message = `Link ${wsId} to ${orgSelected}.`;
  /* link narrative callback factory */
  const linkOrg =
    ({ orgSelected }: { orgSelected: string }) =>
    async () => {
      modalClose();
      dispatch(linkAction({ org: orgSelected, wsId }));
      try {
        await linkTrigger({
          orgId: orgSelected,
          wsId,
        }).unwrap();
        dispatch(setLoading(false));
      } catch (err) {
        if (!isKBaseBaseQueryError(err)) {
          console.error({ err }); // eslint-disable-line no-console
          toast(ErrorMessage({ err }));
          return;
        }
        toast(ErrorMessage({ err: parseError(err) }));
        dispatch(setLoading(false));
        return;
      }
      toast(message);
    };
  const orgsResults = userOrgsQuery.currentData
    ? userOrgsQuery.currentData
    : [];
  const availableOrgs = orgsResults.filter(
    ({ id }) => narrativeOrgsIds.indexOf(id) === -1
  );
  /* LinkOrg component */
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
