import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';


import * as bcrypt from 'bcrypt';

import { LoginUserDto, RegisterUserDto, RegisterSubscriptionDto, LoginAirlineDto } from './dto';
import { JwtService } from '@nestjs/jwt';

import { envs } from 'src/config';
import { JwtPayload, AirlineJwtPayload } from './interfaces/jwt-payload.interface';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('MongoDB connected');
  }
  async signJWT(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async signAirlineJWT(payload: AirlineJwtPayload) {
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string) {
    try {
      
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });

      return {
        user: user,
        token: await this.signJWT(user),
      }

    } catch (error) {
      console.log(error);
      throw new RpcException({
        status: 401,
        message: 'Invalid token'
      })
    }

  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password } = registerUserDto;

    try {
      const user = await this.user.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      const newUser = await this.user.create({
        data: {
          email: email,
          password: bcrypt.hashSync(password, 10),
          name: name,
        },
      });

      const { password: __, ...rest } = newUser;

      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      const user = await this.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid',
        });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid',
        });
      }

      const { password: __, ...rest } = user;

      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async registerSubscription(registerSubscriptionDto: RegisterSubscriptionDto) {
    const { airline, admin, payment } = registerSubscriptionDto;

    try {
      // Verificar si ya existe una aerolínea con ese alias
      const existingAirlineByAlias = await this.airline.findUnique({
        where: { alias: airline.alias },
      });

      if (existingAirlineByAlias) {
        throw new RpcException({
          status: 400,
          message: `Ya existe una aerolínea con el alias: ${airline.alias}`,
        });
      }

      // Verificar si ya existe una aerolínea con ese email
      const existingAirlineByEmail = await this.airline.findUnique({
        where: { contact_email: airline.contact_email },
      });

      if (existingAirlineByEmail) {
        throw new RpcException({
          status: 400,
          message: `Ya existe una aerolínea registrada con el email: ${airline.contact_email}`,
        });
      }      // Verificar si ya existe un admin con ese email
      const existingAdmin = await this.adminUser.findUnique({
        where: { admin_email: admin.admin_email },
      });

      if (existingAdmin) {
        throw new RpcException({
          status: 400,
          message: `Ya existe un administrador con el email: ${admin.admin_email}`,
        });
      }

      // Crear la aerolínea
      const newAirline = await this.airline.create({
        data: {
          airline_name: airline.airline_name,
          alias: airline.alias,
          country: airline.country,
          contact_email: airline.contact_email,
          phone_number: airline.phone_number,
        },
      });

      // Crear el administrador
      const newAdmin = await this.adminUser.create({
        data: {
          admin_name: admin.admin_name,
          admin_email: admin.admin_email,
          admin_password: bcrypt.hashSync(admin.admin_password, 10),
          admin_phone: admin.admin_phone || null,
          airline_id: newAirline.id,
        },
      });

      // Crear la suscripción
      const newSubscription = await this.subscription.create({
        data: {
          plan: payment.plan,
          card_number: payment.card_number,
          cardholder_name: payment.cardholder_name,
          expiry_date: payment.expiry_date,
          cvv: payment.cvv,
          airline_id: newAirline.id,
        },
      });

      // Preparar datos para el JWT (sin información sensible)
      const jwtPayload = {
        id: newAdmin.id,
        admin_name: newAdmin.admin_name,
        admin_email: newAdmin.admin_email,
        role: newAdmin.role,
        airline: {
          id: newAirline.id,
          airline_name: newAirline.airline_name,
          alias: newAirline.alias,
          country: newAirline.country,
        },
      };

      return {
        user: jwtPayload,
        airline: {
          id: newAirline.id,
          airline_name: newAirline.airline_name,
          alias: newAirline.alias,
          country: newAirline.country,
          contact_email: newAirline.contact_email,
        },
        subscription: {
          id: newSubscription.id,
          plan: newSubscription.plan,
          status: newSubscription.status,
        },
        token: await this.signAirlineJWT(jwtPayload),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async loginAirline(loginAirlineDto: LoginAirlineDto) {
    const { admin_email, admin_password } = loginAirlineDto;

    try {
      const adminUser = await this.adminUser.findUnique({
        where: { admin_email },
        include: {
          airline: true,
        },
      });

      if (!adminUser) {
        throw new RpcException({
          status: 400,
          message: 'Email/Contraseña no válidos',
        });
      }

      const isPasswordValid = bcrypt.compareSync(admin_password, adminUser.admin_password);

      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'Email/Contraseña no válidos',
        });
      }

      // Preparar datos para el JWT
      const jwtPayload: AirlineJwtPayload = {
        id: adminUser.id,
        admin_name: adminUser.admin_name,
        admin_email: adminUser.admin_email,
        role: adminUser.role,
        airline: {
          id: adminUser.airline.id,
          airline_name: adminUser.airline.airline_name,
          alias: adminUser.airline.alias,
          country: adminUser.airline.country,
        },
      };

      return {
        user: jwtPayload,
        airline: {
          id: adminUser.airline.id,
          airline_name: adminUser.airline.airline_name,
          alias: adminUser.airline.alias,
          country: adminUser.airline.country,
          contact_email: adminUser.airline.contact_email,
        },
        token: await this.signAirlineJWT(jwtPayload),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
}