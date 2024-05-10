/**
 * The TabPanel component wraps up the functionality for MUI tab panels.
 *
 * MUI does not have a general-purpose component for a tab's content. This
 * component uses the example given in the MUI docs and generalizes it for
 * usage, at least in the orcidlink feature.
 */
import { Box } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export default function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}
