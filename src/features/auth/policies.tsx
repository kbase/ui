import policyStrings from 'kbase-policies';
import frontmatter from 'front-matter';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Paper,
  Typography,
} from '@mui/material';
import classes from './PolicyViewer.module.scss';
import createDOMPurify from 'dompurify';
import { marked } from 'marked';

export const ENFORCED_POLICIES = ['kbase-user'];

const purify = createDOMPurify(window);

interface PolicyMeta {
  title: string;
  id: string;
  version: string;
  equivalentVersions: string[];
}

export const kbasePolicies = policyStrings.reduce(
  (policies, str) => {
    const parsed = frontmatter(str);
    const attr = parsed.attributes as PolicyMeta;
    const policy = {
      raw: str,
      markdown: parsed.body,
      title: String(attr.title) ?? '',
      id: String(attr.id) ?? '',
      version: String(attr.version) ?? '',
      equivalentVersions: (attr.equivalentVersions ?? []) as string[],
    };
    if (ENFORCED_POLICIES.includes(policy.id)) policies[policy.id] = policy;
    return policies;
  },
  {} as Record<
    string,
    PolicyMeta & {
      raw: string;
      markdown: string;
    }
  >
);

export const PolicyViewer = ({
  policyId,
  setAccept,
  accepted = false,
}: {
  policyId: string;
  setAccept: (accepted: boolean) => void;
  accepted?: boolean;
}) => {
  const policy = kbasePolicies[policyId];
  if (!policy)
    throw new Error(`Required policy "${policyId}" cannot be loaded`);
  return (
    <FormControl>
      <Typography fontWeight="bold">{policy.title}</Typography>
      <Paper className={classes['policy-panel']} elevation={0}>
        <div
          dangerouslySetInnerHTML={{
            __html: purify.sanitize(marked(policy.markdown)),
          }}
        />
      </Paper>
      <div>
        <Box className={classes['agreement-box']}>
          <FormControlLabel
            control={
              <Checkbox
                checked={accepted}
                onChange={(e) => {
                  setAccept(e.currentTarget.checked);
                }}
              />
            }
            label="I have read and agree to this policy"
          />
        </Box>
      </div>
    </FormControl>
  );
};
