import { useTranslation } from "react-i18next";
import images from "./images";
import plantImages from "./plantImages";

// This function returns the translated `plantGrowth` data
export const usePlantGrowth = () => {
  const { t } = useTranslation();

  return [
    {
      id: 1,
      diplayName: t("plants.apple"),
      name: "Apple",
      icon: images.apple,
      iconLg: images.appleLg,
      plantImages: [
        plantImages.apple1,
        plantImages.apple2,
        plantImages.apple3,
        plantImages.apple4,
      ],
      plantSickImages: [
        plantImages.appleSick1,
        plantImages.appleSick2,
        plantImages.appleSick3,
        plantImages.appleSick4,
      ],
      plantRainImages: [
        plantImages.appleRain1,
        plantImages.appleRain2,
        plantImages.appleRain3,
        plantImages.appleRain4,
      ],
      levels: 2,
      progress: 0.2,
    },
    {
      id: 2,
      diplayName: t("plants.maize"),
      name: "Maize",
      icon: images.maize,
      iconLg: images.maizeLg,
      plantImages: [
        plantImages.maize1,
        plantImages.maize2,
        plantImages.maize3,
        plantImages.maize4,
      ],
      plantSickImages: [
        plantImages.maizeSick1,
        plantImages.maizeSick2,
        plantImages.maizeSick3,
        plantImages.maizeSick4,
      ],
      plantRainImages: [
        plantImages.maizeRain1,
        plantImages.maizeRain2,
        plantImages.maizeRain3,
        plantImages.maizeRain4,
      ],
      levels: 4,
      progress: 0.65,
    },
    {
      id: 3,
      name: "Mango",
      diplayName: t("plants.mango"),
      icon: images.mango,
      iconLg: images.mangoLg,
      plantImages: [
        plantImages.mango1,
        plantImages.mango2,
        plantImages.mango3,
        plantImages.mango4,
      ],
      plantSickImages: [
        plantImages.mangoSick1,
        plantImages.mangoSick2,
        plantImages.mangoSick3,
        plantImages.mangoSick4,
      ],
      plantRainImages: [
        plantImages.mangoRain1,
        plantImages.mangoRain2,
        plantImages.mangoRain3,
        plantImages.mangoRain4,
      ],
      levels: 3,
      progress: 0.5,
    },
    {
      id: 4,
      name: "Orange",
      diplayName: t("plants.orange"),
      icon: images.orange,
      iconLg: images.orangeLg,
      plantImages: [
        plantImages.orange1,
        plantImages.orange2,
        plantImages.orange3,
        plantImages.orange4,
      ],
      plantSickImages: [
        plantImages.orangeSick1,
        plantImages.orangeSick2,
        plantImages.orangeSick3,
        plantImages.orangeSick4,
      ],
      plantRainImages: [
        plantImages.orangeRain1,
        plantImages.orangeRain2,
        plantImages.orangeRain3,
        plantImages.orangeRain4,
      ],
      levels: 1,
      progress: 0.1,
    },
    {
      id: 5,
      name: "Paw Paw",
      diplayName: t("plants.pawpaw"),
      icon: images.pawpaw,
      iconLg: images.pawpawLg,
      plantImages: [
        plantImages.pawpaw1,
        plantImages.pawpaw2,
        plantImages.pawpaw3,
        plantImages.pawpaw4,
      ],
      plantSickImages: [
        plantImages.pawpawSick1,
        plantImages.pawpawSick2,
        plantImages.pawpawSick3,
        plantImages.pawpawSick4,
      ],
      plantRainImages: [
        plantImages.pawpawRain1,
        plantImages.pawpawRain2,
        plantImages.pawpawRain3,
        plantImages.pawpawRain4,
      ],
      levels: 4,
      progress: 0.9,
    },
  ];
};

// Similarly for the growth messages
export const usePlantGrowthMessages = () => {
  const { t } = useTranslation();

  return [
    {
      stage: 0,
      message: t("plants.stage0"),
      image: images.growth1,
    },
    {
      stage: 1,
      message: t("plants.stage1"),
      image: images.growth2,
    },
    {
      stage: 2,
      message: t("plants.stage2"),
      image: images.growth3,
    },
    {
      stage: 3,
      message: t("plants.stage3"),
      image: images.growth4,
    },
  ];
};
