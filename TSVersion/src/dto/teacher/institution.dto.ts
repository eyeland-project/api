export interface InstitutionDetailDto {
  id: number;
  name: string;
  nit: string;
  address: string;
  city: string;
  country: string;
  phone: {
    countryCode: string;
    number: string;
  };
  email: string;
  websiteUrl: string | null;
}
