import { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useRouter } from 'next/router';

interface CampaignDetailProps {}

export default function CampaignDetail(props: CampaignDetailProps) {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      // Load campaign details
    }
  }, [id]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            href="/campaigns"
            color="inherit"
            underline="hover"
          >
            Campaigns
          </Link>
          <Typography color="text.primary">Campaign Details</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Campaign Overview</Typography>
          <Typography>Campaign details will be displayed here.</Typography>
        </Paper>
      </Box>
    </Container>
  );
}