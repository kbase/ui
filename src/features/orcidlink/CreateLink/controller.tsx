/**
 * A controller for the CreateLink component.
 *
 * The main task of this component is to determine if the user is linked or not.
 * If so, then the CreateLink interface is displayed, otherwise an error message.
 *
 * This component is normally invoked in reaction to an unlinked user pressing a
 * button displayed from the orcidlink home view.
 *
 * As a controller, other than loading the initial external state form the
 * orcidlink service, it also provides action functions to allow the user to
 * start the process of creating a new link.
 *
 * Note that we use a more context-specific state machine which is driven by
 * changes in the RTK query state.
 *
 */

import { Box } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../layout/layoutSlice';
import ORCIDLinkAPI from '../common/api/ORCIDLInkAPI';
import ErrorMessage, {
  CommonError,
  makeCommonError,
} from '../common/ErrorMessage';
import Loading from '../common/Loading';
import { API_CALL_TIMEOUT, ORCIDLINK_SERVICE_API_ENDPOINT } from '../constants';
import View from './view';

export enum CreateLinkStatus {
  NONE = 'NONE',
  DETERMINING_ELIGIBILITY = 'DETERMINING_ELIGIBILITY',
  CAN_CREATE_SESSION = 'CAN_CREATE_SESSION',
  CREATING_SESSION = 'CREATING_SESSION',
  SESSION_CREATED = 'SESSION_CREATED',
  ERROR = 'ERROR',
  CANCELED = 'CANCELED',
}

export interface CreateLinkStateBase {
  status: CreateLinkStatus;
}

export interface CreateLinkStateNone extends CreateLinkStateBase {
  status: CreateLinkStatus.NONE;
}

export interface CreateLinkStateDeterminigEligibility
  extends CreateLinkStateBase {
  status: CreateLinkStatus.DETERMINING_ELIGIBILITY;
}

export interface CreateLinkStateCanCreateSession extends CreateLinkStateBase {
  status: CreateLinkStatus.CAN_CREATE_SESSION;
}

export interface CreateLinkStateCreatingSession extends CreateLinkStateBase {
  status: CreateLinkStatus.CREATING_SESSION;
}

export interface CreateLinkStateSessionCreated extends CreateLinkStateBase {
  status: CreateLinkStatus.SESSION_CREATED;
  session_id: string;
}

export interface CreateLinkStateSessionError extends CreateLinkStateBase {
  status: CreateLinkStatus.ERROR;
  error: CommonError;
}

export interface CreateLinkStateCanceled extends CreateLinkStateBase {
  status: CreateLinkStatus.CANCELED;
}

export type CreateLinkState =
  | CreateLinkStateNone
  | CreateLinkStateDeterminigEligibility
  | CreateLinkStateCanCreateSession
  | CreateLinkStateCreatingSession
  | CreateLinkStateSessionCreated
  | CreateLinkStateCanceled
  | CreateLinkStateSessionError;

export interface CreateLinkControllerProps {
  username: string;
  token: string;
}

