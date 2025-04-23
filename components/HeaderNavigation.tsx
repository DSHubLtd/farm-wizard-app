import React from "react";
import { View, TouchableOpacity, Image } from "react-native";

interface HeaderNavigationProps {
  onLeftPress?: () => void;
  onRightPress?: () => void;
  leftIcon?: any;
  rightIcon?: any;
  showLeftButton?: boolean;
  showRightButton?: boolean;
}

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  onLeftPress,
  onRightPress,
  leftIcon,
  rightIcon,
  showLeftButton = true,
  showRightButton = true,
}) => {
  return (
    <View className="w-full px-5 flex-row justify-between items-center mt-20">
      {showLeftButton && (
        <TouchableOpacity
          className="w-10 h-10 bg-white/30 rounded-full items-center justify-center"
          onPress={onLeftPress}
        >
          <Image source={leftIcon} className="w-20 h-20" />
        </TouchableOpacity>
      )}

      {showRightButton && (
        <TouchableOpacity
          className="w-10 h-10 bg-white/30 rounded-full items-center justify-center"
          onPress={onRightPress}
        >
          <Image source={rightIcon} className="w-20 h-20" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HeaderNavigation;
