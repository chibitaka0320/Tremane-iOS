import * as bodyPartRepository from "@/localDb/repository/bodyPartRepository";
import { BodyPart } from "@/types/dto/bodyPartDto";

// 種目付き部位一覧取得
export async function getBodyPartsWithExercises(): Promise<BodyPart[]> {
  return await bodyPartRepository.getBodyPartsWithExercises();
}
