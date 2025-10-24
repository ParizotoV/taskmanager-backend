import { AuthService } from "@/application/auth/service/auth.service";
import { SignUpDto } from "@/interfaces/http/api/v1/controllers/auth/dtos/sign-up.dto";
import { SignInDto } from "@/interfaces/http/api/v1/controllers/auth/dtos/sign-in.dto";
import RequestResponseDocumentation from "@/shared/decorators/request-responses.decorator";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RequestResponseDocumentation({
    success: {
      status: 201,
      description: 'Usuário cadastrado com sucesso',
    },
    summary: 'Cadastrar novo usuário'
  })
  @Post('signup')
  async signUp(@Body() body: SignUpDto) {
    return await this.authService.signUp(body);
  }

  @RequestResponseDocumentation({
    success: {
      status: 200,
      description: 'Login realizado com sucesso',
    },
    summary: 'Realizar login'
  })
  @Post('signin')
  async signIn(@Body() body: SignInDto) {
    return await this.authService.signIn(body);
  }
}
