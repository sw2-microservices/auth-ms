import { IsEmail, IsString } from 'class-validator';

export class LoginAirlineDto {
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  admin_email: string;

  @IsString()
  admin_password: string;
}
