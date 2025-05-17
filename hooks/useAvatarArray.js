import { avatars } from "../constants";

export const useAvatarArray = (index) => {
  const avatarsArr = [
    avatars.africanMale,
    avatars.africanFmale,
    avatars.asianMale,
    avatars.asianFmale,
    avatars.antMale,
    avatars.antFmale,
    avatars.austMale,
    avatars.austFmale,
    avatars.euMale,
    avatars.euFmale,
    avatars.naMale,
    avatars.naFmale,
    avatars.saMale,
    avatars.saFmale,
  ];

  return avatarsArr[index];
};
