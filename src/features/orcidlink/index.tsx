import { Box } from '@mui/material';
import Home from './Home';
import styles from './orcidlink.module.scss';

const ORCIDLinkFeature = () => {
  return (
    <Box className={styles.paper} sx={{ p: 4 }}>
      <Home />
    </Box>
  );
};

export default ORCIDLinkFeature;
