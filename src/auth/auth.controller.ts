import { Controller, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto, RegisterSubscriptionDto, LoginAirlineDto } from './dto';


@Controller()
export class AuthController {
  private readonly logger = new Logger('AuthController');
  
  constructor(private readonly authService: AuthService) {}
  /*
    foo.* matches foo.bar, foo.baz, and so on, but not foo.bar.baz
    foo.*.bar matches foo.baz.bar, foo.qux.bar, and so on, but not foo.bar or foo.bar.baz
    foo.> matches foo.bar, foo.bar.baz, and so on
  */  @MessagePattern('auth.register.user')
  registerUser(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }
  @MessagePattern('auth.register.subscription')
  registerSubscription(@Payload() registerSubscriptionDto: RegisterSubscriptionDto) {
    this.logger.log('🎯 Received subscription registration request');
    this.logger.debug('📋 Subscription data received:', JSON.stringify(registerSubscriptionDto, null, 2));
    
    try {
      const result = this.authService.registerSubscription(registerSubscriptionDto);
      this.logger.log('✅ Subscription registration successful');
      return result;
    } catch (error) {
      this.logger.error('❌ Error in subscription registration:', error);
      this.logger.error('📄 Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }
  @MessagePattern('auth.login.user')
  loginUser(@Payload() loginUserDto: LoginUserDto) {
    return this.authService.loginUser( loginUserDto );
  }

  @MessagePattern('auth.login.airline')
  loginAirline(@Payload() loginAirlineDto: LoginAirlineDto) {
    return this.authService.loginAirline( loginAirlineDto );
  }

  @MessagePattern('auth.verify.user')
  verifyToken( @Payload() token: string ) {
    return this.authService.verifyToken(token)
  }
}