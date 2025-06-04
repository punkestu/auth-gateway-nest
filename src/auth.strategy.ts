import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Reads from Authorization: Bearer ...
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret', // Replace with env var in real app
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, username: payload.username, type: payload.type };
  }
}
