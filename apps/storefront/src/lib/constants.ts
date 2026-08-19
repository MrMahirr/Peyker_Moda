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
    platform: 'Location',
    url: 'https://maps.google.com/?q=Peyker+Moda',
    label: 'Konum'
  },
  {
    platform: 'Contact',
    url: 'mailto:iletisim@peykermoda.com',
    label: 'İletişim'
  }
];

export const LEGAL_LINKS = {
  KVKK: '/yasal/kvkk',
  KULLANIM_KOSULLARI: '/yasal/kullanim-kosullari'
};
