import { InfoResult, orcidlinkAPI } from '../../../common/api/orcidlinkAPI';
import { useAppSelector } from '../../../common/hooks';
import { authUsername } from '../../auth/authSlice';
import ErrorMessage from '../common/ErrorMessage';
import { renderLoadingOverlay } from '../common/misc';
import HomeLinked from './view';

export interface HomeLinkedControllerProps {
  info: InfoResult;
}

export default function HomeLinkedController({
  info,
}: HomeLinkedControllerProps) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const username = useAppSelector(authUsername)!;

  const { data, error, isError, isFetching, isSuccess } =
    orcidlinkAPI.useOrcidlinkLinkedUserInfoQuery(
      { username },
      { refetchOnMountOrArgChange: true }
    );

  // Renderers
  function renderState() {
    if (isError) {
      return <ErrorMessage error={error} />;
    } else if (isSuccess) {
      const { linkRecord, profile } = data;
      return (
        <HomeLinked info={info} linkRecord={linkRecord} profile={profile} />
      );
    }
  }

  return (
    <>
      {renderLoadingOverlay(isFetching)}
      {renderState()}
    </>
  );
}