export default function CreateLinkController({
  username,
  token,
}: CreateLinkControllerProps) {
  const navigate = useNavigate();

  const [state, setState] = useState<CreateLinkState>({
    status: CreateLinkStatus.NONE,
  });

  const createLinkSession = useCallback(async () => {
    const orcidLinkService = new ORCIDLinkAPI({
      url: ORCIDLINK_SERVICE_API_ENDPOINT,
      timeout: API_CALL_TIMEOUT,
      token,
    });

    if (state.status !== CreateLinkStatus.CAN_CREATE_SESSION) {
      return;
    }

    setState({
      status: CreateLinkStatus.CREATING_SESSION,
    });

    try {
      const { session_id } = await orcidLinkService.createLinkingSession({
        username,
      });

      setState({
        status: CreateLinkStatus.SESSION_CREATED,
        session_id,
      });

      // Now redirect into the oauth flow...
      const pathname = `/services/orcidlink/linking-sessions/${session_id}/oauth/start`;

      // TODO: implement return instructions to allow for landing here from
      // somewhere other than the orcidlink home (e.g. user profile); the
      // purpose is to allow redirecting to the original location when linking
      // is complete.

      // TODO: ui_options - was used during development, not used any more, but
      // a good feature to keep for now. It was used to provide a hint to the
      // linking ui; the only usage I recall is that when we we implemented
      // linking in a pop-out window from the Narrative, we needed a way of
      // communicating this to kbase-ui, and elected for the more generalized ui
      // options string rather than a specific flag.

      // TODO: skip_prompt - allows skipping the prompt for linking at the final
      // confirmation step; in other words, skip the final step. I don't think
      // this was being used in the final implementation, but was a feature
      // we wanted to be able to exploit if it was felt that confirmation was
      // not desired.

      const skipPrompt = 'false';

      const url = new URL(window.location.origin);
      url.pathname = pathname;
      url.searchParams.set('skip_prompt', skipPrompt);
      window.open(url, '_self');
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : 'Unknown error';
      setState({
        status: CreateLinkStatus.ERROR,
        error: makeCommonError({
          message: `Cannot create linking session: ${message}`,
        }),
      });
    }
  }, [setState, state, token, username]);

  usePageTitle('KBase ORCID Link - Create Link');

  const mountedRef = useRef<boolean>(false);

  useEffect(() => {
    if (mountedRef.current) {
      return;
    }
    mountedRef.current = true;

    setState({
      ...state,
      status: CreateLinkStatus.DETERMINING_ELIGIBILITY,
    });

    async function initialize(username: string) {
      const orcidLinkService = new ORCIDLinkAPI({
        url: ORCIDLINK_SERVICE_API_ENDPOINT,
        timeout: API_CALL_TIMEOUT,
        token,
      });

      try {
        const isLinked = await orcidLinkService.isLinked({ username });
        if (isLinked) {
          setState({
            status: CreateLinkStatus.ERROR,
            error: makeCommonError({
              message:
                'Your KBase account is already linked to an ORCID account',
              title: 'Already Linked',
              solutions: [
                {
                  description:
                    'Visit the ORCID Link home page to see your link',
                  link: {
                    label: 'KBase ORCID Link Home',
                    url: '/orcidlink',
                  },
                },
              ],
            }),
          });
        } else {
          setState({
            status: CreateLinkStatus.CAN_CREATE_SESSION,
          });
        }
      } catch (ex) {
        const message = ex instanceof Error ? ex.message : 'Unknown error';
        setState({
          status: CreateLinkStatus.ERROR,
          error: makeCommonError({
            message,
          }),
        });
      }
    }

    initialize(username);
  }, [setState, state, token, username, navigate]);

  switch (state.status) {
    case CreateLinkStatus.NONE:
      // NB returning null because the Authed component's "element" prop, which
      // follows the react-router's "element" prop, nevertheless is not typed
      // the same.
      return null;
    case CreateLinkStatus.DETERMINING_ELIGIBILITY:
      return (
        <Loading title="Loading">
          Determining whether your account is already linked...
        </Loading>
      );

    case CreateLinkStatus.CAN_CREATE_SESSION:
      return (
        <View createLinkState={state} createLinkSession={createLinkSession} />
      );

    case CreateLinkStatus.CREATING_SESSION:
      return (
        <View createLinkState={state} createLinkSession={createLinkSession} />
      );

    case CreateLinkStatus.SESSION_CREATED:
      return (
        <View createLinkState={state} createLinkSession={createLinkSession} />
      );

    case CreateLinkStatus.ERROR:
      return (
        <Box>
          <ErrorMessage error={state.error} />
        </Box>
      );

    case CreateLinkStatus.CANCELED:
      navigate('/orcidlink');
      return null;
  }
}
