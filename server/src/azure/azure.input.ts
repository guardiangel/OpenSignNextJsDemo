import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class FileInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  encodedContent: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  encodingType: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  mimeType: string;

  @Field({ nullable: true })
  size?: string;

  @Field({ nullable: true })
  createdById?: string;

  @Field({ nullable: true })
  folderId?: string;

  @Field({ nullable: true })
  tag?: string; //used for indicating the current file belongs to starred or trash or nothing
}

@InputType()
export class UpdateFileInput extends PartialType(FileInput) {
  @IsNotEmpty()
  @IsString()
  @Field()
  id: string;

  @Field({ nullable: true })
  newName?: string;
}
