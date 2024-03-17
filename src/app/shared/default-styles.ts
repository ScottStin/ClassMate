/* eslint-disable linebreak-style *//* eslint-disable prettier/prettier */
import { BackgroundImageDTO, backgroundImages } from './background-images';

export const defaultStyles: {
  selectedBackgroundImage: BackgroundImageDTO;
  primaryButtonBackgroundColor: string;
  primaryButtonTextColor: string;
} = {
  selectedBackgroundImage: backgroundImages[0],
  primaryButtonBackgroundColor: '#6200EE',
  primaryButtonTextColor: '#FFFFFF',
};
