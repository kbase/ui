/**
 * This is the ConfirmLink component entrypoint and controller.
 *
 * This component is invoked on the path which is the redirection target from
 * the orcidlink service at the completion of creating an orcidlink.
 *
 * Within the design of linking, however, the service leaves the completed
 * linkint in an incomplete state, pending the user's final approval of the
 * link. In other words, all conditions have been satisfied for creating the
 * link with ORCID and the service has saved the linking information including
 * ORCID authorization, but we allow the user a final chance to inspect their
 * link before creating it.
 *
 * This component is responsible for fetching the given current linking session
 * and presenting it to the user. As a controller, it provides action functions
 * as props, so that the user may finalize the link or cancel the linking session.
 */

import { Alert, Box } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../../common/hooks';
import { JSONRPC20Exception } from '../common/api/JSONRPC20';
import ORCIDLinkAPI, {
  InfoResult,
  LinkingSessionPublicComplete,
} from '../common/api/ORCIDLInkAPI';
import ErrorMessage, {
  CommonError,
  makeCommonError,
} from '../common/ErrorMessage';
import Loading from '../common/Loading';
import { API_CALL_TIMEOUT, ORCIDLINK_SERVICE_API_ENDPOINT } from '../constants';
import ConfirmLink from './view';

export enum ConfirmLinkStatus {
  NONE = 'NONE',
  LOADING_SESSION_DATA = 'LOADING_SESSION_DATA',
  SESSION_DATA_READY = 'SESSION_DATA_READY',
  ERROR_LOADING_SESSION_DATA = 'ERROR_LOADING_SESSION_DATA',
  CANCELING_SESSION = 'CANCELING_SESSION',
  SESSION_CANCELATION_ERROR = 'SESSION_CANCELATION_ERROR',
  FINALIZING_SESSION = 'FINALIZING_SESSION',
  SESSION_FINALIZATION_ERROR = 'SESSION_FINALIZATION_ERROR',
}

export interface ConfirmLinkStateBase {
  status: ConfirmLinkStatus;
}

export interface ConfirmLinkStateNone extends ConfirmLinkStateBase {
  status: ConfirmLinkStatus.NONE;
}

export interface ConfirmLinkStateLoadingSession extends ConfirmLinkStateBase {
  status: ConfirmLinkStatus.LOADING_SESSION_DATA;
}

export interface ConfirmLinkStateSessionLoadedBase
  extends ConfirmLinkStateBase {
  status:
    | ConfirmLinkStatus.SESSION_DATA_READY
    | ConfirmLinkStatus.CANCELING_SESSION
    | ConfirmLinkStatus.FINALIZING_SESSION;
  sessionId: string;
  session: LinkingSessionPublicComplete;
  info: InfoResult;
  cancel: () => Promise<void>;
  finalize: () => Promise<void>;
}
export interface ConfirmLinkStateSessionDataReady
  extends ConfirmLinkStateSessionLoadedBase {
  status: ConfirmLinkStatus.SESSION_DATA_READY;
  session: LinkingSessionPublicComplete;
  info: InfoResult;
}

export interface ConfirmLinkStateErrorLoadingSessionData
  extends ConfirmLinkStateBase {
  status: ConfirmLinkStatus.ERROR_LOADING_SESSION_DATA;
  error: CommonError;
}

export interface ConfirmLinkStateCancelingSession
  extends ConfirmLinkStateSessionLoadedBase {
  status: ConfirmLinkStatus.CANCELING_SESSION;
}

export interface ConfirmLinkStateSessionCancelationError
  extends ConfirmLinkStateBase {
  status: ConfirmLinkStatus.SESSION_CANCELATION_ERROR;
  error: {
    // TODO: enhance error; e.g. code
    message: string;
  };
}

export interface ConfirmLinkStateFinalizingSession
  extends ConfirmLinkStateSessionLoadedBase {
  status: ConfirmLinkStatus.FINALIZING_SESSION;
}

export interface ConfirmLinkStateSessionFinalizationErrror
  extends ConfirmLinkStateBase {
  status: ConfirmLinkStatus.SESSION_FINALIZATION_ERROR;
  error: {
    // TODO: enhance error; e.g. code
    message: string;
  };
}

export type ConfirmLinkState =
  | ConfirmLinkStateNone
  | ConfirmLinkStateLoadingSession
  | ConfirmLinkStateSessionDataReady
  | ConfirmLinkStateErrorLoadingSessionData
  | ConfirmLinkStateCancelingSession
  | ConfirmLinkStateSessionCancelationError
  | ConfirmLinkStateFinalizingSession
  | ConfirmLinkStateSessionFinalizationErrror;

