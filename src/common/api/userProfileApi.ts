import { baseApi } from './index';
import { jsonRpcService } from './utils/serviceHelpers';

const userProfile = jsonRpcService({
  url: '/services/user_profile/rpc',
});

interface UserProfileParams {
  status: void;
  get_user_profile: { usernames: string[] };
  set_user_profile: [
    profile: {
      profile: {
        user: { username: string; realname: string };
        profile: unknown;
      };
    },
    optionalToken: string | undefined
  ];
}

interface UserProfileResults {
  status: unknown;
  get_user_profile: [
    [
      {
        user: { username: string; realname: string };
        profile: unknown;
      } | null
    ]
  ];
  set_user_profile: void;
}

export const userProfileApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Profile'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      userProfileStatus: builder.query<
        UserProfileResults['status'],
        UserProfileParams['status']
      >({
        query: () =>
          userProfile({
            method: 'UserProfile.status',
            params: [],
          }),
      }),

      getUserProfile: builder.query<
        UserProfileResults['get_user_profile'],
        UserProfileParams['get_user_profile']
      >({
        query: ({ usernames }) =>
          userProfile({
            method: 'UserProfile.get_user_profile',
            params: [usernames],
          }),
        // Cache profiles for an hour
        keepUnusedDataFor: 3600,
        // Tells rtk-query the cache constraints for this query
        providesTags: (result, error, { usernames }) =>
          usernames.map((username) => ({ type: 'Profile', id: username })),
      }),

      setUserProfile: builder.mutation<
        UserProfileResults['set_user_profile'],
        UserProfileParams['set_user_profile']
      >({
        query: ([profile, optionalToken]) =>
          userProfile({
            fetchArgs: optionalToken
              ? { headers: { Authorization: optionalToken } }
              : {},
            method: 'UserProfile.set_user_profile',
            params: [profile],
          }),
        // Invalidates the cache for any queries with a matching tag
        invalidatesTags: (result, error, [{ profile }]) => [
          { type: 'Profile', id: profile.user.username },
        ],
      }),
    }),
  });

export const { getUserProfile, setUserProfile, userProfileStatus } =
  userProfileApi.endpoints;
