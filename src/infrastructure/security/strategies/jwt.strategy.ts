import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

export interface JwtPayload {
  sub: string // userId
  email: string
  role: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    // Injete aqui o UserPort se quiser validar se o user ainda existe
    // private readonly userPort: UserPort
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    })
  }

  async validate(payload: JwtPayload) {
    // Opcional: Buscar usuário no banco para garantir que ainda existe
    // const user = await this.userPort.findById(payload.sub);
    // if (!user) {
    //   throw new UnauthorizedException('Usuário não encontrado');
    // }

    // Retorna os dados que vão para request.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  }
}
