import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GetLoginChoiceResult } from '../../common/api/authService';

// Define a type for the slice state
export interface SignupState {
  loginData?: GetLoginChoiceResult;
  account: {
    display?: string;
    email?: string;
    username?: string;
    policyids: string[];
  };
  profile?: {
    userdata: {
      organization: string;
      department: string;
      avatarOption: 'gravatar';
      gravatarDefault: 'identicon';
    };
    surveydata: {
      referralSources: {
        question: string;
        response: Record<string, string | boolean>;
      };
    };
  };
}

const initialState: SignupState = {
  loginData: undefined,
  account: {
    display: 'someName',
    email: 'someEmail@email.co',
    username: 'someUser',
    policyids: [],
  },
  profile: undefined,
};

export const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    setLoginData: (state, action: PayloadAction<SignupState['loginData']>) => {
      // Set provider creeation data
      state.loginData = action.payload;
      // Set account defaults from provider
      state.account.display = action.payload?.create[0].provfullname;
      state.account.email = action.payload?.create[0].provemail;
      state.account.username = action.payload?.create[0].availablename;
    },
    setAccount: (
      state,
      action: PayloadAction<Partial<SignupState['account']>>
    ) => {
      state.account = { ...state.account, ...action.payload };
    },
    setProfile: (state, action: PayloadAction<SignupState['profile']>) => {
      state.profile = action.payload;
    },
  },
});

export default signupSlice.reducer;
export const { setLoginData, setAccount, setProfile } = signupSlice.actions;
