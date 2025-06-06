import {
  Box,
  Typography,
  Button,
  Divider,
  Paper,
  Stack,
  IconButton,
  SvgIcon,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ImageIcon from '@mui/icons-material/Image';
import {
  EmailComponent,
  TextComponentProps,
  ImageComponentProps,
  ButtonComponentProps,
  DividerComponentProps,
  SocialComponentProps,
  SocialNetwork,
} from './types';

const SOCIAL_ICONS: Record<SocialNetwork, typeof SvgIcon> = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
};

export function renderEmailComponent(component: EmailComponent) {
  switch (component.type) {
    case 'text': {
      const props = component.props as TextComponentProps;
      const isEmpty = !props.content || props.content.trim() === '';
      
      return (
        <Box>
          {isEmpty ? (
            <Box
              sx={{
                p: 2,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.default',
                color: 'text.secondary',
                textAlign: props.align,
              }}
            >
              <Typography variant="body2">
                Click to add text...
              </Typography>
            </Box>
          ) : (
            <Typography
              sx={{
                fontFamily: props.fontFamily,
                fontSize: props.fontSize,
                color: props.color,
                textAlign: props.align,
                fontWeight: props.bold ? 'bold' : 'normal',
                fontStyle: props.italic ? 'italic' : 'normal',
              }}
            >
              {props.content}
            </Typography>
          )}
        </Box>
      );
    }

    case 'image': {
      const props = component.props as ImageComponentProps;
      const isEmpty = !props.src || props.src.trim() === '';
      
      return (
        <Box
          sx={{
            textAlign: props.align,
          }}
        >
          {isEmpty ? (
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                bgcolor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
              }}
            >
              <ImageIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Click to add an image
              </Typography>
            </Paper>
          ) : (
            <img
              src={props.src}
              alt={props.alt}
              style={{
                maxWidth: '100%',
                width: props.width,
              }}
            />
          )}
        </Box>
      );
    }

    case 'button': {
      const props = component.props as ButtonComponentProps;
      return (
        <Box
          sx={{
            textAlign: props.align,
          }}
        >
          <Button
            variant="contained"
            href={props.url}
            target="_blank"
            sx={{
              backgroundColor: props.backgroundColor,
              color: props.textColor,
              borderRadius: `${props.borderRadius}px`,
              minWidth: 120,
              '&:hover': {
                backgroundColor: props.backgroundColor,
                opacity: 0.9,
              },
            }}
          >
            {props.text || 'Click Here'}
          </Button>
        </Box>
      );
    }

    case 'divider': {
      const props = component.props as DividerComponentProps;
      return (
        <Stack spacing={1}>
          <Divider
            sx={{
              my: props.spacing / 8,
              borderStyle: props.style,
              borderColor: props.color,
            }}
          />
        </Stack>
      );
    }

    case 'social': {
      const props = component.props as SocialComponentProps;
      return (
        <Box
          sx={{
            textAlign: props.align,
            p: 2,
            bgcolor: props.networks.length === 0 ? 'background.default' : 'transparent',
            border: props.networks.length === 0 ? '1px dashed' : 'none',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          {props.networks.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center">
              Select social networks to display
            </Typography>
          ) : (
            props.networks.map((network) => {
              const Icon = SOCIAL_ICONS[network];
              return (
                <IconButton
                  key={network}
                  sx={{
                    mx: 1,
                    color: '#666666',
                    '&:hover': {
                      color: '#000000',
                    },
                  }}
                >
                  <Icon fontSize="inherit" sx={{ fontSize: props.size }} />
                </IconButton>
              );
            })
          )}
        </Box>
      );
    }

    default:
      return null;
  }
} 
