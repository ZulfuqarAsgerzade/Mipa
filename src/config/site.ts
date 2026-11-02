// Contact details render only when filled in.
// Source: the Contact page of MIPA's previous site, mipa.az (Oct 2026). Street address and hours live in the i18n footer strings.
export const site = {
  name: "MIPA COMPANY",
  instagram: "https://www.instagram.com/mipacompanyofficial/",
  phones: ["+994 12 459 73 42", "+994 55 922 14 44", "+994 55 824 77 77"],
  email: "info@mipacompany.com",
  map: "https://www.google.com/maps/search/?api=1&query=Qala+k%C3%BC%C3%A7%C9%99si+100%2C+Qala%2C+X%C9%99z%C9%99r%2C+Bak%C4%B1",
};

// Footer social bar, in display order. A network goes live as soon as its URL is filled in;
// until then it shows only in `next dev`, as a dimmed placeholder.
export const socials = {
  facebook: "",
  instagram: site.instagram,
  x: "",
  tiktok: "",
} as const;

export type Social = keyof typeof socials;
