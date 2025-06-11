 export interface JwtPayload {
  id: string;
  email: string;
  name: string;
}

export interface AirlineJwtPayload {
  id: string;
  admin_name: string;
  admin_email: string;
  role: string;
  airline: {
    id: string;
    airline_name: string;
    alias: string;
    country: string;
  };
}