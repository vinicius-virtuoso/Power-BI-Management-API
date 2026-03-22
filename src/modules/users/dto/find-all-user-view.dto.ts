import { ApiProperty } from '@nestjs/swagger';
import { UserViewDto } from './user-view.dto';

export class FindAllUsersViewDto {
  @ApiProperty({ example: 10, description: 'Total de usuários encontrados' })
  total: number;

  @ApiProperty({
    type: [UserViewDto],
    description: 'Lista de usuários',
  })
  users: UserViewDto[];
}
