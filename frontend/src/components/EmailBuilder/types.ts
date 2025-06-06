export type ComponentType = 'text' | 'image' | 'button' | 'divider' | 'social';

export type SocialNetwork = 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'youtube';

export interface FooterSettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  socialLinks: {
    network: SocialNetwork;
    url: string;
  }[];
  unsubscribeText: string;
  legalText: string;
  logo?: {
    src: string;
    alt: string;
    width: number;
  };
}

export interface TextComponentProps {
  content: string;
  fontSize: number;
  color: string;
  align: 'left' | 'center' | 'right';
  fontFamily: string;
  bold?: boolean;
  italic?: boolean;
}

export interface ImageComponentProps {
  src: string;
  alt: string;
  width: string;
  align: 'left' | 'center' | 'right';
}

export interface ButtonComponentProps {
  text: string;
  backgroundColor: string;
  textColor: string;
  url: string;
  borderRadius: number;
  align: 'left' | 'center' | 'right';
}

export interface DividerComponentProps {
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  spacing: number;
}

export interface SocialComponentProps {
  networks: SocialNetwork[];
  size: number;
  align: 'left' | 'center' | 'right';
}

export type ComponentProps =
  | TextComponentProps
  | ImageComponentProps
  | ButtonComponentProps
  | DividerComponentProps
  | SocialComponentProps;

export interface EmailComponent {
  id: string;
  type: ComponentType;
  props: ComponentProps;
}

export interface EmailBuilderProps {
  value: EmailComponent[];
  onChange: (components: EmailComponent[]) => void;
  onSendTest?: () => void;
  footerSettings?: FooterSettings;
} 