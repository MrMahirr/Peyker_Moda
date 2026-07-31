export enum SocialPlatform {
  INSTAGRAM = 'Instagram',
  PINTEREST = 'Pinterest',
  TWITTER = 'Twitter',
  FACEBOOK = 'Facebook'
}

export const SOCIAL_LINKS = [
  {
    platform: SocialPlatform.INSTAGRAM,
    url: 'https://instagram.com/peykermoda',
    label: 'Instagram'
  },
  {
    platform: SocialPlatform.PINTEREST,
    url: 'https://pinterest.com/peykermoda',
    label: 'Pinterest'
  }
];

export const LEGAL_LINKS = {
  KVKK: '/yasal/kvkk',
  KULLANIM_KOSULLARI: '/yasal/kullanim-kosullari'
};
