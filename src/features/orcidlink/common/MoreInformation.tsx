import { List, ListItem, ListItemText } from '@mui/material';

/**
 * Implements a list of information resources about ORCID and KBase ORCID linking,
 * each with a link and short description.
 */
export default function MoreInformation() {
  return (
    <List sx={{ pt: 0 }}>
      <ListItem sx={{ pt: 0 }}>
        <ListItemText
          primary={
            <a href="https://docs.kbase.us" target="_blank" rel="noreferrer">
              About KBase ORCID® Links
            </a>
          }
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary={
            <a
              href="https://info.orcid.org/what-is-orcid/"
              target="_blank"
              rel="noreferrer"
            >
              <span className="fa fa-external-link" /> About ORCID®
            </a>
          }
        />
      </ListItem>
    </List>
  );
}
