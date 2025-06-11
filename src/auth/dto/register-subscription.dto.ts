import { IsEmail, IsString, IsStrongPassword, IsOptional, MinLength, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AirlineDataDto {
  @IsString()
  @MinLength(3, { message: 'El nombre de la aerolínea debe tener al menos 3 caracteres' })
  airline_name: string;

  @IsString()
  @MinLength(2, { message: 'El alias debe tener al menos 2 caracteres' })
  alias: string;

  @IsString()
  @MinLength(2, { message: 'El país debe tener al menos 2 caracteres' })
  country: string;

  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  contact_email: string;

  @IsString()
  @MinLength(7, { message: 'El número de teléfono debe tener al menos 7 caracteres' })
  phone_number: string;
}

export class AdminDataDto {
  @IsString()
  @MinLength(2, { message: 'El nombre del administrador debe tener al menos 2 caracteres' })
  admin_name: string;

  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  admin_email: string;

  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  }, { message: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números' })
  admin_password: string;

  @IsOptional()
  @IsString()
  admin_phone?: string;
}

export class PaymentDataDto {
  @IsString()
  @Matches(/^\d{16}$/, { message: 'El número de tarjeta debe tener exactamente 16 dígitos' })
  card_number: string;

  @IsString()
  @MinLength(2, { message: 'El nombre del titular es obligatorio' })
  cardholder_name: string;

  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'La fecha debe tener el formato MM/YY' })
  expiry_date: string;

  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'El CVV debe tener 3 o 4 dígitos' })
  cvv: string;

  @IsString()
  plan: string = 'premium';
}

export class RegisterSubscriptionDto {
  @ValidateNested()
  @Type(() => AirlineDataDto)
  airline: AirlineDataDto;

  @ValidateNested()
  @Type(() => AdminDataDto)
  admin: AdminDataDto;

  @ValidateNested()
  @Type(() => PaymentDataDto)
  payment: PaymentDataDto;
}
