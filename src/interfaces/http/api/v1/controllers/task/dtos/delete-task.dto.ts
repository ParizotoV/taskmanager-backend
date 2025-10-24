import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class DeleteTaskDto {
  @ApiProperty({
    description: 'ID da tarefa a ser deletada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;
}