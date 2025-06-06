import {
  Box,
  Typography,
  Link,
  Stack,
  IconButton,
  Divider,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { FooterSettings, SocialNetwork } from './types';

const SOCIAL_ICONS: Record<SocialNetwork, typeof FacebookIcon> = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
};

interface EmailFooterProps {
  settings: FooterSettings;
}

export default function EmailFooter({ settings }: EmailFooterProps) {
  return (
    <Box
      sx={{
        bgcolor: 'grey.100',
        borderTop: 1,
        borderColor: 'divider',
        mt: 4,
        pt: 4,
        pb: 2,
      }}
    >
      <Stack spacing={3} alignItems="center">
        {/* Company Logo */}
        {settings.logo && (
          <Box
            component="img"
            src={settings.logo.src}
            alt={settings.logo.alt}
            sx={{
              width: settings.logo.width,
              maxWidth: '200px',
              height: 'auto',
            }}
          />
        )}

        {/* Company Info */}
        <Stack spacing={1} alignItems="center">
          <Typography variant="subtitle1" fontWeight="medium">
            {settings.companyName}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {settings.address}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            divider={<Typography color="text.disabled">|</Typography>}
          >
            <Link href={`tel:${settings.phone}`} color="inherit" underline="hover">
              {settings.phone}
            </Link>
            <Link href={`mailto:${settings.email}`} color="inherit" underline="hover">
              {settings.email}
            </Link>
            <Link href={settings.website} color="inherit" underline="hover" target="_blank">
              {settings.website.replace(/^https?:\/\//, '')}
            </Link>
          </Stack>
        </Stack>

        {/* Social Links */}
        {settings.socialLinks.length > 0 && (
          <Stack direction="row" spacing={1}>
            {settings.socialLinks.map(({ network, url }) => {
              const Icon = SOCIAL_ICONS[network];
              return (
                <IconButton
                  key={network}
                  href={url}
                  target="_blank"
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              );
            })}
          </Stack>
        )}

        <Divider sx={{ width: '100%' }} />

        {/* Legal Text & Unsubscribe */}
        <Stack spacing={1} sx={{ width: '100%' }}>
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            sx={{ px: 2 }}
          >
            {settings.legalText}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            sx={{
              '& a': {
                color: 'inherit',
                textDecoration: 'underline',
                '&:hover': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: settings.unsubscribeText }} />
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
} 
