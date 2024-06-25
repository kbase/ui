/**
 * A direct (not RTK) client for the orcidlink service.
 *
 * Using the JSON-RPC 2.0 and service client implementations in this same
 * directory, implements enough of the orcidlink api to allow for functionality
 * currently implemented in the ui.
 *
 * This separate client exists because it is only used for the ephemeral states
 * for creating and perhaps removing an orcidlink.
 *
 * Future developers may move this into the RTK orcidlink client, but given the
 * short amount of time to port this, I didn't want to go down that rabbit hole.
 *
 * This code was ported from kbase-ui and modified to fit.
 */

import { JSONRPC20ObjectParams } from './JSONRPC20';
import {
  LinkRecordPublic,
  LinkRecordPublicNonOwner,
  ORCIDAuthPublic,
  ORCIDProfile,
} from './orcidlinkAPICommon';
import { ServiceClient } from './ServiceClient';

export interface StatusResult {
  status: 'ok';
  current_time: number;
  start_time: number;
}

export interface ServiceDescription {
  name: string;
  title: string;
  version: string;
  language: string;
  description: string;
  repoURL: string;
}

export interface ServiceConfig {
  url: string;
}

export interface Auth2Config extends ServiceConfig {
  tokenCacheLifetime: number;
  tokenCacheMaxSize: number;
}

export interface GitInfo {
  commit_hash: string;
  commit_hash_abbreviated: string;
  author_name: string;
  committer_name: string;
  committer_date: number;
  url: string;
  branch: string;
  tag: string | null;
}

export interface RuntimeInfo {
  current_time: number;
  orcid_api_url: string;
  orcid_oauth_url: string;
  orcid_site_url: string;
}

export interface InfoResult {
  'service-description': ServiceDescription;
  'git-info': GitInfo;
  runtime_info: RuntimeInfo;
}

export interface ErrorInfo {
  code: number;
  title: string;
  description: string;
  status_code: number;
}

export interface ErrorInfoResult {
  error_info: ErrorInfo;
}

export interface LinkingSessionPublicComplete {
  session_id: string;
  username: string;
  created_at: number;
  expires_at: number;
  orcid_auth: ORCIDAuthPublic;
  return_link: string | null;
  skip_prompt: boolean;
  ui_options: string;
}

export interface LinkParams extends JSONRPC20ObjectParams {
  username: string;
}

export interface LinkForOtherParams extends JSONRPC20ObjectParams {
  username: string;
}

export interface DeleteLinkParams extends JSONRPC20ObjectParams {
  username: string;
}

export interface CreateLinkingSessionParams extends JSONRPC20ObjectParams {
  username: string;
}

export interface CreateLinkingSessionResult {
  session_id: string;
}

export interface DeleteLinkingSessionParams extends JSONRPC20ObjectParams {
  session_id: string;
}

export interface FinishLinkingSessionParams extends JSONRPC20ObjectParams {
  session_id: string;
}

export interface GetLinkingSessionParams extends JSONRPC20ObjectParams {
  session_id: string;
}

export interface IsLinkedParams extends JSONRPC20ObjectParams {
  username: string;
}

export interface GetProfileParams extends JSONRPC20ObjectParams {
  username: string;
}

// Works

export interface ExternalId {
  type: string;
  value: string;
  url: string;
  relationship: string;
}

export interface Citation {
  type: string;
  value: string;
}

export interface ContributorORCIDInfo {
  uri: string;
  path: string;
}

export interface ContributorRole {
  role: string;
}

export interface Contributor {
  orcidId: string | null;
  name: string;
  roles: Array<ContributorRole>;
}

export interface SelfContributor {
  orcidId: string;
  name: string;
  roles: Array<ContributorRole>;
}
export interface WorkBase {
  title: string;
  journal: string;
  date: string;
  workType: string;
  url: string;
  doi: string;
  externalIds: Array<ExternalId>;
  citation: Citation | null;
  shortDescription: string;
  selfContributor: SelfContributor;
  otherContributors: Array<Contributor> | null;
}

export type NewWork = WorkBase;

export interface PersistedWork extends WorkBase {
  putCode: string;
}

export type WorkUpdate = PersistedWork;

export interface Work extends PersistedWork {
  createdAt: number;
  updatedAt: number;
  source: string;
}

export type GetWorksResult = Array<{
  externalIds: Array<ExternalId>;
  updatedAt: number;
  works: Array<Work>;
}>;

export interface GetWorksParams extends JSONRPC20ObjectParams {
  username: string;
}

export interface GetWorkParams extends JSONRPC20ObjectParams {
  username: string;
  put_code: string;
}

export interface GetWorkResult extends JSONRPC20ObjectParams {
  work: Work;
}

export interface SaveWorkParams extends JSONRPC20ObjectParams {
  username: string;
  work_update: WorkUpdate;
}

export interface SaveWorkResult {
  work: Work;
}

export interface DeleteWorkParams extends JSONRPC20ObjectParams {
  username: string;
  put_code: string;
}

export default class ORCIDLinkAPI extends ServiceClient {
  module = 'ORCIDLink';
  prefix = false;

  async status(): Promise<StatusResult> {
    const result = await this.callFunc('status');
    return result as unknown as StatusResult;
  }

  async info(): Promise<InfoResult> {
    const result = await this.callFunc('info');
    return result as unknown as InfoResult;
  }

  async errorInfo(errorCode: number): Promise<ErrorInfoResult> {
    const result = await this.callFunc('error-info', {
      error_code: errorCode,
    });
    return result as unknown as ErrorInfoResult;
  }

  async isLinked(params: IsLinkedParams): Promise<boolean> {
    const result = await this.callFunc('is-linked', params);
    return result as unknown as boolean;
  }

  async getOwnerLink(params: LinkParams): Promise<LinkRecordPublic> {
    const result = await this.callFunc('owner-link', params);
    return result as unknown as LinkRecordPublic;
  }

  async getOtherLink(
    params: LinkForOtherParams
  ): Promise<LinkRecordPublicNonOwner> {
    const result = await this.callFunc('other-link', params);
    return result as unknown as LinkRecordPublicNonOwner;
  }

  async deleteOwnLink(params: DeleteLinkParams): Promise<void> {
    await this.callFunc('delete-own-link', params);
  }

  async createLinkingSession(
    params: CreateLinkingSessionParams
  ): Promise<CreateLinkingSessionResult> {
    const result = await this.callFunc('create-linking-session', params);
    return result as unknown as CreateLinkingSessionResult;
  }

  async getLinkingSession(
    params: GetLinkingSessionParams
  ): Promise<LinkingSessionPublicComplete> {
    const result = await this.callFunc('get-linking-session', params);
    return result as unknown as LinkingSessionPublicComplete;
  }

  async deleteLinkingSession(
    params: DeleteLinkingSessionParams
  ): Promise<void> {
    await this.callFunc('delete-linking-session', params);
  }

  async finishLinkingSession(
    params: FinishLinkingSessionParams
  ): Promise<void> {
    await this.callFunc('finish-linking-session', params);
  }

  // ORCID profile

  async getProfile(params: GetProfileParams): Promise<ORCIDProfile> {
    const result = await this.callFunc('get-orcid-profile', params);
    return result as unknown as ORCIDProfile;
  }
}
