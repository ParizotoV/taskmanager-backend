import { AuthService } from '@/application/auth/service/auth.service';
import { SignUpUseCase } from '@/application/auth/usecases/sign-up.usecase';
import { SignInUseCase } from '@/application/auth/usecases/sign-in.usecase';
import { UserDaoModule } from '@/infrastructure/database/daos/user.dao.module';
import { SecurityModule } from '@/infrastructure/security/security.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [UserDaoModule, SecurityModule],
  providers: [
    AuthService,
    SignUpUseCase,
    SignInUseCase,
  ],
  exports: [AuthService],
})
export class AuthModule { }
