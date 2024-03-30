/* eslint-disable linebreak-style *//* eslint-disable prettier/prettier */
import { BackgroundImageDTO } from './background-images';

export const defaultStyles: {
  selectedBackgroundImage: BackgroundImageDTO;
  primaryButtonBackgroundColor: string;
  primaryButtonTextColor: string;
} = {
  selectedBackgroundImage: {
    name: '#f9f1f1',
    label: '',
    shadow: '#000000',
    type: 'color',
  }, // backgroundImages[0],
  primaryButtonBackgroundColor: '#778899', // '#6200EE',
  primaryButtonTextColor: '#FFFFFF',
};
