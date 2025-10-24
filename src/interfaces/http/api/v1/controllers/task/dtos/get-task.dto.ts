import { IsNotEmpty, IsString } from "class-validator"

export class GetTaskDto {
  @IsString()
  @IsNotEmpty()
  id: string
}