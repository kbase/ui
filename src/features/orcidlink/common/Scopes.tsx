/**
 * Renders a set of ORCID OAuth Scopes with custom help content, wrapped in an accordion.
 *
 * This form allows users to scan the set of scopes since the accordion is
 * initially closed, showing just the scope titles. The user may insepct a scope
 * by opening the accordion for that item.
 */

import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Typography,
} from '@mui/material';
import { ORCIDScope, ScopeHelp, SCOPE_HELP } from '../constants';
import styles from '../orcidlink.module.scss';

export interface ScopesProps {
  scopes: string;
}

function getScopeHelp(scope: ORCIDScope): ScopeHelp {
  return SCOPE_HELP[scope];
}

function isScope(possibleScope: string): possibleScope is ORCIDScope {
  return ['/read-limited', '/activities/update'].includes(possibleScope);
}

export default function Scopes({ scopes }: ScopesProps) {
  const rows = scopes.split(/\s+/).map((scope: string, index) => {
    if (!isScope(scope)) {
      return (
        <Alert severity="error" title="Not a valid scope" key={scope}>
          Invalid scope: {scope}
        </Alert>
      );
    }
    const { orcid, help, seeAlso } = getScopeHelp(scope);
    return (
      <Accordion key={scope}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>{orcid.label}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className={styles['section-title']}>ORCID® Policy</div>
          <p>{orcid.tooltip}</p>
          <div className={styles['section-title']}>How KBase Uses It</div>
          {help.map((item, index) => {
            return <p key={index}>{item}</p>;
          })}
          <div className={styles['section-title']}>See Also</div>
          <ul>
            {seeAlso.map(({ url, label }, index) => {
              return (
                <li key={index}>
                  <a href={url} target="_blank" rel="noreferrer">
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </AccordionDetails>
      </Accordion>
    );
  });
  return <div>{rows}</div>;
}
