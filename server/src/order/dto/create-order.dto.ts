import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  skuId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  gameRegion?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24 * 60)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;

  /** 点名陪玩用户 id；不传或 null 表示进公共大厅 */
  @IsOptional()
  @IsUUID('4')
  designatedCompanionUserId?: string | null;
}
