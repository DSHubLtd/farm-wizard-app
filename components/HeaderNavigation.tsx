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
          className="w-10 h-10 rounded-full items-center justify-center"
          onPress={onLeftPress}
        >
          <Image source={leftIcon} className="w-20 h-20 rounded-full" />
        </TouchableOpacity>
        // <View className="flex-row">
        //             <TouchableOpacity className="">
        //               <Image
        //                 source={useAvatarArray(user.avatar || 0)}
        //                 className="w-16 h-16 rounded-full"
        //               />
        //             </TouchableOpacity>
        //             <View className="flex my-4">
        //               <Text className="text-white text-md">Hi, {user.fullName}</Text>
        //               <Text className="text-white text-md">{user.score}</Text>
        //             </View>
        //           </View>
      )}

      {showRightButton && (
        <TouchableOpacity
          className="w-10 h-10 rounded-full items-center justify-center"
          onPress={onRightPress}
        >
          <Image source={rightIcon} className="w-20 h-20" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HeaderNavigation;