export default function ConfirmLinkController() {
  const { sessionId } = useParams() as { sessionId: string };

  // sessionId is always defined, since the route that gets us here always has
  // the session id path param defined (and thus required).

  const [state, setState] = useState<ConfirmLinkState>({
    status: ConfirmLinkStatus.NONE,
  });

  const token = useAppSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const doCancelSession = useCallback(async () => {
    if (state.status !== ConfirmLinkStatus.SESSION_DATA_READY) {
      return;
    }

    setState({
      ...state,
      status: ConfirmLinkStatus.CANCELING_SESSION,
    });

    const orcidLinkService = new ORCIDLinkAPI({
      url: ORCIDLINK_SERVICE_API_ENDPOINT,
      timeout: API_CALL_TIMEOUT,
      token,
    });
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await orcidLinkService.deleteLinkingSession({ session_id: sessionId! });
      navigate('/orcidlink');
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : 'Unknown error';
      setState({
        status: ConfirmLinkStatus.SESSION_CANCELATION_ERROR,
        error: {
          message,
        },
      });
    }
  }, [setState, state, token, navigate, sessionId]);

  const doFinishSession = useCallback(async () => {
    if (state.status !== ConfirmLinkStatus.SESSION_DATA_READY) {
      return;
    }

    setState({
      ...state,
      status: ConfirmLinkStatus.FINALIZING_SESSION,
    });

    const orcidLinkService = new ORCIDLinkAPI({
      url: ORCIDLINK_SERVICE_API_ENDPOINT,
      timeout: API_CALL_TIMEOUT,
      token,
    });
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await orcidLinkService.finishLinkingSession({ session_id: sessionId! });
      toast(
        <Alert severity="success">
          Your KBase ORCID Link has been created!
        </Alert>,
        {
          duration: 5000,
        }
      );
      navigate('/orcidlink', { replace: true });
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : 'Unknown error';
      setState({
        status: ConfirmLinkStatus.SESSION_FINALIZATION_ERROR,
        error: {
          message,
        },
      });
    }
  }, [setState, state, token, navigate, sessionId]);

  const mountedRef = useRef<boolean>(false);

  useEffect(() => {
    if (mountedRef.current) {
      return;
    }
    mountedRef.current = true;

    async function initialize(sessionId: string) {
      try {
        const orcidLinkService = new ORCIDLinkAPI({
          url: ORCIDLINK_SERVICE_API_ENDPOINT,
          timeout: API_CALL_TIMEOUT,
          token,
        });

        const [info, session] = await Promise.all([
          orcidLinkService.info(),
          orcidLinkService.getLinkingSession({ session_id: sessionId }),
        ]);

        if (session.expires_at <= Date.now()) {
          setState({
            status: ConfirmLinkStatus.ERROR_LOADING_SESSION_DATA,
            error: makeCommonError({
              message: 'Linking Session Expired',
              details: 'A linking session expires after 10 minutes',
              solutions: [
                {
                  description:
                    'You should restart the linking process if you still want to create a KBase ORCID Link',
                  link: {
                    label: 'ORCIDLink Home Page',
                    url: '/orcidlink',
                  },
                },
              ],
            }),
          });
          return;
        }

        setState({
          status: ConfirmLinkStatus.SESSION_DATA_READY,
          sessionId,
          info,
          session,
          cancel: doCancelSession,
          finalize: doFinishSession,
        });
      } catch (ex) {
        if (ex instanceof JSONRPC20Exception) {
          const error = ((): CommonError => {
            switch (ex.error.code) {
              case 1020:
                return makeCommonError({
                  title: `Not Found (${ex.error.code})`,
                  message: `The session id "${sessionId}" does not exist`,
                  details:
                    'You may have refreshed this page after successfully creating your link',
                  solutions: [
                    {
                      description: 'Return to the ORCID Link home page',
                      link: {
                        label: 'Home',
                        url: '/orcidlink',
                      },
                    },
                  ],
                });
              default:
                return makeCommonError({
                  title: 'Error',
                  message: `orcidlink service error "${ex.error.code}"`,
                  details: ex.error.message,
                });
            }
          })();
          setState({
            status: ConfirmLinkStatus.ERROR_LOADING_SESSION_DATA,
            error,
          });
        } else if (ex instanceof Error) {
          setState({
            status: ConfirmLinkStatus.ERROR_LOADING_SESSION_DATA,
            error: makeCommonError({
              message: ex.message,
            }),
          });
        } else {
          setState({
            status: ConfirmLinkStatus.ERROR_LOADING_SESSION_DATA,
            error: makeCommonError({
              message: 'Unknown error',
            }),
          });
        }
      }
    }
    initialize(sessionId);
  }, [
    mountedRef,
    sessionId,
    token,
    state,
    navigate,
    setState,
    doFinishSession,
    doCancelSession,
  ]);

  switch (state.status) {
    case ConfirmLinkStatus.NONE:
    case ConfirmLinkStatus.LOADING_SESSION_DATA:
      return (
        <Box sx={{ m: 2 }}>
          <Loading title="Loading">Loading Linking Session...</Loading>
        </Box>
      );
    case ConfirmLinkStatus.SESSION_DATA_READY: {
      const { sessionId, session, info } = state;
      return (
        <ConfirmLink
          sessionId={sessionId}
          session={session}
          info={info}
          doCancelSession={doCancelSession}
          canceling={false}
          doFinishSession={doFinishSession}
          finishing={false}
        />
      );
    }
    case ConfirmLinkStatus.ERROR_LOADING_SESSION_DATA:
      return <ErrorMessage error={state.error} />;
    case ConfirmLinkStatus.CANCELING_SESSION: {
      const { sessionId, session, info } = state;
      return (
        <ConfirmLink
          sessionId={sessionId}
          session={session}
          info={info}
          doCancelSession={doCancelSession}
          canceling={true}
          doFinishSession={doFinishSession}
          finishing={false}
        />
      );
    }
    case ConfirmLinkStatus.SESSION_CANCELATION_ERROR:
      return <ErrorMessage error={state.error} />;
    case ConfirmLinkStatus.FINALIZING_SESSION: {
      const { sessionId, session, info } = state;
      return (
        <ConfirmLink
          sessionId={sessionId}
          session={session}
          info={info}
          doCancelSession={doCancelSession}
          canceling={false}
          doFinishSession={doFinishSession}
          finishing={true}
        />
      );
    }
    case ConfirmLinkStatus.SESSION_FINALIZATION_ERROR:
      return <ErrorMessage error={state.error} />;
  }
}
