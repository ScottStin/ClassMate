import { BackgroundImageDTO } from './background-images';

export const defaultStyles: {
  selectedBackgroundImage: BackgroundImageDTO;
  primaryButtonBackgroundColor: string;
  primaryButtonTextColor: string;
  warnColor: string;
  errorColor: string;
} = {
  selectedBackgroundImage: {
    name: '#f9f1f1',
    label: '',
    shadow: '#000000',
    type: 'color',
  },
  primaryButtonBackgroundColor: '#778899',
  primaryButtonTextColor: '#FFFFFF',
  warnColor: '#FF6600',
  errorColor: '#FF0000',
};
