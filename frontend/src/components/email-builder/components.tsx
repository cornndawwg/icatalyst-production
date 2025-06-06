import { Box, IconButton } from '@mui/material';
import { EmailComponent, TextComponentProps, ImageComponentProps, ButtonComponentProps, DividerComponentProps, SocialComponentProps } from './types';

// Type guards
const isTextComponent = (component: EmailComponent): component is EmailComponent & { props: TextComponentProps } => 
  component.type === 'text';

const isImageComponent = (component: EmailComponent): component is EmailComponent & { props: ImageComponentProps } => 
  component.type === 'image';

const isButtonComponent = (component: EmailComponent): component is EmailComponent & { props: ButtonComponentProps } => 
  component.type === 'button';

const isDividerComponent = (component: EmailComponent): component is EmailComponent & { props: DividerComponentProps } => 
  component.type === 'divider';

const isSocialComponent = (component: EmailComponent): component is EmailComponent & { props: SocialComponentProps } => 
  component.type === 'social';

export const renderEmailComponent = (component: EmailComponent): JSX.Element => {
  switch (component.type) {
    case 'text':
      if (isTextComponent(component)) {
        return (
          <Box
            sx={{
              fontSize: component.props.fontSize,
              color: component.props.color,
              textAlign: component.props.align,
              fontFamily: component.props.fontFamily || 'Arial',
              fontWeight: component.props.bold ? 'bold' : 'normal',
            }}
          >
            {component.props.content}
          </Box>
        );
      }
      break;

    case 'image':
      if (isImageComponent(component)) {
        return (
          <Box
            sx={{
              textAlign: component.props.align,
            }}
          >
            <img
              src={component.props.src || 'https://via.placeholder.com/400x200'}
              alt={component.props.alt}
              style={{
                maxWidth: component.props.width,
                height: 'auto',
              }}
            />
          </Box>
        );
      }
      break;

    case 'button':
      if (isButtonComponent(component)) {
        return (
          <Box
            sx={{
              textAlign: component.props.align,
            }}
          >
            <a
              href={component.props.url}
              style={{
                backgroundColor: component.props.backgroundColor,
                color: component.props.textColor,
                padding: '12px 24px',
                textDecoration: 'none',
                borderRadius: component.props.borderRadius || 4,
                display: 'inline-block',
              }}
            >
              {component.props.text}
            </a>
          </Box>
        );
      }
      break;

    case 'divider':
      if (isDividerComponent(component)) {
        return (
          <Box
            sx={{
              my: component.props.spacing / 8,
              borderBottom: `1px ${component.props.style} ${component.props.color}`,
            }}
          />
        );
      }
      break;

    case 'social':
      if (isSocialComponent(component)) {
        return (
          <Box sx={{ textAlign: component.props.align }}>
            {component.props.networks.map((network: string) => (
              <IconButton
                key={network}
                size="small"
                sx={{
                  mx: 0.5,
                  fontSize: component.props.size,
                }}
              >
                📱
              </IconButton>
            ))}
          </Box>
        );
      }
      break;
  }

  return <Box>Invalid component</Box>;
}; 
