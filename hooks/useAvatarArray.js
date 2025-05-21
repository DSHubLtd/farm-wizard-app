import { avatars } from "../constants";

export const useFramedAvatarArray = (index) => {
  const avatarsArr = [
    avatars.africanMaleF,
    avatars.africanFmaleF,
    avatars.asianMaleF,
    avatars.asianFmaleF,
    avatars.antMaleF,
    avatars.antFmaleF,
    avatars.austMaleF,
    avatars.austFmaleF,
    avatars.euMaleF,
    avatars.euFmaleF,
    avatars.naMaleF,
    avatars.naFmaleF,
    avatars.saMaleF,
    avatars.saFmaleF,
  ];

  return avatarsArr[Number(index)];
};
export const useNonFramedAvatarArray = (index) => {
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

  return avatarsArr[Number(index)];
};

export const avatarsArr = [
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
