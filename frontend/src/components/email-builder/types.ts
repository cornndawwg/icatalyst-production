export type ComponentType = 'text' | 'image' | 'button' | 'divider' | 'social';

export interface TextComponentProps {
  content: string;
  fontSize: number;
  color: string;
  align: 'left' | 'center' | 'right';
  fontFamily?: string;
  bold?: boolean;
}

export interface ImageComponentProps {
  src: string;
  alt: string;
  width: string;
  align: 'left' | 'center' | 'right';
}

export interface ButtonComponentProps {
  text: string;
  url: string;
  backgroundColor: string;
  textColor: string;
  borderRadius?: number;
  align: 'left' | 'center' | 'right';
}

export interface DividerComponentProps {
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  spacing: number;
}

export interface SocialComponentProps {
  networks: string[];
  size: number;
  align: 'left' | 'center' | 'right';
}

export type ComponentProps = TextComponentProps | ImageComponentProps | ButtonComponentProps | DividerComponentProps | SocialComponentProps;

export interface EmailComponent {
  id: string;
  type: ComponentType;
  props: ComponentProps;
}

export interface FooterSettings {
  companyName: string;
  companyAddress: string;
  unsubscribeLink: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
} 