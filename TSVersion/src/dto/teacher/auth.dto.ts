export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: {
    countryCode: string;
    number: string;
  };
}
