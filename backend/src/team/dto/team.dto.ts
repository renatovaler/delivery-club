import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ContactDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  whatsapp_numbers: string[];

  @ApiProperty()
  @IsString()
  email: string;
}

export class AddressDto {
  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty()
  @IsString()
  number: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty()
  @IsString()
  neighborhood: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  zip_code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;
}

export class CreateTeamDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['products', 'services', 'both'], default: 'products' })
  @IsEnum(['products', 'services', 'both'])
  offering_type: string;

  @ApiProperty()
  @IsString()
  cnpj_cpf: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ enum: ['padaria', 'restaurante', 'mercado', 'farmacia', 'outros'], default: 'outros' })
  @IsEnum(['padaria', 'restaurante', 'mercado', 'farmacia', 'outros'])
  category: string;

  @ApiProperty()
  @IsString()
  owner_id: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => ContactDto)
  contact: ContactDto;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

export class UpdateTeamDto extends CreateTeamDto {}
