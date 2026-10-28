// Public photo sources (Unsplash CDN for dogs, randomuser.me for portraits).
// Every <SmartImage> has a branded fallback in case a URL fails to load.

export const unsplash = (id, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
export const portrait = (gender, n) => `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;

export const DOG_PHOTOS = {
  golden: '1552053831-71594a27632d',
  goldenPark: '1494947665470-20322015e3a8', // walker with several dogs on leash
  labrador: '1561037404-61cd46aa615b',
  pug: '1517849845537-4d257902454a',
  twoDogs: '1548199973-03cce0bbc87b',
  smallWhite: '1583511655857-d19b40a7a54e',
  corgi: '1587300003388-59208cc962cb',
  husky: '1543466835-00a7907e9de1',
  shepherd: '1558788353-f76d92427f16',
  beagle: '1505628346881-b72b27e84530',
  frenchie: '1518717758536-85ae29035b6d',
  puppy: '1507146426996-ef05306b995a',
  terrier: '1534361960057-19889db9621e',
  mixed: '1530281700549-e82e7bf110d6',
  dalmatian: '1537151608828-ea2b11777ee8',
  poodle: '1588943211346-0908a1fb0b01',
  border: '1477884213360-7e9d7dcc1e48',
  park: '1544568100-847a948585b9',
  leash: '1596492784531-6e6eb5ea9993',
  walk: '1529429617124-95b109e86bb8',
  walkPair: '1601758124510-52d02ddb7cbd',
  boxer: '1576201836106-db1758fd1c97',
  street: '1494947665470-20322015e3a8',
  lying: '1560807707-8cc77767d783',
  doberman: '1591160690555-5debfba289f0',
  shihtzu: '1583337130417-3346a1be7dee',
  happy: '1611003228941-98852ba62227',
  grass: '1589941013453-ec89f33b5e95',
  rottweiler: '1600804340584-c7db2eacf0bf',
  senior: '1592754862816-1a21a4ea2281',
  bulldog: '1546527868-ccb7ee7dfa6a',
  cocker: '1525253086316-d0c936c814f8',
  running: '1504595403659-9088ce801e29',
  spaniel: '1541364983171-a8ba01e95cfc',
  sunset: '1527526029430-319f10814151',
  pitbull: '1598133894008-61f7fdb8cc3a',
};

export const dogPhoto = (key, w) => unsplash(DOG_PHOTOS[key] || DOG_PHOTOS.mixed, w);
